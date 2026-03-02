"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, type CreatePostInput } from "@/lib/validations/post";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "./post-card";
import Image from "next/image";
import { ImagePlus, Send, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { toastFromError, toastError } from "@/lib/toast";

async function fetchPosts(cursor?: string | null) {
  const url = cursor
    ? `/api/posts?cursor=${cursor}&limit=20`
    : "/api/posts?limit=20";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gönderiler yüklenemedi.");
  return res.json();
}

async function createPost(data: CreatePostInput & { mediaUrl?: string; mediaType?: string }) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.content?.[0] || err.error?.message || "Gönderi atılamadı.";
    const e = new Error(msg) as Error & { status?: number };
    e.status = res.status;
    throw e;
  }
  return res.json();
}

export function Feed() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const currentUserId = session?.user?.id ?? "";
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: "", mediaUrl: undefined, mediaType: undefined },
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      form.reset();
      setMediaPreview(null);
    },
    onError: (err) => toastFromError(err, t("errPostFailed")),
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Yükleme başarısız.");
      const { url, mediaType } = await res.json();
      setMediaPreview({ url, type: mediaType });
    } catch (err) {
      console.error(err);
      toastError(t("errUploadFailed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSubmit = (d: CreatePostInput) => {
    if (!d.content.trim() && !mediaPreview) {
      form.setError("root", { type: "manual", message: "Metin veya fotoğraf/video ekleyin." });
      return;
    }
    createMutation.mutate({
      ...d,
      mediaUrl: mediaPreview?.url,
      mediaType: mediaPreview?.type,
    });
  };

  const posts = data?.pages?.flatMap((p) => p.posts) ?? [];

  return (
    <div className="divide-y divide-border">
      {/* Composer */}
      <div className="p-4 border-b border-border">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Textarea
            placeholder={t("placeholderPost")}
            className="min-h-[100px] resize-none rounded-xl border-border bg-muted/30 focus:bg-background/50 placeholder:text-muted-foreground text-base"
            {...form.register("content")}
          />
          {mediaPreview && (
            <div className="relative inline-block rounded-xl overflow-hidden">
              {mediaPreview.type === "image" && (
                <div className="relative max-h-56 w-full aspect-video rounded-xl overflow-hidden">
                  <Image src={mediaPreview.url} alt="" fill className="object-cover" unoptimized />
                </div>
              )}
              {mediaPreview.type === "video" && (
                <video src={mediaPreview.url} className="max-h-56 rounded-xl" muted />
              )}
              <button
                type="button"
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 text-sm hover:bg-black/90 transition-colors"
                onClick={() => setMediaPreview(null)}
              >
                ×
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFile}
                disabled={uploading}
              />
              <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium bg-background hover:bg-muted transition-colors">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {uploading ? t("uploading") : t("photoVideo")}
              </span>
            </label>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl font-semibold px-6"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t("send")}
                </>
              )}
            </Button>
          </div>
          {(form.formState.errors as { content?: { message?: string }; root?: { message?: string } }).content && (
            <p className="text-sm text-destructive">{form.formState.errors.content?.message}</p>
          )}
          {(form.formState.errors as { root?: { message?: string } }).root && (
            <p className="text-sm text-destructive">{(form.formState.errors as { root?: { message?: string } }).root?.message}</p>
          )}
        </form>
      </div>

      {/* Feed */}
      <div>
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>{t("postsLoading")}</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-destructive">
            <p className="font-medium">Hata</p>
            <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-6 px-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center max-w-sm">
              <h3 className="font-semibold text-lg">{t("noPosts")}</h3>
              <p className="text-muted-foreground mt-2">
                {t("noPostsDesc")}
              </p>
            </div>
          </div>
        ) : (
          <>
            {posts.map((post: { id: string; content: string; author: { id: string; anonymousNickname: string }; _count: { likes: number; comments: number }; createdAt: string; mediaUrl?: string; mediaType?: string }) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
            {hasNextPage && (
              <div className="p-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("loadMore")
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
