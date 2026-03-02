"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, createQuoteSchema, type CreateCommentInput, type CreateQuoteInput } from "@/lib/validations/post";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TranslatableContent } from "@/components/translatable-content";
import { useLanguage } from "@/lib/language-context";
import { MessageCircle, MoreHorizontal, Flag, Trash2, Share2 } from "lucide-react";
import { PostActionsMenu } from "@/components/post-actions-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/report-dialog";
import { toastSuccess } from "@/lib/toast";

type CommentType = {
  id: string;
  content: string;
  author: { id: string; anonymousNickname: string };
  _count: { likes: number };
  createdAt: string | Date;
  replies?: CommentType[];
};

type Post = {
  id: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  author: { id: string; anonymousNickname: string };
  _count: { likes: number; comments: number };
  liked: boolean;
  createdAt: string | Date;
  comments: CommentType[];
};

export function PostDetail({
  post,
  showQuoteForm,
  currentUserId,
}: {
  post: Post;
  showQuoteForm?: boolean;
  currentUserId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, locale } = useLanguage();
  const commentForm = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { content: "", parentCommentId: undefined },
  });
  const quoteForm = useForm<CreateQuoteInput>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: { quoteContent: "" },
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const replyForm = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { content: "", parentCommentId: undefined },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: post.liked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("İşlem başarısız.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      router.refresh();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: CreateCommentInput) => {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Yorum eklenemedi.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      commentForm.reset();
      router.refresh();
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (data: CreateCommentInput & { parentCommentId: string }) => {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content, parentCommentId: data.parentCommentId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Yanıt eklenemedi.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      replyForm.reset();
      setReplyingTo(null);
      router.refresh();
    },
  });

  const quoteMutation = useMutation({
    mutationFn: async (data: CreateQuoteInput) => {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, postId: post.id }),
      });
      if (!res.ok) throw new Error("Alıntı oluşturulamadı.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      quoteForm.reset();
      router.push("/app");
    },
  });

  const date = new Date(post.createdAt as string | Date).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatCommentDate = (d: string | Date) =>
    new Date(d).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  async function deleteComment(commentId: string) {
    if (!confirm(t("confirmDeleteComment"))) return;
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      router.refresh();
    }
  }

  return (
    <div className="p-4 space-y-6">
      <article>
        <div className="flex gap-3">
          <Link href={`/app/profile/${post.author.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-xs">
                {(post.author.anonymousNickname || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm min-w-0">
                <Link href={`/app/profile/${post.author.id}`} className="font-medium hover:underline">
                  {post.author.anonymousNickname}
                </Link>
                <span className="text-muted-foreground shrink-0">· {date}</span>
              </div>
              {currentUserId && (
                <PostActionsMenu
                  postId={post.id}
                  authorId={post.author.id}
                  currentUserId={currentUserId}
                  onDeleted={() => router.refresh()}
                />
              )}
            </div>
            {post.mediaUrl && post.mediaType === "image" && (
              <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="block relative rounded-lg overflow-hidden my-1 max-h-[400px] w-full aspect-video">
                <Image src={post.mediaUrl} alt="" fill className="object-cover" sizes="600px" />
              </a>
            )}
            {post.mediaUrl && post.mediaType === "video" && (
              <video src={post.mediaUrl} controls className="rounded-lg max-h-[400px] w-full my-1" />
            )}
            {post.content.trim() !== "" && (
              <TranslatableContent content={post.content} className="mt-1 text-sm" compact />
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className={post.liked ? "text-red-500" : "text-muted-foreground"}
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
              >
                ♥ {post._count.likes}
              </Button>
              <span className="text-muted-foreground text-sm">💬 {post._count.comments}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={async (e) => {
                  e.preventDefault();
                  const url = typeof window !== "undefined" ? `${window.location.origin}/app/post/${post.id}` : "";
                  if (typeof navigator !== "undefined" && navigator.share) {
                    try {
                      await navigator.share({ title: "Luno", text: post.content?.slice(0, 100) ?? "", url });
                      return;
                    } catch {}
                  }
                  try {
                    await navigator.clipboard?.writeText(url);
                    toastSuccess(t("linkCopied"));
                  } catch {
                    toastSuccess(t("copyLink") + ": " + url);
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-1" />
                {t("sharePost")}
              </Button>
            </div>
          </div>
        </div>
      </article>

      {showQuoteForm && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-medium mb-2">{t("quote")}</h3>
          <form onSubmit={quoteForm.handleSubmit((d) => quoteMutation.mutate(d))} className="space-y-2">
            <Textarea
              placeholder="..."
              className="min-h-[80px]"
              {...quoteForm.register("quoteContent")}
            />
            {quoteForm.formState.errors.quoteContent && (
              <p className="text-sm text-destructive">{quoteForm.formState.errors.quoteContent.message}</p>
            )}
            <Button type="submit" size="sm" disabled={quoteMutation.isPending}>
              {quoteMutation.isPending ? "..." : t("quote")}
            </Button>
          </form>
        </div>
      )}

      <section>
        <h3 className="font-medium mb-2">{t("comments")}</h3>
        <form
          onSubmit={commentForm.handleSubmit((d) => commentMutation.mutate(d))}
          className="flex gap-2 mb-4"
        >
          <Textarea
            placeholder={t("writeComment")}
            className="min-h-[60px] flex-1 resize-none"
            {...commentForm.register("content")}
          />
          <Button type="submit" disabled={commentMutation.isPending}>
            {t("send")}
          </Button>
        </form>
        {commentForm.formState.errors.content && (
          <p className="text-sm text-destructive mb-2">{commentForm.formState.errors.content.message}</p>
        )}
        <ul className="space-y-3">
          {post.comments.map((c) => (
            <li key={c.id} className="text-sm">
              <div className="flex gap-2 items-center flex-wrap">
                <Link href={`/app/profile/${c.author.id}`} className="font-medium hover:underline shrink-0">
                  {c.author.anonymousNickname}
                </Link>
                <span className="text-muted-foreground">· {formatCommentDate(c.createdAt)} · {c._count.likes} {t("like")}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {t("reply")}
                </Button>
                {currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => setReportCommentId(c.id)}>
                        <Flag className="h-3 w-3 mr-2" />
                        {t("reportComment")}
                      </DropdownMenuItem>
                      {c.author.id === currentUserId && (
                        <DropdownMenuItem onClick={() => deleteComment(c.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-3 w-3 mr-2" />
                          {t("deleteComment")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <TranslatableContent content={c.content} className="w-full mt-1" compact />

              {replyingTo === c.id && (
                <form
                  onSubmit={replyForm.handleSubmit((d) =>
                    replyMutation.mutate({ ...d, parentCommentId: c.id })
                  )}
                  className="mt-2 ml-4 flex gap-2"
                >
                  <Textarea
                    placeholder={t("writeReply")}
                    className="min-h-[50px] flex-1 resize-none text-sm"
                    {...replyForm.register("content")}
                  />
                  <div className="flex flex-col gap-1">
                    <Button type="submit" size="sm" disabled={replyMutation.isPending}>
                      {t("send")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setReplyingTo(null); replyForm.reset(); }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </form>
              )}

              {c.replies && c.replies.length > 0 && (
                <ul className="mt-2 ml-4 space-y-2 border-l-2 border-muted pl-3">
                  {c.replies.map((r) => (
                    <li key={r.id}>
                      <div className="flex gap-2 items-center flex-wrap">
                        <Link href={`/app/profile/${r.author.id}`} className="font-medium hover:underline shrink-0">
                          {r.author.anonymousNickname}
                        </Link>
                        <span className="text-muted-foreground">· {formatCommentDate(r.createdAt)}</span>
                        {currentUserId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem onClick={() => setReportCommentId(r.id)}>
                                <Flag className="h-3 w-3 mr-2" />
                                {t("reportComment")}
                              </DropdownMenuItem>
                              {r.author.id === currentUserId && (
                                <DropdownMenuItem onClick={() => deleteComment(r.id)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  {t("deleteComment")}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <TranslatableContent content={r.content} className="w-full" compact />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
      {reportCommentId && (
        <ReportDialog
          open={!!reportCommentId}
          onClose={() => setReportCommentId(null)}
          type="comment"
          commentId={reportCommentId}
          onSent={() => { setReportCommentId(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
