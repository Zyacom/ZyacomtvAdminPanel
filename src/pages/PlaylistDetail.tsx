import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Video,
  Eye,
  Calendar,
  Globe,
  Lock,
  Users,
  Play,
  TrendingUp,
  Trash2,
  Edit2,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { LOCAL_HOST } from "../config/config";
import {
  fetchPlaylistDetail,
  deletePlaylist,
  updatePlaylist,
  setSelectedPlaylist,
} from "../redux/slices/playlistsSlice";
import { ConfirmModal } from "../components/ConfirmModal";
import { EditPlaylistModal } from "../components/EditPlaylistModal";

export const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedPlaylist, loading, error, actionLoading } = useAppSelector(
    (state) => state.playlists,
  );

  const [confirmModal, setConfirmModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLocalLoading(true);
      dispatch(fetchPlaylistDetail(Number(id)))
        .unwrap()
        .then(() => {
          setLocalLoading(false);
        })
        .catch((err) => {
          setLocalLoading(false);
          toast.error(err?.message || "Failed to load playlist details");
        });
    }
    return () => {
      dispatch(setSelectedPlaylist(null));
    };
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (id) {
      try {
        await dispatch(deletePlaylist(Number(id))).unwrap();
        toast.success("Playlist deleted successfully");
        navigate("/playlists");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete playlist");
      }
    }
  };

  const handleEdit = async (data: {
    name: string;
    visibility: "public" | "private" | "unlisted";
    description: string;
  }) => {
    if (id) {
      try {
        await dispatch(updatePlaylist({ id: Number(id), data })).unwrap();
        toast.success("Playlist updated successfully");
        setEditModal(false);
        // Refresh the playlist details
        dispatch(fetchPlaylistDetail(Number(id)));
      } catch (err: any) {
        toast.error(err.message || "Failed to update playlist");
      }
    }
  };

  const handleViewVideos = () => {
    if (selectedPlaylist) {
      navigate(
        `/videos?playlist=${selectedPlaylist.id}&playlistName=${encodeURIComponent(selectedPlaylist.name)}`,
      );
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe size={20} className="text-green-600" />;
      case "private":
        return <Lock size={20} className="text-red-600" />;
      case "unlisted":
        return <Eye size={20} className="text-yellow-600" />;
      default:
        return <Globe size={20} className="text-gray-600" />;
    }
  };

  const getThumbnailUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${LOCAL_HOST}${path.startsWith("/") ? path.slice(1) : path}`;
  };

  // Show loading state
  if (localLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading playlist details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <Button variant="primary" onClick={() => navigate("/playlists")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!selectedPlaylist) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Playlist not found</p>
          <Button variant="primary" onClick={() => navigate("/playlists")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  // At this point, selectedPlaylist is guaranteed to be non-null
  const playlist = selectedPlaylist;
  const thumbnails = (playlist as any).thumbnails as string[] | undefined;
  const thumbnail = (playlist as any).thumbnail as string | undefined;
  const thumbnailUrl = getThumbnailUrl(
    thumbnails && thumbnails.length > 0 ? thumbnails[0] : thumbnail,
  );
  const visibility = playlist.visibility || "public";
  const videos = playlist.videos || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => navigate("/playlists")}
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Playlists
      </Button>

      {/* Header Section */}
      <div className="relative overflow-hidden bg-linear-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-2xl">
        {thumbnailUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          ></div>
        )}
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Thumbnail */}
            <div className="shrink-0 w-full md:w-64 h-40 bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-500 to-blue-500">
                  <Play size={64} className="text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                {playlist.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 flex items-center gap-2 ${
                    visibility === "public"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : visibility === "private"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                  }`}
                >
                  {getVisibilityIcon(visibility)}
                  {visibility.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <Video size={18} />
                  <span className="font-semibold">
                    {playlist.videosCount || 0} videos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span className="font-semibold">
                    Created{" "}
                    {new Date(playlist.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <Button variant="primary" onClick={handleViewVideos}>
              <Video size={16} className="mr-2" />
              View All Videos
            </Button>
            <Button variant="secondary" onClick={() => setEditModal(true)}>
              <Edit2 size={16} className="mr-2" />
              Edit Playlist
            </Button>
            <Button variant="danger" onClick={() => setConfirmModal(true)}>
              <Trash2 size={16} className="mr-2" />
              Delete Playlist
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video size={20} className="text-purple-600" />
            </div>
            <p className="text-xs font-bold text-purple-600 uppercase">
              Total Videos
            </p>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {playlist.videosCount || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye size={20} className="text-blue-600" />
            </div>
            <p className="text-xs font-bold text-blue-600 uppercase">
              Total Views
            </p>
          </div>
          <p className="text-3xl font-black text-gray-900">0</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <p className="text-xs font-bold text-green-600 uppercase">
              Avg Views
            </p>
          </div>
          <p className="text-3xl font-black text-gray-900">0</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users size={20} className="text-orange-600" />
            </div>
            <p className="text-xs font-bold text-orange-600 uppercase">
              Channel
            </p>
          </div>
          <p className="text-lg font-black text-gray-900">
            {playlist.channelName || "N/A"}
          </p>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-4 flex items-center gap-2">
            <Users size={18} />
            Playlist Owner
          </h3>
          <div className="space-y-2">
            <p className="text-xl font-bold text-purple-600">
              {playlist.ownerName || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              {playlist.ownerEmail || "No email"}
            </p>
            <p className="text-sm text-gray-600">
              Channel:{" "}
              <span className="font-semibold">
                {playlist.channelName || "N/A"}
              </span>
            </p>
          </div>
        </div>

        {/* Visibility Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">
            Visibility Settings
          </h3>
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-lg ${
                visibility === "public"
                  ? "bg-green-100"
                  : visibility === "private"
                    ? "bg-red-100"
                    : "bg-yellow-100"
              }`}
            >
              {getVisibilityIcon(visibility)}
            </div>
            <div>
              <p className="font-bold text-gray-900 capitalize text-lg">
                {visibility}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {visibility === "public" &&
                  "Anyone can search for and view this playlist"}
                {visibility === "private" &&
                  "Only the creator can view this playlist"}
                {visibility === "unlisted" &&
                  "Anyone with the link can view this playlist"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Video size={20} />
            Videos in Playlist ({videos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.slice(0, 6).map((video: any) => (
              <div
                key={video.id}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={getThumbnailUrl(video.thumbnail) || ""}
                  alt={video.title}
                  className="w-full h-32 object-cover bg-gray-200"
                />
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {video.duration || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {videos.length > 6 && (
            <Button
              variant="secondary"
              onClick={handleViewVideos}
              className="mt-4 w-full"
            >
              View All {videos.length} Videos
            </Button>
          )}
        </div>
      )}

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onSave={handleEdit}
        playlist={playlist}
        loading={actionLoading}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleDelete}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This action cannot be undone and will remove all video associations."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
