import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: Bu kullanıcıyla konuşma var mı / açılabilir mi? Takip ediyorsan doğrudan aç */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { userId: toUserId } = await params;
    if (toUserId === session.user.id) {
      return NextResponse.json({ needsRequest: false, error: "Kendinize mesaj gönderemezsiniz." }, { status: 400 });
    }
    const target = await prisma.user.findUnique({ where: { id: toUserId } });
    if (!target) {
      return NextResponse.json({ needsRequest: false, error: "Kullanıcı bulunamadı." }, { status: 404 });
    }
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
      return NextResponse.json({ conversationId: conv.id, otherUser });
    }
    const follows = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId: session.user.id, followingId: toUserId },
      },
    });
    if (follows) {
      const newConv = await prisma.conversation.create({
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
      const otherUser = newConv.participants.find((p) => p.userId !== session.user.id)?.user;
      return NextResponse.json({ conversationId: newConv.id, otherUser, autoCreated: true });
    }
    return NextResponse.json({ needsRequest: true });
  } catch (e) {
    console.error("Conversation with user error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
