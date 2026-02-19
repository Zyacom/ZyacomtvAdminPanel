import { LOCAL_HOST } from "../config/config";

export interface CommentUser {
  id: number;
  fullName: string;
  username: string;
  avatar: string | null;
  email?: string;
}

export interface CommentVideo {
  id: number;
  title: string;
  thumbnail: string | null;
  channel?: {
    id: number;
    name: string;
  } | null;
}

export interface Comment {
  id: number;
  body: string;
  userId: number;
  postId: number;
  parentId: number | null;
  deletedAt: number;
  createdAt: string;
  updatedAt: string;
  user: CommentUser | null;
  video?: CommentVideo | null;
  repliesCount?: number;
}

export interface CommentsStats {
  total: number;
  deleted: number;
  today: number;
  thisWeek: number;
  replies: number;
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

const commentsService = {
  /**
   * Get comments statistics
   */
  async getStats(): Promise<{
    status: boolean;
    message: string;
    stats: CommentsStats;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/comments/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch comments stats");
    }

    return response.json();
  },

  /**
   * Get all comments with pagination and filters
   */
  async getComments(params: {
    page?: number;
    limit?: number;
    search?: string;
    showDeleted?: boolean;
    videoId?: number;
    userId?: number;
  }): Promise<{
    status: boolean;
    message: string;
    comments: Comment[];
    pagination: PaginationInfo;
  }> {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.showDeleted) queryParams.append("showDeleted", "true");
    if (params.videoId)
      queryParams.append("videoId", params.videoId.toString());
    if (params.userId) queryParams.append("userId", params.userId.toString());

    const response = await fetch(
      `${LOCAL_HOST}api/admin/comments?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }

    return response.json();
  },

  /**
   * Get a specific comment details
   */
  async getComment(id: number): Promise<{
    status: boolean;
    message: string;
    comment: Comment;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/comments/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch comment");
    }

    return response.json();
  },

  /**
   * Update a comment
   */
  async updateComment(
    id: number,
    body: string,
  ): Promise<{
    status: boolean;
    message: string;
    comment: Comment;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/comments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update comment");
    }

    return response.json();
  },

  /**
   * Soft delete a comment
   */
  async deleteComment(id: number): Promise<{
    status: boolean;
    message: string;
    commentId: number;
  }> {
    const token = getAuthToken();
    const response = await fetch(`${LOCAL_HOST}api/admin/comments/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete comment");
    }

    return response.json();
  },

  /**
   * Restore a soft-deleted comment
   */
  async restoreComment(id: number): Promise<{
    status: boolean;
    message: string;
    comment: Comment;
  }> {
    const token = getAuthToken();
    const response = await fetch(
      `${LOCAL_HOST}api/admin/comments/${id}/restore`,
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
      throw new Error(error.message || "Failed to restore comment");
    }

    return response.json();
  },

  /**
   * Permanently delete a comment
   */
  async permanentDeleteComment(id: number): Promise<{
    status: boolean;
    message: string;
    commentId: number;
  }> {
    const token = getAuthToken();
    const response = await fetch(
      `${LOCAL_HOST}api/admin/comments/${id}/permanent`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to permanently delete comment");
    }

    return response.json();
  },

  /**
   * Bulk delete multiple comments
   */
  async bulkDeleteComments(ids: number[]): Promise<{
    status: boolean;
    message: string;
    deletedCount: number;
    ids: number[];
  }> {
    const token = getAuthToken();
    const response = await fetch(
      `${LOCAL_HOST}api/admin/comments/bulk-delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to bulk delete comments");
    }

    return response.json();
  },

  /**
   * Get comments for a specific video
   */
  async getVideoComments(
    videoId: number,
    params?: { page?: number; limit?: number; showDeleted?: boolean },
  ): Promise<{
    status: boolean;
    message: string;
    comments: Comment[];
    pagination: PaginationInfo;
  }> {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.showDeleted) queryParams.append("showDeleted", "true");

    const response = await fetch(
      `${LOCAL_HOST}api/admin/comments/video/${videoId}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video comments");
    }

    return response.json();
  },

  /**
   * Get comments by a specific user
   */
  async getUserComments(
    userId: number,
    params?: { page?: number; limit?: number; showDeleted?: boolean },
  ): Promise<{
    status: boolean;
    message: string;
    user: CommentUser;
    comments: Comment[];
    pagination: PaginationInfo;
  }> {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.showDeleted) queryParams.append("showDeleted", "true");

    const response = await fetch(
      `${LOCAL_HOST}api/admin/comments/user/${userId}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user comments");
    }

    return response.json();
  },
};

export default commentsService;
