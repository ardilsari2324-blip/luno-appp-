import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { hashPassword, normalizeEmail, passwordFieldSchema } from "@/lib/password";
import { rateLimitByKey } from "@/lib/rate-limit";
import { z } from "zod";

const registerSendSchema = z.object({
  email: z.string().email("Invalid email."),
  password: passwordFieldSchema,
});

const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;
const OTP_EXPIRY_MINUTES = 10;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const email = normalizeEmail(parsed.data.email);
    const { password } = parsed.data;

    const { ok } = await rateLimitByKey(`register-send:${email}`, RATE_LIMIT, WINDOW_MS);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpVerification.deleteMany({
      where: { email, purpose: "signup", passwordHash: { not: null } },
    });
    await prisma.otpVerification.create({
      data: {
        email,
        phone: null,
        code,
        passwordHash,
        purpose: "signup",
        expiresAt,
      },
    });

    const sent = await sendOtpEmail(email, code);
    if (!sent) {
      await prisma.otpVerification.deleteMany({
        where: { email, purpose: "signup", passwordHash: { not: null } },
      });
      if (process.env.NODE_ENV === "development") {
        console.log("[register] Resend failed or RESEND_API_KEY missing — email:", email, "code:", code);
      }
      return NextResponse.json(
        {
          error:
            "E-posta gönderilemedi. Vercel’de RESEND_API_KEY ve (domain doğrulandıysa) RESEND_FROM_EMAIL ayarlı olmalı. Resend panelinden API key alın.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (e) {
    console.error("register send error:", e);
    const msg =
      e instanceof Prisma.PrismaClientKnownRequestError
        ? `${e.code}: ${e.message}`
        : e instanceof Error
          ? e.message
          : String(e);
    console.error("[register send] detail:", msg);

    const looksLikeSchema =
      /passwordHash|column|does not exist|Unknown column/i.test(msg) ||
      (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2022");

    return NextResponse.json(
      {
        error: looksLikeSchema
          ? "Veritabanı şeması güncel değil (ör. passwordHash kolonu yok). Postgres kullanıyorsanız scripts/vercel-postgres-password-columns.sql dosyasını çalıştırın veya prisma db push ile şemayı eşitleyin."
          : "Kod kaydedilemedi veya sunucu hatası. Biraz sonra tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}
