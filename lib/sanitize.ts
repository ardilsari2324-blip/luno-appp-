/**
 * XSS önleme: kullanıcı girdisinden tehlikeli karakterleri temizle.
 * HTML render etmiyorsak sadece uzunluk ve kontrol karakterleri yeterli.
 */

const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ON_EVENT_PATTERN = /\s*on\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URI_PATTERN = /javascript:/gi;

export function sanitizeText(input: string, maxLength: number = 10_000): string {
  if (typeof input !== "string") return "";
  const s = input
    .replace(SCRIPT_PATTERN, "")
    .replace(ON_EVENT_PATTERN, "")
    .replace(JAVASCRIPT_URI_PATTERN, "")
    .replace(/\0/g, "")
    .trim();
  return s.slice(0, maxLength);
}

export function sanitizeForDisplay(input: string): string {
  return sanitizeText(input, 5000);
}
