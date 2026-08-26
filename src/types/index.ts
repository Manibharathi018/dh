export interface User {
  id: number;
  name: string;
  userName: string; // email in backend
  role: "ADMIN" | "USER";
  isVerified: boolean;
  registrationCompleted: boolean;
  phoneNumber: string;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description: string;
  imageUrl: string;
  active: boolean;
  parentId?: number;
  parentName?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  discountPercentage: number;
  imageUrls: string[];
  images?: string;
  description: string;
  quantity: number;
  isActive: boolean;
  featured: boolean;
  category: Category;
  brand?: string;
  hasSizes?: boolean;
  sizeSQuantity?: number;
  sizeMQuantity?: number;
  sizeLQuantity?: number;
  sizeXLQuantity?: number;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  size?: string;
  price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
