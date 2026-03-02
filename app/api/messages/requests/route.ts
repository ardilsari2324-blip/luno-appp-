import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

/** GET: Gelen mesaj istekleri (engellenenler hariç) */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { getBlockedUserIds } = await import("@/lib/block");
    const blockedIds = await getBlockedUserIds(session.user.id);
    const requests = await prisma.messageRequest.findMany({
      where: { toUserId: session.user.id, status: "pending" },
      include: {
        fromUser: { select: { id: true, anonymousNickname: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const filtered = requests.filter((r) => !blockedIds.includes(r.fromUser.id));
    return NextResponse.json(filtered);
  } catch (e) {
    console.error("Message requests error:", e);
    return NextResponse.json({ error: "İstekler yüklenemedi." }, { status: 500 });
  }
}

/** POST: Mesaj isteği gönder — takip ediyorsan doğrudan konuşma açılır */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const body = await req.json();
    const toUserId = body.toUserId as string | undefined;
    const content = (body.content as string)?.trim();
    if (!toUserId) {
      return NextResponse.json({ error: "toUserId gerekli." }, { status: 400 });
    }
    if (toUserId === session.user.id) {
      return NextResponse.json({ error: "Kendinize istek gönderemezsiniz." }, { status: 400 });
    }
    const existing = await prisma.messageRequest.findUnique({
      where: {
        fromUserId_toUserId: { fromUserId: session.user.id, toUserId },
      },
    });
    if (existing?.status === "accepted") {
      const conv = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId: toUserId } } },
          ],
        },
        include: {
          participants: {
            include: { user: { select: { id: true, anonymousNickname: true } } },
          },
        },
      });
      if (conv) {
        const otherUser = conv.participants.find((p) => p.userId !== session.user.id)?.user;
        return NextResponse.json({ conversationId: conv.id, otherUser, autoAccepted: true });
      }
    }
    if (existing?.status === "pending") {
      return NextResponse.json({ error: "Bekleyen istek zaten var." }, { status: 400 });
    }
    // Takip ediyorsam: doğrudan konuşma aç
    const follows = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId: session.user.id, followingId: toUserId },
      },
    });
    if (follows) {
      let conv = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId: toUserId } } },
          ],
        },
        include: {
          participants: {
            include: { user: { select: { id: true, anonymousNickname: true } } },
          },
        },
      });
      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: session.user.id },
                { userId: toUserId },
              ],
            },
          },
          include: {
            participants: {
              include: { user: { select: { id: true, anonymousNickname: true } } },
            },
          },
        });
        await prisma.messageRequest.upsert({
          where: {
            fromUserId_toUserId: { fromUserId: session.user.id, toUserId },
          },
          create: {
            fromUserId: session.user.id,
            toUserId,
            status: "accepted",
          },
          update: { status: "accepted" },
        });
        if (content) {
          await prisma.message.create({
            data: {
              conversationId: conv.id,
              senderId: session.user.id,
              content: content.slice(0, 2000),
            },
          });
          await createNotification(toUserId, "message", conv.id, session.user.id);
        }
      }
      const otherUser = conv.participants.find((p) => p.userId !== session.user.id)?.user;
      return NextResponse.json({ conversationId: conv.id, otherUser, autoAccepted: true });
    }
    // Takip etmiyorsam: normal istek
    const request = await prisma.messageRequest.upsert({
      where: {
        fromUserId_toUserId: { fromUserId: session.user.id, toUserId },
      },
      create: {
        fromUserId: session.user.id,
        toUserId,
        status: "pending",
      },
      update: { status: "pending" },
      include: {
        toUser: { select: { id: true, anonymousNickname: true } },
      },
    });
    await createNotification(toUserId, "message_request_in", request.id, session.user.id);
    return NextResponse.json(request);
  } catch (e) {
    console.error("Message request error:", e);
    return NextResponse.json({ error: "İstek gönderilemedi." }, { status: 500 });
  }
}
