// ============================================
// INTEGRATION TESTS - ContentCard component
// ============================================
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithStore } from "./testUtils";
import ContentCard from "@/features/feed/components/ContentCard";
import { ContentItem } from "@/shared/types";

// Mock framer-motion to avoid animation issues in tests
// We strip out motion-specific props so they don't get passed to the real DOM
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, whileHover, layout, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockItem: ContentItem = {
  id: "card-test-1",
  type: "news",
  title: "AI Breakthrough in 2025",
  description: "Scientists have made a remarkable AI discovery.",
  image: "https://example.com/image.png",
  url: "https://example.com/article",
  source: "Tech Daily",
  category: "technology",
  publishedAt: "2025-06-15T10:00:00Z",
};

describe("ContentCard", () => {
  it("renders the title", () => {
    renderWithStore(<ContentCard item={mockItem} index={0} />);
    expect(screen.getByText("AI Breakthrough in 2025")).toBeInTheDocument();
  });

  it("renders the description", () => {
    renderWithStore(<ContentCard item={mockItem} index={0} />);
    expect(screen.getByText(/remarkable AI discovery/i)).toBeInTheDocument();
  });

  it("renders the source name", () => {
    renderWithStore(<ContentCard item={mockItem} index={0} />);
    expect(screen.getByText("Tech Daily")).toBeInTheDocument();
  });

  it("shows 'Read More' CTA for news type", () => {
    renderWithStore(<ContentCard item={mockItem} index={0} />);
    expect(screen.getByText(/Read More/i)).toBeInTheDocument();
  });

  it("shows 'Watch Now' CTA for recommendation type", () => {
    const movieItem = { ...mockItem, type: "recommendation" as const };
    renderWithStore(<ContentCard item={movieItem} index={0} />);
    expect(screen.getByText(/Watch Now/i)).toBeInTheDocument();
  });

  it("shows News badge for news type", () => {
    renderWithStore(<ContentCard item={mockItem} index={0} />);
    expect(screen.getByText("News")).toBeInTheDocument();
  });

  it("adds to favorites when heart button clicked", () => {
    const { store } = renderWithStore(<ContentCard item={mockItem} index={0} />);

    // Initially no favorites
    expect(store.getState().content.favorites).toHaveLength(0);

    // Click the favorite button (shows 🤍 initially)
    const favoriteBtn = screen.getByLabelText("Add to favorites");
    fireEvent.click(favoriteBtn);

    // Now should have 1 favorite
    expect(store.getState().content.favorites).toHaveLength(1);
    expect(store.getState().content.favorites[0].id).toBe("card-test-1");
  });

  it("removes from favorites when already favorited", () => {
    const { store } = renderWithStore(<ContentCard item={mockItem} index={0} />);

    // Add to favorites
    fireEvent.click(screen.getByLabelText("Add to favorites"));
    expect(store.getState().content.favorites).toHaveLength(1);

    // Remove from favorites
    fireEvent.click(screen.getByLabelText("Remove from favorites"));
    expect(store.getState().content.favorites).toHaveLength(0);
  });
});
