import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtpSchema } from "@/lib/validations/auth";
import { sendOtpEmail } from "@/lib/email";
import { sendOtpSms } from "@/lib/sms";

const OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 dakika

// Basit rate limit: aynı e-posta/telefon için dakikada max 5 istek (MVP için bellek)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_COUNT;
}

/** 6 haneli OTP kodu üretir */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, phone } = parsed.data;
    const identifier = email ?? phone ?? "";
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen bir dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }
    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await prisma.otpVerification.create({
      data: {
        email: email ?? null,
        phone: phone ?? null,
        code,
        expiresAt,
      },
    });

    if (email) {
      const sent = await sendOtpEmail(email, code);
      if (!sent && process.env.NODE_ENV === "development") {
        console.log("[OTP] Resend yok — e-posta:", email, "kod:", code);
      }
    } else if (phone) {
      const sent = await sendOtpSms(phone, code);
      if (!sent && process.env.NODE_ENV === "development") {
        console.log("[OTP] Twilio yok — telefon:", phone, "kod:", code);
      }
    }

    return NextResponse.json({
      success: true,
      message: email
        ? "E-posta adresinize doğrulama kodu gönderildi."
        : "Telefon numaranıza doğrulama kodu gönderildi.",
    });
  } catch (e) {
    console.error("OTP send error:", e);
    return NextResponse.json(
      { error: "Kod gönderilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
