import { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from "react";
import type { CartState, CartItem } from "../types/cart.ts";
import type { Product } from "../types/product.ts";
import { cartReducer, CartAction } from "./cart.reducer.ts";
import { Cart } from "../models/Cart.ts";
import { cartStorage } from "../models/StorageService.ts";
import { useToast } from "./ToastContext.tsx";

interface CartContextType {
  state: CartState;
  cart: Cart;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
  addItem: (product: Product, qty?: number) => boolean;
  setQuantity: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => { success: boolean; error?: string };
  removePromo: () => void;
  dispatch: React.Dispatch<CartAction>;
}

const initialCartState: CartState = {
  items: [],
  promoCode: null,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();

  const [state, dispatch] = useReducer(
    cartReducer,
    initialCartState,
    () => {
      const saved = cartStorage.get();
      return saved && Array.isArray(saved.items) ? saved : initialCartState;
    }
  );

  useEffect(() => {
    cartStorage.set(state);
  }, [state]);

  const cart = useMemo(() => new Cart(state.items, state.promoCode ?? null), [state.items, state.promoCode]);

  const addItem = (product: Product, qty: number = 1): boolean => {
    if (product.stock <= 0) {
      showToast("This item is currently out of stock", "error");
      return false;
    }

    const existing = state.items.find((i) => i.productId === product.id);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + qty > product.stock) {
      showToast(`Cannot add more: Only ${product.stock} available in stock`, "error");
      return false;
    }

    dispatch({ type: "ADD_ITEM", product, qty });
    showToast("Added to cart ✓", "success");
    return true;
  };

  const setQuantity = (productId: number, qty: number) => {
    const item = state.items.find((i) => i.productId === productId);
    if (!item) return;

    if (qty > item.stock) {
      showToast(`Maximum available stock is ${item.stock}`, "error");
      return;
    }

    dispatch({ type: "SET_QTY", productId, qty });
  };

  const removeItem = (productId: number) => {
    dispatch({ type: "REMOVE_ITEM", productId });
    showToast("Removed from cart", "info");
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR" });
  };

  const applyPromo = (code: string): { success: boolean; error?: string } => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === "10X10") {
      dispatch({ type: "APPLY_PROMO", code: trimmed });
      showToast("Promo code 10X10 applied! (10% off)", "success");
      return { success: true };
    } else {
      const err = "Invalid promo code";
      showToast(err, "error");
      return { success: false, error: err };
    }
  };

  const removePromo = () => {
    dispatch({ type: "REMOVE_PROMO" });
    showToast("Promo code removed", "info");
  };

  return (
    <CartContext.Provider
      value={{
        state,
        cart,
        items: state.items,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal(),
        discount: cart.discount(),
        shipping: cart.shipping(),
        total: cart.total(),
        promoCode: state.promoCode ?? null,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        applyPromo,
        removePromo,
        dispatch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
