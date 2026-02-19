import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListVideo,
  Trash2,
  Eye,
  Video,
  Globe,
  Lock,
  Search,
  Edit2,
} from "lucide-react";
import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { ConfirmModal } from "../components/ConfirmModal";
import { PlaylistDetailModal } from "../components/PlaylistDetailModal";
import { PlaylistVideosModal } from "../components/PlaylistVideosModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { LOCAL_HOST } from "../config/config";
import {
  fetchPlaylists,
  fetchPlaylistStats,
  deletePlaylist,
  setSelectedPlaylist,
  updatePlaylist,
} from "../redux/slices/playlistsSlice";
import { EditPlaylistModal } from "../components/EditPlaylistModal";

export const Playlists = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    playlists,
    stats,
    pagination,
    loading,
    actionLoading,
    selectedPlaylist,
  } = useAppSelector((state) => state.playlists);

  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVideosModal, setShowVideosModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    playlistId: number | null;
  }>({ isOpen: false, playlistId: null });

  // Fetch playlists and stats on component mount
  useEffect(() => {
    dispatch(fetchPlaylists({ page: 1, limit: 10 }));
    dispatch(fetchPlaylistStats());
  }, [dispatch]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchPlaylists({ page: 1, limit: 10, search: searchQuery }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(fetchPlaylists({ page, limit: 10, search: searchQuery }));
  };

  const handleViewPlaylist = (playlist: any) => {
    navigate(`/playlists/${playlist.id}`);
  };

  const handleViewVideos = (playlistId: number | string) => {
    // Use selectedPlaylist if available, otherwise search in playlists array
    const playlist =
      selectedPlaylist || playlists.find((p) => p.id === Number(playlistId));
    if (playlist) {
      // Navigate to Videos page with playlist filter
      navigate(
        `/videos?playlist=${playlist.id}&playlistName=${encodeURIComponent(playlist.name)}`,
      );
      // Close the modal after navigation
      setShowDetailModal(false);
      dispatch(setSelectedPlaylist(null));
    }
  };

  const handleVideoClick = (video: any) => {
    toast.info(`Opening video: ${video.title}`);
    // Here you can navigate to video detail or open video detail modal
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, playlistId: id });
  };

  const handleEditPlaylist = (playlist: any) => {
    setEditingPlaylist(playlist);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (data: {
    name: string;
    visibility: "public" | "private" | "unlisted";
    description: string;
  }) => {
    if (!editingPlaylist) return;
    try {
      await dispatch(updatePlaylist({ id: editingPlaylist.id, data })).unwrap();
      toast.success("Playlist updated successfully");
      setShowEditModal(false);
      setEditingPlaylist(null);
      dispatch(
        fetchPlaylists({
          page: pagination.currentPage,
          limit: 10,
          search: searchQuery,
        }),
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update playlist");
    }
  };

  const confirmDelete = async () => {
    if (confirmModal.playlistId) {
      try {
        await dispatch(deletePlaylist(confirmModal.playlistId)).unwrap();
        toast.success("Playlist deleted successfully");
        setConfirmModal({ isOpen: false, playlistId: null });
        // Refresh stats
        dispatch(fetchPlaylistStats());
      } catch (error: any) {
        toast.error(error.message || "Failed to delete playlist");
      }
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe size={14} className="text-green-600" />;
      case "private":
        return <Lock size={14} className="text-red-600" />;
      case "unlisted":
        return <Eye size={14} className="text-yellow-600" />;
      default:
        return <Globe size={14} className="text-gray-600" />;
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${LOCAL_HOST}${path.startsWith("/") ? path.slice(1) : path}`;
  };

  const renderPlaylistThumbnail = (thumbnails: string[] | null | undefined) => {
    const validThumbnails = (thumbnails || [])
      .map(getImageUrl)
      .filter((url): url is string => url !== null);

    // If no thumbnails, show placeholder
    if (validThumbnails.length === 0) {
      return (
        <div className="w-20 h-12 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <ListVideo size={20} className="text-purple-400" />
        </div>
      );
    }

    // Single thumbnail
    if (validThumbnails.length === 1) {
      return (
        <img
          src={validThumbnails[0]}
          alt="Playlist"
          className="w-20 h-12 rounded-lg border-2 border-gray-200 object-cover"
        />
      );
    }

    // Grid of 2-4 thumbnails
    return (
      <div className="w-20 h-12 rounded-lg border-2 border-gray-200 overflow-hidden">
        <div
          className={`grid h-full ${
            validThumbnails.length === 2
              ? "grid-cols-2"
              : validThumbnails.length === 3
                ? "grid-cols-2 grid-rows-2"
                : "grid-cols-2 grid-rows-2"
          }`}
        >
          {validThumbnails.slice(0, 4).map((thumb, idx) => (
            <img
              key={idx}
              src={thumb}
              alt={`Video ${idx + 1}`}
              className={`w-full h-full object-cover ${
                validThumbnails.length === 3 && idx === 0 ? "row-span-2" : ""
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Playlist",
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          {renderPlaylistThumbnail(row.thumbnails)}
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{value}</span>
            <div className="flex items-center gap-2 mt-1">
              {getVisibilityIcon(row.visibility)}
              <span className="text-xs text-gray-500 capitalize">
                {row.visibility}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "channelName",
      label: "Channel",
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <span className="text-purple-600 font-semibold">{value}</span>
          <span className="text-xs text-gray-500">{row.ownerName}</span>
        </div>
      ),
    },
    {
      key: "videosCount",
      label: "Videos",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Video size={14} className="text-gray-500" />
          <span className="font-bold">{value}</span>
        </div>
      ),
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${
            value === "public"
              ? "bg-green-100 text-green-700"
              : value === "private"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {getVisibilityIcon(value)}
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <PermissionGuard permissions={["playlists.view"]}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleViewPlaylist(row)}
              className="text-xs"
              disabled={loading}
            >
              <Eye size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={["playlists.edit"]}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleEditPlaylist(row)}
              className="text-xs"
              disabled={actionLoading}
            >
              <Edit2 size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={["playlists.delete"]}>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(row.id)}
              className="text-xs"
              disabled={actionLoading}
            >
              <Trash2 size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <ListVideo
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                Playlists
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-xl text-purple-100 font-medium">
              Monitor all video playlists across the platform
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button type="submit" variant="primary" disabled={loading}>
            Search
          </Button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Playlists
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.totalPlaylists || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Bookmarks
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.totalBookmarks || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            New This Month
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.newPlaylistsThisMonth || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-pink-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Avg Videos/Playlist
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.avgVideosPerPlaylist || 0}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading && !playlists.length ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading playlists...</p>
        </div>
      ) : (
        <Table columns={columns} data={playlists} />
      )}

      {/* Pagination */}
      {!loading && pagination.total > pagination.perPage && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-gray-700">
            Page {pagination.currentPage} of {pagination.lastPage}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Playlist Detail Modal */}
      <PlaylistDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          dispatch(setSelectedPlaylist(null));
        }}
        playlist={selectedPlaylist}
        onViewVideos={handleViewVideos}
      />

      {/* Playlist Videos Modal */}
      <PlaylistVideosModal
        isOpen={showVideosModal}
        onClose={() => setShowVideosModal(false)}
        playlist={selectedPlaylist}
        onVideoClick={handleVideoClick}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, playlistId: null })}
        onConfirm={confirmDelete}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This action cannot be undone and will remove all video associations."
        confirmText="Delete"
        variant="danger"
      />

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPlaylist(null);
        }}
        onSave={handleSaveEdit}
        playlist={editingPlaylist}
        loading={actionLoading}
      />
    </div>
  );
};
