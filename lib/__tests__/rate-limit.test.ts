import { describe, it, expect } from "vitest";
import { rateLimit, rateLimitByKey, hasRedisRateLimit } from "../rate-limit";

describe("rateLimit (memory)", () => {
  it("allows within limit", () => {
    const k = `t-${Date.now()}-a`;
    expect(rateLimit(k, 3, 60_000).ok).toBe(true);
    expect(rateLimit(k, 3, 60_000).ok).toBe(true);
  });
});

describe("rateLimitByKey", () => {
  it("resolves and returns ok shape", async () => {
    const r = await rateLimitByKey(`async-${Date.now()}`, 5, 60_000);
    expect(r).toHaveProperty("ok");
    expect(r).toHaveProperty("remaining");
    expect(typeof r.ok).toBe("boolean");
  });
});

describe("hasRedisRateLimit", () => {
  it("returns boolean", () => {
    expect(typeof hasRedisRateLimit()).toBe("boolean");
  });
});
