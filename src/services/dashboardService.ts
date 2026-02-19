import axios from "axios";
import { LOCAL_HOST } from "../config/config";

const api = axios.create({
  baseURL: LOCAL_HOST,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardService = {
  // Get overview statistics
  getOverview: async () => {
    return await api.get("/api/admin/dashboard/overview");
  },

  // Get traffic data (last 7 days)
  getTraffic: async () => {
    return await api.get("/api/admin/dashboard/traffic");
  },

  // Get revenue data (last 6 months)
  getRevenue: async () => {
    return await api.get("/api/admin/dashboard/revenue");
  },

  // Get content distribution by category
  getContentDistribution: async () => {
    return await api.get("/api/admin/dashboard/content-distribution");
  },

  // Get recent activities
  getActivities: async () => {
    return await api.get("/api/admin/dashboard/activities");
  },

  // Get filtered stats by date range
  getFilteredStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return await api.get(
      `/api/admin/dashboard/filtered-stats?${params.toString()}`,
    );
  },
};

export default dashboardService;
