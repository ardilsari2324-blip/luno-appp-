import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: Kullanıcının bildirimleri (en yeni önce) */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 30, 50);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, readAt: null },
    });
    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    console.error("Notifications list error:", e);
    return NextResponse.json({ error: "Bildirimler yüklenemedi." }, { status: 500 });
  }
}
