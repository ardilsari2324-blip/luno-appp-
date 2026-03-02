import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: commentId } = await params;
    await prisma.commentLike.upsert({
      where: { userId_commentId: { userId: session.user.id, commentId } },
      create: { userId: session.user.id, commentId },
      update: {},
    });
    const count = await prisma.commentLike.count({ where: { commentId } });
    return NextResponse.json({ liked: true, count });
  } catch (e) {
    console.error("Comment like error:", e);
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
    const { id: commentId } = await params;
    await prisma.commentLike.deleteMany({
      where: { userId: session.user.id, commentId },
    });
    const count = await prisma.commentLike.count({ where: { commentId } });
    return NextResponse.json({ liked: false, count });
  } catch (e) {
    console.error("Comment unlike error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
