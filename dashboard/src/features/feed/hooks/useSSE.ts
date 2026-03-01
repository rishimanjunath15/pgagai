// ============================================
// useSSE HOOK - Subscribes to Server-Sent Events
// ============================================
"use client";

import { useEffect, useRef, useState } from "react";

export interface SSEItem {
  id: string;
  type: "news" | "movie" | "social";
  title: string;
  source: string;
  timestamp: string;
  category: string;
  imageUrl: string;
}

interface UseSSEReturn {
  newItems: SSEItem[];
  isConnected: boolean;
  clearNewItems: () => void;
}

export function useSSE(url: string): UseSSEReturn {
  const [newItems, setNewItems] = useState<SSEItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;

    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("connected", () => {
      setIsConnected(true);
    });

    es.addEventListener("newItem", (event) => {
      try {
        const item: SSEItem = JSON.parse(event.data);
        setNewItems((prev) => [item, ...prev]);
      } catch {
        // Ignore malformed events
      }
    });

    es.onerror = () => {
      setIsConnected(false);
      // EventSource auto-reconnects; no need to manually retry
    };

    return () => {
      es.close();
      esRef.current = null;
      setIsConnected(false);
    };
  }, [url]);

  const clearNewItems = () => setNewItems([]);

  return { newItems, isConnected, clearNewItems };
}
