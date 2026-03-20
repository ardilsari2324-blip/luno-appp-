import { z } from "zod";

/** Sadece e-posta (telefon girişi kapatıldı) */
export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email."),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits."),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
