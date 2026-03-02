import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: Takipçi listesi */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: targetId } = await params;
    const page = Math.max(0, Number(new URL(req.url).searchParams.get("page")) || 0);
    const limit = Math.min(Number(new URL(req.url).searchParams.get("limit")) || 20, 50);
    const skip = page * limit;
    const [follows, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followingId: targetId },
        take: limit + 1,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          follower: { select: { id: true, anonymousNickname: true } },
        },
      }),
      prisma.userFollow.count({ where: { followingId: targetId } }),
    ]);
    const hasMore = follows.length > limit;
    const items = hasMore ? follows.slice(0, limit) : follows;
    return NextResponse.json({
      users: items.map((f) => f.follower),
      total,
      nextPage: hasMore ? page + 1 : null,
    });
  } catch (e) {
    console.error("Followers fetch error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
