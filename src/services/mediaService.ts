import { api } from "@/lib/axios";

export interface MediaContent {
  id: number;
  address: string;
  isbannerimage: boolean;
  isreviewvideo: boolean;
  isexperiencecollection: boolean;
}

const mediaCache: {
  banners?: Promise<MediaContent[]>;
  reviewVideos?: Promise<MediaContent[]>;
  experienceCollection?: Promise<MediaContent[]>;
} = {};

export const mediaService = {
  clearCache: () => {
    delete mediaCache.banners;
    delete mediaCache.reviewVideos;
    delete mediaCache.experienceCollection;
  },

  // Public GET endpoints with deduplication & caching
  getBanners: async (): Promise<MediaContent[]> => {
    if (mediaCache.banners) return mediaCache.banners;

    mediaCache.banners = (async () => {
      try {
        const response = await api.get<MediaContent[]>("/media/banners");
        return response.data || [];
      } catch (error) {
        console.warn("mediaService.getBanners error:", error);
        delete mediaCache.banners;
        return [];
      }
    })();

    return mediaCache.banners;
  },

  getReviewVideos: async (): Promise<MediaContent[]> => {
    if (mediaCache.reviewVideos) return mediaCache.reviewVideos;

    mediaCache.reviewVideos = (async () => {
      try {
        const response = await api.get<MediaContent[]>("/media/review-videos");
        return response.data || [];
      } catch (error) {
        console.warn("mediaService.getReviewVideos error:", error);
        delete mediaCache.reviewVideos;
        return [];
      }
    })();

    return mediaCache.reviewVideos;
  },

  getExperienceCollection: async (): Promise<MediaContent[]> => {
    if (mediaCache.experienceCollection) return mediaCache.experienceCollection;

    mediaCache.experienceCollection = (async () => {
      try {
        const response = await api.get<MediaContent[]>("/media/experience-collection");
        return response.data || [];
      } catch (error) {
        console.warn("mediaService.getExperienceCollection error:", error);
        delete mediaCache.experienceCollection;
        return [];
      }
    })();

    return mediaCache.experienceCollection;
  },

  // Admin management endpoints
  addBanner: async (address: string): Promise<MediaContent> => {
    const response = await api.post<MediaContent>("/admin/media/banner", { address });
    delete mediaCache.banners;
    return response.data;
  },

  addReviewVideo: async (address: string): Promise<MediaContent> => {
    const response = await api.post<MediaContent>("/admin/media/review-video", { address });
    delete mediaCache.reviewVideos;
    return response.data;
  },

  addExperienceCollection: async (address: string): Promise<MediaContent> => {
    const response = await api.post<MediaContent>("/admin/media/experience-collection", { address });
    delete mediaCache.experienceCollection;
    return response.data;
  },

  deleteMedia: async (id: number): Promise<void> => {
    await api.delete(`/admin/media/${id}`);
    mediaService.clearCache();
  },
};

