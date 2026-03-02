import { describe, it, expect } from "vitest";
import { containsBadWord } from "../bad-words";

describe("containsBadWord", () => {
  it("returns false for empty or clean text", () => {
    expect(containsBadWord("")).toBe(false);
    expect(containsBadWord("Merhaba dünya")).toBe(false);
    expect(containsBadWord("Normal bir gönderi")).toBe(false);
  });

  it("returns true when bad word present", () => {
    expect(containsBadWord("bu spam bir mesaj")).toBe(true);
    expect(containsBadWord("SPAM test")).toBe(true);
  });
});
