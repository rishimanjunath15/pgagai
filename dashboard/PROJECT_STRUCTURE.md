# Project Structure - Feature-Based Organization

## 📁 Directory Organization

```
src/
├── app/                          # Next.js App Router (pages & API routes)
│   ├── layout.tsx
│   ├── page.tsx                  # Main feed page
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Authentication routes
│   │   └── sse/                  # Server-Sent Events
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── favorites/
│   ├── trending/
│   ├── settings/
│   └── profile/
│
├── store/                         # Global Redis state management
│   ├── index.ts
│   ├── contentSlice.ts
│   ├── preferencesSlice.ts
│   └── searchSlice.ts
│
├── shared/                        # Shared across all features
│   ├── components/
│   │   ├── layout/               # DashboardLayout, Header, Sidebar
│   │   ├── ui/                   # CategoryFilter, LanguageSwitcher, LoadingSpinner, etc.
│   │   └── providers/            # AuthProvider, I18nProvider, ReduxProvider
│   ├── hooks/
│   │   └── useRedux.ts           # Redux selector hook
│   ├── types/
│   │   └── index.ts              # Global TypeScript types
│   ├── utils/
│   │   ├── api.ts                # API service utilities
│   │   └── avatarOptions.ts      # Avatar configuration
│   ├── constants/                # Global constants
│   └── config/
│       └── i18n/                 # Internationalization configuration
│           ├── config.ts
│           └── locales/
│               ├── en.json
│               ├── es.json
│               ├── fr.json
│               └── de.json
│
├── features/                      # Feature-based modules
│   ├── auth/                      # Authentication feature
│   │   ├── components/
│   │   └── auth.ts               # Auth utilities
│   │
│   ├── feed/                      # Main feed feature
│   │   ├── components/
│   │   │   ├── DraggableFeed.tsx
│   │   │   └── ContentCard.tsx
│   │   ├── hooks/
│   │   │   └── useSSE.ts          # Server-Sent Events hook
│   │   └── store/                 # Feed-specific state (if needed)
│   │
│   ├── favorites/                 # Favorites feature
│   │   ├── components/
│   │   └── (hooks & store in app/favorites/page.tsx)
│   │
│   ├── trending/                  # Trending feature
│   │   └── components/
│   │
│   ├── settings/                  # Settings feature
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useApiKeys.ts
│   │   └── store/
│   │
│   └── profile/                   # Profile feature
│       └── components/
│
└── __tests__/                     # Test files
    ├── __tests__/
    ├── e2e/                       # End-to-end tests
    └── playwright-report/
```

## 🎯 Key Principles

1. **Shared**: Reusable components, hooks, utilities used across multiple features
2. **Features**: Self-contained feature modules with their specific components and hooks
3. **Store**: Global Redux state (kept at root level for simplicity)
4. **App Router**: Next.js pages and routes remain in `app/` directory

## 📦 Import Paths

**Old Structure:**
```typescript
import { useRedux } from '@/hooks/useRedux';
import { ContentCard } from '@/components/cards/ContentCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
```

**New Structure:**
```typescript
import { useRedux } from '@/shared/hooks/useRedux';
import { ContentCard } from '@/features/feed/components/ContentCard';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
```

## ✅ Path Alias Configuration

Update `tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"],
      "@/store": ["./src/store"],
      "@/app": ["./src/app"]
    }
  }
}
```
