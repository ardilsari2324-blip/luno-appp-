import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { hashPassword, normalizeEmail, passwordFieldSchema } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
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

    const { ok } = rateLimit(`register-send:${email}`, RATE_LIMIT, WINDOW_MS);
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
      where: { email, passwordHash: { not: null } },
    });
    await prisma.otpVerification.create({
      data: {
        email,
        phone: null,
        code,
        passwordHash,
        expiresAt,
      },
    });

    const sent = await sendOtpEmail(email, code);
    if (!sent && process.env.NODE_ENV === "development") {
      console.log("[register] Resend missing — email:", email, "code:", code);
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (e) {
    console.error("register send error:", e);
    return NextResponse.json({ error: "Could not send code." }, { status: 500 });
  }
}
