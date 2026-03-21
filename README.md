# Veilon

Anonim rumuzlarla gönderi paylaşımı, yorum, beğeni, alıntı, takip, mesaj ve bildirimler — X/Twitter tarzı sosyal web uygulaması.

## Teknolojiler

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend:** Next.js Route Handlers
- **Veritabanı:** Geliştirme SQLite (Prisma) — production’da **PostgreSQL** (ör. Neon)
- **Auth:** NextAuth v5 — **e-posta + şifre**; kayıtta e-posta doğrulama kodu; **şifremi unuttum** akışı
- **State:** TanStack Query, React Hook Form + Zod

## Kurulum (yerel)

```bash
npm install
cp .env.example .env   # AUTH_SECRET, DATABASE_URL, NEXTAUTH_URL doldur
npm run db:generate
npm run db:migrate
# npm run db:seed    # isteğe bağlı
npm run dev          # → http://localhost:3001
```

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (port 3001) |
| `npm run build` | Yerel production build (SQLite şeması) |
| `npm run vercel-build` | Postgres şeması + `db push` + build (Vercel’de kullanılır) |
| `npm run db:migrate` | SQLite migration |
| `npm run db:push:pg` | Postgres şemasını `prisma/pg/schema` ile it (manuel) |

**Ayrıntılı deploy:** [DEPLOYMENT.md](./DEPLOYMENT.md) · **Güvenlik:** [SECURITY.md](./SECURITY.md)

## Ortam değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | SQLite: `file:./dev.db` · Production: `postgresql://...` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Örn. `http://localhost:3001` veya `https://proje.vercel.app` |
| `RESEND_API_KEY` | Kayıt / şifre sıfırlama e-postaları |
| `RESEND_FROM_EMAIL` | Doğrulanmış gönderen (opsiyonel) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limit (production önerilir) |
| `BLOB_READ_WRITE_TOKEN` | Medya (Vercel Blob) |
| `NEXT_PUBLIC_SENTRY_DSN` | Hata izleme (opsiyonel) |
| `ADMIN_USER_IDS` | Admin paneli (virgülle CUID) |

## Sayfalar (özet)

| Rota | Açıklama |
|------|----------|
| `/` | Landing |
| `/login` | Giriş · Kayıt (e-posta + şifre + kod) · Şifremi unuttum |
| `/app` | Akış |
| `/app/post/[id]` | Gönderi, yorum, alıntı |
| `/app/profile/[id]` | Profil, takip |
| `/app/messages` | Mesajlar |
| `/app/search` | Arama |
| `/settings` | Dil, tema, veri dışa aktarma, hesap silme (e-posta + şifre) |
| `/admin` | Şikayet inceleme (ADMIN_USER_IDS) |

## Özellikler (MVP+)

1. **Hesap:** Kayıt (kod ile doğrulama), giriş, çıkış, şifre sıfırlama, hesap silme
2. **İçerik:** Gönderi, medya, beğeni, yorum, alıntı, çeviri
3. **Sosyal:** Takip, bildirimler, engelleme, şikayet
4. **Gizlilik:** KVKK/GDPR veri dışa aktarma, çerez bildirimi

## Güvenlik (kısa)

- Şifreler bcrypt; JWT oturum; rate limit (Redis ile güçlendirilir).
- CSP ve güvenlik başlıkları `next.config.mjs` içinde.
- Ayrıntı: [SECURITY.md](./SECURITY.md)

## Vercel + Neon

1. Repoyu GitHub’a bağla, Vercel’den import et.
2. Environment Variables: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY` (Build + Production).
3. `vercel.json` → `npm run vercel-build` (Postgres client üretimi + `prisma db push` + `next build`).
4. İlk deploy sonrası `NEXTAUTH_URL`’i gerçek domain ile güncelle, yeniden deploy et.

Manuel SQL gerekirse: `scripts/vercel-postgres-password-columns.sql` (eski veritabanları için).

## Test & CI

```bash
npm run lint
npm run test
npm run build
```

GitHub Actions: push/PR’da lint, test, build (`.github/workflows/ci.yml`).

## Not

- Telefon / SMS ile giriş şu an kapalı; e-posta + şifre kullanılır.
- Eski yalnızca OTP hesaplarında `passwordHash` yoksa yeni giriş yöntemiyle oturum açılamaz; gerekirse destek veya “şifre belirle” akışı eklenir.
