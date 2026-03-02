import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getBlockedUserIds } from "@/lib/block";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** GET: Gönderi ve kullanıcı ara (q= terimi, type= posts | users | all) */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
    const type = searchParams.get("type") || "all"; // posts | users | all
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 30);
    if (!q || q.length < 2) {
      return NextResponse.json({ posts: [], users: [] });
    }
    const blockedIds = await getBlockedUserIds(session.user.id);
    type PostWithAuthor = Prisma.PostGetPayload<{
      include: { author: { select: { id: true; anonymousNickname: true } }; _count: { select: { likes: true; comments: true } } };
    }>;
    let posts: PostWithAuthor[] = [];
    let users: { id: string; anonymousNickname: string; _count: { posts: number } }[] = [];
    if (type === "posts" || type === "all") {
      const pattern = `%${q.toLowerCase()}%`;
      const raw = await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM Post WHERE LOWER(content) LIKE ${pattern} ORDER BY createdAt DESC LIMIT ${limit * 2}`;
      const ids = raw.map((r) => r.id);
      if (ids.length > 0) {
        const found = await prisma.post.findMany({
          where: {
            id: { in: ids },
            ...(blockedIds.length > 0 ? { authorId: { notIn: blockedIds } } : {}),
          },
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, anonymousNickname: true } },
            _count: { select: { likes: true, comments: true } },
          },
        });
        posts = found;
      }
    }
    if (type === "users" || type === "all") {
      const pattern = `%${q.toLowerCase()}%`;
      const raw = await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM User WHERE LOWER(anonymousNickname) LIKE ${pattern} AND id != ${session.user.id} LIMIT ${limit}`;
      const ids = raw.map((r) => r.id).filter((id) => !blockedIds.includes(id));
      if (ids.length > 0) {
        users = await prisma.user.findMany({
          where: { id: { in: ids } },
          select: {
            id: true,
            anonymousNickname: true,
            _count: { select: { posts: true } },
          },
        });
      }
    }
    const postIds = posts.map((p) => p.id);
    const likedByMe =
      postIds.length > 0
        ? await prisma.like.findMany({
            where: { postId: { in: postIds }, userId: session.user.id },
            select: { postId: true },
          })
        : [];
    const likedSet = new Set(likedByMe.map((l) => l.postId));
    const postsWithLiked = posts.map((p) => ({
      ...p,
      liked: likedSet.has(p.id),
    }));
    return NextResponse.json({
      posts: postsWithLiked,
      users,
    });
  } catch (e) {
    console.error("Search error:", e);
    return NextResponse.json({ error: "Arama başarısız." }, { status: 500 });
  }
}
