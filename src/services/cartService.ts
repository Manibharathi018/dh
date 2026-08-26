import { api } from "@/lib/axios";
import { Cart } from "@/types";

const transformCart = (c: any): Cart => {
  if (!c) return { id: 0, items: [], totalPrice: 0 };
  
  const transformProduct = (p: any) => {
    if (p && p.images && typeof p.images === 'string') {
      p.imageUrls = p.images.split(',').filter(Boolean);
    }
    return p;
  };

  return {
    id: c.id || 0,
    items: (c.cartItems || []).map((item: any) => ({
      id: item.id,                          // CartItemDTO.id — the cart row PK
      product: transformProduct(item.product),
      quantity: item.quantity || 0,
      size: item.size || undefined,
      price: item.price || 0,
    })),
    totalPrice: c.totalAmount || 0,
  };
};

export const cartService = {
  // Fetch the current user's cart from the backend
  getCart: async () => {
    const response = await api.get<any>("/cart");
    return transformCart(response.data);
  },

  // Add an item to the cart
  addToCart: async (productId: number, quantity: number, size?: string) => {
    const response = await api.post<any>(`/cart/add`, null, {
      params: { productId, quantity, size },
    });
    return transformCart(response.data);
  },

  // Update item quantity
  updateQuantity: async (itemId: number, quantity: number) => {
    const response = await api.put<any>(`/cart/items/${itemId}`, null, {
      params: { quantity },
    });
    return transformCart(response.data);
  },

  // Remove an item from the cart
  removeFromCart: async (itemId: number) => {
    const response = await api.delete<any>(`/cart/items/${itemId}`);
    return transformCart(response.data);
  },

  // Clear the entire cart
  clearCart: async () => {
    const response = await api.delete<any>("/cart/clear");
    return transformCart(response.data);
  },
};
