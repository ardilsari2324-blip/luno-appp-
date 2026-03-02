import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkUserRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { containsBadWord } from "@/lib/bad-words";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations/post";

const COMMENT_RATE_LIMIT = 30; // kullanıcı başına dakikada

/** GET: Gönderi yorumları */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: postId } = await params;
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, anonymousNickname: true } },
        _count: { select: { likes: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, anonymousNickname: true } },
            _count: { select: { likes: true } },
          },
        },
      },
    });
    const topLevel = comments.filter((c) => !c.parentCommentId);
    return NextResponse.json(topLevel);
  } catch (e) {
    console.error("Comments list error:", e);
    return NextResponse.json({ error: "Yorumlar yüklenemedi." }, { status: 500 });
  }
}

/** POST: Yorum ekle */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { ok } = await checkUserRateLimit(session.user.id, "comment", COMMENT_RATE_LIMIT);
    if (!ok) {
      return NextResponse.json({ error: "Çok fazla yorum. Lütfen bekleyin." }, { status: 429 });
    }
    const { id: postId } = await params;
    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Gönderi bulunamadı." }, { status: 404 });
    }
    const parentId = parsed.data.parentCommentId?.trim() || undefined;
    if (parentId) {
      const parent = await prisma.comment.findFirst({ where: { id: parentId, postId } });
      if (!parent) {
        return NextResponse.json({ error: "Üst yorum bulunamadı." }, { status: 400 });
      }
    }
    const safeContent = sanitizeText(parsed.data.content, 300);
    if (containsBadWord(safeContent)) {
      return NextResponse.json({ error: "İçerik kurallara uygun değil." }, { status: 400 });
    }
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        content: safeContent,
        parentCommentId: parentId,
      },
      include: {
        author: { select: { id: true, anonymousNickname: true } },
        _count: { select: { likes: true } },
      },
    });
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId }, select: { authorId: true } });
      if (parent && parent.authorId !== session.user.id) {
        await createNotification(parent.authorId, "reply_comment", postId, session.user.id);
      }
    } else if (post.authorId !== session.user.id) {
      await createNotification(post.authorId, "comment_post", postId, session.user.id);
    }
    return NextResponse.json(comment);
  } catch (e) {
    console.error("Comment create error:", e);
    return NextResponse.json({ error: "Yorum eklenemedi." }, { status: 500 });
  }
}
