import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: Kullanıcı tercihleri */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailNotifications: true, passwordHash: true },
    });
    return NextResponse.json({
      emailNotifications: user?.emailNotifications ?? false,
      /** Eski OTP-only hesaplar için false — şifre sıfırlama ile şifre belirlenebilir */
      hasPassword: !!user?.passwordHash,
    });
  } catch (e) {
    console.error("Preferences get error:", e);
    return NextResponse.json({ error: "Tercihler yüklenemedi." }, { status: 500 });
  }
}

/** PATCH: E-posta bildirim tercihi */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const body = await req.json();
    const emailNotifications = !!body.emailNotifications;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { emailNotifications },
    });
    return NextResponse.json({ emailNotifications });
  } catch (e) {
    console.error("Preferences update error:", e);
    return NextResponse.json({ error: "Tercih güncellenemedi." }, { status: 500 });
  }
}
