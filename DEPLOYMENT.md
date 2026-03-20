# Veilon — Deployment Rehberi

Bu döküman, Veilon uygulamasını production ortamına alırken izleyebileceğiniz referans bir rehberdir.

---

## Vercel ile Deploy (En Hızlı Yol)

### 1. Postgres Veritabanı Aç

- [Neon](https://neon.tech) veya [Supabase](https://supabase.com) ücretsiz hesap aç
- Yeni proje oluştur → **Connection string** (PostgreSQL) kopyala  
  Örnek: `postgresql://user:pass@host/db?sslmode=require`

### 2. GitHub'a Push

```bash
cd "/Users/ardilsari/Desktop/my app/luno"
git init
git add .
git commit -m "Initial Veilon"
git branch -M main
# GitHub'da yeni repo oluştur (örn. luno-app), sonra:
git remote add origin https://github.com/KULLANICI_ADIN/luno-app.git
git push -u origin main
```

### 3. Vercel'de Proje Oluştur

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. GitHub reposunu seç → **Import**
3. **Environment Variables** ekle:

| Değişken | Değer |
|----------|-------|
| `DATABASE_URL` | Neon/Supabase connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` ile üret |
| `NEXTAUTH_URL` | `https://PROJE-ADIN.vercel.app` (deploy sonrası güncelle) |
| `RESEND_API_KEY` | Resend API key |

4. **Deploy** tıkla.

### 4. İlk Deploy Sonrası

1. Vercel'den verilen URL'i kopyala (örn. `https://luno-xxx.vercel.app`)
2. Vercel → **Settings** → **Environment Variables** → `NEXTAUTH_URL` değerini bu URL ile güncelle
3. **Redeploy** yap
4. Veritabanı tablolarını oluştur (bir kere, kendi bilgisayarından):

```bash
DATABASE_URL="postgresql://..." npm run db:push:pg
```

(`DATABASE_URL` yerine Neon/Supabase connection string'ini yapıştır)

---

## 1. Gereksinimler

- Node.js 20
- Docker + Docker Compose (önerilir)
- Bir PostgreSQL instance'ı (managed veya kendi Docker'iniz)
- Bir e-posta sağlayıcısı (Resend) ve isteğe bağlı olarak:
  - Twilio (SMS OTP)
  - Upstash Redis (rate limit)
  - Sentry (error monitoring)

## 2. Ortam Değişkenlerini Hazırlama

1. Sunucuda projeyi klonlayın.
2. `.env.example` dosyasını kopyalayın:

```bash
cp .env.example .env
```

3. Aşağıdaki kritik değişkenleri mutlaka doldurun:

- `DATABASE_URL` → production PostgreSQL bağlantısı
- `AUTH_SECRET` → güçlü, 32+ karakterlik secret
- `NEXTAUTH_URL` → dışarıdan erişilen HTTPS URL
- `RESEND_API_KEY` → e-posta OTP için

İsteğe bağlı ama önerilenler:

- `TWILIO_*` → SMS OTP
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` → rate limit için
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` → Sentry

## 3. Docker ile Deploy (App + Postgres)

Sunucuda:

```bash
# İlk kurulum / güncelleme
docker-compose up -d --build

# Postgres şemasını migrate etmek için (hosttan)
npm run db:migrate:pg
```

Bu komutlar:

- `postgres` servisini başlatır (Docker içinde)
- `app` servisini `Dockerfile` kullanarak build eder ve 3001 portundan sunar
- `DATABASE_URL` otomatik olarak `postgres://luno:luno@postgres:5432/luno?schema=public` olarak ayarlanır

Uygulama URL'si:

- `http://<sunucu-ip>:3001` (veya reverse proxy üzerinden HTTPS)

## 4. Reverse Proxy (Nginx / Caddy) Örneği

Domain üzerinden yayınlamak için bir reverse proxy kullanın.

Örneğin Nginx için:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

HTTPS için Let's Encrypt (Certbot) veya Caddy (otomatik SSL) kullanabilirsiniz.

## 5. CI (GitHub Actions)

`main` / `master` branch'lerine push veya PR açıldığında:

- `.github/workflows/ci.yml` pipeline'ı:
  - `npm ci`
  - `npm run db:generate`
  - `npm run lint`
  - `npm run test`
  - `npm run build`

Bu sayede production'a giden kodun her zaman:

- Lint hatasız
- Testleri geçen
- Build'ü çalışır

olması sağlanır.

## 6. Güncelleme Akışı (Önerilen)

1. Lokalinizde feature branch'te geliştirme yapın.
2. `npm run lint`, `npm run test`, `npm run build` çalıştırın.
3. GitHub'a push edin, PR açın → CI pipeline'ı otomatik çalışır.
4. PR merge olduktan sonra sunucuda:

```bash
git pull
docker-compose up -d --build
npm run db:migrate:pg   # Şema değiştiyse
```

Bu akış, hem veritabanı hem de uygulama için güvenli ve tekrarlanabilir bir deploy süreci sağlar.

