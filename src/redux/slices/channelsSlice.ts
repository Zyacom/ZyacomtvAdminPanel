import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { channelsService } from "../../services/channelsService";

// Types
export interface Channel {
  id: number;
  name: string;
  avatar: string | null;
  coverImage: string | null;
  userId: number;
  verificationStatus: string | null;
  isDisabled: boolean;
  disableReason: string | null;
  subscribersCount: number;
  videosCount: number;
  totalViews: number;
  lastUpload: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  } | null;
}

export interface ChannelStats {
  totalChannels: number;
  verifiedChannels: number;
  disabledChannels: number;
  totalSubscribers: number;
  totalVideos: number;
  totalViews: number;
  newChannelsThisMonth: number;
  pendingVerification: number;
}

export interface ChannelsFilters {
  page: number;
  limit: number;
  search: string;
  status: string;
  verified: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: string;
}

interface ChannelsState {
  channels: Channel[];
  selectedChannel: Channel | null;
  stats: ChannelStats | null;
  pendingVerifications: Channel[];
  disabledChannels: Channel[];
  filters: ChannelsFilters;
  pagination: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
  loading: boolean;
  statsLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ChannelsState = {
  channels: [],
  selectedChannel: null,
  stats: null,
  pendingVerifications: [],
  disabledChannels: [],
  filters: {
    page: 1,
    limit: 10,
    search: "",
    status: "",
    verified: "",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  pagination: {
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  },
  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
};

// Async thunks
export const fetchChannels = createAsyncThunk(
  "channels/fetchChannels",
  async (params: Partial<ChannelsFilters> | undefined, { rejectWithValue }) => {
    try {
      const response = await channelsService.getChannels(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch channels",
      );
    }
  },
);

export const fetchChannelStats = createAsyncThunk(
  "channels/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await channelsService.getChannelStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch channel stats",
      );
    }
  },
);

export const fetchChannelById = createAsyncThunk(
  "channels/fetchById",
  async (channelId: number, { rejectWithValue }) => {
    try {
      const response = await channelsService.getChannelById(channelId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch channel",
      );
    }
  },
);

export const updateChannel = createAsyncThunk(
  "channels/update",
  async (
    { channelId, data }: { channelId: number; data: Partial<Channel> },
    { rejectWithValue },
  ) => {
    try {
      const response = await channelsService.updateChannel(channelId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update channel",
      );
    }
  },
);

export const verifyChannel = createAsyncThunk(
  "channels/verify",
  async (channelId: number, { rejectWithValue }) => {
    try {
      const response = await channelsService.verifyChannel(channelId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify channel",
      );
    }
  },
);

export const revokeChannelVerification = createAsyncThunk(
  "channels/revokeVerification",
  async (channelId: number, { rejectWithValue }) => {
    try {
      const response = await channelsService.revokeVerification(channelId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to revoke verification",
      );
    }
  },
);

export const disableChannel = createAsyncThunk(
  "channels/disable",
  async (
    { channelId, reason }: { channelId: number; reason: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await channelsService.disableChannel(channelId, reason);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to disable channel",
      );
    }
  },
);

export const enableChannel = createAsyncThunk(
  "channels/enable",
  async (channelId: number, { rejectWithValue }) => {
    try {
      const response = await channelsService.enableChannel(channelId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to enable channel",
      );
    }
  },
);

export const deleteChannel = createAsyncThunk(
  "channels/delete",
  async (channelId: number, { rejectWithValue }) => {
    try {
      const response = await channelsService.deleteChannel(channelId);
      return { ...response.data, channelId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete channel",
      );
    }
  },
);

export const fetchPendingVerifications = createAsyncThunk(
  "channels/fetchPendingVerifications",
  async (
    params: { page?: number; limit?: number } | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response = await channelsService.getPendingVerifications(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch pending verifications",
      );
    }
  },
);

export const fetchDisabledChannels = createAsyncThunk(
  "channels/fetchDisabledChannels",
  async (
    params: { page?: number; limit?: number } | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response = await channelsService.getDisabledChannels(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch disabled channels",
      );
    }
  },
);

