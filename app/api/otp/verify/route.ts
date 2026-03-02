import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAnonymousNickname, createOtpToken } from "@/lib/auth-utils";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";

const VERIFY_RATE_LIMIT = 10; // dakikada max 10 doğrulama denemesi (identifier başına)
const VERIFY_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, phone, code } = parsed.data;
    const identifier = (email ?? phone ?? "unknown").toString();
    const { ok } = rateLimit(`otp-verify:${identifier}`, VERIFY_RATE_LIMIT, VERIFY_WINDOW_MS);
    if (!ok) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Lütfen bir dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }
    const now = new Date();
    const record = await prisma.otpVerification.findFirst({
      where: {
        ...(email ? { email } : { phone }),
        code,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!record) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş kod." },
        { status: 400 }
      );
    }
    let user = await prisma.user.findFirst({
      where: email ? { email } : { phone: phone! },
    });
    if (!user) {
      let nickname = generateAnonymousNickname();
      for (let i = 0; i < 5; i++) {
        const existing = await prisma.user.findUnique({ where: { anonymousNickname: nickname } });
        if (!existing) break;
        nickname = generateAnonymousNickname();
      }
      user = await prisma.user.create({
        data: {
          email: email ?? null,
          phone: phone ?? null,
          anonymousNickname: nickname,
          name: nickname,
        },
      });
    }
    const emailOrPhone = email ?? phone ?? "";
    const token = await createOtpToken(user.id, emailOrPhone);
    await prisma.otpVerification.deleteMany({
      where: { id: record.id },
    });
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.anonymousNickname,
      },
    });
  } catch (e) {
    console.error("OTP verify error:", e);
    return NextResponse.json(
      { error: "Doğrulama başarısız. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
