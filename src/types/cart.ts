import type { Product } from "./product.ts";

export type CartItem = Pick<
  Product,
  "title" | "thumbnail" | "price" | "discountPercentage" | "stock"
> & {
  productId: number;
  quantity: number;
};

export interface CartState {
  items: CartItem[];
  promoCode?: string | null;
}
