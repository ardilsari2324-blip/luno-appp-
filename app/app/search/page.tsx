"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";
import { useSession } from "next-auth/react";
import { Search as SearchIcon, Loader2, User } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

type SearchResult = {
  posts: Array<{
    id: string;
    content: string;
    author: { id: string; anonymousNickname: string };
    _count: { likes: number; comments: number };
    createdAt: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    liked?: boolean;
  }>;
  users: Array<{
    id: string;
    anonymousNickname: string;
    _count: { posts: number };
  }>;
};

export default function SearchPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    const term = q.trim().slice(0, 100);
    if (term.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&type=all&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      setResults({ posts: [], users: [] });
    } finally {
      setLoading(false);
    }
  }

  const currentUserId = session?.user?.id ?? "";

  return (
    <div className="max-w-2xl mx-auto border-x border-border min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <BackButton href="/app" />
          <h1 className="font-bold text-xl">{t("search")}</h1>
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="rounded-xl flex-1"
          />
          <Button onClick={search} disabled={loading || q.trim().length < 2} className="rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="p-4">
        {results && (
          <>
            {results.users.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">Kullanıcılar</h2>
                <ul className="space-y-2">
                  {results.users.map((u) => (
                    <li key={u.id}>
                      <Link
                        href={`/app/profile/${u.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{u.anonymousNickname}</p>
                          <p className="text-sm text-muted-foreground">{u._count.posts} {t("postsCount")}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {results.posts.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-2">Gönderiler</h2>
                <div className="divide-y divide-border">
                  {results.posts.map((post) => (
                    <PostCard key={post.id} post={post} currentUserId={currentUserId} />
                  ))}
                </div>
              </section>
            )}
            {results && results.posts.length === 0 && results.users.length === 0 && q.trim().length >= 2 && (
              <p className="text-center text-muted-foreground py-12">Sonuç bulunamadı.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
