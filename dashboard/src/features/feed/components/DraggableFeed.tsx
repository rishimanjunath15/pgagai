// ============================================
// DRAGGABLE FEED - Feed with drag-and-drop reordering
// ============================================
"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentItem } from "@/shared/types";
import { useAppDispatch } from "@/shared/hooks/useRedux";
import { reorderFeed } from "@/store/contentSlice";
import ContentCard from "@/features/feed/components/ContentCard";

// ---- SortableCard Wrapper ----
// IMPORTANT: We split the drag listeners from the card content.
// The entire card div gets `setNodeRef` for size tracking.
// But we ONLY apply `listeners` (drag start events) to a small drag handle at the top
// of the card — this prevents clicks on "Read More", favorites, or links from
// accidentally starting a drag.
function SortableCard({
  item,
  index,
  isActive,
}: {
  item: ContentItem;
  index: number;
  isActive: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative"
    >
      {/* ---- Drag Handle ---- */}
      {/* Only this strip responds to drag events — keeps card buttons fully clickable */}
      <div
        {...listeners}
        className={`absolute top-0 left-0 right-0 h-8 z-10 flex items-center justify-center gap-1
                   cursor-grab active:cursor-grabbing select-none rounded-t-xl
                   bg-gradient-to-b from-black/25 to-transparent
                   group transition-opacity duration-150
                   ${isActive ? "opacity-0" : "opacity-100"}`}
        title="Drag to reorder"
        aria-label="Drag handle"
      >
        {/* Grip dots — 6 dots in 2 rows of 3 */}
        <svg
          viewBox="0 0 18 10"
          className="w-5 h-3 text-white/80 group-hover:text-white transition-colors"
          fill="currentColor"
        >
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="9" cy="2" r="1.5" />
          <circle cx="16" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="9" cy="8" r="1.5" />
          <circle cx="16" cy="8" r="1.5" />
        </svg>
      </div>

      {/* Ghost placeholder shown where a dragging card WAS */}
      {isDragging ? (
        <div className="rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
             style={{ height: "360px" }}
        />
      ) : (
        /* The actual content card — all its buttons/links work normally */
        <ContentCard item={item} index={index} isDragging={false} />
      )}
    </div>
  );
}

// ---- Main DraggableFeed Component ----
interface DraggableFeedProps {
  items: ContentItem[];
}

export default function DraggableFeed({ items }: DraggableFeedProps) {
  const dispatch = useAppDispatch();
  // Track which card is currently being dragged so we can render its DragOverlay
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeItem = items.find((i) => i.id === activeId) ?? null;

  // Set up drag sensors
  // PointerSensor with a distance of 8px means the user must move 8px before
  // a drag starts — this avoids accidental drags on simple clicks.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  // Called when user drops a card — reorder the feed in Redux
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        dispatch(reorderFeed(arrayMove(items, oldIndex, newIndex)));
      }
    },
    [items, dispatch]
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No content found</p>
        <p className="text-sm mt-2">Try adjusting your category preferences</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <SortableCard
              key={item.id}
              item={item}
              index={index}
              isActive={item.id === activeId}
            />
          ))}
        </div>
      </SortableContext>

      {/* DragOverlay renders the card as a floating ghost following the cursor */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeItem ? (
          <div className="rotate-2 scale-105 shadow-2xl ring-2 ring-blue-400 ring-offset-2 rounded-xl pointer-events-none">
            <ContentCard item={activeItem} index={0} isDragging={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
