"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { toastError } from "@/lib/toast";

type ReportRow = {
  id: string;
  status: string;
  reason: string | null;
  note: string | null;
  createdAt: string;
  reporter: { id: string; anonymousNickname: string };
  post: { id: string; content: string } | null;
  comment: { id: string; content: string } | null;
  postId: string | null;
  commentId: string | null;
  reportedUserId: string | null;
};

export function AdminReportsClient() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reports?status=${status}`)
      .then((r) => {
        if (!r.ok) throw new Error("Fetch failed");
        return r.json();
      })
      .then((d) => setReports(Array.isArray(d) ? d : []))
      .catch(() => {
        setReports([]);
        toastError(t("errReportsLoad"));
      })
      .finally(() => setLoading(false));
  }, [status, t]);

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  async function bulkAction(status: string) {
    const ids = reports.filter((r) => r.status === "pending").map((r) => r.id);
    if (ids.length === 0) return;
    const res = await fetch("/api/admin/reports/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status }),
    });
    if (res.ok) setReports((prev) => prev.filter((r) => r.status !== "pending"));
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  if (loading) return <p className="text-muted-foreground">Yükleniyor...</p>;
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        {["pending", "reviewed", "dismissed", "all"].map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(s)}
          >
            {s === "pending" ? "Bekleyen" : s === "reviewed" ? "İncelendi" : s === "dismissed" ? "Reddedildi" : "Tümü"}
          </Button>
        ))}
        {status === "pending" && pendingCount > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={() => bulkAction("reviewed")}>
              Tümünü incelendi yap
            </Button>
            <Button variant="ghost" size="sm" onClick={() => bulkAction("dismissed")}>
              Tümünü reddet
            </Button>
          </>
        )}
      </div>
      <ul className="space-y-3">
        {reports.map((r) => (
          <li key={r.id} className="border rounded-lg p-3 bg-card">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">Sebep: {r.reason ?? "—"} · Durum: {r.status}</p>
                <p className="text-xs text-muted-foreground">
                  Şikayet eden: {r.reporter.anonymousNickname} · {new Date(r.createdAt).toLocaleString("tr-TR")}
                </p>
                {r.note && <p className="text-sm mt-1">Not: {r.note}</p>}
                {r.post && <p className="text-sm truncate">Gönderi: {r.post.content?.slice(0, 80)}...</p>}
                {r.comment && <p className="text-sm truncate">Yorum: {r.comment.content?.slice(0, 80)}...</p>}
                {r.reportedUserId && <p className="text-sm">Şikayet edilen kullanıcı ID: {r.reportedUserId}</p>}
              </div>
              <div className="flex gap-1 shrink-0 flex-wrap">
                {r.reportedUserId && (
                  <Link href={`/app/profile/${r.reportedUserId}`} target="_blank" rel="noopener">
                    <Button variant="outline" size="sm">Profil</Button>
                  </Link>
                )}
                {r.postId && (
                  <Link href={`/app/post/${r.postId}`} target="_blank" rel="noopener">
                    <Button variant="outline" size="sm">Gönderi</Button>
                  </Link>
                )}
                {r.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(r.id, "reviewed")}>İncelendi</Button>
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, "dismissed")}>Reddet</Button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {reports.length === 0 && <p className="text-muted-foreground">Şikayet yok.</p>}
    </div>
  );
}
