import { apiClient } from "./ApiClient.ts";
import { buildProductsUrl } from "../utils/url.ts";
import type { Category, CatalogParams, Product, ProductsResponse } from "../types/product.ts";

export async function fetchProducts(
  params: CatalogParams,
  signal?: AbortSignal
): Promise<ProductsResponse> {
  const url = buildProductsUrl(params);
  return apiClient.get<ProductsResponse>(url, signal);
}

export async function fetchProductById(
  id: number,
  signal?: AbortSignal
): Promise<Product> {
  return apiClient.get<Product>(`/products/${id}`, signal);
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const data = await apiClient.get<Array<{ slug: string; name: string; url: string } | string>>(
    "/products/categories",
    signal
  );

  return data.map((item) => {
    if (typeof item === "string") {
      return {
        slug: item,
        name: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, " "),
        url: `/products/category/${item}`,
      };
    }
    return item;
  });
}

export async function fetchRelatedProducts(
  category: string,
  currentId: number,
  signal?: AbortSignal
): Promise<Product[]> {
  try {
    const res = await apiClient.get<ProductsResponse>(
      `/products/category/${encodeURIComponent(category)}?limit=5`,
      signal
    );
    return res.products.filter((p) => p.id !== currentId).slice(0, 4);
  } catch {
    return [];
  }
}
