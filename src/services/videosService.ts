import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "../config/Api";

export const videosService = {
  // Get all videos with filters
  getVideos: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    channelId?: number;
    isPaid?: string;
    forKids?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return await makeGetRequest(
      `admin/videos${queryString ? `?${queryString}` : ""}`,
    );
  },

  // Get video statistics
  getStats: async () => {
    return await makeGetRequest("admin/videos/stats");
  },

  // Get all categories
  getCategories: async () => {
    return await makeGetRequest("admin/videos/categories");
  },

  // Get disabled videos
  getDisabledVideos: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return await makeGetRequest(
      `admin/videos/disabled${queryString ? `?${queryString}` : ""}`,
    );
  },

  // Get video by ID
  getVideoById: async (videoId: string) => {
    return await makeGetRequest(`admin/videos/${videoId}`);
  },

  // Update video
  updateVideo: async (
    videoId: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string;
      isPublic?: boolean;
      forKids?: number;
      isPaid?: boolean;
      price?: number;
    },
  ) => {
    return await makePutRequest(`admin/videos/${videoId}`, data);
  },

  // Disable video
  disableVideo: async (videoId: string, reason?: string) => {
    return await makePostRequest(`admin/videos/${videoId}/disable`, { reason });
  },

  // Enable video
  enableVideo: async (videoId: string) => {
    return await makePostRequest(`admin/videos/${videoId}/enable`, {});
  },

  // Permanently delete video
  deleteVideo: async (videoId: string) => {
    return await makeDeleteRequest(`admin/videos/${videoId}`);
  },
};

export default videosService;
