"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserX, Flag, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { ReportDialog } from "@/components/report-dialog";

export function PostActionsMenu({
  postId,
  authorId,
  currentUserId,
  onDeleted,
}: {
  postId: string;
  authorId: string;
  currentUserId: string;
  onDeleted?: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const isOwn = authorId === currentUserId;

  async function handleBlock() {
    const res = await fetch(`/api/users/${authorId}/block`, { method: "POST" });
    if (res.ok) {
      onDeleted?.();
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm(t("confirmDeletePost"))) return;
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted?.();
      router.push("/app");
      router.refresh();
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          {!isOwn && (
            <DropdownMenuItem onClick={handleBlock} className="text-destructive focus:text-destructive">
              <UserX className="h-4 w-4 mr-2" />
              {t("blockUser")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4 mr-2" />
            {t("reportPost")}
          </DropdownMenuItem>
          {isOwn && (
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              {t("deletePost")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        type="post"
        postId={postId}
        onSent={() => router.refresh()}
      />
    </>
  );
}
