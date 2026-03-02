import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MessagesPageClient } from "./messages-page-client";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; conversation?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { to, conversation } = await searchParams;
  return <MessagesPageClient currentUserId={session.user.id} initialToUserId={to} initialConversationId={conversation} />;
}
