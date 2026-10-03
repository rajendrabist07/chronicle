import { describe, it, expect } from "vitest";
import { evaluatePasswordStrength } from "../app/lib/passwordStrength";

describe("Password Strength Evaluator", () => {
  it("evaluates empty password as Very Weak", () => {
    const result = evaluatePasswordStrength("");
    expect(result.score).toBe(0);
    expect(result.label).toBe("Very Weak");
    expect(result.percentage).toBe(0);
  });

  it("evaluates short password as Weak", () => {
    const result = evaluatePasswordStrength("abc");
    expect(result.score).toBe(0);
    expect(result.label).toBe("Very Weak");
  });

  it("evaluates 8 character simple password", () => {
    const result = evaluatePasswordStrength("password");
    expect(result.score).toBeGreaterThanOrEqual(1);
  });

  it("evaluates strong complex password", () => {
    const result = evaluatePasswordStrength("SuperSecret123!@#Pass");
    expect(result.score).toBe(4);
    expect(result.label).toBe("Strong");
    expect(result.percentage).toBe(100);
  });
});
