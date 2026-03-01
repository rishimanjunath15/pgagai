// ============================================
// CONTENT SLICE - Manages feed, trending, favorites
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ContentState, ContentItem, Category } from "@/shared/types";
import { fetchNews, fetchRecommendations, fetchSocialPosts } from "@/shared/utils/api";

// Initial state
const initialState: ContentState = {
  feed: [],
  trending: [],
  favorites: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

// ---- Async Thunks (fetch data from APIs) ----

// Fetch content from all APIs based on user's preferred categories.
// The second argument from RTK contains `signal` — an AbortSignal tied to this
// thunk's lifecycle. We forward it to axios so the HTTP request is truly
// cancelled at the network level when the thunk is aborted (e.g. on clearFeed).
export const fetchContent = createAsyncThunk(
  "content/fetchContent",
  async (
    { categories, page }: { categories: Category[]; page: number },
    { signal }
  ) => {
    // Fetch from all three sources in parallel, forwarding the abort signal
    const [news, recommendations, social] = await Promise.all([
      fetchNews(categories, page, signal),
      fetchRecommendations(categories, page, signal),
      fetchSocialPosts(categories, page),
    ]);

    // Combine all results into one array
    const allContent: ContentItem[] = [...news, ...recommendations, ...social];
    return allContent;
  }
);

// Fetch trending content (top items regardless of user prefs)
export const fetchTrending = createAsyncThunk(
  "content/fetchTrending",
  async () => {
    const [news, recommendations, social] = await Promise.all([
      fetchNews(["technology", "entertainment", "sports"], 1),
      fetchRecommendations(["entertainment"], 1),
      fetchSocialPosts(["technology", "entertainment", "sports"], 1),
    ]);
    return [...news.slice(0, 6), ...recommendations.slice(0, 6), ...social.slice(0, 4)];
  }
);

// ---- Slice Definition ----
const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    // Add item to favorites
    addFavorite: (state, action: PayloadAction<ContentItem>) => {
      const exists = state.favorites.find((f) => f.id === action.payload.id);
      if (!exists) {
        state.favorites.push(action.payload);
      }
    },
    // Remove item from favorites
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((f) => f.id !== action.payload);
    },
    // Reorder feed items (for drag-and-drop)
    reorderFeed: (state, action: PayloadAction<ContentItem[]>) => {
      state.feed = action.payload;
    },
    // Clear the feed (used when preferences change)
    // We also set loading: true immediately so the IntersectionObserver doesn't
    // fire in the gap between clearFeed() and fetchContent.pending.
    clearFeed: (state) => {
      state.feed = [];
      state.page = 1;
      state.hasMore = true;
      state.loading = true; // prevents double-fetch race condition
      state.error = null;
    },
    // Clear all favorites at once
    clearFavorites: (state) => {
      state.favorites = [];
    },
  },
  extraReducers: (builder) => {
    // Handle fetchContent lifecycle
    builder
      .addCase(fetchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.loading = false;
        // Use action.meta.arg.page (the page we actually requested), NOT state.page.
        // This avoids bugs if two requests complete out of order.
        if (action.meta.arg.page === 1) {
          state.feed = action.payload;  // replace on first page
        } else {
          state.feed = [...state.feed, ...action.payload]; // append for subsequent pages
        }
        // Stop infinite scroll after page 5 (mock data never runs out naturally).
        // With real APIs, this naturally becomes false when the API returns 0 results.
        state.hasMore = action.payload.length > 0 && action.meta.arg.page < 5;
        state.page = action.meta.arg.page + 1; // next page to fetch
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch content";
      });

    // Handle fetchTrending lifecycle
    builder
      .addCase(fetchTrending.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch trending";
      });
  },
});

export const { addFavorite, removeFavorite, reorderFeed, clearFeed, clearFavorites } = contentSlice.actions;
export default contentSlice.reducer;
