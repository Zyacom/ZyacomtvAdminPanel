import { makeGetRequest, makePostRequest, makePutRequest } from "../config/Api";

export interface SystemConfigs {
  // Note: Monetization rules are managed in a separate page using the monetization_rules table
  upload: {
    maxFileSize: number;
    allowedFormats: string[];
    maxVideoDuration: number;
    maxUploadsPerDay: number;
  };
  content: {
    autoModeration: boolean;
    manualReviewRequired: boolean;
    copyrightCheckEnabled: boolean;
    profanityFilterEnabled: boolean;
  };
  subscription: {
    freeTrialDays: number;
    allowCancellation: boolean;
    prorateBilling: boolean;
    gracePeriodDays: number;
  };
  notifications: {
    emailNotificationsEnabled: boolean;
    pushNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    weeklyDigestEnabled: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
}

export interface ConfigUpdatePayload {
  category: string;
  key: string;
  value: string | number | boolean | string[];
}

const systemConfigService = {
  /**
   * Get all system configurations
   */
  async getConfigs(): Promise<{
    status: boolean;
    message: string;
    configs: SystemConfigs;
  }> {
    const response = await makeGetRequest("admin/config");
    return response.data;
  },

  /**
   * Get configurations for a specific category
   */
  async getConfigsByCategory(category: string): Promise<{
    status: boolean;
    message: string;
    configs: Record<string, unknown>;
  }> {
    const response = await makeGetRequest(`admin/config/${category}`);
    return response.data;
  },

  /**
   * Update a single configuration value
   */
  async updateConfig(
    category: string,
    key: string,
    value: string | number | boolean | string[],
  ): Promise<{
    status: boolean;
    message: string;
    config: { category: string; key: string; value: unknown };
  }> {
    const response = await makePutRequest(`admin/config/${category}/${key}`, {
      value,
    });
    return response.data;
  },

  /**
   * Update all configurations for a category
   */
  async updateCategoryConfigs(
    category: string,
    configs: Record<string, unknown>,
  ): Promise<{ status: boolean; message: string; configs: unknown[] }> {
    const response = await makePutRequest(`admin/config/${category}`, configs);
    return response.data;
  },

  /**
   * Bulk update multiple configurations
   */
  async bulkUpdateConfigs(
    updates: ConfigUpdatePayload[],
  ): Promise<{ status: boolean; message: string; configs: unknown[] }> {
    const response = await makePutRequest("admin/config", {
      configs: updates,
    });
    return response.data;
  },

  /**
   * Reset configurations to defaults
   */
  async resetConfigs(
    category?: string,
  ): Promise<{ status: boolean; message: string; configs: SystemConfigs }> {
    const response = await makePostRequest("admin/config/reset", {
      category,
    });
    return response.data;
  },
};

export default systemConfigService;
