import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Milestone F4-1: Claims Integrity Guard
 * 
 * Enforces Chronicle's core thesis: "Technical writing you can trust — and learn from."
 * Permanently prevents regression of hardcoded or fabricated truth signals.
 */
describe("Claims Integrity Guard", () => {
  const BANNED_CLAIM_PATTERNS = [
    {
      phrase: "100% Grounded",
      reason: "Overclaiming AI accuracy without verification.",
    },
    {
      phrase: "generateFallbackQuizFromContent",
      reason: "Fake template questions that hallucinate comprehension checks.",
    },
    {
      phrase: "Published engineer sharing architectural insights and verified code patterns on Chronicle",
      reason: "Boilerplate author bio fabrication.",
    },
    {
      phrase: "Technical Writer at Chronicle",
      reason: "Fabricated role title assigned without server data.",
    },
    {
      phrase: "What is the core takeaway of",
      reason: "Generic hardcoded quiz fallback question.",
    },
  ];

  function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        // Skip hidden, build, or node_modules directories
        if (!file.startsWith(".") && file !== "node_modules") {
          getAllSourceFiles(fullPath, fileList);
        }
      } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const appDir = path.resolve(process.cwd(), "app");
  const allAppFiles = getAllSourceFiles(appDir);

  it("finds production app source files to verify", () => {
    expect(allAppFiles.length).toBeGreaterThan(15);
  });

  for (const { phrase, reason } of BANNED_CLAIM_PATTERNS) {
    it(`guarantees zero occurrences of banned claim: "${phrase}" (${reason})`, () => {
      const offendingFiles: string[] = [];

      for (const filePath of allAppFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        if (content.includes(phrase)) {
          offendingFiles.push(path.relative(process.cwd(), filePath));
        }
      }

      expect(
        offendingFiles,
        `Found banned phrase "${phrase}" in: ${offendingFiles.join(", ")}. Reason: ${reason}`
      ).toEqual([]);
    });
  }
});
