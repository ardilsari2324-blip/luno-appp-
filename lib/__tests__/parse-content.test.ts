import { describe, it, expect } from "vitest";
import { extractHashtags, extractMentions } from "../parse-content";

describe("extractHashtags", () => {
  it("extracts hashtags from text", () => {
    expect(extractHashtags("#test #hello")).toEqual(["test", "hello"]);
    expect(extractHashtags("Merhaba #dünya")).toEqual(["dünya"]);
    expect(extractHashtags("no tags")).toEqual([]);
  });

  it("deduplicates hashtags", () => {
    expect(extractHashtags("#tag #tag #other")).toEqual(["tag", "other"]);
  });
});

describe("extractMentions", () => {
  it("extracts mentions from text", () => {
    expect(extractMentions("@user1 @user2")).toEqual(["user1", "user2"]);
    expect(extractMentions("Hey @anon_123!")).toEqual(["anon_123"]);
    expect(extractMentions("no mentions")).toEqual([]);
  });
});
