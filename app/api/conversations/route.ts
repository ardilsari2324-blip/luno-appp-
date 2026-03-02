import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { getBlockedUserIds } from "@/lib/block";

/** GET: Kullanıcının konuşma listesi (engellenenler hariç) */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const blockedIds = await getBlockedUserIds(session.user.id);
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: session.user.id } },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: {
          include: { user: { select: { id: true, anonymousNickname: true } } },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
    const list = conversations
      .map((c) => ({
        ...c,
        otherUser: c.participants.find((p) => p.userId !== session.user!.id)?.user,
        lastMessage: c.messages[0] ?? null,
      }))
      .filter((c) => c.otherUser && !blockedIds.includes(c.otherUser.id));
    return NextResponse.json(list);
  } catch (e) {
    console.error("Conversations error:", e);
    return NextResponse.json({ error: "Konuşmalar yüklenemedi." }, { status: 500 });
  }
}
