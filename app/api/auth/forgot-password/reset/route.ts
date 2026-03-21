import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, normalizeEmail, passwordFieldSchema, verifyPassword } from "@/lib/password";
import { rateLimitByKey } from "@/lib/rate-limit";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits."),
  newPassword: passwordFieldSchema,
});

const VERIFY_RATE_LIMIT = 10;
const VERIFY_WINDOW_MS = 60_000;

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
    const { code, newPassword } = parsed.data;

    const { ok } = await rateLimitByKey(`forgot-reset:${email}`, VERIFY_RATE_LIMIT, VERIFY_WINDOW_MS);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many attempts. Wait a minute." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 400 }
      );
    }

    const now = new Date();
    const record = await prisma.otpVerification.findFirst({
      where: {
        email,
        code,
        purpose: "password_reset",
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

    if (user.passwordHash) {
      const sameAsOld = await verifyPassword(newPassword, user.passwordHash);
      if (sameAsOld) {
        return NextResponse.json(
          { error: "NEW_PASSWORD_SAME_AS_OLD" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.otpVerification.deleteMany({
        where: { email, purpose: "password_reset" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("forgot-password reset:", e);
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  }
}
