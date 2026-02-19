import { useState, useEffect } from "react";
import { X, Save, Globe, Lock, Eye } from "lucide-react";

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    visibility: "public" | "private" | "unlisted";
    description: string;
  }) => void;
  playlist: {
    name: string;
    visibility?: string;
    description?: string | null;
  } | null;
  loading?: boolean;
}

export const EditPlaylistModal = ({
  isOpen,
  onClose,
  onSave,
  playlist,
  loading = false,
}: EditPlaylistModalProps) => {
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<
    "public" | "private" | "unlisted"
  >("public");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (playlist) {
      setName(playlist.name || "");
      setVisibility(
        (playlist.visibility as "public" | "private" | "unlisted") || "public",
      );
      setDescription(playlist.description || "");
    }
  }, [playlist]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, visibility, description });
  };

  const visibilityOptions = [
    {
      value: "public",
      label: "Public",
      icon: <Globe size={18} />,
      description: "Anyone can search for and view this playlist",
      color: "bg-green-100 border-green-300 text-green-800",
    },
    {
      value: "private",
      label: "Private",
      icon: <Lock size={18} />,
      description: "Only you can view this playlist",
      color: "bg-red-100 border-red-300 text-red-800",
    },
    {
      value: "unlisted",
      label: "Unlisted",
      icon: <Eye size={18} />,
      description: "Anyone with the link can view this playlist",
      color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Playlist</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Playlist Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter playlist name"
              required
            />
          </div>

          {/* Visibility Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Visibility
            </label>
            <div className="space-y-3">
              {visibilityOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    visibility === option.value
                      ? option.color + " border-current"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) =>
                      setVisibility(
                        e.target.value as "public" | "private" | "unlisted",
                      )
                    }
                    className="sr-only"
                  />
                  <div
                    className={`p-2 rounded-lg ${
                      visibility === option.value ? option.color : "bg-gray-100"
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      visibility === option.value
                        ? "border-purple-600 bg-purple-600"
                        : "border-gray-300"
                    }`}
                  >
                    {visibility === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Enter playlist description..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
