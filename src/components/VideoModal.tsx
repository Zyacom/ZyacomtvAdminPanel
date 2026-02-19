import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "./Button";
import { useState, useEffect } from "react";

interface Category {
  id: number | string;
  name: string;
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (videoData: any) => void;
  editVideo?: any;
  categories?: Category[];
}

export const VideoModal = ({
  isOpen,
  onClose,
  onSubmit,
  editVideo,
  categories: propCategories,
}: VideoModalProps) => {
  const [formData, setFormData] = useState({
    title: editVideo?.title || "",
    description: editVideo?.description || "",
    category: editVideo?.category || "",
    tags: editVideo?.tags || "",
    duration: editVideo?.duration || "",
    isPublic: editVideo?.isPublic !== undefined ? editVideo.isPublic : 1,
    forKids: editVideo?.forKids !== undefined ? editVideo.forKids : 0,
    copyright: editVideo?.copyright !== undefined ? editVideo.copyright : 0,
    isPaid: editVideo?.isPaid !== undefined ? editVideo.isPaid : 0,
    price: editVideo?.price || "",
    status: editVideo?.status || "active",
    channelName: editVideo?.channelName || "",
    media: editVideo?.media || "",
    thumbnail: editVideo?.thumbnail || "",
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editVideo) {
      setFormData({
        title: editVideo.title || "",
        description: editVideo.description || "",
        category: editVideo.category || "",
        tags: editVideo.tags || "",
        duration: editVideo.duration || "",
        isPublic: editVideo.isPublic !== undefined ? editVideo.isPublic : 1,
        forKids: editVideo.forKids !== undefined ? editVideo.forKids : 0,
        copyright: editVideo.copyright !== undefined ? editVideo.copyright : 0,
        isPaid: editVideo.isPaid !== undefined ? editVideo.isPaid : 0,
        price: editVideo.price || "",
        status: editVideo.status || "pending",
        channelName: editVideo.channelName || "",
        media: editVideo.media || "",
        thumbnail: editVideo.thumbnail || "",
      });
    }
  }, [editVideo]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: any = {};

    // Only validate editable fields for admin
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.isPaid === 1 && !formData.price) {
      newErrors.price = "Price is required for paid videos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
      // Reset form if not editing
      if (!editVideo) {
        setFormData({
          title: "",
          description: "",
          category: "",
          tags: "",
          duration: "",
          isPublic: 1,
          forKids: 0,
          copyright: 0,
          isPaid: 0,
          price: "",
          status: "active",
          channelName: "",
          media: "",
          thumbnail: "",
        });
      }
      setErrors({});
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Default categories if none provided via props
  const defaultCategories = [
    "Education",
    "Entertainment",
    "Gaming",
    "Music",
    "News",
    "Sports",
    "Technology",
    "Travel",
    "Cooking",
    "Fashion",
    "Health & Fitness",
    "Science",
    "Business",
    "Comedy",
    "Film & Animation",
    "People & Blogs",
    "Pets & Animals",
    "Autos & Vehicles",
    "Nonprofits & Activism",
  ];

  const categories =
    propCategories && propCategories.length > 0
      ? propCategories.map((c) => c.name)
      : defaultCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-purple-50">
          <div>
            <h3 className="text-2xl font-black text-gray-900">
              Edit Video Details
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Moderate and update video information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 max-h-[70vh] overflow-y-auto"
        >
          <div className="space-y-5">
            {/* Video Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter video title"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Video title is set by the creator and cannot be changed
              </p>
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter video description"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Video description is set by the creator
              </p>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category *{" "}
                  <span className="text-blue-600 text-xs">
                    (Admin can update)
                  </span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Channel Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Channel Name *
                </label>
                <input
                  type="text"
                  name="channelName"
                  value={formData.channelName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.channelName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter channel name"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Channel name cannot be changed
                </p>
                {errors.channelName && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.channelName}
                  </p>
                )}
              </div>
            </div>

            {/* Tags and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., react, tutorial, javascript"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tags are set by the creator
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 10:30 or 1:05:30"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-detected from video file
                </p>
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.duration}
                  </p>
                )}
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Video URL (Read-only)
              </label>
              <div className="relative">
                <Upload
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="media"
                  value={formData.media}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none bg-gray-50"
                  placeholder="Video uploaded by creator"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Video files are uploaded by creators, cannot be changed
              </p>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Thumbnail URL (Read-only)
              </label>
              <div className="relative">
                <ImageIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="thumbnail"
                  value={formData.thumbnail}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none bg-gray-50"
                  placeholder="Thumbnail uploaded by creator"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Thumbnail is set by the creator
              </p>
            </div>

            {/* Video Settings */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-2">
                Moderation Settings{" "}
                <span className="text-blue-600">(Admin Controls)</span>
              </h4>
              <p className="text-xs text-gray-600 mb-4">
                These settings can be modified by admins for content moderation
                purposes
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visibility */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    name="isPublic"
                    value={formData.isPublic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value={1}>Public</option>
                    <option value={0}>Private</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Moderation Status *{" "}
                    <span className="text-blue-600 text-xs">
                      (Admin can update)
                    </span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="forKids"
                    checked={formData.forKids === 1}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Made for Kids
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="copyright"
                    checked={formData.copyright === 1}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Copyright Claimed
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid === 1}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Paid Content
                  </span>
                </label>
              </div>

              {/* Price (shown only if isPaid) */}
              {formData.isPaid === 1 && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter price"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">
                      {errors.price}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} type="button">
            Update Video
          </Button>
        </div>
      </div>
    </div>
  );
};
