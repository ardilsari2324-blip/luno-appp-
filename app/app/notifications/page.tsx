"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { BackButton } from "@/components/ui/back-button";
import { Heart, MessageCircle, Mail, Loader2 } from "lucide-react";
import { toastError } from "@/lib/toast";

type NotificationItem = {
  id: string;
  type: string;
  refId: string | null;
  refId2: string | null;
  readAt: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const { t, locale } = useLanguage();
  const [list, setList] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications?limit=50")
      .then((r) => r.json())
      .then((d) => {
        setList(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .catch(() => {
        setList([]);
        toastError(t("errNotificationsLoad"));
      })
      .finally(() => setLoading(false));
  }, [t]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  function getLink(n: NotificationItem): string {
    if (n.type === "like_post" || n.type === "comment_post") return `/app/post/${n.refId}`;
    if (n.type === "reply_comment") return `/app/post/${n.refId}`;
    if (n.type === "message") return `/app/messages${n.refId ? `?conversation=${n.refId}` : ""}`;
    if (n.type === "message_request") return `/app/messages${n.refId ? `?conversation=${n.refId}` : ""}`;
    if (n.type === "message_request_in") return "/app/messages";
    return "/app";
  }

  function getLabel(n: NotificationItem): string {
    switch (n.type) {
      case "like_post": return t("likeNotification");
      case "comment_post": return t("commentNotification");
      case "reply_comment": return t("replyNotification");
      case "message": return t("messageNotification");
      case "message_request": return t("messageRequestNotification");
      case "message_request_in": return t("newMessageRequest");
      default: return "";
    }
  }

  function getIcon(n: NotificationItem) {
    switch (n.type) {
      case "like_post": return <Heart className="h-5 w-5 text-red-500" />;
      case "comment_post":
      case "reply_comment": return <MessageCircle className="h-5 w-5 text-primary" />;
      case "message":
      case "message_request":
      case "message_request_in": return <Mail className="h-5 w-5 text-primary" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  }

  const dateFmt = (d: string) =>
    new Date(d).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-2xl mx-auto border-x border-border min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackButton href="/app" />
            <h1 className="font-bold text-xl">{t("notifications")}</h1>
          </div>
          {list.length > 0 && unreadCount > 0 && (
            <button
              type="button"
              onClick={async () => {
                const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
                if (res.ok) {
                  setList((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
                  setUnreadCount(0);
                } else {
                  toastError(t("errFailed"));
                }
              }}
              className="text-sm text-primary hover:underline"
            >
              {t("markAllRead")}
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t("noNotifications")}</p>
        ) : (
          <ul className="space-y-1">
            {list.map((n) => (
              <li key={n.id}>
                <Link
                  href={getLink(n)}
                  onClick={() => !n.readAt && markRead(n.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-muted/50 ${!n.readAt ? "bg-primary/5" : ""}`}
                >
                  <div className="shrink-0 mt-0.5">{getIcon(n)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{getLabel(n)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{dateFmt(n.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
