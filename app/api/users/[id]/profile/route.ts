import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: Profil bilgisi (takipçi/takip sayıları, takip durumu) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: targetId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, anonymousNickname: true, createdAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }
    const [postCount, followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.post.count({ where: { authorId: targetId } }),
      prisma.userFollow.count({ where: { followingId: targetId } }),
      prisma.userFollow.count({ where: { followerId: targetId } }),
      prisma.userFollow.findUnique({
        where: {
          followerId_followingId: { followerId: session.user.id, followingId: targetId },
        },
      }),
    ]);
    return NextResponse.json({
      user,
      postCount,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
      isMe: session.user.id === targetId,
    });
  } catch (e) {
    console.error("Profile fetch error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
