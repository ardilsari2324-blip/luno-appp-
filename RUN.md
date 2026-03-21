# Veilon — Çalıştırma komutları

## Geliştirme (local)

```bash
npm install
npm run db:generate
npm run db:migrate
# npm run db:seed   # isteğe bağlı
npm run dev
# → http://localhost:3001
```

`.env` yoksa: `cp .env.example .env` — en az `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`.

---

## Production (yerelde test)

```bash
npm run build
npm run start
# next start varsayılan port 3000 — package.json'da özelleştirilebilir
```

Vercel’de production build: `vercel.json` → **`npm run vercel-build`** (Postgres şeması + `prisma db push` + `next build`).

---

## Lint & test

```bash
npm run lint
npm run test
```

---

## Deploy (özet)

1. `git push origin main`
2. Vercel: env’ler — `DATABASE_URL` (**Build + Production**), `AUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, isteğe bağlı `UPSTASH_REDIS_*`
3. Ayrıntı: [DEPLOYMENT.md](./DEPLOYMENT.md) · Güvenlik: [SECURITY.md](./SECURITY.md)
