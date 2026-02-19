import {
  X,
  Users,
  Video,
  Calendar,
  CheckCircle,
  Edit,
  Ban,
  Eye,
  TrendingUp,
  Mail,
  Clock,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Button } from "./Button";

interface ChannelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: any;
  onEdit?: (channel: any) => void;
  onDisable?: (channelId: string) => void;
  onEnable?: (channelId: string) => void;
}

export const ChannelDetailModal = ({
  isOpen,
  onClose,
  channel,
  onEdit,
  onDisable,
  onEnable,
}: ChannelDetailModalProps) => {
  if (!isOpen || !channel) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toLocaleString() || "0";
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fadeIn">
        {/* Banner Section */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-56 w-full relative overflow-hidden">
            {channel.banner ? (
              <>
                <img
                  src={channel.banner}
                  alt={`${channel.name} cover`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"></div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all duration-200 cursor-pointer group"
          >
            <X
              size={20}
              className="text-white group-hover:rotate-90 transition-transform duration-200"
            />
          </button>

          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm ${
                channel.status === "active"
                  ? "bg-emerald-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {channel.status}
            </span>
            {channel.isVerified && (
              <span className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm flex items-center gap-1">
                <ShieldCheck size={12} />
                Verified
              </span>
            )}
          </div>

          {/* Channel Avatar - Positioned at bottom of banner */}
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-violet-500 to-purple-600">
                  <span className="text-4xl font-black text-white">
                    {channel.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Channel Info Header */}
        <div className="pt-20 px-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {channel.name}
                </h2>
                {channel.isVerified && (
                  <CheckCircle
                    size={22}
                    className="text-blue-500"
                    fill="currentColor"
                  />
                )}
              </div>
              <p className="text-gray-500 text-sm">
                @
                {channel.handle ||
                  channel.name?.toLowerCase().replace(/\s+/g, "")}
              </p>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(channel)}
                  className="rounded-lg!"
                >
                  <Edit size={14} className="mr-1.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 py-6 bg-gray-50/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Subscribers */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(channel.subscribersCount || 0)}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Subscribers
                  </p>
                </div>
              </div>
            </div>

            {/* Videos */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Video size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(channel.videosCount || 0)}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Videos</p>
                </div>
              </div>
            </div>

            {/* Total Views */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Eye size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(channel.totalViews || 0)}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Total Views
                  </p>
                </div>
              </div>
            </div>

            {/* Avg Views */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingUp size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {channel.videosCount > 0
                      ? formatNumber(
                          Math.round(
                            (channel.totalViews || 0) / channel.videosCount,
                          ),
                        )
                      : "0"}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Avg. Views
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-8 py-6 max-h-[35vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Channel Owner
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {channel.ownerName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {channel.ownerName || "Unknown Owner"}
                    </p>
                    {channel.ownerEmail && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Mail size={12} />
                        <span className="truncate">{channel.ownerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Timeline
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(channel.createdAt)}
                  </span>
                </div>
                {channel.lastUpload && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={14} />
                      <span className="text-sm">Last Upload</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(channel.lastUpload)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {channel.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                About
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">
                {channel.description}
              </p>
            </div>
          )}

          {/* Disable Reason Alert */}
          {channel.status === "disabled" && channel.disableReason && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <Ban size={16} className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">
                    Disable Reason
                  </h4>
                  <p className="text-sm text-red-700">
                    {channel.disableReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 px-8 py-5 border-t border-gray-100 bg-white">
          <div>
            {channel.status === "active" && onDisable && (
              <Button
                variant="danger"
                onClick={() => onDisable(channel.id)}
                className="rounded-lg!"
              >
                <Ban size={16} className="mr-2" />
                Disable Channel
              </Button>
            )}
            {channel.status === "disabled" && onEnable && (
              <Button
                variant="success"
                onClick={() => onEnable(channel.id)}
                className="rounded-lg!"
              >
                <Shield size={16} className="mr-2" />
                Enable Channel
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={onClose} className="rounded-lg!">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
