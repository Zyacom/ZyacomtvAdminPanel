import { LOCAL_HOST } from "../config/config";

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

const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const systemConfigService = {
  /**
   * Get all system configurations
   */
  async getConfigs(): Promise<{
    status: boolean;
    message: string;
    configs: SystemConfigs;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch configurations");
    }

    return response.json();
  },

  /**
   * Get configurations for a specific category
   */
  async getConfigsByCategory(
    category: string,
  ): Promise<{
    status: boolean;
    message: string;
    configs: Record<string, unknown>;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/config/${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} configurations`);
    }

    return response.json();
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
    const token = getAuthToken();
    const response = await fetch(
      `${LOCAL_HOST}api/admin/config/${category}/${key}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update configuration");
    }

    return response.json();
  },

  /**
   * Update all configurations for a category
   */
  async updateCategoryConfigs(
    category: string,
    configs: Record<string, unknown>,
  ): Promise<{ status: boolean; message: string; configs: unknown[] }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/config/${category}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(configs),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${category} configurations`);
    }

    return response.json();
  },

  /**
   * Bulk update multiple configurations
   */
  async bulkUpdateConfigs(
    updates: ConfigUpdatePayload[],
  ): Promise<{ status: boolean; message: string; configs: unknown[] }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ configs: updates }),
    });

    if (!response.ok) {
      throw new Error("Failed to update configurations");
    }

    return response.json();
  },

  /**
   * Reset configurations to defaults
   */
  async resetConfigs(
    category?: string,
  ): Promise<{ status: boolean; message: string; configs: SystemConfigs }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/config/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category }),
    });

    if (!response.ok) {
      throw new Error("Failed to reset configurations");
    }

    return response.json();
  },
};

export default systemConfigService;
