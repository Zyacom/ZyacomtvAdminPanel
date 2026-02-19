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

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  categoryId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  messagesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportTicketDetail {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  comments: Array<{
    id: number;
    comment: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
      email: string;
      avatar?: string;
      role: string;
    };
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportStats {
  total: number;
  byStatus: {
    pending: number;
    open: number;
    inProgress: number;
    onHold: number;
    resolved: number;
    closed: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  recentTickets: number;
}

export const supportService = {
  // Get paginated support tickets with filters
  getTickets: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return await api.get("/api/admin/support", { params });
  },

  // Get support statistics
  getStats: async () => {
    return await api.get("/api/admin/support/stats");
  },

  // Get single ticket details
  getTicketById: async (ticketId: string) => {
    return await api.get(`/api/admin/support/${ticketId}`);
  },

  // Update ticket status
  updateTicketStatus: async (ticketId: string, status: string) => {
    return await api.put(`/api/admin/support/${ticketId}/status`, { status });
  },

  // Add admin comment to ticket
  addComment: async (ticketId: string, comment: string) => {
    return await api.post(`/api/admin/support/${ticketId}/comment`, {
      comment,
    });
  },

  // Delete/Close ticket
  deleteTicket: async (ticketId: string) => {
    return await api.delete(`/api/admin/support/${ticketId}`);
  },
};
