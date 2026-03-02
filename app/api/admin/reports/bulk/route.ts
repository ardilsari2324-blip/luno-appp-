import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? process.env.ADMIN_USER_ID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAdmin(userId: string) {
  return ADMIN_IDS.length > 0 && ADMIN_IDS.includes(userId);
}

/** POST: Toplu şikayet işlemi (status: reviewed | dismissed) */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const body = await req.json();
    const ids = (body.ids as string[])?.filter((id: unknown) => typeof id === "string") ?? [];
    const status = body.status === "dismissed" ? "dismissed" : "reviewed";
    if (ids.length === 0) {
      return NextResponse.json({ error: "En az bir şikayet ID gerekli." }, { status: 400 });
    }
    const { count } = await prisma.report.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    await prisma.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        action: "bulk_reports",
        details: JSON.stringify({ status, count, ids: ids.slice(0, 10) }),
      },
    });
    return NextResponse.json({ success: true, count });
  } catch (e) {
    console.error("Bulk reports error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
