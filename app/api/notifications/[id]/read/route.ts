import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** PATCH: Bildirimi okundu işaretle */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id } = await params;
    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Notification read error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
