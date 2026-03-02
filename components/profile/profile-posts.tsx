"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/feed/post-card";
import { useLanguage } from "@/lib/language-context";

async function fetchProfilePosts(userId: string) {
  const res = await fetch(`/api/posts?userId=${userId}&limit=50`);
  if (!res.ok) throw new Error("Gönderiler yüklenemedi.");
  return res.json();
}

export function ProfilePosts({ userId, currentUserId }: { userId: string; currentUserId?: string }) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "posts";
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile-posts", userId],
    queryFn: () => fetchProfilePosts(userId),
    enabled: tab === "posts",
  });

  if (tab !== "posts") return null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="h-11 w-11 rounded-xl bg-muted/50 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
            <div className="h-12 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="py-8 text-center text-muted-foreground text-sm">{t("loading")}</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">{t("error")}</p>
        <p className="text-muted-foreground text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }
  const posts = data?.posts ?? [];
  if (posts.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">{t("noPosts")}</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-border">
      {posts.map((post: Parameters<typeof PostCard>[0]["post"]) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
