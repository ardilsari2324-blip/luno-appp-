#!/bin/bash
# Luno — Çalıştır ve tarayıcıda aç

cd "$(dirname "$0")"
PORT=3001

# Portu temizle
echo "Port $PORT kontrol ediliyor..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null && echo "Eski süreç durduruldu." || true
sleep 2

# Sunucuyu arka planda başlat
echo "Luno başlatılıyor..."
npm run dev &
PID=$!

# Sunucunun hazır olmasını bekle
echo "Sunucu hazırlanıyor..."
for i in {1..15}; do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/ 2>/dev/null | grep -q "200\|304"; then
    echo "✓ Sunucu hazır!"
    sleep 1
    open "http://127.0.0.1:$PORT"
    echo ""
    echo "Luno açıldı: http://127.0.0.1:$PORT"
    echo "Durdurmak için: kill $PID"
    wait $PID
    exit 0
  fi
  sleep 1
done

echo "Sunucu başlatılamadı. Manuel: npm run dev"
kill $PID 2>/dev/null
exit 1
