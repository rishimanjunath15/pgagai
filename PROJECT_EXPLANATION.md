<div align="center">

# 📊 Personalized Content Dashboard
### A full-featured, real-time content feed built for the modern web

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)

> A responsive dashboard where logged-in users see a curated, real-time feed of news articles,  
> movie recommendations, and social posts — fully customizable, filterable, and drag-reorderable.

**🔑 Demo Login:** `demo@dashboard.com` / `demo123`

</div>

---

## 📌 Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Tech Stack](#2-tech-stack-at-a-glance)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Authentication Flow](#4-authentication-flow)
5. [Data Fetching Flow](#5-data-fetching-flow)
6. [Real-Time Updates (SSE)](#6-real-time-updates-sse)
7. [State Management (Redux)](#7-state-management-redux)
8. [Key UI Features](#8-key-ui-features)
9. [Component Hierarchy](#9-component-hierarchy)
10. [TypeScript Data Model](#10-typescript-data-model)
11. [Pages & Routes](#11-pages--routes)
12. [Testing Strategy](#12-testing-strategy)
13. [Internationalization](#13-internationalization-i18n)
14. [How to Run](#14-how-to-run)
15. [Key Engineering Decisions](#15-key-engineering-decisions)

---

## 1. What Is This Project?

A **Personalized Content Dashboard** built as a frontend engineering assignment. It is a responsive dashboard where a logged-in user sees a curated feed of content pulled from multiple sources.

### ✨ Core Capabilities

| Capability | Details |
|---|---|
| 📰 Multi-source Feed | News (NewsAPI), Movies (TMDB), Social (mock) merged into one feed |
| 🎯 Personalization | User picks categories; feed updates automatically |
| ♾️ Infinite Scroll | Loads more content as you scroll, with auto-refresh every 60s |
| 🔴 Real-Time | Server-Sent Events push new items live without page reload |
| 🔍 Search | Debounced search across all content (500ms) |
| ❤️ Favorites | Heart any card; saved to localStorage via redux-persist |
| 🌗 Dark Mode | System-aware toggle, preference persisted across sessions |
| 🌍 Multi-Language | English, Spanish, French, German |
| 🧪 Fully Tested | Unit, integration, and E2E test coverage |

---

## 2. Tech Stack at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                        TECH STACK                           │
├──────────────────────┬──────────────────────────────────────┤
│  LAYER               │  TECHNOLOGY                          │
├──────────────────────┼──────────────────────────────────────┤
│  Framework           │  Next.js 15  (App Router)            │
│  Language            │  TypeScript  (strict mode)           │
│  State Management    │  Redux Toolkit + redux-persist        │
│  Styling             │  Tailwind CSS                        │
│  Animations          │  Framer Motion                       │
│  Drag & Drop         │  @dnd-kit                            │
│  Authentication      │  NextAuth.js v5  (JWT strategy)      │
│  HTTP Client         │  Axios                               │
│  Real-Time           │  Server-Sent Events (SSE)            │
│  Internationalization│  react-i18next (EN / ES / FR / DE)   │
│  Unit Testing        │  Jest + React Testing Library        │
│  E2E Testing         │  Playwright                          │
└──────────────────────┴──────────────────────────────────────┘
```

---

## 3. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                           BROWSER                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js App Router  (src/app/)              │    │
│  │                                                          │    │
│  │  layout.tsx ──── Providers: Auth → Redux → i18n          │    │
│  │  ├── page.tsx                  (Home / Feed)             │    │
│  │  ├── trending/page.tsx         (Trending content)        │    │
│  │  ├── favorites/page.tsx        (Saved items)             │    │
│  │  ├── settings/page.tsx         (Preferences & API keys)  │    │
│  │  ├── profile/page.tsx          (Profile editor)          │    │
│  │  └── api/                                                │    │
│  │        ├── auth/[...nextauth]  (NextAuth handler)        │    │
│  │        └── sse/route.ts        (SSE stream)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────┐   ┌──────────────────────────────┐    │
│  │   Redux Store        │   │   Services  (api.ts)          │    │
│  │                      │   │                              │    │
│  │  contentSlice        │   │  NewsAPI   → News articles   │    │
│  │  preferencesSlice    │   │  TMDB API  → Movies          │    │
│  │  searchSlice         │   │  Mock      → Social posts    │    │
│  └─────────────────────┘   └──────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  middleware.ts  →  Route guard (unauthenticated → /login)│    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Authentication Flow

```
  User visits a protected page  (e.g. "/")
              │
              ▼
  ┌─────────────────────────┐
  │     middleware.ts        │  ←── runs on every request
  │  checks JWT session      │
  └────────────┬────────────┘
               │
       ┌───────┴────────┐
       │                │
   No session        Has session
       │                │
       ▼                ▼
  Redirect to      Render page  ✓
  /login?callbackUrl=/
       │
       ▼
  ┌─────────────────────────────┐
  │  /login  — Credentials form  │
  │  email + password input      │
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌──────────────────────────────────┐
  │  NextAuth  Credentials Provider  │
  │  auth.ts → validates MOCK_USERS  │
  └──────────────┬───────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
    Invalid             Valid
        │                  │
        ▼                  ▼
   Show error        Issue JWT token
                      ┌──────────────────┐
                      │  Standard fields │ name, email
                      │  Custom fields   │ initials, plan,
                      │                  │ bio, avatarId
                      └────────┬─────────┘
                               │
                               ▼
                    session callbacks surface
                    all fields into session.user
                               │
                               ▼
                    Redirect to callbackUrl  ✓
```

> **💡 Key Detail:** Profile edits (name, bio, avatar) call NextAuth's `update()`, which re-triggers the `jwt` callback with `trigger === "update"` — persisting changes into the JWT **without requiring re-login**.

---

## 5. Data Fetching Flow

```
  User loads Feed page
          │
          ▼
  preferencesSlice  →  reads  favoriteCategories
          │
          ▼
  fetchContent  thunk  dispatched  (contentSlice.ts)
          │
          ▼
  ┌───────────────────────────────────────────────┐
  │         Promise.all  —  parallel fetch         │
  ├─────────────────┬──────────────┬──────────────┤
  │  fetchNews()    │fetchRecom()  │fetchSocial() │
  │  NewsAPI  🗞️   │  TMDB API 🎬 │  Mock  💬    │
  └────────┬────────┴──────┬───────┴──────┬───────┘
           │               │              │
           └───────────────┴──────────────┘
                           │
                           ▼
               Merged → ContentItem[]
                           │
                           ▼
               Stored in Redux: content.feed
                           │
                           ▼
               DraggableFeed  renders  cards  🃏
```

### 🔑 API Key Resolution Priority

```
Priority 1 ──► NEXT_PUBLIC_* env var (.env.local)
    │
    └── missing?
         │
         ▼
Priority 2 ──► localStorage key (saved via Settings page)
    │
    └── missing?
         │
         ▼
Priority 3 ──► Automatic mock data fallback  ✅ (always works)
```

---

## 6. Real-Time Updates (SSE)

```
  ┌─────────────────────────────────────────┐
  │         SERVER  /api/sse/route.ts        │
  │                                         │
  │  HTTP connection stays open (streaming) │
  │  Every ~10 seconds:                     │
  │    ── sends "newItem" event ──►          │
  └──────────────────┬──────────────────────┘
                     │  Server-Sent Event
                     ▼
  ┌─────────────────────────────────────────┐
  │         CLIENT  useSSE  hook            │
  │                                         │
  │  EventSource("/api/sse") opened         │
  │  On "newItem" → add to newItems state   │
  │                                         │
  │  Header shows:  "3 new items ↑"  banner │
  │  User clicks  → prepend to Redux feed   │
  └─────────────────────────────────────────┘
```

---

## 7. State Management (Redux)

Three slices compose the full store, persisted selectively to `localStorage`:

### 📦 `contentSlice`

| Field | Type | Persisted | Description |
|---|---|---|---|
| `feed` | `ContentItem[]` | ❌ | Current page content |
| `trending` | `ContentItem[]` | ❌ | Top items regardless of prefs |
| `favorites` | `ContentItem[]` | ✅ | User-saved cards |
| `loading` | `boolean` | ❌ | Fetch in progress |
| `page` | `number` | ❌ | Current pagination page |
| `hasMore` | `boolean` | ❌ | More pages available |

### ⚙️ `preferencesSlice`

| Field | Type | Persisted | Description |
|---|---|---|---|
| `favoriteCategories` | `Category[]` | ✅ | Selected categories |
| `darkMode` | `boolean` | ✅ | Dark/light mode |

### 🔍 `searchSlice`

| Field | Type | Persisted | Description |
|---|---|---|---|
| `query` | `string` | ❌ | Search string |
| `results` | `ContentItem[]` | ❌ | Search results |
| `loading` | `boolean` | ❌ | Search in progress |

> **Persistence Strategy:** `redux-persist` uses a **custom Transform** — it saves only `favorites` from `contentSlice` (not the whole feed), keeping localStorage lean. An SSR-safe no-op storage prevents `localStorage` crashes during Next.js server rendering.

---

## 8. Key UI Features

### ♾️ Infinite Scroll
```
Feed bottom sentinel <div>
        │
        ▼  (enters viewport)
IntersectionObserver fires
        │
        ▼
fetchContent dispatched  →  page + 1
        │
        ▼
New items appended to feed
```
> Auto-refresh every **60 seconds** resets to page 1 even without scrolling.

---

### 🖱️ Drag & Drop  (`dnd-kit`)
```
User grabs a card
        │
        ▼
useDraggable  →  card follows cursor
        │
        ▼
useDroppable  →  target slot highlights
        │
        ▼
onDragEnd  →  reorderFeed dispatched  →  Redux updated
```

---

### 🔍 Search  (Debounced)
```
User types "react"
        │
        ▼  (500ms debounce — no API call yet)
        │
        ▼  (debounce settles)
searchContent thunk  →  NewsAPI query
        │
        ▼
Results stored in searchSlice  →  rendered in feed
```

---

### 🌗 Dark Mode
```
Toggle clicked
        │
        ▼
toggleDarkMode  dispatched  (preferencesSlice)
        │
        ▼
DashboardLayout  adds/removes  class="dark"  on <html>
        │
        ▼
Tailwind  dark:  variants apply globally  🎨
```

---

### 🏷️ Category Filter
```
User clicks "Sports" pill
        │
        ▼
toggleCategory dispatched  →  preferencesSlice updated
        │
        ▼
useEffect watches favoriteCategories
        │
        ▼
clearFeed  +  fetchContent  re-dispatched  →  fresh feed
```

---

## 9. Component Hierarchy

```
RootLayout  (layout.tsx)
  │
  └── AuthProvider  (NextAuth session)
        │
        └── ReduxProvider  (global store)
              │
              └── I18nProvider  (react-i18next)
                    │
                    └── Page Component  (e.g. page.tsx)
                          │
                          └── DashboardLayout
                                │
                                ├── Sidebar
                                │     └── Nav links  (Home / Trending / Favorites / Settings)
                                │
                                ├── Header
                                │     ├── 🔍 Search bar  (debounced, 500ms)
                                │     ├── 🌗 Dark mode toggle
                                │     ├── 🌍 Language switcher
                                │     └── 👤 User avatar menu  (Profile / Sign out)
                                │
                                └── Main Content Area
                                      ├── CategoryFilter  (pill buttons)
                                      ├── SkeletonCard ×9  (initial loading)
                                      ├── DraggableFeed
                                      │     └── ContentCard ×N
                                      │           ├── Image / Title / Description
                                      │           ├── Source + Timestamp
                                      │           ├── ❤️  Favorite toggle
                                      │           └── CTA button  (Read / Watch / View)
                                      └── LoadingSpinner  (pagination)
```

---

## 10. TypeScript Data Model

```typescript
// ─── Categories available in the app ───────────────────────────────────────
type Category =
  | "technology" | "sports" | "finance"
  | "entertainment" | "health" | "science";

// ─── A single piece of content shown on the dashboard ──────────────────────
interface ContentItem {
  id:          string;                              // unique identifier
  type:        "news" | "recommendation" | "social"; // content origin
  title:       string;
  description: string;
  image:       string;
  url:         string;
  source:      string;                             // "NewsAPI", "TMDB", etc.
  category:    Category;
  publishedAt: string;                             // ISO 8601 timestamp
}

// ─── User preferences persisted to localStorage ────────────────────────────
interface UserPreferences {
  favoriteCategories: Category[];   // what the feed shows
  darkMode:           boolean;      // UI theme
}

// ─── Redux root state shape ─────────────────────────────────────────────────
interface RootState {
  content:     ContentState;
  preferences: PreferencesState;
  search:      SearchState;
}
```

---

## 11. Pages & Routes

| Route | 🔒 Auth | Description |
|---|:---:|---|
| `/` | ✅ Yes | Personalized feed with infinite scroll + SSE |
| `/trending` | ❌ No | Top content regardless of user preferences |
| `/favorites` | ❌ No | All cards the user has hearted |
| `/settings` | ✅ Yes | API key manager, dark mode, language picker |
| `/profile` | ✅ Yes | Name, bio, avatar editor (JWT-persisted) |
| `/login` | ↩️ Redirects if authed | Credentials login form |
| `/api/auth/*` | — | NextAuth.js internal endpoints |
| `/api/sse` | — | Server-Sent Events stream |

---

## 12. Testing Strategy

### 🧪 Unit & Integration  (Jest + React Testing Library)

| Test File | Coverage |
|---|---|
| `contentSlice.test.ts` | Add/remove favorites, reorder feed, clear feed |
| `preferencesSlice.test.ts` | Toggle categories, dark mode, minimum-1-category rule |
| `ContentCard.test.tsx` | Renders title/description/source, CTA type, favorite toggle |
| `CategoryFilter.test.tsx` | Renders all categories, highlights selected, fires `onToggle` |
| `Header.test.tsx` | Search input, Redux dispatch, dark mode toggle |
| `DraggableFeed.test.tsx` | Renders all cards, empty state |
| `api.test.ts` | Mock API responses, fallback behavior |

```bash
npm test                   # single run
npm run test:watch         # watch mode (re-runs on save)
npm run test:coverage      # generates HTML coverage report
```

---

### 🎭 End-to-End  (Playwright)

| Spec File | What It Tests |
|---|---|
| `search.spec.ts` | Type in search bar → correct results appear |
| `dragdrop.spec.ts` | Drag card to new position → order changes |

```bash
npx playwright test                   # headless run
npx playwright test --ui              # visual test runner
npx playwright show-report            # open HTML report
```

---

## 13. Internationalization (i18n)

```
src/i18n/
  ├── config.ts              ← i18next setup, language detection
  └── locales/
        ├── en.json  🇬🇧     ← English   (default)
        ├── es.json  🇪🇸     ← Spanish
        ├── fr.json  🇫🇷     ← French
        └── de.json  🇩🇪     ← German
```

- All UI strings go through `t("key")` — **zero hardcoded text** in components.
- `LanguageSwitcher` in the Header calls `i18next.changeLanguage()` instantly without a page reload.
- Language preference is saved in `localStorage` automatically by i18next.

---

## 14. How to Run

```bash
# ── Step 1: Install dependencies ──────────────────────────────
cd dashboard
npm install

# ── Step 2: (Optional) Configure API keys ─────────────────────
# Create .env.local — app works WITHOUT keys (mock data fallback)
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key    # https://newsapi.org  (free)
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key       # https://themoviedb.org (free)

# ── Step 3: Start development server ──────────────────────────
npm run dev
# → Open http://localhost:3000

# ── Step 4: Login with demo account ───────────────────────────
# Email:    demo@dashboard.com
# Password: demo123

# ── Step 5: Run tests ──────────────────────────────────────────
npm test                   # unit + integration
npx playwright test        # E2E

# ── Step 6: Build for production ──────────────────────────────
npm run build
npm start
```

---

## 15. Key Engineering Decisions

| Decision | Why |
|---|---|
| **Next.js App Router** | Server components shrink the client bundle; file-based routing keeps structure clean |
| **JWT session strategy** | Stateless — no database needed; custom fields (`bio`, `plan`) added easily via callbacks |
| **Mock data fallback** | App is fully demoable with zero API setup; great for interviews and reviews |
| **`redux-persist` + Transform** | Persist only what matters (favorites, prefs) — not the entire volatile feed |
| **Debounced search (500ms)** | Prevents hammering the API on every keystroke; respects NewsAPI rate limits |
| **SSR-safe no-op storage** | Prevents `localStorage is not defined` crash during Next.js server rendering |
| **Abort signals on thunks** | Cancels in-flight HTTP requests at the network level when user navigates or clears feed |
| **Parallel API fetches** | `Promise.all` across 3 sources cuts load time vs sequential calls |

---

<div align="center">

Built with ❤️ using **Next.js 15** · **TypeScript** · **Redux Toolkit** · **Tailwind CSS**

</div>
