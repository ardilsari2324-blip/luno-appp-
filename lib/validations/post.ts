import { z } from "zod";

const MAX_POST_LENGTH = 500;
const MAX_COMMENT_LENGTH = 300;

export const createPostSchema = z.object({
  content: z.string().max(MAX_POST_LENGTH, `En fazla ${MAX_POST_LENGTH} karakter.`),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(["image", "video"]).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Yorum gerekli.").max(MAX_COMMENT_LENGTH, `En fazla ${MAX_COMMENT_LENGTH} karakter.`),
  parentCommentId: z.string().optional(),
});

export const createQuoteSchema = z.object({
  quoteContent: z.string().min(1, "Alıntı metni gerekli.").max(MAX_POST_LENGTH),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
