import { X, Check } from "lucide-react";
import { Button } from "./Button";
import { useState, useEffect } from "react";

interface Permission {
  id: number;
  name: string;
  slug?: string;
  category: string;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleData: any) => void;
  editRole?: any;
  allPermissions: Permission[];
}

export const RoleModal = ({
  isOpen,
  onClose,
  onSubmit,
  editRole,
  allPermissions,
}: RoleModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "purple",
    permissions: [] as number[],
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      console.log("RoleModal opened, editRole:", editRole);
      console.log("editRole.permissions:", editRole?.permissions);
      if (editRole) {
        const permissionIds = editRole.permissions || [];
        console.log("Setting permissions to:", permissionIds);
        setFormData({
          name: editRole.name || "",
          description: editRole.description || "",
          color: editRole.color || "purple",
          permissions: permissionIds,
        });
      } else {
        // Reset form for new role
        setFormData({
          name: "",
          description: "",
          color: "purple",
          permissions: [],
        });
      }
      setErrors({});
    }
  }, [editRole, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        color: "purple",
        permissions: [],
      });
      setErrors({});
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const togglePermission = (permissionId: number) => {
    const permissions = [...formData.permissions];
    const index = permissions.indexOf(permissionId);

    if (index > -1) {
      permissions.splice(index, 1);
    } else {
      permissions.push(permissionId);
    }

    setFormData({ ...formData, permissions });

    // Clear permission error
    if (errors.permissions) {
      setErrors({ ...errors, permissions: "" });
    }
  };

  const toggleAllPermissions = () => {
    if (formData.permissions.length === allPermissions.length) {
      setFormData({ ...formData, permissions: [] });
    } else {
      setFormData({
        ...formData,
        permissions: allPermissions.map((p) => p.id),
      });
    }

    // Clear permission error
    if (errors.permissions) {
      setErrors({ ...errors, permissions: "" });
    }
  };

  const toggleCategoryPermissions = (category: string) => {
    const categoryPerms = allPermissions
      .filter((p) => p.category === category)
      .map((p) => p.id);

    const allCategorySelected = categoryPerms.every((p) =>
      formData.permissions.includes(p),
    );

    let newPermissions = [...formData.permissions];

    if (allCategorySelected) {
      // Remove all category permissions
      newPermissions = newPermissions.filter((p) => !categoryPerms.includes(p));
    } else {
      // Add all category permissions
      categoryPerms.forEach((p) => {
        if (!newPermissions.includes(p)) {
          newPermissions.push(p);
        }
      });
    }

    setFormData({ ...formData, permissions: newPermissions });

    // Clear permission error
    if (errors.permissions) {
      setErrors({ ...errors, permissions: "" });
    }
  };

  const groupedPermissions = allPermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  const colorOptions = [
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "pink", label: "Pink", class: "bg-pink-500" },
    { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
    { value: "teal", label: "Teal", class: "bg-teal-500" },
  ];

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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-blue-50">
          <h3 className="text-2xl font-black text-gray-900">
            {editRole ? "Edit Role" : "Create New Role"}
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
          <div className="space-y-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Content Manager"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.name}
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
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe the role and its responsibilities"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                    className={`relative h-12 rounded-xl ${color.class} transition-all ${
                      formData.color === color.value
                        ? "ring-4 ring-offset-2 ring-gray-400 scale-110"
                        : "hover:scale-105"
                    }`}
                  >
                    {formData.color === color.value && (
                      <Check
                        className="absolute inset-0 m-auto text-white"
                        size={20}
                        strokeWidth={3}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-gray-700">
                  Permissions *
                </label>
                <button
                  type="button"
                  onClick={toggleAllPermissions}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    formData.permissions.length === allPermissions.length &&
                    allPermissions.length > 0
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {formData.permissions.length === allPermissions.length &&
                  allPermissions.length > 0
                    ? "✓ All Permissions"
                    : "Select All"}
                </button>
              </div>

              {errors.permissions && (
                <p className="text-red-500 text-xs mb-3 font-semibold">
                  {errors.permissions}
                </p>
              )}

              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => {
                  const allCategorySelected = perms.every((p) =>
                    formData.permissions.includes(p.id),
                  );

                  return (
                    <div
                      key={category}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-black text-gray-900">
                          {category}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleCategoryPermissions(category)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            allCategorySelected
                              ? "bg-purple-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {allCategorySelected ? "✓ All" : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-semibold text-gray-700">
                              {perm.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {formData.permissions.length === allPermissions.length &&
                allPermissions.length > 0 && (
                  <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Check
                          className="text-white"
                          size={20}
                          strokeWidth={3}
                        />
                      </div>
                      <h4 className="text-lg font-black text-gray-900">
                        All Permissions Granted
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      This role will have complete access to all features and
                      settings in the system.
                    </p>
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
            {editRole ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </div>
    </div>
  );
};
