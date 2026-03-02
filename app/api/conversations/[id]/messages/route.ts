import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

/** GET: Konuşma mesajları */
export async function GET(
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
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, anonymousNickname: true } },
      },
    });
    return NextResponse.json(messages);
  } catch (e) {
    console.error("Messages list error:", e);
    return NextResponse.json({ error: "Mesajlar yüklenemedi." }, { status: 500 });
  }
}

/** POST: Mesaj gönder */
export async function POST(
  req: Request,
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
    const body = await req.json();
    const content = ((body?.content as string) ?? "").trim().slice(0, 2000);
    const mediaUrl = (body?.mediaUrl as string)?.trim() || null;
    const mediaType = (body?.mediaType as string) === "video" ? "video" : (body?.mediaType === "image" ? "image" : null);
    if (!content && !mediaUrl) {
      return NextResponse.json(
        { error: { content: ["Mesaj metni veya medya gerekli."] } },
        { status: 400 }
      );
    }
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: content || " ",
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
      },
      include: {
        sender: { select: { id: true, anonymousNickname: true } },
      },
    });
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    const otherUserId = participants.find((p) => p.userId !== session.user.id)?.userId;
    if (otherUserId) {
      await createNotification(otherUserId, "message", conversationId, session.user.id);
    }
    return NextResponse.json(message);
  } catch (e) {
    console.error("Message send error:", e);
    return NextResponse.json({ error: "Mesaj gönderilemedi." }, { status: 500 });
  }
}
