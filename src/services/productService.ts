import { api } from "@/lib/axios";
import { Product } from "@/types";

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductFilter {
  keyword?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  active?: boolean;
}

export const getDeletedProductIds = (): number[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("dhanya_deleted_product_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const isProductActiveAndNotDeleted = (p: any): boolean => {
  if (!p) return false;
  if (p.isActive === false) return false;
  const deleted = getDeletedProductIds();
  if (deleted.includes(p.id)) return false;
  return true;
};

const transformProduct = (p: any): Product => {
  if (p && p.images && typeof p.images === 'string') {
    p.imageUrls = p.images.split(',').filter(Boolean);
  }
  if (p && p.categoryName && !p.category) {
    p.category = {
      id: 0,
      name: p.categoryName,
      description: "",
      imageUrl: "",
      active: true,
    };
  }
  return p as Product;
};

const transformPageResponse = (res: PageResponse<any>): PageResponse<Product> => {
  if (res && res.content) {
    const deleted = getDeletedProductIds();
    res.content = res.content
      .filter((p: any) => p && p.isActive !== false && !deleted.includes(p.id))
      .map(transformProduct);
  }
  return res;
};

export const productService = {
  getAllProducts: async (page = 0, size = 50): Promise<PageResponse<Product>> => {
    try {
      const response = await api.get<PageResponse<Product>>(`/products`, {
        params: { page, size },
      });
      return transformPageResponse(response.data);
    } catch (error) {
      console.warn("productService.getAllProducts warning:", error);
      return {
        content: [],
        pageable: { pageNumber: page, pageSize: size },
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  getProductById: async (id: number): Promise<Product | null> => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      const p = transformProduct(response.data);
      if (!isProductActiveAndNotDeleted(p)) return null;
      return p;
    } catch (error) {
      console.warn(`productService.getProductById(${id}) warning:`, error);
      return null;
    }
  },

  searchProducts: async (query: string, page = 0, size = 20): Promise<PageResponse<Product>> => {
    try {
      const response = await api.get<PageResponse<Product>>(`/products/search`, {
        params: { query, page, size },
      });
      return transformPageResponse(response.data);
    } catch (error) {
      console.warn("productService.searchProducts warning:", error);
      return {
        content: [],
        pageable: { pageNumber: page, pageSize: size },
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  getProductsByCategory: async (category: string, page = 0, size = 50): Promise<PageResponse<Product>> => {
    try {
      const response = await api.get<PageResponse<Product>>(`/products/category/${category}`, {
        params: { page, size },
      });
      return transformPageResponse(response.data);
    } catch (error) {
      console.warn(`productService.getProductsByCategory(${category}) warning:`, error);
      return {
        content: [],
        pageable: { pageNumber: page, pageSize: size },
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>(`/products/featured`);
      const deleted = getDeletedProductIds();
      return (response.data || [])
        .filter((p) => p && p.isActive !== false && !deleted.includes(p.id))
        .map(transformProduct);
    } catch (error) {
      console.warn("productService.getFeaturedProducts warning:", error);
      return [];
    }
  },

  getRecentProducts: async (page = 0, size = 8): Promise<PageResponse<Product>> => {
    try {
      const response = await api.get<PageResponse<Product>>(`/products/recent`, {
        params: { page, size },
      });
      return transformPageResponse(response.data);
    } catch (error) {
      console.warn("productService.getRecentProducts warning:", error);
      return {
        content: [],
        pageable: { pageNumber: page, pageSize: size },
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  filterProducts: async (filter: ProductFilter, page = 0, size = 50): Promise<PageResponse<Product>> => {
    try {
      const payload: ProductFilter = {
        ...filter,
        active: true,
      };
      const response = await api.post<PageResponse<Product>>(`/products/filter`, payload, {
        params: { page, size },
      });
      return transformPageResponse(response.data);
    } catch (error) {
      console.warn("productService.filterProducts warning:", error);
      return {
        content: [],
        pageable: { pageNumber: page, pageSize: size },
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  createProduct: async (product: any) => {
    const response = await api.post<Product>("/products", product);
    return transformProduct(response.data);
  },

  updateProduct: async (product: any) => {
    const response = await api.put<Product>("/products", product);
    return transformProduct(response.data);
  },

  deleteProduct: async (id: number) => {
    // Persist deletion ID locally for immediate UI reactivity
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("dhanya_deleted_product_ids");
        const list = stored ? JSON.parse(stored) : [];
        const next = Array.from(new Set([...list, id]));
        localStorage.setItem("dhanya_deleted_product_ids", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to update deleted IDs storage", e);
      }
    }

    try {
      await api.delete(`/products/${id}`);
    } catch (error: any) {
      // If hard delete fails because product is linked to cart or order history in MySQL RDS, soft delete / deactivate it
      try {
        await api.put(`/products/${id}/deactivate`);
      } catch (deactError) {
        throw error;
      }
    }
  },

  addProductImages: async (id: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append("file", file));
    const response = await api.post<Product>(`/products/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return transformProduct(response.data);
  },
};
