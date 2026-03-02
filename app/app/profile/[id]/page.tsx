import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfilePosts } from "@/components/profile/profile-posts";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { ProfileFollowList } from "@/components/profile/profile-follow-list";

export default async function ProfilePage({
  params,
}: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, anonymousNickname: true, createdAt: true },
  });
  if (!user) notFound();
  const [postCount, followersCount, followingCount, isFollowing] = await Promise.all([
    prisma.post.count({ where: { authorId: id } }),
    prisma.userFollow.count({ where: { followingId: id } }),
    prisma.userFollow.count({ where: { followerId: id } }),
    prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId: session.user.id, followingId: id },
      },
    }),
  ]);
  const isMe = session.user.id === id;
  return (
    <div className="max-w-2xl mx-auto border-x border-border min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <ProfilePageHeader />
      </div>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {(user.anonymousNickname || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-xl">{user.anonymousNickname}</h1>
            <ProfileStats
              postCount={postCount}
              followersCount={followersCount}
              followingCount={followingCount}
              isMe={isMe}
              userId={id}
            />
            <ProfileActions
              profileUserId={id}
              currentUserId={session.user.id}
              initialFollowing={!!isFollowing}
            />
          </div>
        </div>
      </div>
      <ProfileTabs
        userId={id}
        postCount={postCount}
        followersCount={followersCount}
        followingCount={followingCount}
      />
      <ProfilePosts userId={id} currentUserId={session.user.id} />
      <ProfileFollowList userId={id} type="followers" />
      <ProfileFollowList userId={id} type="following" />
    </div>
  );
}
