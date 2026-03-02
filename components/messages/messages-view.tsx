"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Conversation = {
  id: string;
  otherUser?: { id: string; anonymousNickname: string };
  lastMessage?: { content: string; createdAt: string } | null;
};

type MessageRequest = {
  id: string;
  fromUser: { id: string; anonymousNickname: string };
};

export function MessagesView({
  currentUserId,
  initialToUserId,
  initialConversationId,
}: {
  currentUserId: string;
  initialToUserId?: string;
  initialConversationId?: string;
}) {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId ?? null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialToUserId ?? null);
  const [otherUserOverride, setOtherUserOverride] = useState<{ id: string; anonymousNickname: string } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialToUserId) setSelectedUserId(initialToUserId);
  }, [initialToUserId]);
  useEffect(() => {
    if (initialConversationId) setSelectedConversationId(initialConversationId);
  }, [initialConversationId]);

  const { data: convWithData } = useQuery({
    queryKey: ["conversation-with", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const res = await fetch(`/api/conversations/with/${selectedUserId}`);
      if (!res.ok) throw new Error("Yüklenemedi.");
      return res.json();
    },
    enabled: !!selectedUserId && !selectedConversationId,
  });

  useEffect(() => {
    if (selectedUserId && convWithData?.conversationId) {
      setSelectedConversationId(convWithData.conversationId);
      if (convWithData.otherUser) setOtherUserOverride(convWithData.otherUser);
      setSelectedUserId(null);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  }, [selectedUserId, convWithData, queryClient]);

  const { data: conversations, isLoading: convLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Yüklenemedi.");
      return res.json();
    },
  });

  const { data: requests } = useQuery({
    queryKey: ["message-requests"],
    queryFn: async () => {
      const res = await fetch("/api/messages/requests");
      if (!res.ok) throw new Error("Yüklenemedi.");
      return res.json();
    },
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];
      const res = await fetch(`/api/conversations/${selectedConversationId}/messages`);
      if (!res.ok) throw new Error("Mesajlar yüklenemedi.");
      const data = await res.json();
      fetch(`/api/conversations/${selectedConversationId}/messages/read`, { method: "POST" }).catch(() => {});
      return data;
    },
    enabled: !!selectedConversationId,
  });

  const sendMutation = useMutation({
    mutationFn: async ({
      convId,
      content,
      mediaUrl,
      mediaType,
    }: { convId: string; content: string; mediaUrl?: string; mediaType?: string }) => {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content || " ", mediaUrl: mediaUrl || undefined, mediaType: mediaType || undefined }),
      });
      if (!res.ok) throw new Error("Gönderilemedi.");
      return res.json();
    },
    onSuccess: () => {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (toUserId: string) => {
      const res = await fetch("/api/messages/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, content: messageText }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "İstek gönderilemedi.");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["message-requests"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMessageText("");
      if (data?.conversationId) {
        setSelectedConversationId(data.conversationId);
        if (data.otherUser) setOtherUserOverride(data.otherUser);
        setSelectedUserId(null);
      }
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/messages/requests/${requestId}/accept`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Kabul edilemedi.");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["message-requests"] });
      if (data?.id) {
        setSelectedConversationId(data.id);
        const other = data.participants?.find((p: { userId: string }) => p.userId !== currentUserId)?.user;
        if (other) setOtherUserOverride(other);
      }
      setSelectedUserId(null);
    },
  });

  const list: Conversation[] = conversations ?? [];
  const requestList: MessageRequest[] = requests ?? [];
  const otherUserFromConv = otherUserOverride ?? list.find(
    (c) => c.id === selectedConversationId
  )?.otherUser;
  const showConv = !!selectedConversationId && otherUserFromConv;
  const showRequest = !!selectedUserId && !showConv;

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
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSend = () => {
    const content = messageText.trim();
    if (!content && !mediaPreview) return;
    if (selectedConversationId) {
      sendMutation.mutate({
        convId: selectedConversationId,
        content: content || " ",
        mediaUrl: mediaPreview?.url,
        mediaType: mediaPreview?.type,
      });
      setMessageText("");
      setMediaPreview(null);
    } else if (selectedUserId) {
      requestMutation.mutate(selectedUserId);
    }
  };

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-64 border-r flex flex-col overflow-hidden">
        <div className="p-2 border-b text-sm font-medium">Konuşmalar</div>
        <div className="overflow-y-auto flex-1">
          {convLoading ? (
            <p className="p-2 text-muted-foreground text-sm">Yükleniyor...</p>
          ) : (
            list.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted rounded-md"
                onClick={() => {
                  setSelectedConversationId(c.id);
                  setSelectedUserId(null);
                  setOtherUserOverride(null);
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {(c.otherUser?.anonymousNickname || "?").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.otherUser?.anonymousNickname}</p>
                  {c.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage.content}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="p-2 border-t text-sm font-medium">Mesaj istekleri</div>
        <div className="overflow-y-auto max-h-32">
          {requestList.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-2 gap-2">
              <span className="text-sm truncate">{r.fromUser.anonymousNickname}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => acceptMutation.mutate(r.id)}
                disabled={acceptMutation.isPending}
              >
                Kabul
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {showConv && (
          <>
            <div className="p-2 border-b font-medium text-sm">
              {otherUserFromConv?.anonymousNickname}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(messages ?? []).map((m: { id: string; content: string; senderId: string; createdAt: string; readAt?: string | null; mediaUrl?: string; mediaType?: string }) => (
                <div
                  key={m.id}
                  className={`flex ${m.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.senderId === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.mediaUrl && m.mediaType === "image" && (
                      <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer" className="block relative rounded overflow-hidden my-1 max-w-full h-64 w-64">
                        <Image src={m.mediaUrl} alt="" fill className="object-cover" sizes="256px" />
                      </a>
                    )}
                    {m.mediaUrl && m.mediaType === "video" && (
                      <video src={m.mediaUrl} controls className="rounded max-h-64 my-1" />
                    )}
                    {m.content.trim() !== "" && m.content.trim() !== " " && <p>{m.content}</p>}
                    {m.senderId === currentUserId && (
                      <span className="text-[10px] opacity-70 ml-1">
                        {m.readAt ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 flex flex-col gap-2 border-t">
              {mediaPreview && (
                <div className="relative inline-block">
                  {mediaPreview.type === "image" && (
                    <div className="relative w-24 h-24 rounded overflow-hidden">
                      <Image src={mediaPreview.url} alt="" fill className="object-cover" unoptimized />
                    </div>
                  )}
                  {mediaPreview.type === "video" && (
                    <video src={mediaPreview.url} className="max-h-24 rounded" muted />
                  )}
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs"
                    onClick={() => setMediaPreview(null)}
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFile}
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm bg-background hover:bg-muted">
                    {uploading ? "Yükleniyor…" : "📷 Foto/Video"}
                  </span>
                </label>
                <Input
                  placeholder="Mesaj yaz..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={sendMutation.isPending || (!messageText.trim() && !mediaPreview)}
                >
                  Gönder
                </Button>
              </div>
            </div>
          </>
        )}
        {showRequest && !showConv && (
          <div className="flex-1 p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Bu kullanıcıya mesaj isteği gönder. Kabul ederse sohbet başlar.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="İlk mesajını yaz..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <Button
                onClick={() => selectedUserId && requestMutation.mutate(selectedUserId)}
                disabled={requestMutation.isPending || !messageText.trim()}
              >
                İstek gönder
              </Button>
            </div>
          </div>
        )}
        {!showConv && !showRequest && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Bir konuşma seçin veya profil sayfasından mesaj isteği gönderin.
          </div>
        )}
      </div>
    </div>
  );
}
