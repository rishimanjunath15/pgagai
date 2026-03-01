// ============================================
// UNIT TESTS - searchSlice
// ============================================
import searchReducer, {
  setQuery,
  clearSearch,
  performSearch,
} from "@/store/searchSlice";
import { SearchState } from "@/shared/types";
import { configureStore } from "@reduxjs/toolkit";

// Mock the api service so performSearch thunk doesn't make real HTTP calls
jest.mock("@/services/api", () => ({
  searchContent: jest.fn(),
}));

import { searchContent } from "@/services/api";
const mockedSearchContent = searchContent as jest.MockedFunction<typeof searchContent>;

const initialState: SearchState = {
  query: "",
  results: [],
  loading: false,
  error: null,
};

// Helper: create a fresh store for thunk tests
function makeStore() {
  return configureStore({ reducer: { search: searchReducer } });
}

// ---- Synchronous reducer tests ----
describe("searchSlice — reducers", () => {
  it("sets initial state correctly", () => {
    const state = searchReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual(initialState);
  });

  it("setQuery updates query string", () => {
    const next = searchReducer(initialState, setQuery("react hooks"));
    expect(next.query).toBe("react hooks");
  });

  it("setQuery can set empty string", () => {
    const withQuery = { ...initialState, query: "old" };
    const next = searchReducer(withQuery, setQuery(""));
    expect(next.query).toBe("");
  });

  it("clearSearch resets query to empty string", () => {
    const state = { ...initialState, query: "sports", results: [], error: null };
    const next = searchReducer(state, clearSearch());
    expect(next.query).toBe("");
  });

  it("clearSearch resets results to empty array", () => {
    const mockResult = {
      id: "r1", type: "news" as const, title: "T", description: "D",
      image: "", url: "", source: "S", category: "technology" as const,
      publishedAt: "",
    };
    const state = { ...initialState, results: [mockResult] };
    const next = searchReducer(state, clearSearch());
    expect(next.results).toHaveLength(0);
  });

  it("clearSearch resets error to null", () => {
    const state = { ...initialState, error: "Something went wrong" };
    const next = searchReducer(state, clearSearch());
    expect(next.error).toBeNull();
  });

  it("clearSearch does not affect loading flag", () => {
    const state = { ...initialState, loading: true };
    const next = searchReducer(state, clearSearch());
    // clearSearch is a sync action; it resets data but loading state stays
    expect(next.loading).toBe(true);
  });
});

// ---- Async thunk tests ----
describe("searchSlice — performSearch thunk", () => {
  beforeEach(() => {
    mockedSearchContent.mockReset();
  });

  it("sets loading=true and clears error on pending", async () => {
    // Mock a slow promise so we can inspect the pending state
    let resolveSearch!: (v: never[]) => void;
    mockedSearchContent.mockImplementation(
      () => new Promise((res) => { resolveSearch = res; })
    );

    const store = makeStore();
    store.dispatch(performSearch("react"));

    const { search } = store.getState();
    expect(search.loading).toBe(true);
    expect(search.error).toBeNull();

    resolveSearch([]);
  });

  it("sets results and clears loading on fulfilled", async () => {
    const fakeResults = [
      {
        id: "r1", type: "news" as const, title: "React Hooks Guide",
        description: "D", image: "", url: "", source: "S",
        category: "technology" as const, publishedAt: "",
      },
    ];
    mockedSearchContent.mockResolvedValue(fakeResults);

    const store = makeStore();
    await store.dispatch(performSearch("react"));

    const { search } = store.getState();
    expect(search.loading).toBe(false);
    expect(search.results).toHaveLength(1);
    expect(search.results[0].id).toBe("r1");
  });

  it("sets error and clears loading when rejected (non-aborted)", async () => {
    mockedSearchContent.mockRejectedValue(new Error("Network failure"));

    const store = makeStore();
    await store.dispatch(performSearch("anything"));

    const { search } = store.getState();
    expect(search.loading).toBe(false);
    expect(search.results).toHaveLength(0);
    expect(search.error).toBe("Network failure");
  });

  it("populates results with all returned items", async () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: `item-${i}`, type: "news" as const, title: `Article ${i}`,
      description: "", image: "", url: "", source: "Test",
      category: "technology" as const, publishedAt: "",
    }));
    mockedSearchContent.mockResolvedValue(items);

    const store = makeStore();
    await store.dispatch(performSearch("article"));

    expect(store.getState().search.results).toHaveLength(5);
  });

  it("keeps previous results until new search resolves", async () => {
    const old = [{ id: "old", type: "news" as const, title: "Old", description: "", image: "", url: "", source: "S", category: "technology" as const, publishedAt: "" }];
    const stateWithResults = { query: "old", results: old, loading: false, error: null };

    // Simulate: state has results, then new search starts
    let resolveFn!: (v: never[]) => void;
    mockedSearchContent.mockImplementation(
      () => new Promise((res) => { resolveFn = res; })
    );

    const store = makeStore();
    // Manually hydrate old results via a fulfilled dispatch
    const newItems = old;
    jest.mocked(mockedSearchContent).mockResolvedValueOnce(newItems);
    await store.dispatch(performSearch("old"));

    // Now dispatch a new search that is still pending
    mockedSearchContent.mockImplementation(
      () => new Promise((res) => { resolveFn = res; })
    );
    store.dispatch(performSearch("new"));
    // Results should still be old while loading
    expect(store.getState().search.results).toHaveLength(1);
    resolveFn([]);
  });
});
