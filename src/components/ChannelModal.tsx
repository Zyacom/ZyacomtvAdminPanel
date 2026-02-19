import { X } from "lucide-react";
import { Button } from "./Button";
import { useState, useEffect } from "react";

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (channelData: any) => void;
  editChannel?: any;
}

export const ChannelModal = ({
  isOpen,
  onClose,
  onSubmit,
  editChannel,
}: ChannelModalProps) => {
  const [formData, setFormData] = useState({
    name: editChannel?.name || "",
    description: editChannel?.description || "",
    website: editChannel?.website || "",
    status: editChannel?.status || "active",
    isVerified:
      editChannel?.isVerified !== undefined ? editChannel.isVerified : false,
  });

  const [errors, setErrors] = useState<any>({});

  console.log(errors);

  useEffect(() => {
    if (editChannel) {
      setFormData({
        name: editChannel.name || "",
        description: editChannel.description || "",
        website: editChannel.website || "",
        status: editChannel.status || "active",
        isVerified:
          editChannel.isVerified !== undefined ? editChannel.isVerified : false,
      });
    }
  }, [editChannel]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Channel name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 my-8 animate-fadeIn">
        {/* Header */}
        <div className="relative bg-linear-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-white" />
          </button>
          <h2 className="text-3xl font-black text-white">
            {editChannel ? "Edit Channel Metadata" : "Channel Details"}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {editChannel
              ? "Update channel information for moderation purposes"
              : "View and moderate channel information"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 max-h-[70vh] overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Channel Name - READ ONLY */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Channel Name{" "}
                <span className="text-gray-400 text-xs">
                  (Creator set - Read only)
                </span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed font-medium"
              />
            </div>

            {/* Description - READ ONLY */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description{" "}
                <span className="text-gray-400 text-xs">
                  (Creator set - Read only)
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                readOnly
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed resize-none font-medium"
              ></textarea>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Status *{" "}
                <span className="text-blue-600 text-xs">
                  (Admin can update)
                </span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            {/* Website - READ ONLY */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Website{" "}
                <span className="text-gray-400 text-xs">
                  (Creator set - Read only)
                </span>
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                readOnly
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed font-medium"
              />
            </div>

            {/* Verification Toggle */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-bold text-gray-900">
                    Verified Channel{" "}
                    <span className="text-blue-600">(Admin controls)</span>
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Mark this channel as verified to show the verification badge
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editChannel ? "Save Changes" : "Close"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
