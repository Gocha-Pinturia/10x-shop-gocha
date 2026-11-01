import type { Product } from "../types/product.ts";

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function discountedPrice(price: number, discountPercentage: number): number {
  if (!discountPercentage || discountPercentage <= 0) {
    return price;
  }
  const discounted = price * (1 - discountPercentage / 100);
  return Math.round(discounted * 100) / 100;
}

export function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function isProduct(x: unknown): x is Product {
  if (typeof x !== "object" || x === null) return false;
  const cand = x as Record<string, unknown>;
  return (
    typeof cand.id === "number" &&
    typeof cand.title === "string" &&
    typeof cand.price === "number" &&
    typeof cand.thumbnail === "string"
  );
}
