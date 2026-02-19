import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "../config/Api";

export interface ChannelFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  verified?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const channelsService = {
  // Get all channels with filters and pagination
  getChannels: async (params?: ChannelFilters) => {
    return await makeGetRequest("admin/channels", undefined, params);
  },

  // Get channel statistics
  getChannelStats: async () => {
    return await makeGetRequest("admin/channels/stats");
  },

  // Get single channel details
  getChannelById: async (channelId: number) => {
    return await makeGetRequest(`admin/channels/${channelId}`);
  },

  // Update channel
  updateChannel: async (channelId: number, data: any) => {
    return await makePutRequest(`admin/channels/${channelId}`, data);
  },

  // Verify a channel
  verifyChannel: async (channelId: number) => {
    return await makePostRequest(`admin/channels/${channelId}/verify`, {});
  },

  // Revoke channel verification
  revokeVerification: async (channelId: number) => {
    return await makePostRequest(
      `admin/channels/${channelId}/revoke-verification`,
      {},
    );
  },

  // Disable a channel
  disableChannel: async (channelId: number, reason: string) => {
    return await makePostRequest(`admin/channels/${channelId}/disable`, {
      reason,
    });
  },

  // Enable a channel
  enableChannel: async (channelId: number) => {
    return await makePostRequest(`admin/channels/${channelId}/enable`, {});
  },

  // Delete a channel
  deleteChannel: async (channelId: number) => {
    return await makeDeleteRequest(`admin/channels/${channelId}`);
  },

  // Get pending verification requests
  getPendingVerifications: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    return await makeGetRequest(
      "admin/channels/pending-verifications",
      undefined,
      params,
    );
  },

  // Get disabled channels
  getDisabledChannels: async (params?: { page?: number; limit?: number }) => {
    return await makeGetRequest("admin/channels/disabled", undefined, params);
  },
};
