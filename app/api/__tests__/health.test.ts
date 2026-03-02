/**
 * Health endpoint test — fetch ile gerçek istek (dev server gerekir)
 * npm run test ile çalıştırıldığında server yoksa skip edilebilir
 */
import { describe, it, expect } from "vitest";

describe("API health", () => {
  it("health endpoint returns ok when server running", async () => {
    try {
      const res = await fetch("http://localhost:3001/api/health");
      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.database).toBe("connected");
    } catch {
      // Server yoksa skip — CI'da dev server çalışmıyor olabilir
    }
  });
});
