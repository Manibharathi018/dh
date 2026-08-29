import { api } from "@/lib/axios";

export interface MediaContent {
  id: number;
  address: string;
  isbannerimage: boolean;
  isreviewvideo: boolean;
  isexperiencecollection: boolean;
}

export const mediaService = {
  // Public GET endpoints
  getBanners: async (): Promise<MediaContent[]> => {
    try {
      const response = await api.get<MediaContent[]>("/media/banners");
      return response.data || [];
    } catch (error) {
      console.warn("mediaService.getBanners error:", error);
      return [];
    }
  },

  getReviewVideos: async (): Promise<MediaContent[]> => {
    try {
      const response = await api.get<MediaContent[]>("/media/review-videos");
      return response.data || [];
    } catch (error) {
      console.warn("mediaService.getReviewVideos error:", error);
      return [];
    }
  },

  getExperienceCollection: async (): Promise<MediaContent[]> => {
    try {
      const response = await api.get<MediaContent[]>("/media/experience-collection");
      return response.data || [];
    } catch (error) {
      console.warn("mediaService.getExperienceCollection error:", error);
      return [];
    }
  },

  // Admin management endpoints
  addBanner: async (address: string): Promise<MediaContent> => {
    const response = await api.post<MediaContent>("/admin/media/banner", { address });
    return response.data;
  },

  addReviewVideo: async (address: string): Promise<MediaContent> => {
    const response = await api.post<MediaContent>("/admin/media/review-video", { address });
    return response.data;
  },

  addExperienceCollection: async (address: string): Promise<MediaContent> => {
    const response = await api.post<MediaContent>("/admin/media/experience-collection", { address });
    return response.data;
  },

  deleteMedia: async (id: number): Promise<void> => {
    await api.delete(`/admin/media/${id}`);
  },
};
