# Vercel — Environment Variables

Deploy öncesi Vercel → Project → **Settings** → **Environment Variables** kısmına ekle:

| Name | Value | Gerekli |
|------|--------|--------|
| `DATABASE_URL` | Neon veya Supabase connection string (`postgresql://...?sslmode=require`) | Evet |
| `AUTH_SECRET` | `openssl rand -base64 32` çıktısı veya 32+ karakter rastgele string | Evet |
| `NEXTAUTH_URL` | Deploy sonrası verilen URL, örn. `https://luno-appp-xxx.vercel.app` | Evet |
| `RESEND_API_KEY` | resend.com → API Keys | Opsiyonel (e-posta OTP için) |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Blob | Opsiyonel (medya yükleme) |
| `ADMIN_USER_IDS` | Virgülle ayrılmış kullanıcı ID'leri (admin paneli) | Opsiyonel |

İlk deploy’dan sonra `NEXTAUTH_URL`’i mutlaka gerçek Vercel URL ile güncelle → **Redeploy**.
