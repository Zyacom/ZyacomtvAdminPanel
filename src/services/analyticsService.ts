import { makeGetRequest } from "../config/Api";

export const analyticsService = {
  getDashboardStats: async () => {
    return await makeGetRequest("analytics/dashboard");
  },

  getUserAnalytics: async (params?: any) => {
    return await makeGetRequest("analytics/users", undefined, params);
  },

  getVideoAnalytics: async (params?: any) => {
    return await makeGetRequest("analytics/videos", undefined, params);
  },

  getRevenueAnalytics: async (params?: any) => {
    return await makeGetRequest("analytics/revenue", undefined, params);
  },
};
