import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PostDetail } from "@/components/post/post-detail";
import { PostPageHeader } from "@/components/post/post-page-header";

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quote?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const { id } = await params;
  const { quote } = await searchParams;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, anonymousNickname: true } },
      _count: { select: { likes: true, comments: true } },
      comments: {
        where: { parentCommentId: null },
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
      },
    },
  });
  if (!post) notFound();
  const liked = await prisma.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: id } },
  });
  return (
    <div className="max-w-2xl mx-auto border-x border-border min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <PostPageHeader />
      </div>
      <PostDetail
        post={{ ...post, liked: !!liked }}
        showQuoteForm={quote === "1"}
        currentUserId={session.user.id}
      />
    </div>
  );
}
