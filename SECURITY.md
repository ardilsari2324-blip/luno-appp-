# Veilon — Güvenlik özeti

## Kimlik doğrulama

- Şifreler **bcrypt** ile hash’lenir; düz metin saklanmaz.
- **NextAuth** JWT oturumu; `AUTH_SECRET` production’da güçlü ve gizli tutulmalı.
- **Giriş denemesi:** `authorize` içinde e-posta başına dakikada sınırlı istek (`rateLimitByKey`); Upstash ile dağıtık sınır.
- **Kayıt / şifre sıfırlama:** E-posta kodu, süre ve amaç (`purpose`: signup | password_reset) ayrımı.
- Şifre sıfırlamada **yeni şifre = eski şifre** reddedilir.

## Rate limit

- `lib/rate-limit.ts`: **`rateLimitByKey`** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` tanımlıysa **Upstash Redis**, yoksa bellek içi (serverless’ta zayıf).
- Production’da **Upstash eklemeniz önerilir**.

## HTTP başlıkları

- `next.config.mjs`: CSP, HSTS (prod), `X-Frame-Options`, `Permissions-Policy`, vb.
- Middleware ek başlıklar uygular (korunan rotalar).

## Veri ve sırlar

- `.env` **asla** repoya commit edilmez.
- `DATABASE_URL`, `RESEND_API_KEY` yalnızca sunucu ortamında.
- Vercel’de `DATABASE_URL` **Build** ortamında da tanımlı olmalı (`vercel-build` → `prisma db push`).

## İçerik ve yükleme

- Metin: `sanitize` katmanı.
- Yükleme: MIME + magic byte (görsel), boyut sınırları (`upload-security`).

## Kontrol listesi (deploy öncesi)

- [ ] `AUTH_SECRET` en az 32 karakter, rastgele
- [ ] `NEXTAUTH_URL` canlı domain ile eşleşiyor
- [ ] Neon / Postgres erişimi ve yedek politikası gözden geçirildi
- [ ] Resend domain / gönderen doğrulandı
- [ ] (Önerilir) Upstash Redis bağlandı
- [ ] (Önerilir) Sentry DSN production’da
