"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export function ProfileStats({
  postCount,
  followersCount,
  followingCount,
  isMe,
  userId,
}: {
  postCount: number;
  followersCount: number;
  followingCount: number;
  isMe: boolean;
  userId: string;
}) {
  const { t } = useLanguage();
  return (
    <>
      <p className="text-muted-foreground text-sm">
        {postCount} {t("postsCount")} · {followersCount} {t("followersCount")} · {followingCount}{" "}
        {t("followingCount")}
      </p>
      {!isMe && (
        <Link
          href={`/app/messages?to=${userId}`}
          className="inline-block mt-2 text-sm font-medium text-primary hover:underline"
        >
          {t("sendMessage")}
        </Link>
      )}
    </>
  );
}
