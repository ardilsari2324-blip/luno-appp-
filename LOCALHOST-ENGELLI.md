# Localhost açılmıyorsa / yasaklıysa

Uygulamayı **localhost olmadan** açmak için **ngrok** tüneli kullan (şifre/IP sormaz).

## Adımlar

### 1. Sunucuyu başlat
Bir terminalde:
```bash
cd "/Users/ardilsari/Desktop/my app/luno"
npm run dev
```
"Ready in ..." yazısını bekle.

### 2. Tüneli başlat (ngrok)
**Yeni bir terminal** aç:
```bash
cd "/Users/ardilsari/Desktop/my app/luno"
npm run dev:tunnel
```

Ekranda şöyle bir link görünecek:
```
Forwarding    https://xxxx-xxxx.ngrok-free.app -> http://localhost:3001
```

### 3. Bu linki aç
Tarayıcıda **https://...ngrok-free.app** linkini kopyalayıp aç.  
Ngrok ilk seferde "Visit Site" butonu gösterebilir — tıkla, Luno açılır. Şifre veya IP gerekmez.

Telefonda da aynı linki açabilirsin.

---

**Not:** ngrok ücretsiz; link her seferinde değişir. Sabit link istersen ngrok.com'da ücretsiz hesap açıp authtoken kullan.
