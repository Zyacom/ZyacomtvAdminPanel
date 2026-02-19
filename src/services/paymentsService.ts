import { makeGetRequest, makePostRequest } from "../config/Api";

export interface Transaction {
  id: string;
  type: "subscription" | "video_purchase";
  user: string;
  userEmail: string;
  userId: number;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "expired";
  method: string;
  date: string;
  description: string;
  packageName?: string;
  billingCycle?: string;
  expiresAt?: string;
  purchasedAt?: string;
  videoTitle?: string;
  paymentIntentId?: string;
}

export interface PaymentStats {
  totalRevenue: number;
  subscriptionRevenue: number;
  videoPurchaseRevenue: number;
  activeSubscriptions: number;
  totalVideoPurchases: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalTransactions: number;
  growth: {
    revenue: string;
  };
}

export interface Subscription {
  id: number;
  user: string;
  userEmail: string;
  userId: number;
  packageName: string;
  packageId: number;
  billingCycle: "monthly" | "yearly";
  price: number;
  currency: string;
  isActive: boolean;
  purchasedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface VideoPurchase {
  id: number;
  user: string;
  userEmail: string;
  userId: number;
  videoTitle: string;
  mediaId: number;
  price: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  paymentIntentId: string | null;
  createdAt: string;
}

export interface PackageWithStats {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  type: "creator" | "user";
  isActive: boolean;
  isPublic: boolean;
  subscribers: number;
  totalRevenue: number;
}

export interface RevenueData {
  period: string;
  subscriptions: number;
  videoPurchases: number;
  total: number;
}

export interface TransactionFilters {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

const paymentsService = {
  // Get all transactions with filters
  getTransactions: async (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.perPage) params.append("perPage", filters.perPage.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.type) params.append("type", filters.type);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await makeGetRequest(
      `admin/payments?${params.toString()}`,
    );
    return response.data;
  },

  // Get payment statistics
  getStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await makeGetRequest(
      `admin/payments/stats?${params.toString()}`,
    );
    return response.data;
  },

  // Get single transaction details
  getTransaction: async (id: string, type: string) => {
    const response = await makeGetRequest(`admin/payments/${id}/${type}`);
    return response.data;
  },

  // Get all subscriptions
  getSubscriptions: async (
    filters: {
      page?: number;
      perPage?: number;
      search?: string;
      status?: string;
      packageId?: number;
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.perPage) params.append("perPage", filters.perPage.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.packageId)
      params.append("packageId", filters.packageId.toString());

    const response = await makeGetRequest(
      `admin/payments/subscriptions?${params.toString()}`,
    );
    return response.data;
  },

  // Get all video purchases
  getVideoPurchases: async (
    filters: {
      page?: number;
      perPage?: number;
      search?: string;
      status?: string;
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.perPage) params.append("perPage", filters.perPage.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);

    const response = await makeGetRequest(
      `admin/payments/video-purchases?${params.toString()}`,
    );
    return response.data;
  },

  // Get revenue breakdown
  getRevenue: async (
    startDate?: string,
    endDate?: string,
    groupBy = "month",
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("groupBy", groupBy);

    const response = await makeGetRequest(
      `admin/payments/revenue?${params.toString()}`,
    );
    return response.data;
  },

  // Get packages with stats
  getPackages: async () => {
    const response = await makeGetRequest("admin/payments/packages");
    return response.data;
  },

  // Process refund
  refund: async (id: string, type: string, reason?: string) => {
    const response = await makePostRequest(
      `admin/payments/${id}/${type}/refund`,
      { reason },
    );
    return response.data;
  },

  // Export transactions
  exportTransactions: async (
    startDate?: string,
    endDate?: string,
    type?: string,
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (type) params.append("type", type);

    const response = await makeGetRequest(
      `admin/payments/export?${params.toString()}`,
    );
    return response.data;
  },
};

export default paymentsService;
