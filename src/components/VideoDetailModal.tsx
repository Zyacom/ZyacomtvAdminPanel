import {
  X,
  Play,
  Eye,
  ThumbsUp,
  Calendar,
  Clock,
  Tag,
  DollarSign,
  Shield,
  Users,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Button } from "./Button";

interface VideoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: any;
  onEdit?: (video: any) => void;
  onDelete?: (videoId: string) => void;
  onDisable?: (videoId: string) => void;
  onEnable?: (videoId: string) => void;
}

export const VideoDetailModal = ({
  isOpen,
  onClose,
  video,
  onEdit,
  onDelete,
  onDisable,
  onEnable,
}: VideoDetailModalProps) => {
  if (!isOpen || !video) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "disabled":
        return "bg-red-100 text-red-800 border-red-200";
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
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl mx-4 my-8 animate-fadeIn">
        {/* Header */}
        <div className="relative overflow-hidden">
          {/* Thumbnail Background */}
          {video.thumbnail && (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30"
              style={{ backgroundImage: `url(${video.thumbnail})` }}
            ></div>
          )}
          <div className="relative bg-linear-to-r from-blue-600/90 to-purple-600/90 p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-white" />
            </button>

            <div className="flex items-start gap-6">
              {/* Thumbnail */}
              <div className="shrink-0 w-64 h-36 bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play size={48} className="text-gray-600" />
                  </div>
                )}
              </div>

              {/* Title and Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-3xl font-black text-white leading-tight">
                    {video.title}
                  </h2>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${getStatusColor(
                      video.status,
                    )}`}
                  >
                    {video.status.toUpperCase()}
                  </span>
                  {video.isPaid === 1 && (
                    <span className="px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-bold flex items-center gap-1">
                      <DollarSign size={14} />${video.price}
                    </span>
                  )}
                  {video.forKids === 1 && (
                    <span className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-bold">
                      Kids
                    </span>
                  )}
                  {video.copyright === 1 && (
                    <span className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-sm font-bold flex items-center gap-1">
                      <Shield size={14} />
                      Copyright
                    </span>
                  )}
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-bold">
                    {video.isPublic === 1 ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {/* Video Player */}
          {video.media && (
            <div className="mb-8 bg-black rounded-xl overflow-hidden shadow-2xl">
              <video
                controls
                className="w-full"
                poster={video.thumbnail}
                preload="metadata"
              >
                <source src={video.media} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={20} className="text-blue-600" />
                <p className="text-xs font-bold text-blue-600 uppercase">
                  Views
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {video.views?.toLocaleString() || 0}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-purple-600" />
                <p className="text-xs font-bold text-purple-600 uppercase">
                  Duration
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {video.duration}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp size={20} className="text-green-600" />
                <p className="text-xs font-bold text-green-600 uppercase">
                  Likes
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {video.likes?.toLocaleString() || 0}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-orange-600" />
                <p className="text-xs font-bold text-orange-600 uppercase">
                  Channel
                </p>
              </div>
              <p className="text-lg font-black text-gray-900 truncate">
                {video.channelName}
              </p>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={20} className="text-gray-600" />
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category */}
            {video.category && (
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Category
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {video.category}
                </p>
              </div>
            )}

            {/* Upload Date */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                Uploaded
              </p>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-600" />
                <p className="text-lg font-bold text-gray-900">
                  {new Date(video.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Tags */}
            {video.tags && (
              <div className="p-4 bg-white rounded-xl border border-gray-200 md:col-span-2">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {video.tags.split(",").map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Video URLs */}
          {(video.media || video.thumbnail) && (
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-black text-gray-900 mb-4">
                Media URLs
              </h3>
              <div className="space-y-3">
                {video.media && (
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-1">
                      Video URL:
                    </p>
                    <p className="text-sm text-blue-600 font-medium break-all bg-white p-3 rounded-lg border border-blue-100">
                      {video.media}
                    </p>
                  </div>
                )}
                {video.thumbnail && (
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-1">
                      Thumbnail URL:
                    </p>
                    <p className="text-sm text-blue-600 font-medium break-all bg-white p-3 rounded-lg border border-blue-100">
                      {video.thumbnail}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <div className="flex gap-2">
            {video.status === "active" && onDisable && (
              <Button variant="danger" onClick={() => onDisable(video.id)}>
                <Ban size={16} className="mr-2" />
                Disable Video
              </Button>
            )}
            {video.status === "disabled" && onEnable && (
              <Button variant="success" onClick={() => onEnable(video.id)}>
                <CheckCircle size={16} className="mr-2" />
                Enable Video
              </Button>
            )}
            {video.status === "disabled" && video.disableReason && (
              <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-bold text-red-600 mb-1">
                  Disable Reason:
                </p>
                <p className="text-sm text-red-700">{video.disableReason}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="primary" onClick={() => onEdit(video)}>
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" onClick={() => onDelete(video.id)}>
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
