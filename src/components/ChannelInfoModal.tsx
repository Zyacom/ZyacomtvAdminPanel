import { X, Users, Video, TrendingUp } from "lucide-react";

interface ChannelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const ChannelInfoModal = ({
  isOpen,
  onClose,
  user,
}: ChannelInfoModalProps) => {
  if (!isOpen || !user) return null;

  // Check if user is a creator with a channel
  if (user.userType !== "creator" || !user.channelName) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
          <div className="text-center py-8">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Channel Available
            </h3>
            <p className="text-gray-600">
              This user is not a creator or doesn't have a channel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 my-8 animate-fadeIn">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="relative bg-linear-to-r from-purple-600/90 to-blue-600/90 p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            <div className="flex items-start gap-6">
              {/* Channel Logo */}
              <div className="shrink-0 w-24 h-24 bg-white rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.channelName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video size={32} className="text-purple-600" />
                )}
              </div>

              {/* Channel Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-black text-white leading-tight mb-2">
                  {user.channelName}
                </h2>
                <p className="text-lg text-purple-100">
                  Owned by {user.fullName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-purple-600" />
                <p className="text-xs font-bold text-purple-600 uppercase">
                  Subscribers
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {user.subscribers?.toLocaleString() || 0}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Video size={20} className="text-blue-600" />
                <p className="text-xs font-bold text-blue-600 uppercase">
                  Videos
                </p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {user.videos || 0}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-green-600" />
                <p className="text-xs font-bold text-green-600 uppercase">
                  Status
                </p>
              </div>
              <p className="text-lg font-black text-gray-900 capitalize">
                {user.status}
              </p>
            </div>
          </div>

          {/* Channel Details */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                Owner Email
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {user.email}
              </p>
            </div>

            {user.phone && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Contact Phone
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.phone}
                </p>
              </div>
            )}

            {user.country && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Country
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.country}
                </p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                Verification Status
              </p>
              <div className="flex items-center gap-2">
                {user.isVerified ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-lg font-semibold text-green-700">
                      Verified Channel
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-lg font-semibold text-gray-700">
                      Not Verified
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
