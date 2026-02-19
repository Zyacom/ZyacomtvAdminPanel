import { LOCAL_HOST } from "../config/config";

export interface MonetizationRequest {
  id: number;
  channelId: number;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  reviewedBy: number | null;
  createdAt: string;
  updatedAt: string;
  channel: {
    id: number;
    name: string;
    avatar: string | null;
    coverImage: string | null;
    userId: number;
    user: {
      id: number;
      fullName: string;
      email: string;
    } | null;
  };
  subscriberCount: number;
  watchHours: number;
}

export interface MonetizationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface MonetizationRules {
  id: number | null;
  watchHours: number;
  subscribers: number;
}

export interface PaginationInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasMore: boolean;
}

const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const monetizationService = {
  /**
   * Get monetization statistics
   */
  async getStats(): Promise<{
    status: boolean;
    message: string;
    stats: MonetizationStats;
    rules: MonetizationRules | null;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/monetization/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch monetization stats");
    }

    return response.json();
  },

  /**
   * Get all monetization requests with pagination and filters
   */
  async getRequests(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    status: boolean;
    message: string;
    requests: MonetizationRequest[];
    pagination: PaginationInfo;
  }> {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);

    const response = await fetch(
      `${LOCAL_HOST}api/admin/monetization?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch monetization requests");
    }

    return response.json();
  },

  /**
   * Get a specific monetization request details
   */
  async getRequest(id: number): Promise<{
    status: boolean;
    message: string;
    request: MonetizationRequest;
    rules: MonetizationRules | null;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/monetization/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch monetization request");
    }

    return response.json();
  },

  /**
   * Approve a monetization request
   */
  async approveRequest(id: number): Promise<{
    status: boolean;
    message: string;
    request: { id: number; status: string; reviewedBy: number };
  }> {
    const token = getAuthToken();
    const response = await fetch(
      `${LOCAL_HOST}api/admin/monetization/${id}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to approve request");
    }

    return response.json();
  },

  /**
   * Reject a monetization request
   */
  async rejectRequest(
    id: number,
    reason: string,
  ): Promise<{
    status: boolean;
    message: string;
    request: { id: number; status: string; reason: string; reviewedBy: number };
  }> {
    const token = getAuthToken();
    const response = await fetch(
      `${LOCAL_HOST}api/admin/monetization/${id}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reject request");
    }

    return response.json();
  },

  /**
   * Get monetization rules
   */
  async getRules(): Promise<{
    status: boolean;
    message: string;
    rules: MonetizationRules;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/monetization/rules`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch monetization rules");
    }

    return response.json();
  },

  /**
   * Update monetization rules
   */
  async updateRules(rules: {
    watchHours?: number;
    subscribers?: number;
  }): Promise<{
    status: boolean;
    message: string;
    rules: MonetizationRules;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/monetization/rules`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(rules),
    });

    if (!response.ok) {
      throw new Error("Failed to update monetization rules");
    }

    return response.json();
  },
};

export default monetizationService;
