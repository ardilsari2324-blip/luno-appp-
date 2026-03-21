import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { normalizeEmail } from "@/lib/password";
import { rateLimitByKey } from "@/lib/rate-limit";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email("Invalid email."),
});

const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;
const OTP_EXPIRY_MINUTES = 10;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const GENERIC_OK =
  "If an account exists for this email, we sent a verification code.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const email = normalizeEmail(parsed.data.email);

    const { ok } = await rateLimitByKey(`forgot-pw:${email}`, RATE_LIMIT, WINDOW_MS);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // E-posta yoksa da aynı mesaj (hesap varlığını sızdırmama)
    if (!user) {
      return NextResponse.json({ success: true, message: GENERIC_OK });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpVerification.deleteMany({
      where: { email, purpose: "password_reset" },
    });
    await prisma.otpVerification.create({
      data: {
        email,
        phone: null,
        code,
        passwordHash: null,
        purpose: "password_reset",
        expiresAt,
      },
    });

    const sent = await sendPasswordResetEmail(email, code);
    if (!sent) {
      await prisma.otpVerification.deleteMany({
        where: { email, purpose: "password_reset" },
      });
      return NextResponse.json(
        {
          error:
            "E-posta gönderilemedi. RESEND_API_KEY ve gönderen adresini kontrol edin.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, message: GENERIC_OK });
  } catch (e) {
    console.error("forgot-password send:", e);
    return NextResponse.json(
      { error: "Could not process request." },
      { status: 500 }
    );
  }
}
