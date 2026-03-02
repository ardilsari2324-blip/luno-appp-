"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { toastError, toastRateLimited } from "@/lib/toast";

const REASONS = [
  { value: "spam", key: "reportReasonSpam" as const },
  { value: "harassment", key: "reportReasonHarassment" as const },
  { value: "hate", key: "reportReasonHate" as const },
  { value: "violence", key: "reportReasonViolence" as const },
  { value: "other", key: "reportReasonOther" as const },
] as const;

export function ReportDialog({
  open,
  onClose,
  type,
  postId,
  commentId,
  reportedUserId,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  type: "post" | "comment" | "user";
  postId?: string;
  commentId?: string;
  reportedUserId?: string;
  onSent?: () => void;
}) {
  const { t } = useLanguage();
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>("button, [href], input, textarea, select");
    (focusables?.[0] as HTMLElement)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit() {
    if (!reason) return;
    setSending(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postId || undefined,
          commentId: commentId || undefined,
          reportedUserId: reportedUserId || undefined,
          reason,
          note: note.trim() || undefined,
        }),
      });
      if (res.ok) {
        setSent(true);
        onSent?.();
        setTimeout(() => {
          onClose();
          setReason("");
          setNote("");
          setSent(false);
        }, 1500);
      } else {
        if (res.status === 429) toastRateLimited();
        else {
          const j = await res.json().catch(() => ({}));
          toastError(j.error || "Şikayet gönderilemedi.");
        }
      }
    } catch {
      toastError("Şikayet gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="report-dialog-title" className="font-semibold text-lg">
          {type === "post" ? t("reportPost") : type === "comment" ? t("reportComment") : t("reportUser")}
        </h3>
        {sent ? (
          <p className="text-muted-foreground text-sm">{t("reportSent")}</p>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Sebep</p>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <Button
                    key={r.value}
                    type="button"
                    variant={reason === r.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReason(r.value)}
                  >
                    {t(r.key)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Ek not (isteğe bağlı)</label>
              <textarea
                className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="..."
                maxLength={500}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button onClick={submit} disabled={!reason || sending}>
                {sending ? "..." : t("send")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
