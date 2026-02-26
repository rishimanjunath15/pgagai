// ============================================
// REDUX STORE - Combines all slices + localStorage persistence
// ============================================
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import contentReducer from "./contentSlice";
import preferencesReducer from "./preferencesSlice";
import searchReducer from "./searchSlice";
import type { ContentState, PreferencesState, SearchState } from "@/types";

// ---- SSR-safe storage ----
// redux-persist needs localStorage, which is only available in the browser.
// During Next.js SSR, `window` is undefined — so we fall back to a no-op storage
// that simply does nothing, preventing the "failed to create sync storage" warning.
const createNoopStorage = () => ({
  getItem: (_key: string) => Promise.resolve(null),
  setItem: (_key: string, value: string) => Promise.resolve(value),
  removeItem: (_key: string) => Promise.resolve(),
});

const storage =
  typeof window !== "undefined"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require("redux-persist/lib/storage").default as typeof import("redux-persist/lib/storage").default)
    : createNoopStorage();

// ---- Content transform ----
// We want to persist ONLY favorites from the content slice, not the whole feed.
// A Transform lets us modify state before saving (inbound) and after loading (outbound).
const contentTransform = createTransform<ContentState, Partial<ContentState>>(
  // Called before state is serialized and saved
  (inboundState) => ({
    favorites: inboundState.favorites, // only save favorites
  }),
  // Called after state is deserialized and loaded
  (outboundState) => ({
    feed: [],
    trending: [],
    favorites: outboundState.favorites ?? [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
  }),
  { whitelist: ["content"] } // only apply this transform to the content slice
);

// Persist config — saves preferences & content.favorites to localStorage
const persistConfig = {
  key: "dashboard",
  storage,
  whitelist: ["preferences", "content"], // persist both slices
  transforms: [contentTransform],         // but only save favorites from content
};

// Combine all reducers into one root reducer
const rootReducer = combineReducers({
  content: contentReducer,
  preferences: preferencesReducer,
  search: searchReducer,
});

// Wrap root reducer with persistence
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persistedReducer = persistReducer(persistConfig, rootReducer as any);

// Create the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches actions with non-serializable values — ignore them
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Persistor drives the rehydration — used by PersistGate in ReduxProvider
export const persistor = persistStore(store);

// ---- Typed helpers ----
// redux-persist makes all slice keys potentially `undefined` in its inferred type.
// We override that here with a concrete type so selectors don't need non-null assertions.
export type AppState = {
  content: ContentState;
  preferences: PreferencesState;
  search: SearchState;
  _persist: { version: number; rehydrated: boolean };
};
export type AppDispatch = typeof store.dispatch;

