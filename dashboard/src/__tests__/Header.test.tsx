// ============================================
// INTEGRATION TESTS - Header component
// ============================================
import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithStore } from "./testUtils";
import Header from "@/components/layout/Header";

// ----- Mocks -----
// next/navigation is used inside Header → mock usePathname
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// next-auth/react → mock useSession (unauthenticated by default) and signOut
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: jest.fn(),
}));

// react-i18next → mock useTranslation with a passthrough t()
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en", changeLanguage: jest.fn() } }),
}));

// LanguageSwitcher renders nothing meaningful in unit tests
jest.mock("@/components/ui/LanguageSwitcher", () => ({
  __esModule: true,
  default: () => <span data-testid="lang-switcher" />,
}));

// next/link renders plain <a> in tests
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the api (search thunk) so no real HTTP requests are made
jest.mock("@/services/api", () => ({
  searchContent: jest.fn().mockResolvedValue([]),
}));

// framer-motion: strip animation props from DOM
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { initial, animate, exit, variants, transition, whileHover, layout, ...domProps } = props as any;
      void initial; void animate; void exit; void variants; void transition; void whileHover; void layout;
      return <div {...domProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockOnMenuClick = jest.fn();

// ---- Helper: render Header cleanly ----
function renderHeader() {
  return renderWithStore(<Header onMenuClick={mockOnMenuClick} />);
}

describe("Header — rendering", () => {
  it("renders the search input", () => {
    renderHeader();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("renders the dark mode toggle button", () => {
    renderHeader();
    expect(screen.getByLabelText("Toggle dark mode")).toBeInTheDocument();
  });

  it("renders the hamburger menu button", () => {
    renderHeader();
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
  });

  it("calls onMenuClick when hamburger is clicked", () => {
    mockOnMenuClick.mockClear();
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });
});

describe("Header — Dark Mode toggle", () => {
  it("shows moon icon when dark mode is off", () => {
    renderHeader();
    expect(screen.getByLabelText("Toggle dark mode")).toHaveTextContent("🌙");
  });

  it("toggles dark mode in Redux store when button is clicked", () => {
    const { store } = renderHeader();
    expect(store.getState().preferences.preferences.darkMode).toBe(false);
    fireEvent.click(screen.getByLabelText("Toggle dark mode"));
    expect(store.getState().preferences.preferences.darkMode).toBe(true);
  });

  it("shows sun icon after dark mode is toggled on", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle dark mode"));
    expect(screen.getByLabelText("Toggle dark mode")).toHaveTextContent("☀️");
  });
});

describe("Header — API status banner", () => {
  const origNews  = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  const origTmdb  = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const origToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;

  afterEach(() => {
    // restore env vars after each test
    if (origNews)  process.env.NEXT_PUBLIC_NEWS_API_KEY = origNews;
    else           delete process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (origTmdb)  process.env.NEXT_PUBLIC_TMDB_API_KEY = origTmdb;
    else           delete process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (origToken) process.env.NEXT_PUBLIC_TMDB_READ_TOKEN = origToken;
    else           delete process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;
  });

  it("shows Demo Mode banner when no API keys are set", () => {
    delete process.env.NEXT_PUBLIC_NEWS_API_KEY;
    delete process.env.NEXT_PUBLIC_TMDB_API_KEY;
    delete process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;
    renderHeader();
    expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument();
  });

  it("Demo Mode banner has a link to Settings", () => {
    delete process.env.NEXT_PUBLIC_NEWS_API_KEY;
    delete process.env.NEXT_PUBLIC_TMDB_API_KEY;
    delete process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;
    renderHeader();
    const link = screen.getByText(/Add Keys/i).closest("a");
    expect(link).toHaveAttribute("href", "/settings");
  });
});

describe("Header — Search input", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("search input reflects typed value immediately", () => {
    renderHeader();
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "sports news" } });
    expect(input.value).toBe("sports news");
  });

  it("shows clear (✕) button when input has a value", () => {
    renderHeader();
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: "anything" } });
    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("does NOT show clear button when input is empty", () => {
    renderHeader();
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });

  it("clears input when ✕ button is clicked", () => {
    renderHeader();
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test query" } });
    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(input.value).toBe("");
  });

  it("dispatches setQuery after debounce completes", () => {
    const { store } = renderHeader();
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: "technology" } });
    // Before debounce fires, store query is still empty
    expect(store.getState().search.query).toBe("");
    // Advance timers to fire the 500ms debounce
    act(() => { jest.advanceTimersByTime(500); });
    expect(store.getState().search.query).toBe("technology");
  });

  it("dispatches clearSearch when input is cleared via ✕", () => {
    const { store } = renderHeader();
    const input = screen.getByPlaceholderText(/search/i);

    // Type something and let debounce fire to set the query
    fireEvent.change(input, { target: { value: "tech" } });
    act(() => { jest.advanceTimersByTime(500); });
    expect(store.getState().search.query).toBe("tech");

    // Now clear
    fireEvent.click(screen.getByLabelText("Clear search"));
    act(() => { jest.advanceTimersByTime(500); });
    expect(store.getState().search.query).toBe("");
  });
});
