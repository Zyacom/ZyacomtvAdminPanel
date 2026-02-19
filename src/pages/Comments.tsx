import { useState, useEffect } from "react";
import {
  MessageSquare,
  Trash2,
  Search,
  Eye,
  Edit2,
  RefreshCw,
  Loader2,
  X,
  RotateCcw,
  AlertTriangle,
  Check,
  Calendar,
  User,
  Video,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";
import commentsService, {
  Comment,
  CommentsStats,
  PaginationInfo,
} from "../services/commentsService";

export const Comments = () => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentsStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editBody, setEditBody] = useState("");

  // Processing states
  const [processing, setProcessing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await commentsService.getStats();
      if (response?.stats) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsService.getComments({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        showDeleted,
      });
      if (response?.comments) {
        setComments(response.comments);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, showDeleted]);

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setProcessing(id);
      await commentsService.deleteComment(id);
      toast.success("Comment deleted successfully");
      fetchComments();
      fetchStats();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to delete comment");
    } finally {
      setProcessing(null);
      setShowDeleteModal(false);
      setSelectedComment(null);
    }
  };

  // Handle restore
  const handleRestore = async (id: number) => {
    try {
      setProcessing(id);
      await commentsService.restoreComment(id);
      toast.success("Comment restored successfully");
      fetchComments();
      fetchStats();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to restore comment");
    } finally {
      setProcessing(null);
    }
  };

  // Handle permanent delete
  const handlePermanentDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to PERMANENTLY delete this comment? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      setProcessing(id);
      await commentsService.permanentDeleteComment(id);
      toast.success("Comment permanently deleted");
      fetchComments();
      fetchStats();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to permanently delete comment");
    } finally {
      setProcessing(null);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedComment) return;
    if (!editBody.trim()) {
      toast.error("Comment body cannot be empty");
      return;
    }

    try {
      setSaving(true);
      await commentsService.updateComment(selectedComment.id, editBody);
      toast.success("Comment updated successfully");
      setShowEditModal(false);
      setSelectedComment(null);
      setEditBody("");
      fetchComments();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update comment");
    } finally {
      setSaving(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No comments selected");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} comments?`,
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await commentsService.bulkDeleteComments(selectedIds);
      toast.success(`${selectedIds.length} comments deleted successfully`);
      setSelectedIds([]);
      fetchComments();
      fetchStats();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to bulk delete comments");
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (comment: Comment) => {
    setSelectedComment(comment);
    setEditBody(comment.body);
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = (comment: Comment) => {
    setSelectedComment(comment);
    setShowDetailModal(true);
  };

  // Open delete modal
  const openDeleteModal = (comment: Comment) => {
    setSelectedComment(comment);
    setShowDeleteModal(true);
  };

  // Toggle selection
  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Select all visible
  const selectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map((c) => c.id));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-violet-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <MessageSquare
                  className="w-8 h-8 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Comments Management
              </h1>
            </div>
            <p className="text-gray-200 font-medium">
              View, moderate, and manage all user comments
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => {
                fetchStats();
                fetchComments();
              }}
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total</p>
              <p className="text-xl font-black text-gray-900">
                {stats?.total || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Deleted</p>
              <p className="text-xl font-black text-gray-900">
                {stats?.deleted || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Today</p>
              <p className="text-xl font-black text-gray-900">
                {stats?.today || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">This Week</p>
              <p className="text-xl font-black text-gray-900">
                {stats?.thisWeek || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Replies</p>
              <p className="text-xl font-black text-gray-900">
                {stats?.replies || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => {
                setShowDeleted(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="font-medium text-gray-700">Show Deleted</span>
          </label>
          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Trash2 size={18} className="mr-2" />
              )}
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No comments found</p>
            <p className="text-gray-400 text-sm mt-1">
              Comments will appear here when users comment on videos
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === comments.length &&
                        comments.length > 0
                      }
                      onChange={selectAll}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <tr
                    key={comment.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      comment.deletedAt === 1 ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(comment.id)}
                        onChange={() => toggleSelection(comment.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          {comment.user?.avatar ? (
                            <img
                              src={comment.user.avatar}
                              alt={comment.user?.fullName || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                                (
                                  e.target as HTMLImageElement
                                ).nextElementSibling?.classList.remove(
                                  "hidden",
                                );
                              }}
                            />
                          ) : null}
                          <User
                            size={18}
                            className={`text-purple-600 ${comment.user?.avatar ? "hidden" : ""}`}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {comment.user?.fullName || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{comment.user?.username || "unknown"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p
                          className={`text-sm ${
                            comment.deletedAt === 1
                              ? "text-gray-400 line-through"
                              : "text-gray-700"
                          }`}
                        >
                          {truncateText(comment.body, 80)}
                        </p>
                        {comment.parentId && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            ↳ Reply
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {comment.video ? (
                        <div className="flex items-center gap-2">
                          <Video
                            size={16}
                            className="text-purple-500 flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-40">
                            {comment.video.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {comment.deletedAt === 1 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <Trash2 size={12} />
                          Deleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <Check size={12} />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-600">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailModal(comment)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {comment.deletedAt !== 1 && (
                          <>
                            <button
                              onClick={() => openEditModal(comment)}
                              className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(comment)}
                              disabled={processing === comment.id}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Delete"
                            >
                              {processing === comment.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </>
                        )}
                        {comment.deletedAt === 1 && (
                          <>
                            <button
                              onClick={() => handleRestore(comment.id)}
                              disabled={processing === comment.id}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Restore"
                            >
                              {processing === comment.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <RotateCcw size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(comment.id)}
                              disabled={processing === comment.id}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Permanent Delete"
                            >
                              <AlertTriangle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.lastPage > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.total,
              )}{" "}
              of {pagination.total} comments
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pagination.hasMore}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Comment</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {selectedComment.user?.fullName || "Unknown User"}
                </span>
              </div>
            </div>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows={5}
              placeholder="Edit comment..."
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={saving || !editBody.trim()}
                className="flex-1"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  <Check size={18} className="mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Comment Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  {selectedComment.user?.avatar ? (
                    <img
                      src={selectedComment.user.avatar}
                      alt={selectedComment.user?.fullName || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <User size={24} className="text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedComment.user?.fullName || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{selectedComment.user?.username || "unknown"} •{" "}
                    {selectedComment.user?.email || "N/A"}
                  </p>
                </div>
              </div>

              {/* Comment Body */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-bold text-blue-700 mb-2">Comment:</p>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedComment.body}
                </p>
              </div>

              {/* Video Info */}
              {selectedComment.video && (
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Video size={16} className="text-purple-600" />
                    <span className="text-sm font-bold text-purple-700">
                      Video:
                    </span>
                  </div>
                  <p className="text-gray-800">{selectedComment.video.title}</p>
                  {selectedComment.video.channel && (
                    <p className="text-sm text-gray-600 mt-1">
                      Channel: {selectedComment.video.channel.name}
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">Status</span>
                {selectedComment.deletedAt === 1 ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    <Trash2 size={14} />
                    Deleted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    <Check size={14} />
                    Active
                  </span>
                )}
              </div>

              {/* Reply Info */}
              {selectedComment.parentId && (
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-700">
                    This is a reply to comment #{selectedComment.parentId}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>Created: {formatDate(selectedComment.createdAt)}</p>
                <p>Updated: {formatDate(selectedComment.updatedAt)}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              {selectedComment.deletedAt !== 1 && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditModal(selectedComment);
                    }}
                    className="flex-1"
                  >
                    <Edit2 size={18} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowDetailModal(false);
                      openDeleteModal(selectedComment);
                    }}
                    className="flex-1"
                  >
                    <Trash2 size={18} className="mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Delete Comment
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this comment by{" "}
              <strong>
                {selectedComment.user?.fullName || "Unknown User"}
              </strong>
              ?
            </p>
            <div className="p-3 bg-gray-50 rounded-xl mb-4">
              <p className="text-sm text-gray-600 italic">
                "{truncateText(selectedComment.body, 100)}"
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              The comment will be soft-deleted and can be restored later.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedComment(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedComment.id)}
                disabled={processing === selectedComment.id}
                className="flex-1"
              >
                {processing === selectedComment.id ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  <Trash2 size={18} className="mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
