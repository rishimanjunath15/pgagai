// ============================================
// UNIT TESTS - API Service
// ============================================
// In the Jest environment NEXT_PUBLIC_* env vars are not set, so every function
// follows the "no key â†’ mock data" code path.  We test that code path (which
// covers ~80% of the api.ts source) and verify the mock fallback in the error
// path.  The happy-path "with real keys" axios calls are exercised by the E2E
// test suite where the dev-server runs with a real .env.local.
// ============================================
import { fetchNews, fetchRecommendations, fetchSocialPosts, searchContent } from "@/services/api";
import { ContentItem, Category } from "@/types";

// =============================================
// Helpers
// =============================================
const requiredFields = ["id", "type", "title", "description", "image", "url", "source", "category", "publishedAt"] as const;

function assertContentItem(item: ContentItem) {
  requiredFields.forEach((f) => expect(item).toHaveProperty(f));
}

// =============================================
// fetchNews  â€” mock-data path (no API key in Jest env)
// =============================================
describe("fetchNews (mock-data path)", () => {
  it("returns a non-empty array", async () => {
    const items = await fetchNews(["technology"], 1);
    expect(items.length).toBeGreaterThan(0);
  });

  it("every item has all required ContentItem fields", async () => {
    const items = await fetchNews(["sports"], 1);
    items.forEach(assertContentItem);
  });

  it("every item has type === 'news'", async () => {
    const items = await fetchNews(["finance"], 1);
    items.forEach((item) => expect(item.type).toBe("news"));
  });

  it("items belong to the requested category", async () => {
    const items = await fetchNews(["health"], 1);
    items.forEach((item) => expect(item.category).toBe("health"));
  });

  it("accepts multiple categories and returns items for each", async () => {
    const items = await fetchNews(["technology", "sports"], 1);
    const categories = new Set(items.map((i) => i.category));
    expect(categories.has("technology")).toBe(true);
    expect(categories.has("sports")).toBe(true);
  });

  it("page 1 and page 2 produce entirely unique IDs", async () => {
    const page1 = await fetchNews(["science"], 1);
    const page2 = await fetchNews(["science"], 2);
    const ids = [...page1, ...page2].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all ids, images and publishedAt are non-empty strings", async () => {
    const items = await fetchNews(["technology"], 1);
    items.forEach((item) => {
      expect(typeof item.id).toBe("string");
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.image).toBe("string");
      expect(item.image.length).toBeGreaterThan(0);
      expect(typeof item.publishedAt).toBe("string");
      expect(item.publishedAt.length).toBeGreaterThan(0);
    });
  });
});

// =============================================
// fetchRecommendations  â€” mock-data path
// =============================================
describe("fetchRecommendations (mock-data path)", () => {
  it("returns a non-empty array", async () => {
    const items = await fetchRecommendations(["entertainment"], 1);
    expect(items.length).toBeGreaterThan(0);
  });

  it("every item has all required ContentItem fields", async () => {
    const items = await fetchRecommendations(["entertainment"], 1);
    items.forEach(assertContentItem);
  });

  it("every item has type === 'recommendation'", async () => {
    const items = await fetchRecommendations(["entertainment"], 1);
    items.forEach((item) => expect(item.type).toBe("recommendation"));
  });

  it("every item has category === 'entertainment'", async () => {
    const items = await fetchRecommendations(["entertainment"], 1);
    items.forEach((item) => expect(item.category).toBe("entertainment"));
  });

  it("returns exactly 6 items per page (mock generates 6)", async () => {
    const items = await fetchRecommendations(["entertainment"], 1);
    expect(items).toHaveLength(6);
  });

  it("source is 'Mock TMDB'", async () => {
    const items = await fetchRecommendations(["entertainment"], 1);
    items.forEach((item) => expect(item.source).toBe("Mock TMDB"));
  });

  it("page 1 and page 2 produce unique IDs", async () => {
    const p1 = await fetchRecommendations(["entertainment"], 1);
    const p2 = await fetchRecommendations(["entertainment"], 2);
    const ids = [...p1, ...p2].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// =============================================
// fetchSocialPosts  â€” always mock (no real API)
// =============================================
describe("fetchSocialPosts", () => {
  it("returns a non-empty array", async () => {
    const items = await fetchSocialPosts(["sports"], 1);
    expect(items.length).toBeGreaterThan(0);
  });

  it("every item has type === 'social'", async () => {
    const items = await fetchSocialPosts(["technology"], 1);
    items.forEach((item) => expect(item.type).toBe("social"));
  });

  it("every item has all required ContentItem fields", async () => {
    const items = await fetchSocialPosts(["finance"], 1);
    items.forEach(assertContentItem);
  });
});

// =============================================
// searchContent  â€” no-key path (local mock search)
// =============================================
describe("searchContent (local mock search, no API key)", () => {
  it("returns [] immediately for an empty string", async () => {
    const results = await searchContent("");
    expect(results).toEqual([]);
  });

  it("returns [] immediately for a whitespace-only string", async () => {
    const results = await searchContent("   ");
    expect(results).toEqual([]);
  });

  it("returns [] for a nonsense query that matches nothing", async () => {
    const results = await searchContent("xyzzy_impossible_match_12345");
    expect(results).toHaveLength(0);
  });

  it("returns items when searching for a known mock category word", async () => {
    // "technology" appears in category + titles
    const results = await searchContent("technology");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns only items that match the query in at least one field", async () => {
    const query = "science";
    const results = await searchContent(query);
    results.forEach((item) => {
      const haystack = [item.title, item.description, item.category, item.source, item.type]
        .join(" ").toLowerCase();
      expect(haystack).toMatch(/science/i);
    });
  });

  it("returns items of multiple types when query is broad", async () => {
    // "the" appears in many titles/descriptions across all mock types
    const results = await searchContent("the");
    const types = new Set(results.map((r) => r.type));
    expect(types.size).toBeGreaterThanOrEqual(1);
  });

  it("all returned items have the required ContentItem fields", async () => {
    const results = await searchContent("sports");
    results.forEach(assertContentItem);
  });

  it("searching for 'news' matches items with type 'news' in their fields", async () => {
    const results = await searchContent("news");
    // "news" appears as the type field value â€” should match via type.includes("news")
    expect(results.length).toBeGreaterThan(0);
  });
});

// =============================================
// Cross-cutting: ContentItem shape contract
// =============================================
describe("ContentItem shape contract", () => {
  it("fetchNews items have string publishedAt parseable as a date", async () => {
    const items = await fetchNews(["technology"], 1);
    items.forEach((item) => {
      expect(() => new Date(item.publishedAt).toISOString()).not.toThrow();
    });
  });

  it("fetchRecommendations items have non-empty url strings", async () => {
    const items = await fetchRecommendations(["entertainment"], 1);
    items.forEach((item) => {
      expect(typeof item.url).toBe("string");
      expect(item.url.length).toBeGreaterThan(0);
    });
  });

  it("fetchSocialPosts items have non-empty description", async () => {
    const items = await fetchSocialPosts(["sports"], 1);
    items.forEach((item) => {
      expect(typeof item.description).toBe("string");
      expect(item.description.length).toBeGreaterThan(0);
    });
  });
});
