"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserX, UserCheck, Flag, UserPlus, UserMinus } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { ReportDialog } from "@/components/report-dialog";
import { toast } from "sonner";

export function ProfileActions({
  profileUserId,
  currentUserId,
  initialFollowing,
  onFollowChange,
}: {
  profileUserId: string;
  currentUserId: string;
  initialFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);
  const [following, setFollowing] = useState(!!initialFollowing);
  const [reportOpen, setReportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMe = profileUserId === currentUserId;

  useEffect(() => {
    if (isMe) return;
    fetch(`/api/users/${profileUserId}/block`)
      .then((r) => r.json())
      .then((d) => setBlocked(!!d.blocked))
      .catch(() => { /* Block status optional, no toast */ });
  }, [profileUserId, isMe]);

  useEffect(() => {
    setFollowing(!!initialFollowing);
  }, [initialFollowing]);

  async function toggleBlock() {
    const res = await fetch(`/api/users/${profileUserId}/block`, {
      method: blocked ? "DELETE" : "POST",
    });
    if (res.ok) {
      setBlocked(!blocked);
      router.refresh();
    }
  }

  async function toggleFollow() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${profileUserId}/follow`, {
        method: following ? "DELETE" : "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t("errFailed"));
        return;
      }
      setFollowing(!following);
      onFollowChange?.(!following);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (isMe) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          variant={following ? "outline" : "default"}
          size="sm"
          className="rounded-xl"
          onClick={toggleFollow}
          disabled={loading}
        >
          {following ? (
            <>
              <UserMinus className="h-4 w-4 mr-1.5" />
              {t("unfollow")}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1.5" />
              {t("follow")}
            </>
          )}
        </Button>
        <Button
          variant={blocked ? "outline" : "destructive"}
          size="sm"
          className="rounded-xl"
          onClick={toggleBlock}
        >
          {blocked ? (
            <>
              <UserCheck className="h-4 w-4 mr-1.5" />
              {t("unblockUser")}
            </>
          ) : (
            <>
              <UserX className="h-4 w-4 mr-1.5" />
              {t("blockUser")}
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setReportOpen(true)}>
          <Flag className="h-4 w-4 mr-1.5" />
          {t("reportUser")}
        </Button>
      </div>
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        type="user"
        reportedUserId={profileUserId}
        onSent={() => router.refresh()}
      />
    </>
  );
}
