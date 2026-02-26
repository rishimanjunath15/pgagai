# Personalized Content Dashboard

A fully-featured, responsive dashboard for personalized news, movie recommendations, and social media content — built with **Next.js 15**, **TypeScript**, **Redux Toolkit**, **Tailwind CSS**, and **Framer Motion**.

---

## Features

| Feature | Description |
|---|---|
| Personalized Feed | Choose categories (tech, sports, finance, etc.) and get tailored content |
| Infinite Scroll | Automatically loads more content as you scroll down |
| Drag & Drop | Reorder your feed cards by dragging them |
| Search (Debounced) | Search across news with 500ms debounce to optimize API calls |
| Favorites | Heart any card to save it to your Favorites section |
| Trending Section | See today's top trending news and movies |
| Dark Mode | Toggle dark/light mode — preference saved across sessions |
| Category Filter | Quick filter pills to toggle content categories |
| Animations | Smooth card transitions, hovers, and loading spinners via Framer Motion |
| Mock Data Fallback | Works without API keys using realistic mock data |

---

## Tech Stack

- **Next.js 15** (App Router) — server/client components, file-based routing
- **TypeScript** — strict typing throughout
- **Redux Toolkit** — global state management (content, preferences, search)
- **redux-persist** — saves user preferences to `localStorage`
- **Tailwind CSS** — utility-first responsive styling
- **Framer Motion** — animations and drag effects
- **@dnd-kit** — accessible drag-and-drop for reordering cards
- **Axios** — HTTP requests to external APIs
- **Jest + React Testing Library** — unit and integration tests

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home / Feed page
│   ├── trending/page.tsx   # Trending page
│   ├── favorites/page.tsx  # Favorites page
│   └── settings/page.tsx   # Settings page
│
├── components/
│   ├── layout/             # DashboardLayout, Sidebar, Header
│   ├── feed/               # DraggableFeed (dnd-kit)
│   ├── cards/              # ContentCard
│   ├── ui/                 # CategoryFilter, LoadingSpinner
│   └── providers/          # ReduxProvider
│
├── store/                  # Redux slices + store config
│   ├── index.ts            # Store setup with redux-persist
│   ├── contentSlice.ts     # Feed, trending, favorites
│   ├── preferencesSlice.ts # User preferences (categories, dark mode)
│   └── searchSlice.ts      # Search query + results
│
├── hooks/
│   └── useRedux.ts         # Typed useAppDispatch + useAppSelector
│
├── services/
│   └── api.ts              # NewsAPI, TMDB, mock social media fetchers
│
├── types/
│   └── index.ts            # All TypeScript interfaces
│
└── __tests__/              # Unit + integration tests
    ├── contentSlice.test.ts
    ├── preferencesSlice.test.ts
    ├── ContentCard.test.tsx
    ├── CategoryFilter.test.tsx
    └── testUtils.tsx       # Custom render with Redux store
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd dashboard
npm install
```

### 2. Set up API keys (Optional — app works without them!)

Edit `.env.local`:
```env
NEXT_PUBLIC_NEWS_API_KEY=your_key_here      # https://newsapi.org (free)
NEXT_PUBLIC_TMDB_API_KEY=your_key_here      # https://www.themoviedb.org (free)
```

> **Note:** If keys are absent or API calls fail, the app automatically falls back to realistic mock data, so you can run and demo everything without signing up.

### 3. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### What's tested

| Test File | What it covers |
|---|---|
| `contentSlice.test.ts` | Add/remove favorites, reorder feed, clear feed |
| `preferencesSlice.test.ts` | Toggle categories, toggle dark mode, minimum 1 category rule |
| `ContentCard.test.tsx` | Renders title/description/source, CTA type, add/remove favorites |
| `CategoryFilter.test.tsx` | Renders all categories, highlights selected, calls onToggle correctly |

---

## User Flow

1. **Home (Feed)** — Visit `/` to see your personalized feed
2. **Filter by Category** — Click category pills to toggle topics
3. **Reorder** — Drag any card to a new position
4. **Save** — Click the heart on any card to add it to favorites
5. **Search** — Type in the header search bar (debounced, 500ms)
6. **Trending** — Visit `/trending` for today's top stories
7. **Favorites** — Visit `/favorites` for your saved items
8. **Settings** — Visit `/settings` to manage preferences and dark mode

---

## API Info

| API | Purpose | Free tier |
|---|---|---|
| [NewsAPI](https://newsapi.org) | News articles by category | 100 req/day |
| [TMDB API](https://www.themoviedb.org/settings/api) | Movie recommendations | Unlimited (free) |
| Social Media | Mock only (OAuth required for real APIs) | N/A |

---

## Build for Production

```bash
npm run build
npm start
```

