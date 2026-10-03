import { describe, it, expect } from "vitest";
import { safeNextPath } from "../app/lib/redirect";

describe("safeNextPath", () => {
  it("allows valid same-origin relative paths", () => {
    expect(safeNextPath("/posts")).toBe("/posts");
    expect(safeNextPath("/posts/new")).toBe("/posts/new");
    expect(safeNextPath("/read/my-awesome-post?comment=123")).toBe(
      "/read/my-awesome-post?comment=123",
    );
  });

  it("returns fallback for null, undefined, or empty string", () => {
    expect(safeNextPath(null)).toBe("/posts");
    expect(safeNextPath(undefined)).toBe("/posts");
    expect(safeNextPath("")).toBe("/posts");
    expect(safeNextPath("", "/home")).toBe("/home");
  });

  it("rejects open redirect attacks and external protocols", () => {
    expect(safeNextPath("//evil.com")).toBe("/posts");
    expect(safeNextPath("//attacker.org/phishing")).toBe("/posts");
    expect(safeNextPath("https://google.com")).toBe("/posts");
    expect(safeNextPath("http://evil.com")).toBe("/posts");
    expect(safeNextPath("javascript:alert(1)")).toBe("/posts");
    expect(safeNextPath("/\\evil.com")).toBe("/posts");
    expect(safeNextPath("/posts\\evil")).toBe("/posts");
  });
});
