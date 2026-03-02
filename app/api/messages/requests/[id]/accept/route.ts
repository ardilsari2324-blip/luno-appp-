import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

/** POST: Mesaj isteğini kabul et, konuşma oluştur */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: requestId } = await params;
    const req = await prisma.messageRequest.findUnique({
      where: { id: requestId },
    });
    if (!req || req.toUserId !== session.user.id || req.status !== "pending") {
      return NextResponse.json({ error: "İstek bulunamadı veya geçersiz." }, { status: 404 });
    }
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: req.fromUserId },
          ],
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, anonymousNickname: true } } },
        },
      },
    });
    await prisma.messageRequest.update({
      where: { id: requestId },
      data: { status: "accepted" },
    });
    await createNotification(req.fromUserId, "message_request", conversation.id, session.user.id);
    return NextResponse.json(conversation);
  } catch (e) {
    console.error("Accept request error:", e);
    return NextResponse.json({ error: "İstek kabul edilemedi." }, { status: 500 });
  }
}
