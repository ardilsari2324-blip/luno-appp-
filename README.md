# Luno

Anonim hesaplarla fikir, sorun ve sır paylaşımı yapılan Twitter/X tarzı sosyal uygulama. Sistem kullanıcıya anonim nickname atar; e-posta veya telefonla OTP ile kayıt/giriş.

## Teknolojiler

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes
- **Veritabanı:** SQLite (Prisma) + opsiyonel PostgreSQL
- **Auth:** NextAuth (OTP ile giriş)
- **State:** TanStack Query, React Hook Form + Zod

## Kurulum

```bash
# Bağımlılıklar (zaten yüklü)
npm install

# Ortam değişkenleri
cp .env.example .env
# .env içinde AUTH_SECRET ve DATABASE_URL'ü ayarlayın

# Veritabanı
npm run db:generate
npm run db:migrate
npm run db:seed   # İsteğe bağlı: örnek veri
```

## PostgreSQL ile çalıştırma (opsiyonel)

```bash
# App + Postgres'i başlat
docker-compose up -d --build

# Postgres şemasını migrate et (hosttan)
npm run db:migrate:pg
```

## Ortam Değişkenleri (.env)

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | SQLite: `file:./dev.db` veya Postgres: `postgresql://...` |
| `AUTH_SECRET` | NextAuth secret (en az 32 karakter). Üretmek için: `npx auth secret` veya `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Uygulama URL (dev: `http://localhost:3001`) |
| `RESEND_API_KEY` | Resend API key — e-posta OTP için ([resend.com](https://resend.com)) |
| `RESEND_FROM_EMAIL` | Gönderen e-posta (opsiyonel, yoksa Resend test adresi kullanılır) |
| `ADMIN_USER_ID` veya `ADMIN_USER_IDS` | Admin paneli erişimi için kullanıcı ID'leri (virgülle ayrılmış). Boşsa admin paneli kimseye açılmaz. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — medya yükleme için (production). |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | SMS OTP için Twilio (opsiyonel). |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit için Upstash Redis (opsiyonel ama production’da önerilir). |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (opsiyonel ama production’da önerilir). |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Source map upload (CI/CD) için Sentry (opsiyonel). |

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (http://localhost:3001) |
| `npm run build` | Production build |
| `npm run start` | Production sunucuyu başlat |
| `npm run db:generate` | Prisma client üret |
| `npm run db:migrate` | Migration uygula |
| `npm run db:seed` | Seed script çalıştır |
| `npm run db:studio` | Prisma Studio (veritabanı UI) |
| `npm run db:migrate:pg` | Postgres şeması ile migrate (`prisma/pg/schema.prisma`) |
| `npm run db:studio:pg` | Postgres şeması ile Prisma Studio |

## Sayfalar

- `/` — Landing
- `/login` — OTP ile giriş / kayıt
- `/app` — Akış (gönderiler)
- `/app/post/[id]` — Gönderi detay, yorum, alıntı
- `/app/profile/[id]` — Anonim profil
- `/app/messages` — Mesajlar ve mesaj istekleri
- `/settings` — Ayarlar, çıkış

## MVP Özellikler

1. **Auth:** E-posta veya telefon → OTP kodu → giriş/kayıt (anonim nickname atanır)
2. **Gönderiler:** Oluşturma, akış, beğeni, yorum, alıntı
3. **Mesajlaşma:** Mesaj isteği gönderme, kabul, sohbet

## Güvenlik

- **Auth:** NextAuth JWT, OTP tek kullanımlık ve süre sınırlı (10 dk).
- **Rate limit:** OTP gönderimi dakikada 5; gönderi oluşturma 20; dosya yükleme 10 (kullanıcı başına). Production’da Redis/Upstash önerilir.
- **Başlıklar:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (next.config + middleware).
- **Upload:** Dosya boyutu max 25MB; sadece image/video MIME; görseller için magic-byte doğrulaması (sahte uzantıya karşı).
- **API:** Korumalı route’lar `auth()` ile kontrol edilir; girdi Zod ile validate edilir.
- **Gizlilik:** Secret’lar `.env`’de; `.env` repo’da yok.

## Hız

- **Veritabanı:** Post ve Comment için index (authorId, createdAt, postId); sorgular hızlanır.
- **React Query:** `staleTime: 30s`, `gcTime: 5dk`; gereksiz refetch azalır.
- **Code splitting:** Feed ve Mesajlar sayfaları dynamic import; ilk yükleme hafifler.
- **Loading:** `/app` ve `/app/app` için `loading.tsx`; sayfa geçişinde anında “Yükleniyor” görünür.

## Notlar

- **E-posta OTP:** `RESEND_API_KEY` tanımlıysa giriş kodu kullanıcının e-postasına Resend ile gönderilir. Yoksa (dev) kod konsola yazılır.
- **SMS OTP:** `TWILIO_*` tanımlıysa OTP SMS ile gönderilir. Twilio yoksa (dev) kod konsola yazılır.
- SQLite MVP içindir; production için PostgreSQL önerilir.
- **Error monitoring:** Sentry opsiyonel; `NEXT_PUBLIC_SENTRY_DSN` tanımlıysa otomatik aktif olur.

## Çalıştırma kontrol listesi

- [ ] `.env` dosyası var ve `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` dolu
- [ ] `npm run db:generate` ve `npm run db:migrate` çalıştırıldı
- [ ] İsteğe bağlı: `npm run db:seed` ile örnek veri yüklendi
- [ ] `npm run dev` ile http://localhost:3001 açıldı
- [ ] `/login` → E-posta gir → "Kod gönder" → Konsoldaki 6 haneli kodu gir → Giriş
- [ ] `/app` → Gönderi yazıp gönder, beğeni, yorum, alıntı test edildi
- [ ] `/app/profile/[id]` → "Mesaj gönder" ile mesaj isteği
- [ ] `/app/messages` → İstek kabul / sohbet
- [ ] `/settings` → Çıkış yap
- [ ] `npm run build` hatasız tamamlanıyor
 - [ ] GitHub Actions CI (`.github/workflows/ci.yml`) başarılı

Detaylı production deploy adımları için `DEPLOYMENT.md` dosyasına bakabilirsiniz.
