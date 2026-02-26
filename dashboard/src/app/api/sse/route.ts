// ============================================
// SSE API ROUTE - Server-Sent Events for real-time feed
// GET /api/sse — Streams content update events
// ============================================
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // no caching for SSE

// ---- Pool of mock items to push as live updates ----
const MOCK_ITEMS = [
  {
    id: "sse-1",
    type: "news",
    title: "Breaking: Tech Giants Report Record Earnings This Quarter",
    source: "TechCrunch",
    timestamp: new Date().toISOString(),
    category: "Technology",
    imageUrl: "/placeholder.png",
  },
  {
    id: "sse-2",
    type: "news",
    title: "Scientists Discover New Exoplanet in Habitable Zone",
    source: "Science Daily",
    timestamp: new Date().toISOString(),
    category: "Science",
    imageUrl: "/placeholder.png",
  },
  {
    id: "sse-3",
    type: "movie",
    title: "Most Anticipated Blockbuster Tops Box Office Opening Weekend",
    source: "TMDB",
    timestamp: new Date().toISOString(),
    category: "Movies",
    imageUrl: "/placeholder.png",
  },
  {
    id: "sse-4",
    type: "news",
    title: "Global Markets Rally as Inflation Data Comes in Lower Than Expected",
    source: "Reuters",
    timestamp: new Date().toISOString(),
    category: "Finance",
    imageUrl: "/placeholder.png",
  },
  {
    id: "sse-5",
    type: "news",
    title: "New AI Model Achieves Human-Level Performance on Reasoning Benchmarks",
    source: "MIT Technology Review",
    timestamp: new Date().toISOString(),
    category: "AI",
    imageUrl: "/placeholder.png",
  },
  {
    id: "sse-6",
    type: "movie",
    title: "Award-Winning Drama Gets Greenlit for Sequel",
    source: "TMDB",
    timestamp: new Date().toISOString(),
    category: "Movies",
    imageUrl: "/placeholder.png",
  },
];

let itemIndex = 0;

function getNextItem() {
  const base = MOCK_ITEMS[itemIndex % MOCK_ITEMS.length];
  itemIndex++;
  return {
    ...base,
    id: `sse-${Date.now()}-${itemIndex}`,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event immediately
      controller.enqueue(
        encoder.encode(`event: connected\ndata: {"message":"SSE stream connected"}\n\n`)
      );

      // Push a new content item every 30 seconds
      const interval = setInterval(() => {
        const item = getNextItem();
        const data = JSON.stringify(item);
        controller.enqueue(encoder.encode(`event: newItem\ndata: ${data}\n\n`));
      }, 30_000);

      // Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
    },
  });
}
