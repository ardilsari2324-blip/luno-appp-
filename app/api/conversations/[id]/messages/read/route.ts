import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST: Konuşmadaki bana gelen mesajları okundu işaretle */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: conversationId } = await params;
    const part = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: { userId: session.user.id, conversationId },
      },
    });
    if (!part) {
      return NextResponse.json({ error: "Konuşma bulunamadı." }, { status: 404 });
    }
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Messages read error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
