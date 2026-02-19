import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import playlistsService, {
  Playlist,
  PlaylistVideo,
} from "../../services/playlistsService";

interface PlaylistsState {
  playlists: Playlist[];
  selectedPlaylist: (Playlist & { videos?: PlaylistVideo[] }) | null;
  stats: {
    totalPlaylists: number;
    totalBookmarks: number;
    newPlaylistsThisMonth: number;
    avgVideosPerPlaylist: number;
  } | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: PlaylistsState = {
  playlists: [],
  selectedPlaylist: null,
  stats: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  },
  loading: false,
  error: null,
  actionLoading: false,
};

// Async thunks
export const fetchPlaylists = createAsyncThunk(
  "playlists/fetchPlaylists",
  async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    visibility?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const response = await playlistsService.getPlaylists(params);
    return response.data;
  },
);

export const fetchPlaylistStats = createAsyncThunk(
  "playlists/fetchStats",
  async () => {
    const response = await playlistsService.getStats();
    return response.data;
  },
);

export const fetchPlaylistDetail = createAsyncThunk(
  "playlists/fetchDetail",
  async (id: number) => {
    const response = await playlistsService.getPlaylist(id);
    console.log("Playlist detail raw response:", response);
    // response.data = { success, message, data: { playlist } }
    return response.data;
  },
);

export const updatePlaylist = createAsyncThunk(
  "playlists/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: {
      name?: string;
      visibility?: "public" | "private" | "unlisted";
      description?: string;
    };
  }) => {
    const response = await playlistsService.updatePlaylist(id, data);
    // response.data = { success, message, data: { playlist } }
    return response.data;
  },
);

export const deletePlaylist = createAsyncThunk(
  "playlists/delete",
  async (id: number) => {
    await playlistsService.deletePlaylist(id);
    return id;
  },
);

export const removeVideoFromPlaylist = createAsyncThunk(
  "playlists/removeVideo",
  async ({
    playlistId,
    bookmarkId,
  }: {
    playlistId: number;
    bookmarkId: number;
  }) => {
    await playlistsService.removeVideoFromPlaylist(playlistId, bookmarkId);
    return bookmarkId;
  },
);

const playlistsSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPlaylist: (state, action: PayloadAction<Playlist | null>) => {
      state.selectedPlaylist = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch playlists
    builder
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists = action.payload.data.playlists || [];
        if (action.payload.data.meta) {
          state.pagination = {
            currentPage: action.payload.data.meta.currentPage,
            lastPage: action.payload.data.meta.lastPage,
            perPage: action.payload.data.meta.perPage,
            total: action.payload.data.meta.total,
          };
        }
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch playlists";
      });

    // Fetch playlist stats
    builder
      .addCase(fetchPlaylistStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylistStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data || null;
      })
      .addCase(fetchPlaylistStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch stats";
      });

    // Fetch playlist detail
    builder
      .addCase(fetchPlaylistDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylistDetail.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload = { success, message, data: { playlist } }
        state.selectedPlaylist = action.payload?.data?.playlist || null;
      })
      .addCase(fetchPlaylistDetail.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch playlist details";
      });

    // Update playlist
    builder
      .addCase(updatePlaylist.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updatePlaylist.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedPlaylist = action.payload?.data?.playlist;
        if (!updatedPlaylist) return;
        const index = state.playlists.findIndex(
          (p) => p.id === updatedPlaylist.id,
        );
        if (index !== -1) {
          state.playlists[index] = {
            ...state.playlists[index],
            ...updatedPlaylist,
          };
        }
        if (
          state.selectedPlaylist &&
          state.selectedPlaylist.id === updatedPlaylist.id
        ) {
          state.selectedPlaylist = {
            ...state.selectedPlaylist,
            ...updatedPlaylist,
          };
        }
      })
      .addCase(updatePlaylist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to update playlist";
      });

    // Delete playlist
    builder
      .addCase(deletePlaylist.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.playlists = state.playlists.filter(
          (p) => p.id !== action.payload,
        );
        if (
          state.selectedPlaylist &&
          state.selectedPlaylist.id === action.payload
        ) {
          state.selectedPlaylist = null;
        }
      })
      .addCase(deletePlaylist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to delete playlist";
      });

    // Remove video from playlist
    builder
      .addCase(removeVideoFromPlaylist.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removeVideoFromPlaylist.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.selectedPlaylist && state.selectedPlaylist.videos) {
          state.selectedPlaylist.videos = state.selectedPlaylist.videos.filter(
            (v: PlaylistVideo) => v.id !== action.payload,
          );
          if (state.selectedPlaylist.videosCount) {
            state.selectedPlaylist.videosCount -= 1;
          }
        }
      })
      .addCase(removeVideoFromPlaylist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.error.message || "Failed to remove video from playlist";
      });
  },
});

export const { clearError, setSelectedPlaylist } = playlistsSlice.actions;
export default playlistsSlice.reducer;
