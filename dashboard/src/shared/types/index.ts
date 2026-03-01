// ============================================
// TYPES - All TypeScript interfaces for the app
// ============================================

// Categories the user can choose from
export type Category = "technology" | "sports" | "finance" | "entertainment" | "health" | "science";

// A single content item (news article, recommendation, or social post)
export interface ContentItem {
  id: string;
  type: "news" | "recommendation" | "social";
  title: string;
  description: string;
  image: string;
  url: string;
  source: string;
  category: Category;
  publishedAt: string;
}

// User preferences saved in Redux / localStorage
export interface UserPreferences {
  favoriteCategories: Category[];
  darkMode: boolean;
}

// State shape for the content slice
export interface ContentState {
  feed: ContentItem[];
  trending: ContentItem[];
  favorites: ContentItem[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

// State shape for the user preferences slice
export interface PreferencesState {
  preferences: UserPreferences;
}

// State shape for search
export interface SearchState {
  query: string;
  results: ContentItem[];
  loading: boolean;
  error: string | null;
}

// Root state (combination of all slices)
export interface RootState {
  content: ContentState;
  preferences: PreferencesState;
  search: SearchState;
}
