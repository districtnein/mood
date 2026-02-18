import type { APIRoute } from "astro";
import feed from "../../data/feed.json";

const DEFAULT_PAGE_SIZE = 36;
const MAX_PAGE_SIZE = 60;

export const GET: APIRoute = ({ url }) => {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

  const pageSizeRaw =
    Number(url.searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), MAX_PAGE_SIZE);

  // newest-first: reverse so latest added shows at top
  const items = [...feed.items].reverse();

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const slice = items.slice(start, end);
  const hasMore = end < items.length;

  return new Response(
    JSON.stringify({
      title: feed.title,
      page,
      pageSize,
      hasMore,
      total: items.length,
      items: slice
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
};
