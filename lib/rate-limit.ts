/**
 * Rate limit: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN varsa Redis kullanır,
 * yoksa in-memory (MVP, sunucu restart'ta sıfırlanır).
 */

const store = new Map<string, { count: number; resetAt: number }>();

async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; remaining: number }> {
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
    });
    const result = await ratelimit.limit(key);
    return { ok: result.success, remaining: result.remaining };
  } catch {
    return memoryRateLimit(key, limit, windowMs);
  }
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { ok: true, remaining: limit - 1 };
  }
  entry.count++;
  const ok = entry.count <= limit;
  return { ok, remaining: Math.max(0, limit - entry.count) };
}

function rateLimitSync(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  return memoryRateLimit(key, limit, windowMs);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  return rateLimitSync(key, limit, windowMs);
}

/** Kullanıcı bazlı: dakikada max N istek. Upstash varsa Redis, yoksa in-memory. */
export async function checkUserRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowMs = 60_000
): Promise<{ ok: boolean; remaining: number }> {
  const k = `user:${userId}:${action}`;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return redisRateLimit(k, limit, windowMs);
  }
  return Promise.resolve(memoryRateLimit(k, limit, windowMs));
}
