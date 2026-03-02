import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkUserRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { containsBadWord } from "@/lib/bad-words";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createPostSchema } from "@/lib/validations/post";

const POST_CREATE_LIMIT = 20; // kullanıcı başına dakikada

import { sortByEngagement } from "@/lib/engagement";
import { getBlockedUserIds, excludeBlockedAuthors } from "@/lib/block";

const ALGO_BATCH = 150; // Algoritma için her sayfada çekilecek max gönderi

/** GET: Feed — engagement algoritması (ana akış) veya kronolojik (profil) */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const userId = searchParams.get("userId");
    const useAlgo = !userId; // Ana akış = algoritma, profil = kronolojik

    if (useAlgo) {
      const blockedIds = await getBlockedUserIds(session.user.id);
      const raw = await prisma.post.findMany({
        take: ALGO_BATCH,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, anonymousNickname: true } },
          _count: { select: { likes: true, comments: true } },
        },
      });
      const filtered = excludeBlockedAuthors(raw, blockedIds);
      const sorted = sortByEngagement(
        filtered.map((p) => ({
          ...p,
          likes: p._count.likes,
          comments: p._count.comments,
          hasMedia: !!(p.mediaUrl && p.mediaType),
        }))
      );
      const page = Math.max(0, parseInt(cursor || "0", 10) || 0);
      const offset = page * limit;
      const items = sorted.slice(offset, offset + limit);
      const hasMore = offset + items.length < sorted.length;
      const ids = items.map((p) => p.id);
      const likedByMe = ids.length
        ? await prisma.like.findMany({
            where: { postId: { in: ids }, userId: session.user.id },
            select: { postId: true },
          })
        : [];
      const likedSet = new Set(likedByMe.map((l) => l.postId));
      const postsWithLiked = items.map((p) => ({
        ...p,
        liked: likedSet.has(p.id),
      }));
      return NextResponse.json({
        posts: postsWithLiked,
        nextCursor: hasMore ? String(page + 1) : null,
      });
    }

    // Profil: kronolojik, cursor tabanlı (engellenen kullanıcının gönderileri hariç)
    const blockedIds = await getBlockedUserIds(session.user.id);
    if (blockedIds.includes(userId)) {
      return NextResponse.json({ posts: [], nextCursor: null });
    }
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, anonymousNickname: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const ids = items.map((p) => p.id);
    const likedByMe = ids.length
      ? await prisma.like.findMany({
          where: { postId: { in: ids }, userId: session.user.id },
          select: { postId: true },
        })
      : [];
    const likedSet = new Set(likedByMe.map((l) => l.postId));
    const postsWithLiked = items.map((p) => ({
      ...p,
      liked: likedSet.has(p.id),
    }));
    return NextResponse.json({
      posts: postsWithLiked,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
    });
  } catch (e) {
    console.error("Posts list error:", e);
    return NextResponse.json({ error: "Gönderiler yüklenemedi." }, { status: 500 });
  }
}

/** POST: Yeni gönderi */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { ok } = await checkUserRateLimit(session.user.id, "post", POST_CREATE_LIMIT);
    if (!ok) {
      return NextResponse.json({ error: "Çok fazla gönderi. Lütfen bekleyin." }, { status: 429 });
    }
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const content = sanitizeText((parsed.data.content ?? "").trim(), 500);
    const mediaUrl = (parsed.data.mediaUrl as string)?.trim() || null;
    const mediaType = parsed.data.mediaType === "video" ? "video" : parsed.data.mediaType === "image" ? "image" : null;
    if (!content && !mediaUrl) {
      return NextResponse.json(
        { error: { content: ["Metin veya fotoğraf/video gerekli."] } },
        { status: 400 }
      );
    }
    if (containsBadWord(content || "")) {
      return NextResponse.json({ error: "İçerik kurallara uygun değil." }, { status: 400 });
    }
    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        content: content || " ",
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
      },
      include: {
        author: { select: { id: true, anonymousNickname: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    return NextResponse.json(post);
  } catch (e) {
    console.error("Post create error:", e);
    return NextResponse.json({ error: "Gönderi oluşturulamadı." }, { status: 500 });
  }
}
