import { useEffect, useState } from "react";
import {
  Shield,
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Check,
  Lock,
  Route,
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { RoleModal } from "../components/RoleModal";
import { PermissionsModal } from "../components/PermissionsModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchRoles,
  fetchPermissions,
  fetchRoleStats,
  createRole,
  updateRole,
  deleteRole,
} from "../redux/slices/rolesSlice";
import { refreshUserPermissions } from "../redux/slices/authSlice";
import { syncSystemPermissions } from "../services/rolesService";
import { getAccessibleRoutes } from "../utils/permissions";

const ROLE_COLORS: Record<string, string> = {
  "super-admin": "red",
  admin: "purple",
  moderator: "blue",
  "content-manager": "green",
  support: "orange",
};

export const Roles = () => {
  const dispatch = useAppDispatch();
  const { roles, permissions, allPermissions, stats, loading, actionLoading } =
    useAppSelector((state) => state.roles);

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    roleId: number | null;
  }>({ isOpen: false, roleId: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    dispatch(fetchRoles({ includePermissions: true }));
    dispatch(fetchPermissions());
    dispatch(fetchRoleStats());
  }, [dispatch]);

  const handleSyncSystemPermissions = async () => {
    try {
      setSyncing(true);
      await syncSystemPermissions();
      toast.success("System role permissions synced successfully!");
      // Refresh roles to show updated permissions
      dispatch(fetchRoles({ includePermissions: true }));
      // Refresh current user's permissions
      dispatch(refreshUserPermissions());
    } catch (error: any) {
      toast.error(error.message || "Failed to sync permissions");
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateRole = async (roleData: any) => {
    try {
      await dispatch(
        createRole({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        }),
      ).unwrap();
      toast.success("Role created successfully");
      setShowModal(false);
      dispatch(fetchRoles({ includePermissions: true }));
      dispatch(fetchRoleStats());
    } catch (error: any) {
      toast.error(error.message || "Failed to create role");
    }
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleUpdateRole = async (roleData: any) => {
    try {
      await dispatch(
        updateRole({
          id: editingRole.id,
          data: {
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
          },
        }),
      ).unwrap();
      toast.success("Role updated successfully");
      setShowModal(false);
      setEditingRole(null);
      dispatch(fetchRoles({ includePermissions: true }));
      // Refresh current user's permissions in case their role was updated
      dispatch(refreshUserPermissions());
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleDeleteRole = (roleId: number) => {
    setConfirmModal({ isOpen: true, roleId });
  };

  const confirmDelete = async () => {
    if (confirmModal.roleId) {
      try {
        await dispatch(deleteRole(confirmModal.roleId)).unwrap();
        toast.success("Role deleted successfully");
        dispatch(fetchRoleStats());
      } catch (error: any) {
        toast.error(error.message || "Failed to delete role");
      }
    }
    setConfirmModal({ isOpen: false, roleId: null });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  const handleManagePermissions = (role: any) => {
    console.log("handleManagePermissions called with role:", role);
    console.log("Role permissions:", role.permissions);
    console.log(
      "Permission slugs:",
      role.permissions?.map((p: any) => p.slug || p),
    );
    setSelectedRoleForPerms(role);
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async (permissionIds: number[]) => {
    if (selectedRoleForPerms) {
      try {
        await dispatch(
          updateRole({
            id: selectedRoleForPerms.id,
            data: { permissions: permissionIds },
          }),
        ).unwrap();
        toast.success("Permissions updated successfully");
        dispatch(fetchRoles({ includePermissions: true }));
        // Refresh current user's permissions in case their role was updated
        dispatch(refreshUserPermissions());
      } catch (error: any) {
        toast.error(error.message || "Failed to update permissions");
      }
    }
    setShowPermissionsModal(false);
    setSelectedRoleForPerms(null);
  };

  const getRoleColor = (slug: string) => {
    return ROLE_COLORS[slug] || "gray";
  };

  const getRoleAccessibleRoutes = (permissionSlugs: string[]) => {
    return getAccessibleRoutes(permissionSlugs);
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Convert allPermissions to the format expected by RoleModal (numeric IDs) and PermissionsModal (slugs)
  const formattedPermissions = allPermissions.map((p) => ({
    id: p.id, // Use numeric ID for RoleModal
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description || "",
  }));

  // For PermissionsModal, use slug as id since it expects strings
  const permissionsForModal = allPermissions.map((p) => ({
    id: p.slug, // Use slug as string id for PermissionsModal
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description || "",
  }));

  // Debug: Log permissions data
  useEffect(() => {
    console.log("allPermissions from Redux:", allPermissions);
    console.log("formattedPermissions:", formattedPermissions);
    if (editingRole) {
      console.log("editingRole:", editingRole);
      console.log("editingRole.permissions:", editingRole.permissions);
    }
  }, [allPermissions, formattedPermissions, editingRole]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white">
                  Roles & Permissions
                </h1>
              </div>
              <p className="text-lg lg:text-xl text-purple-100 font-medium">
                Manage user roles and access control
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={() => {
                  dispatch(fetchRoles({ includePermissions: true }));
                  dispatch(fetchRoleStats());
                }}
                disabled={loading}
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </Button>
              <PermissionGuard permissions={["roles.edit"]}>
                <Button
                  variant="secondary"
                  className="bg-amber-500 text-white hover:bg-amber-600"
                  onClick={handleSyncSystemPermissions}
                  disabled={syncing}
                  title="Sync permissions for system roles (Super Admin, Admin, Moderator, etc.)"
                >
                  <Settings
                    size={18}
                    className={syncing ? "animate-spin" : ""}
                  />
                  <span className="ml-2 hidden sm:inline">
                    {syncing ? "Syncing..." : "Sync System Roles"}
                  </span>
                </Button>
              </PermissionGuard>
              <PermissionGuard permissions={["roles.create"]}>
                <Button
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Create Role
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Roles</p>
          <p className="text-3xl font-black text-gray-900">
            {stats?.totalRoles || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Active Roles</p>
          <p className="text-3xl font-black text-gray-900">
            {stats?.activeRoles || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">System Roles</p>
          <p className="text-3xl font-black text-gray-900">
            {stats?.systemRoles || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-pink-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Total Permissions
          </p>
          <p className="text-3xl font-black text-gray-900">
            {stats?.totalPermissions || 0}
          </p>
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
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && roles.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      )}

      {/* Roles Grid */}
      {!loading && filteredRoles.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No roles found</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => {
          const color = getRoleColor(role.slug);
          const permissionSlugs =
            role.permissions?.map((p: any) => p.slug || p) || [];
          const accessibleRoutes = getRoleAccessibleRoutes(permissionSlugs);

          return (
            <div
              key={role.id}
              className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden hover:shadow-3xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Color accent */}
              <div
                className="absolute top-0 left-0 w-full h-2"
                style={{
                  background:
                    color === "red"
                      ? "linear-gradient(to right, #f87171, #dc2626)"
                      : color === "purple"
                        ? "linear-gradient(to right, #c084fc, #9333ea)"
                        : color === "green"
                          ? "linear-gradient(to right, #4ade80, #16a34a)"
                          : color === "blue"
                            ? "linear-gradient(to right, #60a5fa, #2563eb)"
                            : color === "orange"
                              ? "linear-gradient(to right, #fb923c, #ea580c)"
                              : "linear-gradient(to right, #9ca3af, #4b5563)",
                }}
              ></div>

              {/* System Badge */}
              {!!role.isSystem && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    System
                  </span>
                </div>
              )}

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="p-4 rounded-xl shadow-lg"
                    style={{
                      background:
                        color === "red"
                          ? "linear-gradient(to bottom right, #ef4444, #dc2626)"
                          : color === "purple"
                            ? "linear-gradient(to bottom right, #a855f7, #9333ea)"
                            : color === "green"
                              ? "linear-gradient(to bottom right, #22c55e, #16a34a)"
                              : color === "blue"
                                ? "linear-gradient(to bottom right, #3b82f6, #2563eb)"
                                : color === "orange"
                                  ? "linear-gradient(to bottom right, #f97316, #ea580c)"
                                  : "linear-gradient(to bottom right, #6b7280, #4b5563)",
                    }}
                  >
                    <UserCog
                      className="text-white"
                      size={28}
                      strokeWidth={2.5}
                    />
                  </div>
                  {!role.isSystem && (
                    <div className="flex gap-2">
                      <PermissionGuard permissions={["roles.edit"]}>
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit role"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permissions={["roles.delete"]}>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete role"
                          disabled={actionLoading}
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </PermissionGuard>
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {role.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {role.description || "No description"}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {(role.userCount ?? 0) > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                      <Users size={14} className="text-gray-600" />
                      <span className="text-sm font-bold text-gray-700">
                        {role.userCount} users
                      </span>
                    </div>
                  )}
                  {(role.permissions?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full">
                      <Lock size={14} className="text-purple-600" />
                      <span className="text-sm font-bold text-purple-700">
                        {role.permissions?.length} permissions
                      </span>
                    </div>
                  )}
                </div>

                {/* Accessible Routes */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Route size={14} />
                    Accessible Routes ({accessibleRoutes.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {accessibleRoutes.slice(0, 3).map((route) => (
                      <span
                        key={route}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full"
                      >
                        {route}
                      </span>
                    ))}
                    {accessibleRoutes.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                        +{accessibleRoutes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                    Key Permissions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(role.permissions || []).slice(0, 4).map((perm: any) => (
                      <span
                        key={perm.id || perm}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full"
                      >
                        {(perm.name || perm).split(" ")[0]}
                      </span>
                    ))}
                    {(role.permissions?.length || 0) > 4 && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                        +{(role.permissions?.length || 0) - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Manage Permissions Button */}
                <PermissionGuard permissions={["roles.edit"]}>
                  <Button
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleManagePermissions(role)}
                  >
                    <Shield size={16} />
                    <span>Manage Permissions</span>
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Overview */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Lock className="text-purple-600" size={28} />
            All Available Permissions
          </h2>
          <div className="px-4 py-2 bg-purple-100 rounded-full">
            <span className="text-sm font-bold text-purple-900">
              {allPermissions.length} Total
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(permissions).map(([category, perms]) => (
            <div
              key={category}
              className="p-6 bg-gray-50 rounded-2xl border border-gray-200"
            >
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2 capitalize">
                <Shield size={18} className="text-purple-600" />
                {category}
                <span className="text-sm font-medium text-gray-500">
                  ({perms.length})
                </span>
              </h3>
              <div className="space-y-2">
                {perms.map((perm) => (
                  <div key={perm.id} className="flex items-start gap-2">
                    <Check size={14} className="text-green-600 shrink-0 mt-1" />
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        {perm.name}
                      </span>
                      {perm.description && (
                        <span className="text-xs text-gray-500">
                          {perm.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Management Modal */}
      <RoleModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
        editRole={
          editingRole
            ? (() => {
                const mappedPermissions =
                  editingRole.permissions?.map((p: any) => p.id || p) || [];
                console.log("Passing to RoleModal - editingRole:", editingRole);
                console.log(
                  "Passing to RoleModal - original permissions:",
                  editingRole.permissions,
                );
                console.log(
                  "Passing to RoleModal - mapped permissions:",
                  mappedPermissions,
                );
                return {
                  ...editingRole,
                  permissions: mappedPermissions,
                };
              })()
            : null
        }
        allPermissions={formattedPermissions}
      />

      {/* Permissions Management Modal */}
      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedRoleForPerms(null);
        }}
        onSave={(permissionSlugs: string[]) => {
          // Convert slugs to IDs
          const permissionIds = allPermissions
            .filter((p) => permissionSlugs.includes(p.slug))
            .map((p) => p.id);
          handleSavePermissions(permissionIds);
        }}
        currentPermissions={
          selectedRoleForPerms?.permissions?.map((p: any) => p.slug || p) || []
        }
        allPermissions={permissionsForModal}
        roleName={selectedRoleForPerms?.name}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, roleId: null })}
        onConfirm={confirmDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone. Users with this role will need to be reassigned."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
