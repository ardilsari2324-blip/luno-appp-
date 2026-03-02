"use client";

import Link from "next/link";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Quote, Share2 } from "lucide-react";
import { TranslatableContent } from "@/components/translatable-content";
import { useLanguage } from "@/lib/language-context";
import { PostActionsMenu } from "@/components/post-actions-menu";
import { toastSuccess, toastFromError } from "@/lib/toast";

type Post = {
  id: string;
  content: string;
  author: { id: string; anonymousNickname: string };
  _count: { likes: number; comments: number };
  liked?: boolean;
  createdAt: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
};

export function PostCard({ post, currentUserId }: { post: Post; currentUserId?: string }) {
  const queryClient = useQueryClient();
  const { t, locale } = useLanguage();
  const likeMutation = useMutation({
    mutationFn: async ({ postId, unliked }: { postId: string; unliked: boolean }) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: unliked ? "DELETE" : "POST",
      });
      if (!res.ok) {
        const e = new Error("İşlem başarısız.") as Error & { status?: number };
        e.status = res.status;
        throw e;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toastFromError(err, t("errFailed")),
  });

  const date = new Date(post.createdAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/app/post/${post.id}`;
    const title = "Luno";
    const text = post.content?.slice(0, 100) ? `${post.content.slice(0, 100)}...` : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard?.writeText(url);
      toastSuccess(t("linkCopied"));
    } catch {
      toastSuccess(t("copyLink") + ": " + url);
    }
  }

  return (
    <article
      className="p-4 hover:bg-muted/30 active:bg-muted/50 transition-colors border-b border-border/50"
      role="article"
    >
      <div className="flex gap-4">
        <Link href={`/app/profile/${post.author.id}`} className="shrink-0 touch-target flex" aria-label={post.author.anonymousNickname}>
          <Avatar className="h-11 w-11 ring-2 ring-border rounded-xl">
            <AvatarFallback className="text-sm font-semibold bg-primary/20 text-primary rounded-xl">
              {(post.author.anonymousNickname || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <Link
                href={`/app/profile/${post.author.id}`}
                className="font-semibold hover:text-primary transition-colors truncate"
              >
                {post.author.anonymousNickname}
              </Link>
              <span className="text-muted-foreground shrink-0">· {date}</span>
            </div>
            {currentUserId && (
              <PostActionsMenu
                postId={post.id}
                authorId={post.author.id}
                currentUserId={currentUserId}
                onDeleted={() => queryClient.invalidateQueries({ queryKey: ["posts"] })}
              />
            )}
          </div>
          <div className="mt-2 group">
            <Link href={`/app/post/${post.id}`} className="block">
            {post.mediaUrl && post.mediaType === "image" && (
              <div className="relative w-full aspect-video max-h-80 my-2 rounded-xl overflow-hidden border border-border">
                <Image
                  src={post.mediaUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
            )}
            {post.mediaUrl && post.mediaType === "video" && (
              <video
                src={post.mediaUrl}
                className="rounded-xl max-h-80 w-full my-2 border border-border"
                controls
              />
            )}
            {post.content.trim() !== "" && post.content.trim() !== " " && (
              <TranslatableContent
                content={post.content}
                className="text-[15px] leading-relaxed group-hover:text-foreground/90"
              />
            )}
            </Link>
          </div>
          <div className="flex items-center gap-1 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 rounded-lg ${
                post.liked ? "text-red-500 hover:text-red-600 hover:bg-red-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              }`}
              onClick={() => likeMutation.mutate({ postId: post.id, unliked: post.liked ?? false })}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 mr-1.5 ${post.liked ? "fill-current" : ""}`} />
              {post._count.likes}
            </Button>
            <Link href={`/app/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10">
                <MessageCircle className="h-4 w-4 mr-1.5" />
                {post._count.comments}
              </Button>
            </Link>
            <Link href={`/app/post/${post.id}?quote=1`}>
              <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10">
                <Quote className="h-4 w-4 mr-1.5" />
                {t("quote")}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={handleShare} title={t("sharePost")}>
              <Share2 className="h-4 w-4 mr-1.5" />
              {t("sharePost")}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
