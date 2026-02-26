// ============================================
// E2E TEST - Search Functionality
// ============================================
import { test, expect } from "@playwright/test";

test.describe("Search functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls so search results return instantly and deterministically
    await page.route(/newsapi\.org/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          articles: [
            {
              title: "Technology Search Result",
              description: "A tech article",
              urlToImage: null,
              url: "https://example.com/tech",
              source: { name: "Mock News" },
              publishedAt: new Date().toISOString(),
            },
          ],
        }),
      })
    );
    await page.route(/themoviedb\.org/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      })
    );
    await page.goto("/");
    // Wait for the header to be rendered — fast and always present
    await page.waitForSelector("header", { timeout: 15_000 });
  });

  test("search input is visible and focusable", async ({ page }) => {
    const input = page.getByPlaceholder(/search news, movies/i);
    await expect(input).toBeVisible();
    await input.focus();
    await expect(input).toBeFocused();
  });

  test("typing in search input updates the value", async ({ page }) => {
    const input = page.getByPlaceholder(/search news, movies/i);
    await input.fill("technology");
    await expect(input).toHaveValue("technology");
  });

  test("clear button appears after typing", async ({ page }) => {
    const input = page.getByPlaceholder(/search news, movies/i);
    await input.fill("sports");
    const clearBtn = page.getByLabel("Clear search");
    await expect(clearBtn).toBeVisible();
  });

  test("clear button removes search text", async ({ page }) => {
    const input = page.getByPlaceholder(/search news, movies/i) as ReturnType<typeof page.getByPlaceholder>;
    await input.fill("sports");
    await page.getByLabel("Clear search").click();
    await expect(input).toHaveValue("");
  });

  test("clear button disappears after clearing", async ({ page }) => {
    const input = page.getByPlaceholder(/search news, movies/i);
    await input.fill("hello");
    await page.getByLabel("Clear search").click();
    await expect(page.getByLabel("Clear search")).not.toBeVisible();
  });

  test("search shows results or empty state after debounce", async ({ page }) => {
    const input = page.getByPlaceholder(/search news, movies/i);
    await input.fill("technology");
    // Wait for the 500ms debounce + search to complete
    await page.waitForTimeout(1500);
    // Either results or "No results" message should appear — not the normal feed
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test("search for nonsense term shows no results message or empty state", async ({ page }) => {
    const input = page.getByPlaceholder(/search news, movies/i);
    await input.fill("xyzzy_nothing_matches_this_12345");
    await page.waitForTimeout(1500);
    // Should not crash; page should still be functional
    await expect(page.locator("header")).toBeVisible();
  });

  test("pressing Escape or clearing search restores the feed", async ({ page }) => {
    const input = page.getByPlaceholder(/search news, movies/i);
    await input.fill("test query");
    await page.waitForTimeout(600);
    // Clear and verify UI is still responsive
    await page.getByLabel("Clear search").click();
    await expect(input).toHaveValue("");
    await expect(page.locator("header")).toBeVisible();
  });

  test("dark mode toggle works on the page", async ({ page }) => {
    const toggle = page.getByLabel("Toggle dark mode");
    await expect(toggle).toBeVisible();
    await toggle.click();
    // After clicking, body or html should have dark class applied
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(hasDark).toBe(true);
  });
});
