# IMPORT PATH MIGRATION MAP

## Summary
Complete mapping of OLD import paths to NEW paths for all files using deprecated imports.

---

## FILE-BY-FILE MIGRATION GUIDE

### 1. middleware.ts
**File Path:** `dashboard/middleware.ts` (outside src/)

**OLD IMPORTS:**
- Line 6: `import { auth } from "@/auth";`

**NEW IMPORT:**
- `import { auth } from "@/features/auth/auth";`

**Updated Code:**
```typescript
import { auth } from "@/features/auth/auth";
```

---

### 2. src/store/contentSlice.ts
**File Path:** `dashboard/src/store/contentSlice.ts`

**OLD IMPORTS:**
- Line 5: `import { ContentState, ContentItem, Category } from "@/types";`
- Line 6: `import { fetchNews, fetchRecommendations, fetchSocialPosts } from "@/services/api";`

**NEW IMPORTS:**
- `import { ContentState, ContentItem, Category } from "@/shared/types";`
- `import { fetchNews, fetchRecommendations, fetchSocialPosts } from "@/shared/utils/api";`

**Updated Code:**
```typescript
import { ContentState, ContentItem, Category } from "@/shared/types";
import { fetchNews, fetchRecommendations, fetchSocialPosts } from "@/shared/utils/api";
```

---

### 3. src/store/searchSlice.ts
**File Path:** `dashboard/src/store/searchSlice.ts`

**OLD IMPORTS:**
- Line 5: `import { SearchState, ContentItem } from "@/types";`
- Line 6: `import { searchContent } from "@/services/api";`

**NEW IMPORTS:**
- `import { SearchState, ContentItem } from "@/shared/types";`
- `import { searchContent } from "@/shared/utils/api";`

**Updated Code:**
```typescript
import { SearchState, ContentItem } from "@/shared/types";
import { searchContent } from "@/shared/utils/api";
```

---

### 4. src/store/preferencesSlice.ts
**File Path:** `dashboard/src/store/preferencesSlice.ts`

**OLD IMPORTS:**
- Line 5: `import { PreferencesState, Category } from "@/types";`

**NEW IMPORTS:**
- `import { PreferencesState, Category } from "@/shared/types";`

**Updated Code:**
```typescript
import { PreferencesState, Category } from "@/shared/types";
```

---

### 5. src/store/index.ts
**File Path:** `dashboard/src/store/index.ts`

**OLD IMPORTS:**
- Line 9: `import type { ContentState, PreferencesState, SearchState } from "@/types";`

**NEW IMPORTS:**
- `import type { ContentState, PreferencesState, SearchState } from "@/shared/types";`

**Updated Code:**
```typescript
import type { ContentState, PreferencesState, SearchState } from "@/shared/types";
```

---

### 6. src/components/cards/ContentCard.tsx
**File Path:** `dashboard/src/components/cards/ContentCard.tsx`

**OLD IMPORTS:**
- Line 8: `import { ContentItem } from "@/types";`
- Line 9: `import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";`
- Line 10: `import { addFavorite, removeFavorite } from "@/store/contentSlice";`

