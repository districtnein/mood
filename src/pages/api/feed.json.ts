import type { APIRoute } from "astro";
import feed from "../../data/feed.json";

export const GET: APIRoute = () => {
  const anyFeed = feed as any;
  const rows = Array.isArray(anyFeed.rows) ? anyFeed.rows : [];

  // Keep your “append at bottom = newest first on site” behavior:
  const ordered = [...rows].reverse();

  return new Response(
    JSON.stringify({
      title: anyFeed.title ?? "mood",
      total: ordered.length,
      rows: ordered
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
};
