import { create } from "zustand";
import { Cart, Product } from "@/types";
import { cartService } from "@/services/cartService";

interface CartState {
  cart: Cart;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number, size?: string) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: { id: 0, items: [], totalPrice: 0 },
  isLoading: false,
  isCartOpen: false,

  setIsCartOpen: (open) => set({ isCartOpen: open }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      // If error (e.g. not logged in), maybe keep local cart empty
    }
  },

  addToCart: async (product, quantity = 1, size) => {
    set({ isLoading: true });
    try {
      const cart = await cartService.addToCart(product.id, quantity, size);
      set({ cart, isLoading: false, isCartOpen: true });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true });
    try {
      const cart = await cartService.removeFromCart(itemId);
      set({ cart, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      const cart = await cartService.updateQuantity(itemId, quantity);
      set({ cart, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.clearCart();
      set({ cart, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
