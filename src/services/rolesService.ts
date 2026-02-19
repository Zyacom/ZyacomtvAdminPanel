import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "../config/Api";

export interface Permission {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  isActive: boolean;
  userCount?: number;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  totalPermissions: number;
  roleDistribution: { name: string; count: number }[];
}

export interface AdminUser {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string; // For backward compatibility
  email: string;
  image?: string;
  role: string;
  roleId?: number;
  isBanned: boolean;
  assignedRole?: {
    id: number;
    name: string;
    slug: string;
    permissions?: string[];
  };
  createdAt?: string;
}

// Get all roles
export const getRoles = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  includePermissions?: boolean;
}) => {
  const queryParams: Record<string, string> = {};
  if (params) {
    if (params.page) queryParams.page = String(params.page);
    if (params.limit) queryParams.limit = String(params.limit);
    if (params.search) queryParams.search = params.search;
    if (params.includePermissions !== undefined) {
      queryParams.includePermissions = params.includePermissions
        ? "true"
        : "false";
    }
  }
  const queryString =
    Object.keys(queryParams).length > 0
      ? "?" + new URLSearchParams(queryParams).toString()
      : "";
  const response = await makeGetRequest(`admin/roles${queryString}`);
  return response;
};

// Get single role
export const getRole = async (id: number) => {
  const response = await makeGetRequest(`admin/roles/${id}`);
  return response;
};

// Create role
export const createRole = async (data: {
  name: string;
  description?: string;
  permissions?: number[];
}) => {
  const response = await makePostRequest("admin/roles", data);
  return response;
};

// Update role
export const updateRole = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
    permissions?: number[];
  },
) => {
  const response = await makePutRequest(`admin/roles/${id}`, data);
  return response;
};

// Delete role
export const deleteRole = async (id: number) => {
  const response = await makeDeleteRequest(`admin/roles/${id}`);
  return response;
};

// Get all permissions
export const getPermissions = async () => {
  const response = await makeGetRequest("admin/roles/permissions");
  return response;
};

// Get role stats
export const getRoleStats = async () => {
  const response = await makeGetRequest("admin/roles/stats");
  return response;
};

// Assign role to user
export const assignRoleToUser = async (userId: number, roleId: number) => {
  const response = await makePostRequest("admin/roles/assign", {
    userId,
    roleId,
  });
  return response;
};

// Get users by role
export const getUsersByRole = async (
  roleId: number,
  params?: { page?: number; limit?: number },
) => {
  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, string>).toString()
    : "";
  const response = await makeGetRequest(
    `admin/roles/${roleId}/users${queryString}`,
  );
  return response;
};

// Get all admin users
export const getAdminUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, string>).toString()
    : "";
  const response = await makeGetRequest(`admin/users/admins${queryString}`);
  return response;
};

// Create admin user
export const createAdminUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
}) => {
  const response = await makePostRequest("admin/users/admin", data);
  return response;
};

// Update admin user
export const updateAdminUser = async (
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    roleId?: number;
  },
) => {
  const response = await makePutRequest(`admin/users/admin/${userId}`, data);
  return response;
};

// Update admin user role
export const updateAdminUserRole = async (userId: number, roleId: number) => {
  const response = await makePutRequest(`admin/users/${userId}/role`, {
    roleId,
  });
  return response;
};

// Delete admin user
export const deleteAdminUser = async (userId: number) => {
  const response = await makeDeleteRequest(`admin/users/admin/${userId}`);
  return response;
};

// Sync system role permissions
export const syncSystemPermissions = async () => {
  const response = await makePostRequest(
    "admin/roles/sync-system-permissions",
    {},
  );
  return response;
};

export default {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  getRoleStats,
  assignRoleToUser,
  getUsersByRole,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
  syncSystemPermissions,
};
