import type { CartItem } from "../types/cart.ts";
import { discountedPrice } from "../utils/format.ts";

export interface ICart {
  subtotal(): number;
  discount(): number;
  shipping(): number;
  total(): number;
}

export class Cart implements ICart {
  static readonly FREE_SHIPPING_FROM = 100;
  static readonly SHIPPING_COST = 10;
  static readonly PROMO_DISCOUNT_PERCENT = 10; // 10% for promo code 10X10

  constructor(
    private readonly items: CartItem[],
    private readonly promoCode: string | null = null
  ) {}

  get itemCount(): number {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getItems(): CartItem[] {
    return this.items;
  }

  getPromoCode(): string | null {
    return this.promoCode;
  }

  subtotal(): number {
    const raw = this.items.reduce((sum, item) => {
      const discounted = discountedPrice(item.price, item.discountPercentage);
      return sum + discounted * item.quantity;
    }, 0);
    return Math.round(raw * 100) / 100;
  }

  discount(): number {
    if (this.promoCode && this.promoCode.trim().toUpperCase() === "10X10") {
      const disc = (this.subtotal() * Cart.PROMO_DISCOUNT_PERCENT) / 100;
      return Math.round(disc * 100) / 100;
    }
    return 0;
  }

  shipping(): number {
    if (this.items.length === 0) return 0;
    const subAfterDiscount = this.subtotal() - this.discount();
    if (subAfterDiscount >= Cart.FREE_SHIPPING_FROM) {
      return 0;
    }
    return Cart.SHIPPING_COST;
  }

  total(): number {
    if (this.items.length === 0) return 0;
    const finalTotal = this.subtotal() - this.discount() + this.shipping();
    return Math.max(0, Math.round(finalTotal * 100) / 100);
  }
}
