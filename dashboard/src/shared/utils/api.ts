// ============================================
// API SERVICE - Fetches data from News, TMDB, and mock social APIs
// ============================================
import axios from "axios";
import { ContentItem, Category } from "@/shared/types";

// ----- API Keys -----
// Priority order:
//   1. NEXT_PUBLIC_* env var (set in .env.local)
//   2. localStorage key set via the Settings page UI
//   3. Empty string → falls back to mock data
//
// localStorage is only readable in the browser, so we guard with typeof window.
function getBrowserStoredKey(name: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(name) ?? "";
}

const ENV_NEWS_KEY    = process.env.NEXT_PUBLIC_NEWS_API_KEY    || "";
const ENV_TMDB_KEY    = process.env.NEXT_PUBLIC_TMDB_API_KEY    || "";
const ENV_TMDB_TOKEN  = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN || "";

// Returns true when the key is missing or still has the default placeholder value
const isPlaceholder = (key: string) =>
  !key || key === "" || key.includes("your_") || key === "demo";

// Resolve the best available key at call-time (env first, then localStorage)
function getNewsKey(): string {
  if (!isPlaceholder(ENV_NEWS_KEY)) return ENV_NEWS_KEY;
  const lsKey = getBrowserStoredKey("dashboard_news_api_key");
  return isPlaceholder(lsKey) ? "" : lsKey;
}

function getTmdbKey(): string {
  if (!isPlaceholder(ENV_TMDB_KEY)) return ENV_TMDB_KEY;
  const lsKey = getBrowserStoredKey("dashboard_tmdb_api_key");
  return isPlaceholder(lsKey) ? "" : lsKey;
}

// Returns the TMDB Read Access Token (Bearer / v4 auth) if available.
// Bearer auth is preferred over the v3 api_key param.
function getTmdbToken(): string {
  return isPlaceholder(ENV_TMDB_TOKEN) ? "" : ENV_TMDB_TOKEN;
}

// Build axios config for a TMDB request.
// Uses Bearer token when available, falls back to api_key query param.
function tmdbConfig(
  params: Record<string, unknown>,
  signal?: AbortSignal
): object {
  const token = getTmdbToken();
  if (token) {
    return {
      headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      params,
      signal,
    };
  }
  const key = getTmdbKey();
  return { params: { ...params, api_key: key }, signal };
}

// ----- Category-to-keyword mapping for News API -----
const categoryKeywords: Record<Category, string> = {
  technology: "technology",
  sports: "sports",
  finance: "finance",
  entertainment: "entertainment",
  health: "health",
  science: "science",
};

// =============================================
// 1. FETCH NEWS from NewsAPI (or mock data)
// =============================================
export async function fetchNews(
  categories: Category[],
  page: number,
  signal?: AbortSignal
): Promise<ContentItem[]> {
  const NEWS_API_KEY = getNewsKey();
  if (!NEWS_API_KEY) return generateMockNews(categories, page);

  try {
    // Build query from categories
    const query = categories.map((c) => categoryKeywords[c]).join(" OR ");
    // Pass the AbortSignal so axios cancels the HTTP request if the thunk is aborted
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        page,
        pageSize: 6,
        apiKey: NEWS_API_KEY,
        sortBy: "publishedAt",
      },
      signal,
    });

    // Map API response to our ContentItem format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (response.data.articles || []).map((article: any, index: number) => ({
      id: `news-${page}-${index}-${Date.now()}`,
      type: "news" as const,
      title: article.title || "Untitled",
      description: article.description || "No description available.",
      image: article.urlToImage || "/placeholder.png",
      url: article.url || "#",
      source: article.source?.name || "News",
      category: categories[0] || "technology",
      publishedAt: article.publishedAt || new Date().toISOString(),
    }));
  } catch {
    // If API fails, return mock news data
    console.warn("News API failed, using mock data");
    return generateMockNews(categories, page);
  }
}

// =============================================
// 2. FETCH RECOMMENDATIONS from TMDB (or mock data)
// =============================================
export async function fetchRecommendations(
  categories: Category[],
  page: number,
  signal?: AbortSignal
): Promise<ContentItem[]> {
  const TMDB_API_KEY = getTmdbKey();
  const TMDB_TOKEN   = getTmdbToken();
  if (!TMDB_API_KEY && !TMDB_TOKEN) return generateMockRecommendations(page);

  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/trending/movie/week",
      tmdbConfig({ page }, signal)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (response.data.results || []).slice(0, 6).map((movie: any, index: number) => ({
      id: `movie-${page}-${index}-${Date.now()}`,
      type: "recommendation" as const,
      title: movie.title || movie.name || "Untitled",
      description: movie.overview || "No description available.",
      image: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "/placeholder.png",
      url: `https://www.themoviedb.org/movie/${movie.id}`,
      source: "TMDB",
      category: categories.includes("entertainment") ? "entertainment" : categories[0],
      publishedAt: movie.release_date || new Date().toISOString(),
    }));
  } catch {
    console.warn("TMDB API failed, using mock data");
    return generateMockRecommendations(page);
  }
}

