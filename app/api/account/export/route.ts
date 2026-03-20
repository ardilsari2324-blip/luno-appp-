import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: KVKK/GDPR veri dışa aktarma — kullanıcının tüm verileri JSON */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const userId = session.user.id;
    const [user, posts, comments, likes, messages, conversations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          anonymousNickname: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.post.findMany({ where: { authorId: userId }, orderBy: { createdAt: "desc" } }),
      prisma.comment.findMany({ where: { authorId: userId }, orderBy: { createdAt: "desc" } }),
      prisma.like.findMany({ where: { userId } }),
      prisma.message.findMany({ where: { senderId: userId }, orderBy: { createdAt: "desc" } }),
      prisma.conversationParticipant.findMany({
        where: { userId },
        include: { conversation: { include: { messages: true, participants: true } } },
      }),
    ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      posts,
      comments,
      likes: likes.length,
      messages,
      conversations: conversations.map((c) => ({
        id: c.conversationId,
        joinedAt: c.joinedAt,
        messages: c.conversation.messages,
        participants: c.conversation.participants.length,
      })),
    };
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="veilon-data-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e) {
    console.error("Export error:", e);
    return NextResponse.json({ error: "Veri dışa aktarılamadı." }, { status: 500 });
  }
}
