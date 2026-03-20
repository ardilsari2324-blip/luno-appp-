import { NextResponse } from "next/server";

/**
 * Eski OTP ile giriş kapatıldı. Kayıt: POST /api/auth/register/verify
 * Giriş: NextAuth credentials (e-posta + şifre)
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This sign-in method is no longer available. Use email and password, or complete registration with your verification code.",
    },
    { status: 410 }
  );
}
