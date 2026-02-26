// ============================================
// UNIT TESTS - contentSlice
// ============================================
import contentReducer, {
  addFavorite,
  removeFavorite,
  reorderFeed,
  clearFeed,
} from "@/store/contentSlice";
import { ContentState, ContentItem } from "@/types";

// A mock content item to use in tests
const mockItem: ContentItem = {
  id: "test-1",
  type: "news",
  title: "Test News Article",
  description: "A test description",
  image: "https://example.com/image.jpg",
  url: "https://example.com",
  source: "Test Source",
  category: "technology",
  publishedAt: "2025-01-01T00:00:00Z",
};

const mockItem2: ContentItem = { ...mockItem, id: "test-2", title: "Second Article" };
const mockItem3: ContentItem = { ...mockItem, id: "test-3", title: "Third Article" };

const initialState: ContentState = {
  feed: [],
  trending: [],
  favorites: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

describe("contentSlice", () => {
  // ---- addFavorite tests ----

  it("should add item to favorites", () => {
    const nextState = contentReducer(initialState, addFavorite(mockItem));
    expect(nextState.favorites).toHaveLength(1);
    expect(nextState.favorites[0].id).toBe("test-1");
  });

  it("should NOT add duplicate item to favorites", () => {
    const withOneFavorite = { ...initialState, favorites: [mockItem] };
    const nextState = contentReducer(withOneFavorite, addFavorite(mockItem));
    // Should still only have 1 item
    expect(nextState.favorites).toHaveLength(1);
  });

  // ---- removeFavorite tests ----

  it("should remove item from favorites", () => {
    const withFavorite = { ...initialState, favorites: [mockItem] };
    const nextState = contentReducer(withFavorite, removeFavorite("test-1"));
    expect(nextState.favorites).toHaveLength(0);
  });

  it("should only remove the matching item", () => {
    const withTwoFavorites = { ...initialState, favorites: [mockItem, mockItem2] };
    const nextState = contentReducer(withTwoFavorites, removeFavorite("test-1"));
    expect(nextState.favorites).toHaveLength(1);
    expect(nextState.favorites[0].id).toBe("test-2");
  });

  // ---- reorderFeed tests ----

  it("should reorder feed items", () => {
    const withFeed = { ...initialState, feed: [mockItem, mockItem2, mockItem3] };
    const reordered = [mockItem3, mockItem, mockItem2];
    const nextState = contentReducer(withFeed, reorderFeed(reordered));
    expect(nextState.feed[0].id).toBe("test-3");
    expect(nextState.feed[1].id).toBe("test-1");
  });

  // ---- clearFeed tests ----

  it("should clear the feed and reset pagination", () => {
    const withFeed = { ...initialState, feed: [mockItem, mockItem2], page: 3 };
    const nextState = contentReducer(withFeed, clearFeed());
    expect(nextState.feed).toHaveLength(0);
    expect(nextState.page).toBe(1);
    expect(nextState.hasMore).toBe(true);
  });
});
