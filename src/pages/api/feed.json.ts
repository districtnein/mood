import type { APIRoute } from "astro";
import feed from "../../data/feed.json";

const DEFAULT_PAGE_SIZE = 12; // rows per page
const MAX_PAGE_SIZE = 30;

type RowItem = { src: string; w?: number; h?: number; alt?: string };
type Row = { layout: 1 | 2 | 3; items: RowItem[] };

function getRows(): Row[] {
  const anyFeed = feed as any;
  return Array.isArray(anyFeed.rows) ? (anyFeed.rows as Row[]) : [];
}

export const GET: APIRoute = ({ url }) => {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSizeRaw =
    Number(url.searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), MAX_PAGE_SIZE);

  const rows = getRows();
  const ordered = [...rows].reverse(); // newest rows first (append new rows at end)

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
      rows: slice
    }),
    { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }
  );
};
