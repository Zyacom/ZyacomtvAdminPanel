import { X, Shield, Check } from "lucide-react";
import { Button } from "./Button";
import { useState, useEffect } from "react";

interface Permission {
  id: string;
  name: string;
  category: string;
  description?: string;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedPermissions: string[]) => void;
  currentPermissions: string[];
  allPermissions: Permission[];
  roleName?: string;
}

export const PermissionsModal = ({
  isOpen,
  onClose,
  onSave,
  currentPermissions,
  allPermissions,
  roleName = "Role",
}: PermissionsModalProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("PermissionsModal useEffect - isOpen:", isOpen);
    console.log(
      "PermissionsModal useEffect - currentPermissions:",
      currentPermissions,
    );
    console.log(
      "PermissionsModal useEffect - allPermissions count:",
      allPermissions.length,
    );
    console.log(
      "PermissionsModal useEffect - allPermissions sample:",
      allPermissions.slice(0, 3),
    );
    if (isOpen) {
      setSelectedPermissions(currentPermissions);
    }
  }, [isOpen, currentPermissions]);

  if (!isOpen) return null;

  const groupedPermissions = allPermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  const filteredCategories = Object.entries(groupedPermissions).reduce(
    (acc, [category, perms]) => {
      const filtered = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const toggleCategory = (category: string) => {
    const categoryPermissions = groupedPermissions[category].map((p) => p.id);
    const allSelected = categoryPermissions.every((id) =>
      selectedPermissions.includes(id),
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !categoryPermissions.includes(id)),
      );
    } else {
      setSelectedPermissions((prev) => [
        ...new Set([...prev, ...categoryPermissions]),
      ]);
    }
  };

  const selectAll = () => {
    setSelectedPermissions(allPermissions.map((p) => p.id));
  };

  const clearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = () => {
    onSave(selectedPermissions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl mx-4 my-8 animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-linear-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-3xl font-black text-white">
                Manage Permissions
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Configure permissions for:{" "}
                <span className="font-bold">{roleName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="secondary" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </div>

          {/* Selected Count */}
          <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-sm font-bold text-purple-900">
              Selected: {selectedPermissions.length} of {allPermissions.length}{" "}
              permissions
            </p>
          </div>

          {/* Permissions by Category */}
          <div className="space-y-6">
            {Object.entries(filteredCategories).map(
              ([category, permissions]) => {
                const categoryPermissionIds = permissions.map((p) => p.id);
                const allCategorySelected = categoryPermissionIds.every((id) =>
                  selectedPermissions.includes(id),
                );
                const someCategorySelected = categoryPermissionIds.some((id) =>
                  selectedPermissions.includes(id),
                );

                return (
                  <div
                    key={category}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Shield size={20} className="text-purple-600" />
                        {category}
                        <span className="text-sm font-medium text-gray-500">
                          ({permissions.length})
                        </span>
                      </h3>
                      <button
                        onClick={() => toggleCategory(category)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                          allCategorySelected
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : someCategorySelected
                              ? "bg-purple-200 text-purple-800 hover:bg-purple-300"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {allCategorySelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    {/* Permissions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map((permission) => {
                        const isSelected = selectedPermissions.includes(
                          permission.id,
                        );
                        return (
                          <button
                            key={permission.id}
                            onClick={() => togglePermission(permission.id)}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? "border-purple-600 bg-purple-50 shadow-md"
                                : "border-gray-200 bg-white hover:border-purple-300"
                            }`}
                          >
                            <div
                              className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-purple-600 bg-purple-600"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold ${
                                  isSelected
                                    ? "text-purple-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {permission.name}
                              </p>
                              {permission.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {permission.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1 font-mono">
                                {permission.id}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-12">
              <Shield size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No permissions found
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search term
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Permissions ({selectedPermissions.length})
          </Button>
        </div>
      </div>
    </div>
  );
};
