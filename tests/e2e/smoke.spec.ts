import { expect, test, type Page } from "@playwright/test";

const QUESTION = "What did Nare build at Prostrive?";
const USE_REAL_API = process.env.E2E_REAL_API === "1";

const MOCK_ANSWER =
  "At Prostrive (Nov 2025 – Mar 2026, remote) Nare was a core engineer on PromptTracker — now Answer One — an Answer Engine Optimization platform built with Next.js and Nest.js/Node. It connects to multiple LLM providers to automate prompt generation, scraping, and validation of how brands appear in AI answers. (Source: cv.md › Experience › Prostrive)";

/** Deterministic NDJSON stream so the smoke test runs without API credit. */
async function mockAskRoute(page: Page) {
  await page.route("**/api/ask", async (route) => {
    const events = [
      { type: "tool", name: "search_profile" },
      ...MOCK_ANSWER.split(" ").map((w) => ({ type: "text", text: `${w} ` })),
      {
        type: "done",
        latencyMs: 1840,
        costUsd: 0.0021,
        model: "claude-haiku-4-5-20251001",
        usage: { inputTokens: 1500, outputTokens: 120, cacheReadTokens: 0, cacheWriteTokens: 0 },
        sources: ["cv.md › Experience › Prostrive"],
      },
    ];
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: events.map((e) => JSON.stringify(e)).join("\n") + "\n",
    });
  });
}

test("home film loads: boot scene, console, and status render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Nare Sakhoyan" })).toBeAttached();
  await expect(page.getByText("harness ready.")).toBeAttached();
  await expect(page.getByRole("heading", { level: 2, name: "Ask Nare" })).toBeAttached();
  await expect(page.getByText("This is a harness with a model inside.")).toBeAttached();
  await expect(page.getByText("accepting connections").first()).toBeAttached();
});

test("overview index page shows the classic scannable layout", async ({ page }) => {
  await page.goto("/overview");
  await expect(page.getByRole("heading", { level: 1, name: "Nare Sakhoyan" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Projects" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Experience" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Job-search agent/ })).toBeVisible();
});

test("chat answers a known question with sources, latency and cost", async ({ page }) => {
  if (!USE_REAL_API) await mockAskRoute(page);
  await page.goto("/");
  const input = page.getByLabel("Ask a question about Nare");
  await input.fill(QUESTION);
  await input.press("Enter");

  const log = page.getByRole("log", { name: "Conversation" });
  await expect(log.getByText(QUESTION)).toBeVisible();
  await expect(log.getByText(/PromptTracker|Answer One/)).toBeVisible({ timeout: 45_000 });
  await expect(log.getByText(/\d+\.\ds · ≈\$/)).toBeVisible({ timeout: 45_000 });
  await expect(log.getByText(/sources: cv\.md/)).toBeVisible();
  await expect(page.getByText("19/20 questions left")).toBeVisible();
});

test("pressing i on the film jumps to the index view", async ({ page }) => {
  await page.goto("/");
  // The listener attaches on hydration; keep pressing until navigation happens.
  await expect
    .poll(async () => {
      await page.keyboard.press("i");
      return page.url();
    }, { timeout: 15_000 })
    .toContain("/overview");
  await expect(page.getByRole("heading", { level: 2, name: "Projects" })).toBeVisible();
});

test("project page renders MDX sections and stack", async ({ page }) => {
  await page.goto("/projects/job-search-agent");
  await expect(page.getByRole("heading", { level: 1, name: "Job-search agent" })).toBeVisible();
  for (const section of ["Problem", "What I built", "Architecture", "Result", "Stack"]) {
    await expect(page.locator(".prose").getByRole("heading", { level: 2, name: section })).toBeVisible();
  }
  // The diagram lazy-loads via IntersectionObserver; scroll it into view like a real reader would
  // rather than relying on it happening to sit within the initial viewport + rootMargin.
  const diagram = page.getByRole("img", { name: "Architecture diagram" });
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram.locator("svg")).toBeVisible({ timeout: 30_000 });
});

test("writing index and RSS feed are served", async ({ page, request }) => {
  await page.goto("/writing");
  await expect(page.getByRole("heading", { level: 1, name: "Writing" })).toBeVisible();
  // Draft posts are hidden in production; the page must present either posts or the in-progress note.
  await expect(page.getByText(/notes in progress|Evaluating an agent/).first()).toBeVisible();
  const feed = await request.get("/feed.xml");
  expect(feed.ok()).toBeTruthy();
  expect(await feed.text()).toContain("<rss");
});
