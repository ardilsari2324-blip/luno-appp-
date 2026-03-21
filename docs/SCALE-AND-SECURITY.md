# Ölçek, hız ve güvenlik — gerçekçi çerçeve

**Instagram / X (Twitter) / Meta** gibi şirketler milyarlarca kullanıcı için **binlerce mühendis**, **özel donanım**, **küresel CDN**, **WAF**, **şifreli DM altyapısı** ve **yıllık milyarlarca dolar** harcar. Bu repo tek başına o seviyenin **aynısı** olamaz.

Aşağıdaki tablo, “unicorn / büyük sosyal” ile **senin stack’in** arasındaki farkı ve **neyi nerede telafi edebileceğini** özetler.

## Ne sende zaten var (iyi MVP+)

| Alan | Durum |
|------|--------|
| HTTPS (Vercel) | Var |
| HSTS + CSP + temel güvenlik başlıkları | `next.config.mjs` |
| Şifre hash (bcrypt), JWT oturum | NextAuth |
| Rate limit (Redis ile güçlenir) | `rateLimitByKey` + Upstash |
| Postgres (Neon) | Var |
| Medya (Blob), upload doğrulama | Var |
| Sentry hook | `instrumentation.ts` |
| Şikayet / engelleme / export | Var |

## Büyük platformlarda ek olan (repo dışı veya eklenti)

| İhtiyaç | Büyük şirketler | Senin tarafta tipik çözüm |
|--------|------------------|---------------------------|
| **Edge / CDN** | Kendi ağı | **Vercel Edge** (zaten) |
| **DDoS / bot** | Özel filtre | **Cloudflare** önünde + Vercel |
| **DB ölçek** | Sharding, özel SQL | **Neon** scale plan, **connection pooling** (pooler URL) |
| **Oturum / cache** | Redis cluster | **Upstash Redis** |
| **İzleme** | Özel pipeline | **Sentry**, Vercel Analytics |
| **2FA / kimlik** | Tam ürün | İleride TOTP / OAuth |
| **DM şifreleme** | E2E (Signal benzeri) | Ayrı mimari gerekir |

## Hız için kontrol listesi

1. **Neon connection string:** Mümkünse **pooler** host kullan (`-pooler`); sunucusuz fonksiyonlar için daha uygun.
2. **Upstash:** Rate limit + ileride cache pattern’leri.
3. **Sentry:** Production’da DSN tanımlı olsun.
4. **Görsel:** `next/image` kullanımı (projede uygun yerlerde).
5. **Ağır sorgular:** Prisma’da index’ler (şemada çoğu var); yavaş sorguyu logla, gerekirse `EXPLAIN` ile Neon’da incele.

## Güvenlik için kontrol listesi

1. `AUTH_SECRET` güçlü ve sadece env’de.
2. `DATABASE_URL` asla istemcide / Git’te yok.
3. Vercel env: **Production** + **Preview** + gerekiyorsa **Build** tutarlı.
4. Düzenli bağımlılık güncellemesi: `npm audit`, Dependabot (GitHub).

## Sonuç

Bu doküman, **aynı “sistemsel güç” iddiasını** pazarlama diliyle değil, **altyapı gerçekleriyle** hizalar. Ürün büyüdükçe **Cloudflare**, **Upstash**, **Neon planı** ve **observability** yatırımı ölçeği büyütür.
