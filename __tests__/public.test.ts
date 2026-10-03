import { describe, it, expect } from "vitest";
import { calculateReadingTime } from "../app/lib/public";

describe("Public helpers", () => {
  describe("calculateReadingTime", () => {
    it("returns 1 min read for short texts", () => {
      expect(calculateReadingTime("Hello world")).toBe("1 min read");
    });

    it("calculates accurate reading time for long texts", () => {
      // 500 words -> 3 min read (500 / 200 = 2.5 => 3)
      const words = Array(500).fill("word").join(" ");
      expect(calculateReadingTime(words)).toBe("3 min read");
    });
  });
});
