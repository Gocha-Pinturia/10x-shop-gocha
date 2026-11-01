import type { CatalogParams } from "../types/product.ts";

export function buildProductsUrl(params: CatalogParams): string {
  const { q, category, sortBy, order, limit = 12, skip = 0 } = params;

  if (q && q.trim()) {
    const searchParams = new URLSearchParams({
      q: q.trim(),
      limit: String(limit),
      skip: String(skip),
    });
    if (sortBy) {
      searchParams.set("sortBy", sortBy);
      if (order) searchParams.set("order", order);
    }
    return `/products/search?${searchParams.toString()}`;
  }

  if (category && category.trim()) {
    const catParams = new URLSearchParams({
      limit: String(limit),
      skip: String(skip),
    });
    if (sortBy) {
      catParams.set("sortBy", sortBy);
      if (order) catParams.set("order", order);
    }
    return `/products/category/${encodeURIComponent(category.trim())}?${catParams.toString()}`;
  }

  const listParams = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  if (sortBy) {
    listParams.set("sortBy", sortBy);
    if (order) listParams.set("order", order);
  }
  return `/products?${listParams.toString()}`;
}
