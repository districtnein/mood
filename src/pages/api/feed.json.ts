import type { APIRoute } from "astro";
import feed from "../../data/feed.json";

const DEFAULT_PAGE_SIZE = 36;
const MAX_PAGE_SIZE = 60;

type RowItem = { src: string; w?: number; h?: number; alt?: string };
type Row = { layout: 1 | 2 | 3; items: RowItem[] };

function flattenRows(): (RowItem & { layout: 1 | 2 | 3 })[] {
  const anyFeed = feed as any;
  const rows: Row[] = Array.isArray(anyFeed.rows) ? anyFeed.rows : [];

  const out: (RowItem & { layout: 1 | 2 | 3 })[] = [];
  for (const row of rows) {
    const layout = (row?.layout ?? 1) as 1 | 2 | 3;
    const items = Array.isArray(row?.items) ? row.items : [];
    for (const it of items) out.push({ ...it, layout });
  }
  return out;
}

export const GET: APIRoute = ({ url }) => {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

  const pageSizeRaw =
    Number(url.searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), MAX_PAGE_SIZE);

  const flat = flattenRows();

  // Newest-first assumes you append new rows at end
  const ordered = [...flat].reverse();

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
      items: slice
    }),
    { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }
  );
};
