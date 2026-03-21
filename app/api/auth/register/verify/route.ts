import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAnonymousNickname } from "@/lib/auth-utils";
import { normalizeEmail } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const registerVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits."),
});

const VERIFY_RATE_LIMIT = 10;
const VERIFY_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const email = normalizeEmail(parsed.data.email);
    const { code } = parsed.data;

    const { ok } = rateLimit(`register-verify:${email}`, VERIFY_RATE_LIMIT, VERIFY_WINDOW_MS);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many attempts. Wait a minute." },
        { status: 429 }
      );
    }

    const now = new Date();
    const record = await prisma.otpVerification.findFirst({
      where: {
        email,
        code,
        purpose: "signup",
        passwordHash: { not: null },
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.otpVerification.deleteMany({ where: { id: record.id } });
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    let nickname = generateAnonymousNickname();
    for (let i = 0; i < 5; i++) {
      const taken = await prisma.user.findUnique({ where: { anonymousNickname: nickname } });
      if (!taken) break;
      nickname = generateAnonymousNickname();
    }

    await prisma.user.create({
      data: {
        email,
        passwordHash: record.passwordHash!,
        emailVerified: new Date(),
        anonymousNickname: nickname,
        name: nickname,
      },
    });

    await prisma.otpVerification.deleteMany({
      where: { email, purpose: "signup", passwordHash: { not: null } },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("register verify error:", e);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
