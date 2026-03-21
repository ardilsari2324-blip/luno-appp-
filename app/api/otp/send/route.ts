import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtpSchema } from "@/lib/validations/auth";
import { sendOtpEmail } from "@/lib/email";
import { normalizeEmail } from "@/lib/password";
import { rateLimitByKey } from "@/lib/rate-limit";

const OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** E-posta OTP gönderimi (eski akış; kayıt için /api/auth/register/send kullanın) */
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
    const email = normalizeEmail(parsed.data.email);
    const { ok: withinLimit } = await rateLimitByKey(
      `legacy-otp-send:${email}`,
      RATE_LIMIT_COUNT,
      RATE_LIMIT_WINDOW_MS
    );
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }
    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await prisma.otpVerification.create({
      data: {
        email,
        phone: null,
        code,
        passwordHash: null,
        purpose: "legacy_otp",
        expiresAt,
      },
    });

    const sent = await sendOtpEmail(email, code);
    if (!sent && process.env.NODE_ENV === "development") {
      console.log("[OTP] Resend missing — email:", email, "code:", code);
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (e) {
    console.error("OTP send error:", e);
    return NextResponse.json(
      { error: "Could not send code." },
      { status: 500 }
    );
  }
}
