import axios from "axios";
import { LOCAL_HOST } from "../config/config";

const api = axios.create({
  baseURL: LOCAL_HOST,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const usersService = {
  // Get paginated users with filters
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
    status?: string;
    verified?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return await api.get("/api/admin/users", { params });
  },

  // Get user statistics
  getUserStats: async () => {
    return await api.get("/api/admin/users/stats");
  },

  // Get single user by ID
  getUserById: async (userId: string) => {
    return await api.get(`/api/admin/users/${userId}`);
  },

  // Update user
  updateUser: async (userId: string, data: any) => {
    return await api.put(`/api/admin/users/${userId}`, data);
  },

  // Ban user
  banUser: async (userId: string) => {
    return await api.post(`/api/admin/users/${userId}/ban`);
  },

  // Unban user
  unbanUser: async (userId: string) => {
    return await api.post(`/api/admin/users/${userId}/unban`);
  },

  // Delete user permanently
  deleteUser: async (userId: string) => {
    return await api.delete(`/api/admin/users/${userId}`);
  },

  // Get deleted users
  getDeletedUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    return await api.get("/api/admin/users/deleted", { params });
  },

  // Restore a deleted user
  restoreUser: async (userId: string) => {
    return await api.post(`/api/admin/users/${userId}/restore`);
  },
};

export default usersService;
