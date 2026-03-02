"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/lib/language-context";

async function fetchFollowers(userId: string, page: number) {
  const res = await fetch(`/api/users/${userId}/followers?page=${page}&limit=20`);
  if (!res.ok) throw new Error("Takipçiler yüklenemedi.");
  return res.json();
}

async function fetchFollowing(userId: string, page: number) {
  const res = await fetch(`/api/users/${userId}/following?page=${page}&limit=20`);
  if (!res.ok) throw new Error("Takip edilenler yüklenemedi.");
  return res.json();
}

export function ProfileFollowList({
  userId,
  type,
}: {
  userId: string;
  type: "followers" | "following";
}) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "posts";
  const page = Number(searchParams.get("page")) || 0;

  const isFollowers = type === "followers";
  const { data, isLoading, error } = useQuery({
    queryKey: [type, userId, page],
    queryFn: () => (isFollowers ? fetchFollowers(userId, page) : fetchFollowing(userId, page)),
    enabled: tab === type,
  });

  if (tab !== type) return null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted/50 animate-pulse" />
            <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">{t("error")}</p>
      </div>
    );
  }

  const users = data?.users ?? [];
  const nextPage = data?.nextPage;

  if (users.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        {isFollowers ? t("noFollowers") : t("noFollowing")}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {users.map((u: { id: string; anonymousNickname: string }) => (
        <Link
          key={u.id}
          href={`/app/profile/${u.id}`}
          className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm">
              {(u.anonymousNickname || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{u.anonymousNickname}</span>
        </Link>
      ))}
      {nextPage != null && (
        <div className="p-4 text-center">
          <Link
            href={`/app/profile/${userId}?tab=${type}&page=${nextPage}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("loadMore")}
          </Link>
        </div>
      )}
    </div>
  );
}
