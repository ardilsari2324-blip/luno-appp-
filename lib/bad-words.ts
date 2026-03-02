/**
 * Basit kötü kelime filtresi — içerik oluşturulurken kontrol edilir.
 * Liste genişletilebilir; production'da daha kapsamlı bir liste önerilir.
 */

const BAD_WORDS_TR = [
  "küfür", "hakaret", "spam",
  // Bu liste örnek; gerçek kullanımda genişletilmeli
];

const BAD_WORDS_EN = [
  "spam", "scam",
  // Örnek
];

const ALL = Array.from(new Set([...BAD_WORDS_TR, ...BAD_WORDS_EN]));

/** Metinde yasaklı kelime var mı? (basit kelime sınırı kontrolü) */
export function containsBadWord(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase().replace(/[^\w\s\u00c0-\u024f]/g, " ");
  const words = lower.split(/\s+/).filter(Boolean);
  for (const bad of ALL) {
    if (words.some((w) => w.includes(bad) || bad.includes(w))) return true;
  }
  return false;
}
