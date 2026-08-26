import { api } from "@/lib/axios";
import { Category } from "@/types";

export interface CategoryDTO {
  id?: number;
  name: string;
  slug?: string;
  description: string;
  imageUrl: string;
  active: boolean;
  parentId?: number;
  parentName?: string;
}

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get<CategoryDTO[]>("/categories");
    return response.data;
  },

  createCategory: async (category: CategoryDTO) => {
    const response = await api.post<CategoryDTO>("/categories", category);
    return response.data;
  },

  updateCategory: async (id: number, category: CategoryDTO) => {
    const response = await api.put<CategoryDTO>(`/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    await api.delete(`/categories/${id}`);
  },
};
