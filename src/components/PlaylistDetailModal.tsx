import {
  X,
  Video,
  Eye,
  Calendar,
  Globe,
  Lock,
  Users,
  Play,
  TrendingUp,
} from "lucide-react";
import { Button } from "./Button";
import { LOCAL_HOST } from "../config/config";

interface PlaylistDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: any;
  onViewVideos?: (playlistId: number) => void;
}

export const PlaylistDetailModal = ({
  isOpen,
  onClose,
  playlist,
  onViewVideos,
}: PlaylistDetailModalProps) => {
  if (!isOpen) return null;

  if (!playlist) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 animate-fadeIn">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading playlist details...</p>
          </div>
        </div>
      </div>
    );
  }

  const getThumbnailUrl = () => {
    // Check for thumbnails array first
    if (playlist.thumbnails && playlist.thumbnails.length > 0) {
      const firstThumb = playlist.thumbnails[0];
      if (firstThumb.startsWith("http")) return firstThumb;
      return `${LOCAL_HOST}${firstThumb.startsWith("/") ? firstThumb.slice(1) : firstThumb}`;
    }
    // Fallback to single thumbnail
    if (playlist.thumbnail) {
      if (playlist.thumbnail.startsWith("http")) return playlist.thumbnail;
      return `${LOCAL_HOST}${playlist.thumbnail.startsWith("/") ? playlist.thumbnail.slice(1) : playlist.thumbnail}`;
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl();

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe size={14} />;
      case "private":
        return <Lock size={14} />;
      case "unlisted":
        return <Eye size={14} />;
      default:
        return <Globe size={14} />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-green-100 text-green-800 border-green-200";
      case "private":
        return "bg-red-100 text-red-800 border-red-200";
      case "unlisted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 my-8 animate-fadeIn">
        {/* Header */}
        <div className="relative overflow-hidden">
          {/* Thumbnail Background */}
          {thumbnailUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            ></div>
          )}
          <div className="relative bg-linear-to-r from-purple-600/90 to-indigo-600/90 p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-white" />
            </button>

            <div className="flex items-start gap-6">
              {/* Playlist Thumbnail */}
              <div className="shrink-0 w-48 h-32 bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-500 to-blue-500">
                    <Play size={48} className="text-white" />
                  </div>
                )}
              </div>

              {/* Playlist Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-3xl font-black text-white leading-tight">
                    {playlist.name}
                  </h2>
                </div>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 flex items-center gap-1.5 ${getVisibilityColor(
                      playlist.visibility,
                    )}`}
                  >
                    {getVisibilityIcon(playlist.visibility)}
                    {playlist.visibility.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-2">
                    <Video size={16} />
                    <span className="font-semibold">
                      {playlist.videosCount} videos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span className="font-semibold">
                      {playlist.totalViews?.toLocaleString() || 0} views
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Video size={20} className="text-purple-600" />
                <p className="text-xs font-bold text-purple-600 uppercase">
                  Videos
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {playlist.videosCount || 0}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={20} className="text-blue-600" />
                <p className="text-xs font-bold text-blue-600 uppercase">
                  Total Views
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {playlist.totalViews?.toLocaleString() || 0}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-green-600" />
                <p className="text-xs font-bold text-green-600 uppercase">
                  Avg Views
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {playlist.videosCount > 0
                  ? Math.round(
                      playlist.totalViews / playlist.videosCount,
                    ).toLocaleString()
                  : 0}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-orange-600" />
                <p className="text-xs font-bold text-orange-600 uppercase">
                  Channel
                </p>
              </div>
              <p className="text-sm font-black text-gray-900">
                {playlist.channelName}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Playlist Owner
                </h3>
                <p className="text-lg font-bold text-purple-600">
                  {playlist.ownerName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Channel: {playlist.channelName}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(playlist.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  {playlist.lastUpdated && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(playlist.lastUpdated).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {playlist.description && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">
                    Description
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {playlist.description}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">
                  Visibility
                </h3>
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      playlist.visibility === "public"
                        ? "bg-green-100"
                        : playlist.visibility === "private"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                    }`}
                  >
                    {getVisibilityIcon(playlist.visibility)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize">
                      {playlist.visibility}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {playlist.visibility === "public" &&
                        "Anyone can search for and view this playlist"}
                      {playlist.visibility === "private" &&
                        "Only the creator can view this playlist"}
                      {playlist.visibility === "unlisted" &&
                        "Anyone with the link can view this playlist"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          {onViewVideos && (
            <Button
              variant="primary"
              onClick={() => onViewVideos(Number(playlist.id))}
            >
              <Video size={16} className="mr-2" />
              View Videos
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
