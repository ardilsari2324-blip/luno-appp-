-- Veilon: Kayıt (e-posta + şifre) için gerekli kolonlar.
--
-- Otomatik: Vercel build artık `npm run vercel-build` ile `prisma db push`
-- (prisma/pg/schema.prisma) çalıştırır — DATABASE_URL build sırasında ayarlı olmalı.
--
-- Manuel (yedek): Aşağıdakileri Neon / Supabase SQL Editor’de bir kez çalıştırabilirsiniz.

ALTER TABLE "OtpVerification" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
