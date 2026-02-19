import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "../config/Api";

export interface Playlist {
  id: number;
  name: string;
  videosCount: number;
  thumbnail?: string | null;
  thumbnails?: string[];
  ownerName: string;
  ownerEmail: string;
  channelName: string;
  visibility: "public" | "private" | "unlisted";
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistVideo {
  id: number;
  title: string;
  thumbnail: string;
  duration: number;
  addedAt: string;
  note: string;
  channel: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface PlaylistsResponse {
  success: boolean;
  message: string;
  data: {
    playlists: Playlist[];
    meta: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      firstPage: number;
      firstPageUrl: string;
      lastPageUrl: string;
      nextPageUrl: string | null;
      previousPageUrl: string | null;
    };
  };
}

export interface PlaylistStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalPlaylists: number;
    totalBookmarks: number;
    newPlaylistsThisMonth: number;
    avgVideosPerPlaylist: number;
  };
}

export interface PlaylistDetailResponse {
  success: boolean;
  message: string;
  data: {
    playlist: Playlist & {
      videos: PlaylistVideo[];
    };
  };
}

export const playlistsService = {
  // Get all playlists with pagination and filters
  getPlaylists: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    visibility?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<any> => {
    return await makeGetRequest("admin/playlists", undefined, params);
  },

  // Get playlist statistics
  getStats: async (): Promise<any> => {
    return await makeGetRequest("admin/playlists/stats");
  },

  // Get single playlist details
  getPlaylist: async (id: number): Promise<any> => {
    return await makeGetRequest(`admin/playlists/${id}`);
  },

  // Update playlist
  updatePlaylist: async (
    id: number,
    data: {
      name?: string;
      visibility?: "public" | "private" | "unlisted";
      description?: string;
    },
  ): Promise<any> => {
    return await makePutRequest(`admin/playlists/${id}`, data);
  },

  // Delete playlist
  deletePlaylist: async (id: number): Promise<any> => {
    return await makeDeleteRequest(`admin/playlists/${id}`);
  },

  // Get videos in playlist
  getPlaylistVideos: async (
    id: number,
    params?: { page?: number; limit?: number },
  ): Promise<any> => {
    return await makeGetRequest(
      `admin/playlists/${id}/videos`,
      undefined,
      params,
    );
  },

  // Remove video from playlist
  removeVideoFromPlaylist: async (
    playlistId: number,
    bookmarkId: number,
  ): Promise<any> => {
    return await makePostRequest(`admin/playlists/${playlistId}/remove-video`, {
      bookmarkId,
    });
  },
};

export default playlistsService;
