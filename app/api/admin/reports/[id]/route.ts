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

/** PATCH: Şikayet durumu güncelle (reviewed / dismissed) */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const status = body.status === "dismissed" ? "dismissed" : "reviewed";
    await prisma.report.update({
      where: { id },
      data: { status },
    });
    await prisma.adminAuditLog.create({
      data: { adminId: session.user.id, action: `report_${status}`, targetId: id },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin report update error:", e);
    return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  }
}
