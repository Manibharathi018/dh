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
  address?: string;
  active: boolean;
  parentId?: number;
  parentName?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  discountPercentage: number;
  originalPrice?: number;
  imageUrls: string[];
  images?: string;
  description: string;
  quantity: number;
  isActive: boolean;
  featured: boolean;
  category: Category;
  brand?: string;
  hasDressSizes?: boolean;
  hasShoeSizes?: boolean;
  sizeSQuantity?: number;
  sizeMQuantity?: number;
  sizeLQuantity?: number;
  sizeXLQuantity?: number;
  sizeXXLQuantity?: number;
  size3XLQuantity?: number;
  size4XLQuantity?: number;
  size7Quantity?: number;
  size8Quantity?: number;
  size9Quantity?: number;
  size10Quantity?: number;
  size11Quantity?: number;
  size12Quantity?: number;
  size13Quantity?: number;
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
