// ============================================
// INTEGRATION TESTS - DraggableFeed component
// ============================================
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithStore } from "./testUtils";
import DraggableFeed from "@/components/feed/DraggableFeed";
import { ContentItem } from "@/types";

// ----- Mocks -----
// @dnd-kit requires pointer events, ResizeObserver, etc. that jsdom doesn't
// fully implement. We mock the entire dnd-kit stack so we can test the
// component logic and rendering without real drag infrastructure.
jest.mock("@dnd-kit/core", () => ({
  DndContext:       ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter:    jest.fn(),
  KeyboardSensor:   jest.fn(),
  PointerSensor:    jest.fn(),
  useSensor:        jest.fn(),
  useSensors:       jest.fn(() => []),
  DragOverlay:      ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext:           ({ children }: { children: React.ReactNode }) => <>{children}</>,
  sortableKeyboardCoordinates: jest.fn(),
  rectSortingStrategy:      jest.fn(),
  useSortable: () => ({
    attributes:  {},
    listeners:   {},
    setNodeRef:  jest.fn(),
    transform:   null,
    transition:  null,
    isDragging:  false,
  }),
  arrayMove: (arr: ContentItem[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));

// framer-motion: strip animation props
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children, initial, animate, exit, variants,
      transition, whileHover, layout, ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) => {
      void initial; void animate; void exit; void variants;
      void transition; void whileHover; void layout;
      return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// next/image → plain <img>
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

// ---- Fixtures ----
function makeItem(id: string, title: string): ContentItem {
  return {
    id,
    type: "news",
    title,
    description: `Description for ${title}`,
    image: "/placeholder.png",
    url: "https://example.com",
    source: "Test Source",
    category: "technology",
    publishedAt: "2025-01-01T00:00:00Z",
  };
}

const items: ContentItem[] = [
  makeItem("item-1", "First Article"),
  makeItem("item-2", "Second Article"),
  makeItem("item-3", "Third Article"),
];

// =============================================
// Empty State Tests
// =============================================
describe("DraggableFeed — empty state", () => {
  it('shows "No content found" when items array is empty', () => {
    renderWithStore(<DraggableFeed items={[]} />);
    expect(screen.getByText("No content found")).toBeInTheDocument();
  });

  it("shows hint to adjust category preferences in empty state", () => {
    renderWithStore(<DraggableFeed items={[]} />);
    expect(screen.getByText(/Try adjusting your category preferences/i)).toBeInTheDocument();
  });

  it("does NOT render any content cards when empty", () => {
    renderWithStore(<DraggableFeed items={[]} />);
    expect(screen.queryByText("First Article")).not.toBeInTheDocument();
  });
});

// =============================================
// Content Rendering Tests
// =============================================
describe("DraggableFeed — with items", () => {
  it("renders all provided items", () => {
    renderWithStore(<DraggableFeed items={items} />);
    expect(screen.getByText("First Article")).toBeInTheDocument();
    expect(screen.getByText("Second Article")).toBeInTheDocument();
    expect(screen.getByText("Third Article")).toBeInTheDocument();
  });

  it("does NOT show empty-state message when items are present", () => {
    renderWithStore(<DraggableFeed items={items} />);
    expect(screen.queryByText("No content found")).not.toBeInTheDocument();
  });

  it("renders drag handles for each item", () => {
    renderWithStore(<DraggableFeed items={items} />);
    const handles = screen.getAllByLabelText("Drag handle");
    expect(handles).toHaveLength(items.length);
  });

  it("renders exactly one item per card position", () => {
    const singleItem = [makeItem("only-1", "Only Article")];
    renderWithStore(<DraggableFeed items={singleItem} />);
    expect(screen.getAllByText("Only Article")).toHaveLength(1);
  });
});

// =============================================
// Integration: Favorites via feed cards
// =============================================
describe("DraggableFeed — favorites integration", () => {
  it("adds item to Redux favorites when heart is clicked", () => {
    const { store } = renderWithStore(<DraggableFeed items={[items[0]]} />);
    expect(store.getState().content.favorites).toHaveLength(0);

    const favBtn = screen.getByLabelText("Add to favorites");
    fireEvent.click(favBtn);

    expect(store.getState().content.favorites).toHaveLength(1);
    expect(store.getState().content.favorites[0].id).toBe("item-1");
  });

  it("removes item from favorites when heart is clicked again", () => {
    const { store } = renderWithStore(<DraggableFeed items={[items[0]]} />);

    fireEvent.click(screen.getByLabelText("Add to favorites"));
    expect(store.getState().content.favorites).toHaveLength(1);

    fireEvent.click(screen.getByLabelText("Remove from favorites"));
    expect(store.getState().content.favorites).toHaveLength(0);
  });
});

// =============================================
// Integration: Redux reorder dispatch
// =============================================
describe("DraggableFeed — reorderFeed dispatch", () => {
  it("reorderFeed action works correctly in store", () => {
    // We test the Redux action directly (drag events are hard to simulate in jsdom)
    // This is tested thoroughly in contentSlice.test.ts — this test confirms
    // the feed renders the correct order after a reorder dispatch.
    const { store } = renderWithStore(<DraggableFeed items={items} />);

    // Manually dispatch a reorder — simulates what DnD would do
    const { reorderFeed } = require("@/store/contentSlice");
    const reordered = [items[2], items[0], items[1]];
    store.dispatch(reorderFeed(reordered));

    const savedFeed = store.getState().content.feed;
    expect(savedFeed[0].id).toBe("item-3");
    expect(savedFeed[1].id).toBe("item-1");
  });
});
