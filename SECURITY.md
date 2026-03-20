# Veilon — Güvenlik Önlemleri

Bu belge, uygulamanın güvenlik ve güvenilirlik önlemlerini özetler.

## HTTP Güvenlik Başlıkları

- **X-Frame-Options: DENY** — Clickjacking engeli
- **X-Content-Type-Options: nosniff** — MIME sniffing engeli
- **Referrer-Policy** — Referrer bilgisinin sızması sınırlı
- **Permissions-Policy** — Kamera, mikrofon, konum varsayılan kapalı
- **X-XSS-Protection** — Tarayıcı XSS filtresi
- **Content-Security-Policy** — Script, style, bağlantı kaynakları kısıtlı
- **Strict-Transport-Security** (production) — HTTPS zorunluluğu

## Kimlik Doğrulama

- NextAuth JWT oturumu; production’da `useSecureCookies`
- OTP tek kullanımlık; doğrulama sonrası silinir
- OTP gönderim ve doğrulama rate limit ile korunur

## Rate Limiting

| Endpoint / Aksiyon | Limit |
|--------------------|--------|
| OTP gönder | 5 / dakika (e-posta/telefon başına) |
| OTP doğrula | 10 / dakika (identifier başına) |
| Çeviri API | 30 / dakika (IP başına) |
| Gönderi oluştur | 20 / dakika (kullanıcı) |
| Yorum | 30 / dakika (kullanıcı) |
| Medya yükleme | 10 / dakika (kullanıcı) |

## Girdi Güvenliği

- **Zod** ile tüm API girdileri doğrulanıyor
- **sanitizeText** ile post ve yorum metinlerinde XSS riski azaltılıyor (script/onEvent/javascript: temizlenir)
- Medya yüklemede **magic byte** kontrolü (sahte MIME’a karşı)
- Dosya tipi ve boyut sınırları (ör. 25MB, sadece resim/video)

## Veri ve Hata Yanıtları

- API hata yanıtlarında yalnızca kullanıcıya uygun mesajlar dönülür; stack trace veya iç detay gösterilmez
- Production’da hassas hata detayları log’ta tutulabilir, istemciye gönderilmez

## Öneriler (Production)

- Rate limit için **Redis/Upstash** kullanın (şu an in-memory)
- `AUTH_SECRET` / `NEXTAUTH_SECRET` güçlü ve gizli tutulmalı
- HTTPS zorunlu; `NEXTAUTH_URL` https ile ayarlanmalı