// =============================================
// 3. FETCH SOCIAL POSTS (Mock API - simulated)
// =============================================
export async function fetchSocialPosts(categories: Category[], page: number): Promise<ContentItem[]> {
  // Social media APIs require OAuth - we use mock data
  return generateMockSocialPosts(categories, page);
}

// =============================================
// 4. SEARCH across all content
// =============================================
export async function searchContent(
  query: string,
  signal?: AbortSignal
): Promise<ContentItem[]> {
  if (!query.trim()) return [];

  const NEWS_API_KEY  = getNewsKey();
  const TMDB_API_KEY  = getTmdbKey();
  const hasTmdb       = !!TMDB_API_KEY || !!getTmdbToken();
  const q = query.toLowerCase();

  // Helper: checks all searchable fields of a content item
  const matches = (item: ContentItem) =>
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.source.toLowerCase().includes(q) ||
    item.type.toLowerCase().includes(q);

  // No real key — search the full mock dataset locally (all 6 categories)
  if (!NEWS_API_KEY) {
    const ALL_CATEGORIES: Category[] = ["technology", "sports", "finance", "entertainment", "health", "science"];
    const allMock = [
      ...generateMockNews(ALL_CATEGORIES, 1),
      ...generateMockRecommendations(1),
      ...generateMockSocialPosts(ALL_CATEGORIES, 1),
    ];
    return allMock.filter(matches);
  }

  try {
    // Search news AND TMDB in parallel, forwarding the abort signal to both
    const [newsResponse, tmdbResults] = await Promise.all([
      axios.get("https://newsapi.org/v2/everything", {
        params: { q: query, pageSize: 8, apiKey: NEWS_API_KEY, sortBy: "relevancy" },
        signal,
      }),
      // TMDB search by movie title — forward the abort signal here too
      !hasTmdb
        ? Promise.resolve([])
        : axios
            .get("https://api.themoviedb.org/3/search/movie",
              tmdbConfig({ query, page: 1 }, signal)
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((r) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (r.data.results || []).slice(0, 5).map((movie: any, i: number) => ({
                id: `search-movie-${i}-${Date.now()}`,
                type: "recommendation" as const,
                title: movie.title || movie.name || "Untitled",
                description: movie.overview || "",
                image: movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/placeholder.png",
                url: `https://www.themoviedb.org/movie/${movie.id}`,
                source: "TMDB",
                category: "entertainment" as Category,
                publishedAt: movie.release_date || new Date().toISOString(),
              }))
            )
            .catch(() => [] as ContentItem[]),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newsResults: ContentItem[] = (newsResponse.data.articles || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (article: any, index: number) => ({
        id: `search-news-${index}-${Date.now()}`,
        type: "news" as const,
        title: article.title || "Untitled",
        description: article.description || "",
        image: article.urlToImage || "/placeholder.png",
        url: article.url || "#",
        source: article.source?.name || "News",
        category: "technology" as Category,
        publishedAt: article.publishedAt || new Date().toISOString(),
      })
    );

    return [...newsResults, ...(tmdbResults as ContentItem[])];
  } catch {
    // Fallback to filtered mock data on network failure
    const ALL_CATEGORIES: Category[] = ["technology", "sports", "finance", "entertainment", "health", "science"];
    return [
      ...generateMockNews(ALL_CATEGORIES, 1),
      ...generateMockRecommendations(1),
      ...generateMockSocialPosts(ALL_CATEGORIES, 1),
    ].filter(matches);
  }
}

// =============================================
// MOCK DATA GENERATORS (fallback when APIs are unavailable)
// =============================================

function generateMockNews(categories: Category[], page: number): ContentItem[] {
  const mockTitles: Record<Category, string[]> = {
    technology: [
      "AI Revolution: New Breakthroughs in Machine Learning",
      "Tech Giants Announce Major Cloud Computing Updates",
      "The Future of Quantum Computing is Here",
      "Cybersecurity Threats on the Rise in 2025",
      "5G Networks Expand Across Rural Areas",
      "Open Source Software Continues to Dominate",
    ],
    sports: [
      "Championship Finals Draw Record Viewership",
      "Rising Star Breaks World Record in Athletics",
      "Major League Announces Expansion Teams",
      "Olympic Committee Reveals New Sports for 2028",
      "E-Sports Prize Pools Reach New Heights",
      "Local Team Makes Historic Comeback",
    ],
    finance: [
      "Stock Markets Reach All-Time Highs",
      "Cryptocurrency Regulations Take Effect Globally",
      "Central Banks Consider Digital Currency Plans",
      "Tech Startups Secure Record Funding Rounds",
      "Housing Market Shows Signs of Recovery",
      "Green Bonds Gain Popularity Among Investors",
    ],
    entertainment: [
      "Blockbuster Movie Breaks Box Office Records",
      "Streaming Wars Intensify with New Platforms",
      "Award Season Surprises with Unexpected Winners",
      "Indie Films Gain Mainstream Recognition",
      "Music Festival Lineup Announced for Summer",
      "Gaming Industry Revenue Surpasses Film",
    ],
    health: [
      "New Vaccine Shows Promising Results in Trials",
      "Mental Health Awareness Campaigns Go Global",
      "Breakthrough in Cancer Research Announced",
      "Fitness Technology Transforms Home Workouts",
      "Nutrition Science Debunks Popular Myths",
      "Telemedicine Adoption Continues to Grow",
    ],
    science: [
      "Mars Mission Discovers Signs of Ancient Water",
      "Scientists Develop New Renewable Energy Source",
      "Deep Sea Exploration Reveals Unknown Species",
      "Climate Research Shows Encouraging Trends",
      "Particle Physics Experiment Confirms New Theory",
      "Space Telescope Captures Stunning Galaxy Images",
    ],
  };

  const results: ContentItem[] = [];
  categories.forEach((cat) => {
    const titles = mockTitles[cat] || mockTitles.technology;
    titles.slice(0, 3).forEach((title, i) => {
      results.push({
        id: `mock-news-${cat}-${page}-${i}`,
        type: "news",
        title,
        description: `This is a detailed article about ${title.toLowerCase()}. Stay informed with the latest updates and analysis from our expert writers.`,
        image: `https://picsum.photos/seed/${cat}${page}${i}/400/250`,
        url: "#",
        source: "Mock News",
        category: cat,
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      });
    });
  });

  return results;
}

function generateMockRecommendations(page: number): ContentItem[] {
  const movies = [
    { title: "The Digital Frontier", desc: "A thrilling sci-fi adventure exploring the boundaries of AI and humanity." },
    { title: "Echoes of Tomorrow", desc: "A heartwarming drama about time, family, and second chances." },
    { title: "Neon Nights", desc: "An action-packed cyberpunk thriller set in a futuristic metropolis." },
    { title: "The Last Algorithm", desc: "A mystery thriller where a programmer uncovers a dangerous conspiracy." },
    { title: "Starlight Chronicles", desc: "An epic space opera spanning three generations of explorers." },
    { title: "Code Breakers", desc: "Based on true events: the story of history's greatest cryptographers." },
  ];

  return movies.map((movie, i) => ({
    id: `mock-movie-${page}-${i}`,
    type: "recommendation" as const,
    title: movie.title,
    description: movie.desc,
    image: `https://picsum.photos/seed/movie${page}${i}/400/600`,
    url: "#",
    source: "Mock TMDB",
    category: "entertainment" as Category,
    publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockSocialPosts(categories: Category[], page: number): ContentItem[] {
  const posts = [
    { text: "Just saw an incredible tech demo at the conference! The future is here. 🚀", user: "@techfan" },
    { text: "Great game today! What an incredible finish. Sports never disappoint. ⚽", user: "@sportslover" },
    { text: "The market trends are looking promising this quarter. Time to invest wisely. 📈", user: "@financeguru" },
    { text: "This new album is absolutely phenomenal. Music at its finest! 🎵", user: "@musiclover" },
    { text: "Science just blew my mind again. Check out this new discovery! 🔬", user: "@sciencegeek" },
    { text: "Taking care of your health is the best investment you can make. 💪", user: "@healthcoach" },
  ];

  return posts.slice(0, 4).map((post, i) => ({
    id: `mock-social-${page}-${i}`,
    type: "social" as const,
    title: `${post.user} posted`,
    description: post.text,
    image: `https://picsum.photos/seed/social${page}${i}/400/400`,
    url: "#",
    source: "Social Media",
    category: categories[i % categories.length] || "technology",
    publishedAt: new Date(Date.now() - i * 1800000).toISOString(),
  }));
}
