"use client";

import dynamic from "next/dynamic";
import { MessagesPageHeader } from "@/components/messages/messages-page-header";

const MessagesView = dynamic(
  () => import("@/components/messages/messages-view").then((m) => ({ default: m.MessagesView })),
  {
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse">Yükleniyor...</div>
    ),
    ssr: false,
  }
);

export function MessagesPageClient({
  currentUserId,
  initialToUserId,
  initialConversationId,
}: {
  currentUserId: string;
  initialToUserId?: string;
  initialConversationId?: string;
}) {
  return (
    <div className="max-w-2xl mx-auto border-x border-border min-h-screen flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <MessagesPageHeader />
      </div>
      <MessagesView
        currentUserId={currentUserId}
        initialToUserId={initialToUserId}
        initialConversationId={initialConversationId}
      />
    </div>
  );
}

