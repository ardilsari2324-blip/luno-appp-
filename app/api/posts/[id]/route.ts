import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { getBlockedUserIds } from "@/lib/block";

/** GET: Tek gönderi detayı + yorumlar */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, anonymousNickname: true } },
        _count: { select: { likes: true, comments: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, anonymousNickname: true } },
            _count: { select: { likes: true } },
          },
        },
      },
    });
    if (!post) {
      return NextResponse.json({ error: "Gönderi bulunamadı." }, { status: 404 });
    }
    const blockedIds = await getBlockedUserIds(session.user.id);
    if (blockedIds.includes(post.authorId)) {
      return NextResponse.json({ error: "Gönderi bulunamadı." }, { status: 404 });
    }
    const liked = await prisma.like.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: id } },
    });
    return NextResponse.json({
      ...post,
      liked: !!liked,
    });
  } catch (e) {
    console.error("Post get error:", e);
    return NextResponse.json({ error: "Gönderi yüklenemedi." }, { status: 500 });
  }
}

/** DELETE: Kendi gönderini sil */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Gönderi bulunamadı." }, { status: 404 });
    }
    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Sadece kendi gönderinizi silebilirsiniz." }, { status: 403 });
    }
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Post delete error:", e);
    return NextResponse.json({ error: "Gönderi silinemedi." }, { status: 500 });
  }
}
