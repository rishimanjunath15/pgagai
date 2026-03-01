// ============================================
// UNIT TESTS - preferencesSlice
// ============================================
import preferencesReducer, {
  toggleCategory,
  toggleDarkMode,
  setPreferences,
} from "@/store/preferencesSlice";
import { PreferencesState } from "@/shared/types";

// Starting state for each test
const initialState: PreferencesState = {
  preferences: {
    favoriteCategories: ["technology", "entertainment"],
    darkMode: false,
  },
};

describe("preferencesSlice", () => {
  // ---- toggleCategory tests ----

  it("should add a new category when toggled", () => {
    const nextState = preferencesReducer(initialState, toggleCategory("sports"));
    expect(nextState.preferences.favoriteCategories).toContain("sports");
  });

  it("should remove an existing category when toggled", () => {
    const nextState = preferencesReducer(initialState, toggleCategory("entertainment"));
    expect(nextState.preferences.favoriteCategories).not.toContain("entertainment");
  });

  it("should NOT remove a category if only one is left", () => {
    const oneCategory: PreferencesState = {
      preferences: { favoriteCategories: ["technology"], darkMode: false },
    };
    const nextState = preferencesReducer(oneCategory, toggleCategory("technology"));
    // Still contains technology - can't remove the last one
    expect(nextState.preferences.favoriteCategories).toContain("technology");
    expect(nextState.preferences.favoriteCategories.length).toBe(1);
  });

  // ---- toggleDarkMode tests ----

  it("should turn dark mode on when off", () => {
    const nextState = preferencesReducer(initialState, toggleDarkMode());
    expect(nextState.preferences.darkMode).toBe(true);
  });

  it("should turn dark mode off when on", () => {
    const darkState: PreferencesState = {
      preferences: { ...initialState.preferences, darkMode: true },
    };
    const nextState = preferencesReducer(darkState, toggleDarkMode());
    expect(nextState.preferences.darkMode).toBe(false);
  });

  // ---- setPreferences tests ----

  it("should update all preferences at once", () => {
    const newPrefs = { favoriteCategories: ["science"] as const, darkMode: true };
    const nextState = preferencesReducer(initialState, setPreferences(newPrefs as never));
    expect(nextState.preferences.darkMode).toBe(true);
    expect(nextState.preferences.favoriteCategories).toEqual(["science"]);
  });
});