// Slice
const channelsSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ChannelsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedChannel: (state, action: PayloadAction<Channel | null>) => {
      state.selectedChannel = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateChannelInList: (state, action: PayloadAction<Channel>) => {
      const index = state.channels.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.channels[index] = action.payload;
      }
    },
    removeChannelFromList: (state, action: PayloadAction<number>) => {
      state.channels = state.channels.filter((c) => c.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Channels
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload.data.channels;
        state.pagination = {
          total: action.payload.data.meta.total,
          perPage: action.payload.data.meta.perPage,
          currentPage: action.payload.data.meta.currentPage,
          lastPage: action.payload.data.meta.lastPage,
        };
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Channel Stats
    builder
      .addCase(fetchChannelStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchChannelStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchChannelStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Channel By ID
    builder
      .addCase(fetchChannelById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChannelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedChannel = action.payload.data.channel;
      })
      .addCase(fetchChannelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Channel
    builder
      .addCase(updateChannel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateChannel.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedChannel = action.payload.data.channel;
        const index = state.channels.findIndex(
          (c) => c.id === updatedChannel.id,
        );
        if (index !== -1) {
          state.channels[index] = {
            ...state.channels[index],
            ...updatedChannel,
          };
        }
        if (state.selectedChannel?.id === updatedChannel.id) {
          state.selectedChannel = {
            ...state.selectedChannel,
            ...updatedChannel,
          };
        }
      })
      .addCase(updateChannel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Verify Channel
    builder
      .addCase(verifyChannel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(verifyChannel.fulfilled, (state, action) => {
        state.actionLoading = false;
        const verifiedChannel = action.payload.data.channel;
        const index = state.channels.findIndex(
          (c) => c.id === verifiedChannel.id,
        );
        if (index !== -1) {
          state.channels[index].verificationStatus = "verified";
        }
        if (
          state.selectedChannel &&
          state.selectedChannel.id === verifiedChannel.id
        ) {
          state.selectedChannel.verificationStatus = "verified";
        }
      })
      .addCase(verifyChannel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Revoke Verification
    builder
      .addCase(revokeChannelVerification.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(revokeChannelVerification.fulfilled, (state, action) => {
        state.actionLoading = false;
        const channel = action.payload.data.channel;
        const index = state.channels.findIndex((c) => c.id === channel.id);
        if (index !== -1) {
          state.channels[index].verificationStatus = "unverified";
        }
        if (state.selectedChannel && state.selectedChannel.id === channel.id) {
          state.selectedChannel.verificationStatus = "unverified";
        }
      })
      .addCase(revokeChannelVerification.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Disable Channel
    builder
      .addCase(disableChannel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(disableChannel.fulfilled, (state, action) => {
        state.actionLoading = false;
        const disabledChannel = action.payload.data.channel;
        const index = state.channels.findIndex(
          (c) => c.id === disabledChannel.id,
        );
        if (index !== -1) {
          state.channels[index].isDisabled = true;
          state.channels[index].disableReason = disabledChannel.disableReason;
        }
        if (
          state.selectedChannel &&
          state.selectedChannel.id === disabledChannel.id
        ) {
          state.selectedChannel.isDisabled = true;
          state.selectedChannel.disableReason = disabledChannel.disableReason;
        }
      })
      .addCase(disableChannel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Enable Channel
    builder
      .addCase(enableChannel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(enableChannel.fulfilled, (state, action) => {
        state.actionLoading = false;
        const enabledChannel = action.payload.data.channel;
        const index = state.channels.findIndex(
          (c) => c.id === enabledChannel.id,
        );
        if (index !== -1) {
          state.channels[index].isDisabled = false;
          state.channels[index].disableReason = null;
        }
        if (
          state.selectedChannel &&
          state.selectedChannel.id === enabledChannel.id
        ) {
          state.selectedChannel.isDisabled = false;
          state.selectedChannel.disableReason = null;
        }
      })
      .addCase(enableChannel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Delete Channel
    builder
      .addCase(deleteChannel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteChannel.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.channels = state.channels.filter(
          (c) => c.id !== action.payload.channelId,
        );
        if (state.selectedChannel?.id === action.payload.channelId) {
          state.selectedChannel = null;
        }
      })
      .addCase(deleteChannel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Pending Verifications
    builder
      .addCase(fetchPendingVerifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingVerifications.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingVerifications = action.payload.data.channels;
      })
      .addCase(fetchPendingVerifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Disabled Channels
    builder
      .addCase(fetchDisabledChannels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDisabledChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.disabledChannels = action.payload.data.channels;
      })
      .addCase(fetchDisabledChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  setSelectedChannel,
  clearError,
  updateChannelInList,
  removeChannelFromList,
} = channelsSlice.actions;

export default channelsSlice.reducer;
