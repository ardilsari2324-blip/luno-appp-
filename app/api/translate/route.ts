import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const LIBRE_URL = "https://libretranslate.com/translate";
const TRANSLATE_RATE_LIMIT = 30; // dakikada 30 çeviri isteği (IP başına)
const TRANSLATE_WINDOW_MS = 60_000;
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

const INVALID_TRANSLATION_PHRASES = [
  "PLEASE SELECT TWO DISTINCT LANGUAGES",
  "Select two distinct languages",
];

function isValidTranslation(result: string | null, original: string): boolean {
  if (!result || !result.trim()) return false;
  const r = result.trim();
  if (r === original.trim()) return false;
  if (INVALID_TRANSLATION_PHRASES.some((p) => r.toUpperCase().includes(p.toUpperCase()))) return false;
  return true;
}

async function translateLibre(text: string, source: string, target: string): Promise<string | null> {
  if (source === target) return null;
  const res = await fetch(LIBRE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: source === "en" ? "en" : source === "tr" ? "tr" : "auto",
      target: target === "en" ? "en" : "tr",
      format: "text",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { translatedText?: string; error?: string };
  const result = data.translatedText ?? null;
  return result && isValidTranslation(result, text) ? result : null;
}

async function translateMyMemory(text: string, source: string, target: string): Promise<string | null> {
  if (source === target) return null;
  const langPair = `${source}|${target}`;
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { responseData?: { translatedText?: string } };
  const result = data.responseData?.translatedText ?? null;
  return result && isValidTranslation(result, text) ? result : null;
}

function getClientId(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

/** POST: Metni çevir (LibreTranslate + MyMemory fallback) */
export async function POST(req: Request) {
  try {
    const clientId = getClientId(req);
    const { ok } = rateLimit(`translate:${clientId}`, TRANSLATE_RATE_LIMIT, TRANSLATE_WINDOW_MS);
    if (!ok) {
      return NextResponse.json(
        { error: "Çok fazla çeviri isteği. Lütfen bekleyin." },
        { status: 429 }
      );
    }

    const { text, source = "auto", target = "en" } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }
    const trimmed = text.trim().slice(0, 3000);
    if (!trimmed) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    const tgt = target === "en" ? "en" : "tr";
    const srcExplicit = source === "en" ? "en" : source === "tr" ? "tr" : null;

    let result: string | null = null;
    const src = srcExplicit ?? (tgt === "en" ? "tr" : "en");

    if (src !== tgt) {
      result = await translateLibre(trimmed, src, tgt)
        ?? await translateMyMemory(trimmed, src, tgt);
    }
    if (!result && src !== tgt) {
      const otherSrc = tgt === "en" ? "tr" : "en";
      result = await translateMyMemory(trimmed, otherSrc, tgt);
    }

    if (result && !isValidTranslation(result, trimmed)) result = null;

    return NextResponse.json({
      translatedText: result ?? trimmed,
      source: src,
      target: tgt,
    });
  } catch (e) {
    console.error("Translate error:", e);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
