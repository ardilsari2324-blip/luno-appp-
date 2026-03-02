"use client";

import Link from "next/link";

/**
 * Metindeki #hashtag ve @mention'ları linklere çevir.
 * #tag -> /app/search?q=%23tag
 * @nickname -> /app/profile/[id] (nickname ile kullanıcı bulunamalı — şimdilik sadece stil)
 */
export function ContentWithLinks({
  content,
  className,
  userMap,
}: {
  content: string;
  className?: string;
  userMap?: Record<string, string>; // nickname -> userId
}) {
  if (!content) return null;
  const parts: (string | { type: "hashtag" | "mention"; value: string })[] = [];
  const regex = /(#[\w\u00c0-\u024f]+)|(@[\w\u00c0-\u024f_]+)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content))) {
    if (m.index > lastIndex) {
      parts.push(content.slice(lastIndex, m.index));
    }
    parts.push({
      type: m[1] ? "hashtag" : "mention",
      value: m[1] ? m[1].slice(1) : m[2].slice(1),
    });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < content.length) parts.push(content.slice(lastIndex));

  return (
    <span className={className}>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : p.type === "hashtag" ? (
          <Link
            key={i}
            href={`/app/search?q=%23${p.value}`}
            className="text-primary hover:underline"
          >
            #{p.value}
          </Link>
        ) : userMap?.[p.value] ? (
          <Link
            key={i}
            href={`/app/profile/${userMap[p.value]}`}
            className="text-primary hover:underline"
          >
            @{p.value}
          </Link>
        ) : (
          <span key={i} className="text-primary/80">@{p.value}</span>
        )
      )}
    </span>
  );
}
