import type { APIRoute } from "astro";
import feed from "../../data/feed.json";

const DEFAULT_PAGE_SIZE = 36;
const MAX_PAGE_SIZE = 60;

type FeedItem = {
  src: string;
  w?: number;
  h?: number;
  alt?: string;
  span?: number;
};

function getItems(): FeedItem[] {
  const anyFeed = feed as any;

  // Case A: flat items list
  if (Array.isArray(anyFeed.items)) return anyFeed.items as FeedItem[];

  // Case B: rows format -> flatten
  if (Array.isArray(anyFeed.rows)) {
    const out: FeedItem[] = [];
    for (const row of anyFeed.rows) {
      const layout = Number(row?.layout ?? 1);
      const items = Array.isArray(row?.items) ? row.items : [];
      for (const it of items) {
        out.push({
          ...it,
          // map "layout" to span so your front-end can size it
          span: Number(it?.span ?? layout ?? 1),
        });
      }
    }
    return out;
  }

  // Fallback
  return [];
}

export const GET: APIRoute = ({ url }) => {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSizeRaw =
    Number(url.searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), MAX_PAGE_SIZE);

  const items = getItems();

  // newest-first (assumes you append new items at end)
  const ordered = [...items].reverse();

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const slice = ordered.slice(start, end);
  const hasMore = end < ordered.length;

  return new Response(
    JSON.stringify({
      title: (feed as any).title ?? "moodboard",
      page,
      pageSize,
      hasMore,
      total: ordered.length,
      items: slice,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
};