**NEW IMPORTS:**
- `import { ContentItem } from "@/shared/types";`
- `import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";`
- `import { addFavorite, removeFavorite } from "@/store/contentSlice";` (this stays the same - it's not an old import)

**Updated Code:**
```typescript
import { ContentItem } from "@/shared/types";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { addFavorite, removeFavorite } from "@/store/contentSlice";
```

---

### 7. src/components/layout/Header.tsx
**File Path:** `dashboard/src/components/layout/Header.tsx`

**OLD IMPORTS:**
- Line 10: `import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";`
- Line 13: `import { LS_NEWS_KEY, LS_TMDB_KEY } from "@/hooks/useApiKeys";`
- Line 14: `import LanguageSwitcher from "@/components/ui/LanguageSwitcher";`
- Line 15: `import { getAvatarGradient } from "@/lib/avatarOptions";`

**NEW IMPORTS:**
- `import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";`
- `import { LS_NEWS_KEY, LS_TMDB_KEY } from "@/features/settings/hooks/useApiKeys";`
- `import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher";`
- `import { getAvatarGradient } from "@/shared/utils/avatarOptions";`

**Updated Code:**
```typescript
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { toggleDarkMode } from "@/store/preferencesSlice";
import { setQuery, performSearch, clearSearch } from "@/store/searchSlice";
import { LS_NEWS_KEY, LS_TMDB_KEY } from "@/features/settings/hooks/useApiKeys";
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher";
import { getAvatarGradient } from "@/shared/utils/avatarOptions";
```

---

### 8. src/components/layout/DashboardLayout.tsx
**File Path:** `dashboard/src/components/layout/DashboardLayout.tsx`

**OLD IMPORTS:**
- Line 9: `import { useAppSelector } from "@/hooks/useRedux";`

**NEW IMPORTS:**
- `import { useAppSelector } from "@/shared/hooks/useRedux";`

**Updated Code:**
```typescript
import { useAppSelector } from "@/shared/hooks/useRedux";
```

---

### 9. src/components/ui/CategoryFilter.tsx
**File Path:** `dashboard/src/components/ui/CategoryFilter.tsx`

**OLD IMPORTS:**
- Line 8: `import { Category } from "@/types";`

**NEW IMPORTS:**
- `import { Category } from "@/shared/types";`

**Updated Code:**
```typescript
import { Category } from "@/shared/types";
```

---

### 10. src/components/feed/DraggableFeed.tsx
**File Path:** `dashboard/src/components/feed/DraggableFeed.tsx`

**OLD IMPORTS:**
- Line 26: `import { ContentItem } from "@/types";`
- Line 27: `import { useAppDispatch } from "@/hooks/useRedux";`
- Line 29: `import ContentCard from "@/components/cards/ContentCard";`

**NEW IMPORTS:**
- `import { ContentItem } from "@/shared/types";`
- `import { useAppDispatch } from "@/shared/hooks/useRedux";`
- `import ContentCard from "@/features/feed/components/ContentCard";`

**Updated Code:**
```typescript
import { ContentItem } from "@/shared/types";
import { useAppDispatch } from "@/shared/hooks/useRedux";
import { reorderFeed } from "@/store/contentSlice";
import ContentCard from "@/features/feed/components/ContentCard";
```

---

### 11. src/features/feed/components/DraggableFeed.tsx
**File Path:** `dashboard/src/features/feed/components/DraggableFeed.tsx`

**OLD IMPORTS:**
- Line 29: `import ContentCard from "@/components/cards/ContentCard";`

**NEW IMPORTS:**
- `import ContentCard from "@/features/feed/components/ContentCard";`

**Updated Code:**
```typescript
import ContentCard from "@/features/feed/components/ContentCard";
```

---

### 12. src/shared/utils/api.ts
**File Path:** `dashboard/src/shared/utils/api.ts`

**OLD IMPORTS:**
- Line 5: `import { ContentItem, Category } from "@/types";`

**NEW IMPORTS:**
- `import { ContentItem, Category } from "@/shared/types";`

**Updated Code:**
```typescript
import { ContentItem, Category } from "@/shared/types";
```

---

## TEST FILES

### 13. src/__tests__/api.test.ts
**File Path:** `dashboard/src/__tests__/api.test.ts`

**OLD IMPORTS:**
- Line 10: `import { fetchNews, fetchRecommendations, fetchSocialPosts, searchContent } from "@/services/api";`
- Line 11: `import { ContentItem, Category } from "@/types";`

**NEW IMPORTS:**
- `import { fetchNews, fetchRecommendations, fetchSocialPosts, searchContent } from "@/shared/utils/api";`
- `import { ContentItem, Category } from "@/shared/types";`

---

### 14. src/__tests__/ContentCard.test.tsx
**File Path:** `dashboard/src/__tests__/ContentCard.test.tsx`

**OLD IMPORTS:**
- Line 7: `import ContentCard from "@/components/cards/ContentCard";`
- Line 8: `import { ContentItem } from "@/types";`

**NEW IMPORTS:**
- `import ContentCard from "@/features/feed/components/ContentCard";`
- `import { ContentItem } from "@/shared/types";`

---

### 15. src/__tests__/CategoryFilter.test.tsx
**File Path:** `dashboard/src/__tests__/CategoryFilter.test.tsx`

**OLD IMPORTS:**
- Line 7: `import CategoryFilter from "@/components/ui/CategoryFilter";`
- Line 8: `import { Category } from "@/types";`

**NEW IMPORTS:**
- `import CategoryFilter from "@/shared/components/ui/CategoryFilter";`
- `import { Category } from "@/shared/types";`

---

### 16. src/__tests__/Header.test.tsx
**File Path:** `dashboard/src/__tests__/Header.test.tsx`

**OLD IMPORTS:**
- Line 7: `import Header from "@/components/layout/Header";`

**NEW IMPORTS:**
- `import Header from "@/shared/components/layout/Header";`

---

### 17. src/__tests__/DraggableFeed.test.tsx
**File Path:** `dashboard/src/__tests__/DraggableFeed.test.tsx`

**OLD IMPORTS:**
- Line 7: `import DraggableFeed from "@/components/feed/DraggableFeed";`
- Line 8: `import { ContentItem } from "@/types";`

**NEW IMPORTS:**
- `import DraggableFeed from "@/features/feed/components/DraggableFeed";`
- `import { ContentItem } from "@/shared/types";`

---

### 18. src/__tests__/contentSlice.test.ts
**File Path:** `dashboard/src/__tests__/contentSlice.test.ts`

**OLD IMPORTS:**
- Line 10: `import { ContentState, ContentItem } from "@/types";`

**NEW IMPORTS:**
- `import { ContentState, ContentItem } from "@/shared/types";`

---

### 19. src/__tests__/searchSlice.test.ts
**File Path:** `dashboard/src/__tests__/searchSlice.test.ts`

**OLD IMPORTS:**
- Line 9: `import { SearchState } from "@/types";`
- Line 17: `import { searchContent } from "@/services/api";`

**NEW IMPORTS:**
- `import { SearchState } from "@/shared/types";`
- `import { searchContent } from "@/shared/utils/api";`

---

### 20. src/__tests__/preferencesSlice.test.ts
**File Path:** `dashboard/src/__tests__/preferencesSlice.test.ts`

**OLD IMPORTS:**
- Line 9: `import { PreferencesState } from "@/types";`

**NEW IMPORTS:**
- `import { PreferencesState } from "@/shared/types";`

---

## IMPORT PATH TRANSFORMATION SUMMARY

| OLD PATH | NEW PATH | Notes |
|----------|----------|-------|
| `@/auth` | `@/features/auth/auth` | Auth module moved to features |
| `@/types` | `@/shared/types` | Types now in shared folder |
| `@/hooks/useRedux` | `@/shared/hooks/useRedux` | Redux hooks in shared |
| `@/hooks/useApiKeys` | `@/features/settings/hooks/useApiKeys` | API keys hook moved to settings feature |
| `@/components/cards/*` | `@/features/feed/components/*` | Card components moved to feed feature |
| `@/components/layout/*` | `@/shared/components/layout/*` | Layout components in shared |
| `@/components/ui/*` | `@/shared/components/ui/*` | UI components in shared |
| `@/components/feed/*` | `@/features/feed/components/*` | Feed components in feature |
| `@/lib/avatarOptions` | `@/shared/utils/avatarOptions` | Avatar utilities moved to utils |
| `@/services/api` | `@/shared/utils/api` | API service moved to shared utils |
| `@/i18n/*` | `@/shared/config/i18n/*` | i18n config in shared |

---

## QUICK REFERENCE BY FILE

**Files Modified: 20**

**Total Import Changes: ~40 imports**

**Old Path Patterns:**
- `@/auth` → 1 file (middleware.ts)
- `@/types` → 9 files
- `@/hooks/useRedux` → 5 files
- `@/hooks/useApiKeys` → 1 file
- `@/components/cards/*` → 2 files
- `@/components/layout/*` → 3 files
- `@/components/ui/*` → 2 files
- `@/components/feed/*` → 1 file
- `@/lib/avatarOptions` → 1 file
- `@/services/api` → 4 files
