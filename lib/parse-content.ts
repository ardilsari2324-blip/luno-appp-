/**
 * Hashtag (#tag) ve mention (@nickname) parse
 */

/** Metindeki #hashtag'leri bul */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#[\w\u00c0-\u024f]+/g);
  return Array.from(new Set((matches || []).map((m) => m.slice(1).toLowerCase())));
}

/** Metindeki @mention'ları bul (nickname formatı) */
export function extractMentions(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/@[\w\u00c0-\u024f_]+/g);
  return Array.from(new Set((matches || []).map((m) => m.slice(1))));
}
