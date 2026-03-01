// ============================================
// PREFERENCES SLICE - Manages user settings
// ============================================
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PreferencesState, Category } from "@/shared/types";

// Default preferences for a new user
const initialState: PreferencesState = {
  preferences: {
    favoriteCategories: ["technology", "entertainment"],
    darkMode: false,
  },
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    // Toggle a category on/off in user preferences
    toggleCategory: (state, action: PayloadAction<Category>) => {
      const category = action.payload;
      const index = state.preferences.favoriteCategories.indexOf(category);
      if (index >= 0) {
        // Remove category if already selected (but keep at least 1)
        if (state.preferences.favoriteCategories.length > 1) {
          state.preferences.favoriteCategories.splice(index, 1);
        }
      } else {
        // Add category
        state.preferences.favoriteCategories.push(category);
      }
    },
    // Toggle dark mode on/off
    toggleDarkMode: (state) => {
      state.preferences.darkMode = !state.preferences.darkMode;
    },
    // Set all preferences at once (e.g., loading from localStorage)
    setPreferences: (state, action: PayloadAction<PreferencesState["preferences"]>) => {
      state.preferences = action.payload;
    },
  },
});

export const { toggleCategory, toggleDarkMode, setPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
