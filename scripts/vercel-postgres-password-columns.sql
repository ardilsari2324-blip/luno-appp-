-- Veilon: Kayıt (e-posta + şifre) için gerekli kolonlar.
-- Vercel / Neon / Supabase Postgres’te bir kez çalıştırın (SQL Editor).
-- "Could not send code" / Prisma P2022 alıyorsanız bu migration eksiktir.

ALTER TABLE "OtpVerification" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
