# Luno — Çalıştırma komutları

## Geliştirme (local)

```bash
# Bağımlılıklar (ilk seferde)
npm install

# Veritabanı (SQLite) — ilk seferde
npm run db:generate
npm run db:migrate
# İsteğe bağlı: npm run db:seed

# Geliştirme sunucusu
npm run dev
# → http://localhost:3001
```

`.env` dosyası proje kökünde olmalı. Yoksa:

```bash
cp .env.example .env
# .env içinde en azından DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL doldur
```

---

## Production (local test)

```bash
npm run build
npm run start
# → http://localhost:3000 (varsayılan Next port)
```

---

## Lint & Test

```bash
npm run lint
npm run test
```

---

## Vercel’e deploy

1. **GitHub’a push** (zaten yapılandırıldıysa):
   ```bash
   git push -u origin main
   ```

2. **Vercel**: [vercel.com](https://vercel.com) → Add New → Project → Repo’yu seç.

3. **Environment Variables** ekle:
   - `DATABASE_URL` — Neon/Supabase Postgres connection string
   - `AUTH_SECRET` — Güçlü rastgele string (32+ karakter)
   - `NEXTAUTH_URL` — Deploy sonrası verilen URL (örn. `https://xxx.vercel.app`)
   - `RESEND_API_KEY` — (Opsiyonel) E-posta OTP için

4. Deploy sonrası **tabloları oluştur** (bir kere):
   ```bash
   DATABASE_URL="postgresql://..." npm run db:push:pg
   ```

Vercel build otomatik olarak `vercel.json` içindeki komutu kullanır:
`prisma generate --schema prisma/pg/schema.prisma && next build`
