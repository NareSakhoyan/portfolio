import { describe, expect, it } from "vitest";
import { chunkMarkdown } from "@/lib/ask/chunk";

describe("chunkMarkdown", () => {
  it("splits by headings and builds breadcrumb sources", () => {
    const md = `# CV\n\n## Experience\n\n### Prostrive\nBuilt things.\n\n## Skills\nTypeScript.`;
    const chunks = chunkMarkdown("cv.md", md);
    expect(chunks.map((c) => c.source)).toEqual([
      "cv.md › CV › Experience › Prostrive",
      "cv.md › CV › Skills",
    ]);
    expect(chunks[0].text).toContain("Built things.");
    expect(chunks[0].file).toBe("cv.md");
  });

  it("skips empty sections and keeps ids unique", () => {
    const chunks = chunkMarkdown("f.md", "# A\n\n## B\n\n## C\ntext");
    expect(chunks).toHaveLength(1);
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });

  it("splits long sections on paragraph boundaries", () => {
    const para = "word ".repeat(150).trim();
    const md = `# T\n\n${para}\n\n${para}\n\n${para}`;
    const chunks = chunkMarkdown("long.md", md);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c) => expect(c.text.length).toBeLessThan(1400));
  });
});
