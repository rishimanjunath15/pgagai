// ============================================
// SEARCH SLICE - Manages search query & results
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { SearchState, ContentItem } from "@/shared/types";
import { searchContent } from "@/shared/utils/api";

const initialState: SearchState = {
  query: "",
  results: [],
  loading: false,
  error: null,
};

// Async thunk to search content across all APIs.
// We pass the AbortSignal to searchContent so axios can actually cancel the
// in-flight HTTP request when Header calls pendingSearch.current.abort().
export const performSearch = createAsyncThunk(
  "search/performSearch",
  async (query: string, { signal }) => {
    const results = await searchContent(query, signal);
    return results;
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    // Update the query string (typed by user)
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    // Clear search results + any lingering error
    clearSearch: (state) => {
      state.query = "";
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        // fulfilled only fires if the request was NOT aborted — safe to update directly
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(performSearch.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.loading = false;
          state.results = [];
          state.error = action.error.message || "Search failed";
        }
      });
  },
});

export const { setQuery, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
