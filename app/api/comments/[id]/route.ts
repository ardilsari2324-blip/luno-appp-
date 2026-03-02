import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** DELETE: Kendi yorumunu sil */
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
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });
    }
    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: "Sadece kendi yorumunuzu silebilirsiniz." }, { status: 403 });
    }
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Comment delete error:", e);
    return NextResponse.json({ error: "Yorum silinemedi." }, { status: 500 });
  }
}
