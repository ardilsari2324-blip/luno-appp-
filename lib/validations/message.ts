import { z } from "zod";

const MAX_MESSAGE_LENGTH = 2000;

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Mesaj gerekli.").max(MAX_MESSAGE_LENGTH, `En fazla ${MAX_MESSAGE_LENGTH} karakter.`),
  toUserId: z.string().min(1, "Alıcı gerekli."),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
