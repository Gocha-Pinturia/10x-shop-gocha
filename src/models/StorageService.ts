import type { CartState } from "../types/cart.ts";
import type { Order } from "../types/order.ts";
import type { Review } from "../types/product.ts";
import type { AuthUser } from "../types/user.ts";

export class StorageService<T> {
  constructor(private readonly key: string) {}

  get(): T | null {
    try {
      const item = localStorage.getItem(this.key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }

  set(value: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch {
      // Storage quota or privacy mode error
    }
  }

  remove(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {
      // ignore
    }
  }
}

export const STORAGE_KEYS = {
  cart: "shop_cart",
  orders: "shop_orders",
  theme: "shop_theme",
  reviews: "shop_reviews",
  user: "shop_user",
} as const;

export const cartStorage = new StorageService<CartState>(STORAGE_KEYS.cart);
export const ordersStorage = new StorageService<Order[]>(STORAGE_KEYS.orders);
export const themeStorage = new StorageService<"light" | "dark">(STORAGE_KEYS.theme);
export const reviewsStorage = new StorageService<Record<number, Review[]>>(STORAGE_KEYS.reviews);
export const userStorage = new StorageService<AuthUser>(STORAGE_KEYS.user);
