import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

/** POST: Beğen / DELETE: Beğeniyi kaldır */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: postId } = await params;
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (!post) return NextResponse.json({ error: "Gönderi bulunamadı." }, { status: 404 });
    await prisma.like.upsert({
      where: { userId_postId: { userId: session.user.id, postId } },
      create: { userId: session.user.id, postId },
      update: {},
    });
    if (post.authorId !== session.user.id) {
      await createNotification(post.authorId, "like_post", postId, session.user.id);
    }
    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: true, count });
  } catch (e) {
    console.error("Like error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: postId } = await params;
    await prisma.like.deleteMany({
      where: { userId: session.user.id, postId },
    });
    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: false, count });
  } catch (e) {
    console.error("Unlike error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
