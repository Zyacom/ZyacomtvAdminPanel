import { useEffect, useState } from "react";
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Shield,
  Mail,
  Calendar,
  Check,
  X,
} from "lucide-react";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchRoles,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../redux/slices/rolesSlice";

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editUser?: any;
  roles: any[];
  loading?: boolean;
}

const AdminUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  editUser,
  roles,
  loading,
}: AdminUserModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editUser) {
      setFormData({
        firstName: editUser.firstName || "",
        lastName: editUser.lastName || "",
        email: editUser.email || "",
        password: "",
        roleId:
          editUser.roleId?.toString() ||
          editUser.assignedRole?.id?.toString() ||
          "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roleId: "",
      });
    }
    setErrors({});
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!editUser && !formData.password)
      newErrors.password = "Password is required";
    if (!editUser && formData.password && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.roleId) newErrors.roleId = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        roleId: parseInt(formData.roleId),
      };
      if (!editUser) {
        submitData.password = formData.password;
      }
      onSubmit(submitData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">
            {editUser ? "Edit Admin User" : "Create Admin User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="First name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address"
              disabled={!!editUser}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {!editUser && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Assign Role
            </label>
            <select
              value={formData.roleId}
              onChange={(e) =>
                setFormData({ ...formData, roleId: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.roleId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading roles..." : "Select a role"}
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {loading && (
              <p className="text-blue-500 text-sm mt-1">
                Loading available roles...
              </p>
            )}
            {!loading && roles.length === 0 && (
              <p className="text-amber-500 text-sm mt-1">
                No roles available. Please create roles first.
              </p>
            )}
            {errors.roleId && (
              <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  {editUser ? "Updating..." : "Creating..."}
                </span>
              ) : editUser ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AdminUsers = () => {
  const dispatch = useAppDispatch();
  const { roles, adminUsers, loading, actionLoading } = useAppSelector(
    (state) => state.roles,
  );

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: number | null;
  }>({ isOpen: false, userId: null });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch all roles for the dropdown (limit: 100 to get all)
    dispatch(fetchRoles({ limit: 100, includePermissions: true }));
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  // Debug: Log roles when they change
  useEffect(() => {
    console.log("Roles from Redux state:", roles);
  }, [roles]);

  const handleCreateUser = async (userData: any) => {
    try {
      await dispatch(createAdminUser(userData)).unwrap();
      toast.success("Admin user created successfully");
      setShowModal(false);
      dispatch(fetchAdminUsers());
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin user");
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      await dispatch(
        updateAdminUser({
          userId: editingUser.id,
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            roleId: userData.roleId,
          },
        }),
      ).unwrap();
      toast.success("Admin user updated successfully");
      setShowModal(false);
      setEditingUser(null);
      dispatch(fetchAdminUsers());
    } catch (error: any) {
      toast.error(error.message || "Failed to update admin user");
    }
  };

  const handleDeleteUser = (userId: number) => {
    setConfirmModal({ isOpen: true, userId });
  };

  const confirmDelete = async () => {
    if (confirmModal.userId) {
      try {
        await dispatch(deleteAdminUser(confirmModal.userId)).unwrap();
        toast.success("Admin user deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete admin user");
      }
    }
    setConfirmModal({ isOpen: false, userId: null });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const getRoleColor = (slug: string) => {
    const colors: Record<string, string> = {
      "super-admin": "bg-red-100 text-red-700",
      admin: "bg-purple-100 text-purple-700",
      moderator: "bg-blue-100 text-blue-700",
      "content-manager": "bg-green-100 text-green-700",
      support: "bg-orange-100 text-orange-700",
    };
    return colors[slug] || "bg-gray-100 text-gray-700";
  };

  const filteredUsers = adminUsers.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.assignedRole?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <UserCog className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white">
                  Admin Users
                </h1>
              </div>
              <p className="text-lg lg:text-xl text-purple-100 font-medium">
                Manage administrators and their roles
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={() => dispatch(fetchAdminUsers())}
                disabled={loading}
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </Button>
              <PermissionGuard permissions={["admin-users.create"]}>
                <Button
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Add Admin
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Admins</p>
          <p className="text-3xl font-black text-gray-900">
            {adminUsers.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Super Admins</p>
          <p className="text-3xl font-black text-gray-900">
            {
              adminUsers.filter((u) => u.assignedRole?.slug === "super-admin")
                .length
            }
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Moderators</p>
          <p className="text-3xl font-black text-gray-900">
            {
              adminUsers.filter((u) => u.assignedRole?.slug === "moderator")
                .length
            }
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Available Roles
          </p>
          <p className="text-3xl font-black text-gray-900">{roles.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search admin users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && adminUsers.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading admin users...</p>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Admin User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user.firstName?.charAt(0)?.toUpperCase() ||
                          user.name?.charAt(0)?.toUpperCase() ||
                          "A"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-700">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.assignedRole ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(
                          user.assignedRole.slug,
                        )}`}
                      >
                        <Shield size={12} />
                        {user.assignedRole.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No role</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      <Check size={12} />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Calendar size={14} />
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <PermissionGuard permissions={["admin-users.edit"]}>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit user"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permissions={["admin-users.delete"]}>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete user"
                          disabled={
                            actionLoading ||
                            user.assignedRole?.slug === "super-admin"
                          }
                        >
                          <Trash2
                            size={16}
                            className={
                              user.assignedRole?.slug === "super-admin"
                                ? "text-gray-300"
                                : "text-red-600"
                            }
                          />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="p-12 text-center">
            <UserCog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No admin users found</p>
          </div>
        )}
      </div>

      {/* Admin User Modal */}
      <AdminUserModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        editUser={editingUser}
        roles={roles}
        loading={loading}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null })}
        onConfirm={confirmDelete}
        title="Delete Admin User"
        message="Are you sure you want to delete this admin user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
