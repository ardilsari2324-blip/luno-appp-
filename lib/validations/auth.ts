import { z } from "zod";

/** E-posta veya telefon (en az biri) */
export const sendOtpSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.email || data.phone, {
  message: "E-posta veya telefon gerekli.",
  path: ["email"],
});

export const verifyOtpSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  code: z.string().length(6, "Kod 6 haneli olmalı."),
}).refine((data) => data.email || data.phone, {
  message: "E-posta veya telefon gerekli.",
  path: ["email"],
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
