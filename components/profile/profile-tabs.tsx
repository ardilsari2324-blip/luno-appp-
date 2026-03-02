"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

type Tab = "posts" | "followers" | "following";

export function ProfileTabs({
  userId,
  postCount,
  followersCount,
  followingCount,
}: {
  userId: string;
  postCount: number;
  followersCount: number;
  followingCount: number;
}) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) || "posts";

  const base = `/app/profile/${userId}`;
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "posts", label: t("postsTab"), count: postCount },
    { key: "followers", label: t("followers"), count: followersCount },
    { key: "following", label: t("following"), count: followingCount },
  ];

  return (
    <div className="flex border-b border-border">
      {tabs.map(({ key, label, count }) => (
        <Link
          key={key}
          href={`${base}?tab=${key}`}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            tab === key
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="block">{label}</span>
          <span className="text-xs text-muted-foreground">{count}</span>
        </Link>
      ))}
    </div>
  );
}
