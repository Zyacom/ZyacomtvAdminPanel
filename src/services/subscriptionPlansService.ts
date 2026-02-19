import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "../config/Api";

export interface SubscriptionPlan {
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
  createdAt: string;
  updatedAt: string;
  isPurchased?: boolean;
  subscribers?: number;
  totalRevenue?: number;
}

export interface CreatePlanPayload {
  name: string;
  description: string;
  price: number;
  currency?: string;
  billingCycle: "monthly" | "yearly";
  type: "creator" | "user";
  isActive?: boolean;
  isPublic?: boolean;
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingCycle?: "monthly" | "yearly";
  type?: "creator" | "user";
  isActive?: boolean;
  isPublic?: boolean;
}

const subscriptionPlansService = {
  // Get all subscription plans
  getPlans: async (type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);

    const response = await makeGetRequest(`packages?${params.toString()}`);
    return response.data;
  },

  // Get plans with stats (from admin payments endpoint)
  getPlansWithStats: async () => {
    const response = await makeGetRequest("admin/payments/packages");
    return response.data;
  },

  // Create a new subscription plan
  createPlan: async (payload: CreatePlanPayload) => {
    const response = await makePostRequest("packages", payload);
    return response.data;
  },

  // Update a subscription plan
  updatePlan: async (id: number, payload: UpdatePlanPayload) => {
    const response = await makePutRequest(`packages/${id}`, payload);
    return response.data;
  },

  // Delete a subscription plan
  deletePlan: async (id: number) => {
    const response = await makeDeleteRequest(`packages/${id}`);
    return response.data;
  },
};

export default subscriptionPlansService;
