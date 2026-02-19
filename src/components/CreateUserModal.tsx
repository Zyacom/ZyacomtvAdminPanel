import { X } from "lucide-react";
import { Button } from "./Button";
import { useState, useEffect } from "react";

interface Role {
  id: number;
  name: string;
  slug: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
  editUser?: any;
  roles?: Role[];
}

export const CreateUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  editUser,
  roles = [],
}: CreateUserModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    country: "",
    userType: "admin",
    role: "",
    status: "active",
    bio: "",
    channelName: "",
    isVerified: false,
  });

  const [errors, setErrors] = useState<any>({});

  // Update form data when editUser changes
  useEffect(() => {
    if (editUser) {
      setFormData({
        fullName: editUser.fullName || "",
        email: editUser.email || "",
        password: "",
        phone: editUser.phone || "",
        dateOfBirth: editUser.dateOfBirth || "",
        gender: editUser.gender || "male",
        country: editUser.country || "",
        userType: editUser.userType || "viewer",
        role: editUser.roleId || editUser.role || "",
        status: editUser.status || "active",
        bio: editUser.bio || "",
        channelName: editUser.channelName || "",
        isVerified: editUser.isVerified || false,
      });
    } else {
      // Reset to defaults when creating new user
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        dateOfBirth: "",
        gender: "male",
        country: "",
        userType: "admin",
        role: "",
        status: "active",
        bio: "",
        channelName: "",
        isVerified: false,
      });
    }
    // Clear errors when modal opens/closes or editUser changes
    setErrors({});
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!editUser && !formData.password) {
      newErrors.password = "Password is required";
    } else if (!editUser && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Phone is optional for editing (viewers/creators may not have provided it)
    if (!editUser && !formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (formData.userType === "creator" && !formData.channelName.trim()) {
      newErrors.channelName = "Channel name is required for creators";
    }

    if (formData.userType === "admin" && !formData.role) {
      newErrors.role = "Role is required for admin users";
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
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-blue-50">
          <h3 className="text-2xl font-black text-gray-900">
            {editUser ? "Edit User" : "Create New User"}
          </h3>
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
            {/* User Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                User Type *
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium bg-gray-50"
                disabled={!!editUser}
              >
                <option value="viewer">Viewer</option>
                <option value="creator">Creator</option>
                <option value="admin">Admin</option>
              </select>
              {!editUser && (
                <p className="text-xs text-gray-500 mt-1">
                  Note: Only create Admin users from here. Viewers and Creators
                  register themselves.
                </p>
              )}
              {editUser && (
                <p className="text-xs text-gray-500 mt-1">
                  User type cannot be changed after creation.
                </p>
              )}
            </div>

            {/* Admin Role Selection */}
            {formData.userType === "admin" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Admin Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium ${
                    errors.role ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">
                    {roles.length === 0 ? "Loading roles..." : "Select a role"}
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {roles.length === 0 && (
                  <p className="text-amber-500 text-xs mt-1">
                    No roles available. Please create roles first.
                  </p>
                )}
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.role}
                  </p>
                )}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter full name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            {!editUser && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter password (min 6 characters)"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number {editUser ? "" : "*"}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter country"
              />
            </div>

            {/* Channel Name (only for creators) */}
            {formData.userType === "creator" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Channel Name *
                </label>
                <input
                  type="text"
                  name="channelName"
                  value={formData.channelName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.channelName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter channel name"
                />
                {errors.channelName && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.channelName}
                  </p>
                )}
              </div>
            )}

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Bio / Description
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Enter user bio or description"
              />
            </div>

            {/* Status and Verified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Account Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              {/* Verified Badge */}
              {formData.userType === "creator" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Verification
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleChange}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Verified Account
                    </span>
                  </label>
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
            {editUser ? "Update User" : "Create User"}
          </Button>
        </div>
      </div>
    </div>
  );
};
