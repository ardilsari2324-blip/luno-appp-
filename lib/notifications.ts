import { prisma } from "@/lib/db";

export type NotificationType =
  | "like_post"
  | "comment_post"
  | "reply_comment"
  | "message"
  | "message_request"      // istek kabul edildi (to sender)
  | "message_request_in";  // yeni gelen istek (to recipient)

/** Bildirim oluştur (like, comment, message vb. sonrası çağrılır) */
export async function createNotification(
  userId: string,
  type: NotificationType,
  refId?: string | null,
  refId2?: string | null
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        refId: refId ?? undefined,
        refId2: refId2 ?? undefined,
      },
    });
  } catch (e) {
    console.error("Create notification error:", e);
  }
}
