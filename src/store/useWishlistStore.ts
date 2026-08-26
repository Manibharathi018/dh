import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

// The state stores a mapping of userId to their respective wishlist
// This ensures every user gets their own separate and unique wishlist.
// We use "guest" for non-logged in users.
interface WishlistState {
  wishlists: Record<string, Partial<Product>[]>; 
  toggleLike: (userId: string, product: Partial<Product>) => void;
  isLiked: (userId: string, productId: number) => boolean;
  getWishlist: (userId: string) => Partial<Product>[];
  clearWishlist: (userId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlists: {},

      toggleLike: (userId, product) => {
        set((state) => {
          const userList = state.wishlists[userId] || [];
          const exists = userList.some((p) => p.id === product.id);
          const newList = exists
            ? userList.filter((p) => p.id !== product.id)
            : [...userList, product];
            
          return {
            wishlists: {
              ...state.wishlists,
              [userId]: newList,
            },
          };
        });
      },

      isLiked: (userId, productId) => {
        const userList = get().wishlists[userId] || [];
        return userList.some((p) => p.id === productId);
      },

      getWishlist: (userId) => {
        return get().wishlists[userId] || [];
      },

      clearWishlist: (userId) => {
        set((state) => ({
          wishlists: {
            ...state.wishlists,
            [userId]: [],
          },
        }));
      },
    }),
    {
      name: "wishlist-storage", // local storage key
    }
  )
);
