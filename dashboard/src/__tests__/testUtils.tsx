// ============================================
// TEST UTILITIES - Helper for rendering with Redux
// ============================================
// This provides a custom render function that automatically wraps
// all components in a Redux Provider with a real store.
// NOTE: This file is excluded from being run as a test suite (see jest.config.ts testPathIgnorePatterns)
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import contentReducer from "@/store/contentSlice";
import preferencesReducer from "@/store/preferencesSlice";
import searchReducer from "@/store/searchSlice";

// Create a test store (no persistence)
function createTestStore() {
  return configureStore({
    reducer: {
      content: contentReducer,
      preferences: preferencesReducer,
      search: searchReducer,
    },
  });
}

// Custom render - wraps the component in a Redux Provider
function renderWithStore(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  const store = createTestStore();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { ...render(ui, { wrapper: Wrapper, ...options }), store };
}

export { renderWithStore };
