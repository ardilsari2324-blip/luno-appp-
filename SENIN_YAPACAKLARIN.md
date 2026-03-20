# Veilon'u yayına almak — sadece senin yapacakların

Aşağıdakileri **sırayla** yap. Ben tarayıcı açıp hesap oluşturamam, onları sen yapacaksın.

---

## 1) Neon — Veritabanı (2 dk)

1. **https://neon.tech** → Sign up (GitHub ile giriş yap).
2. **New Project** → isim: `luno` → **Create**.
3. **Connection string** kutusundaki metni **Copy** et (örn. `postgresql://...?sslmode=require`).
4. Bunu bir yere kaydet, 4. adımda kullanacaksın.

---

## 2) GitHub'a push (1 dk)

Terminalde (Cursor içinde veya Mac Terminal):

```bash
cd "/Users/ardilsari/Desktop/my app/luno"
git push -u origin main
```

- **Username:** `ardilsari2324-blip`
- **Password:** GitHub şifren değil — **Personal Access Token**.  
  Token yoksa: GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Generate new token (classic)** → **repo** işaretle → oluşan token'ı kopyala, password yerine yapıştır.

Push başarılı olunca 3. adıma geç.

---

## 3) Vercel — Deploy (2 dk)

1. **https://vercel.com** → giriş yap (GitHub ile).
2. **Add New** → **Project**.
3. **Import** → `ardilsari2324-blip/luno-appp-` reposunu seç → **Import**.
4. **Environment Variables** bölümüne şunları ekle (Add diyerek tek tek):

   | Name           | Value |
   |----------------|--------|
   | `DATABASE_URL` | 1. adımda kopyaladığın Neon connection string |
   | `AUTH_SECRET`  | `luno-gizli-anahtar-32-karakter-minimum-boyle` |
   | `NEXTAUTH_URL` | İlk deploy sonrası verilen linki yazacağız, şimdilik `https://luno-appp-.vercel.app` yaz |
   | `RESEND_API_KEY` | İsteğe bağlı; resend.com'dan alırsan e-posta OTP çalışır |

5. **Deploy**'e bas. Deploy bitince Vercel bir link verecek (örn. `https://luno-appp-xxxx.vercel.app`). Bu linki kopyala.

6. Vercel'de projeye gir → **Settings** → **Environment Variables** → `NEXTAUTH_URL`'i bu link ile değiştir → **Save**.
7. **Deployments** → son deploy'un yanında **⋯** → **Redeploy**.

---

## 4) Tabloları oluştur (1 dk)

Terminalde (Neon'dan kopyaladığın connection string'i tırnak içinde yapıştır):

```bash
cd "/Users/ardilsari/Desktop/my app/luno"
DATABASE_URL="postgresql://..." npm run db:push:pg
```

`postgresql://...` yerine 1. adımda kopyaladığın tam connection string gelecek.

---

Bitti. App adresi: Vercel'in verdiği link (örn. `https://luno-appp-xxxx.vercel.app`).
