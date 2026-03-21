# Yayına alma kontrol listesi (Veilon)

Yasal ve operasyonel olarak canlıya almadan önce bu listeyi işaretleyin. **Hukuki konularda bir avukata danışmanız önerilir.**

## Teknik

- [ ] `DATABASE_URL` (Neon pooler önerilir), `AUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY` Vercel’de **Production + Build** için tanımlı
- [ ] `NEXTAUTH_URL` gerçek domain ile eşleşiyor
- [ ] (Önerilir) `UPSTASH_REDIS_*` — rate limit
- [ ] (Önerilir) `NEXT_PUBLIC_SENTRY_DSN` — hatalar
- [ ] `SECURITY_CONTACT_EMAIL` ve gerekirse `LEGAL_CONTACT_EMAIL` / destek e-postası
- [ ] `npm run build` / deploy başarılı
- [ ] `/.well-known/security.txt` canlıda açılıyor mu kontrol

## Yasal / içerik

- [ ] [Kullanım koşulları](/terms) ve [gizlilik](/privacy) güncel; kullanıcı erişebiliyor
- [ ] Çerez bandı çalışıyor (`CookieConsent`)
- [ ] Şikayet / engelleme akışı test edildi
- [ ] Admin şikayet paneli sadece yetkili hesaplara açık (`ADMIN_USER_IDS`)

## Operasyon

- [ ] Şikayetlere yanıt süresi ve içerik kaldırma süreci net (ekip içi)
- [ ] 5651 / ciddi ihlal senaryosu için yetkili makam bildirimi prosedürü (avukat ile)
- [ ] Yedek: Neon snapshot / export politikası

## Son not

Bu liste tamamlanmış olsa bile **yatırım veya hukuki risk sıfırlanmaz**; ürün büyüdükçe politika ve altyapı güncellenmelidir.
