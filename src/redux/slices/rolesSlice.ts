import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import rolesService, {
  Role,
  Permission,
  RoleStats,
  AdminUser,
} from "../../services/rolesService";

interface RolesState {
  roles: Role[];
  selectedRole: Role | null;
  permissions: Record<string, Permission[]>;
  allPermissions: Permission[];
  stats: RoleStats | null;
  adminUsers: AdminUser[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  adminUsersPagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  selectedRole: null,
  permissions: {},
  allPermissions: [],
  stats: null,
  adminUsers: [],
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  },
  adminUsersPagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  },
  loading: false,
  actionLoading: false,
  error: null,
};

// Async thunks
export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    includePermissions?: boolean;
  }) => {
    const response = await rolesService.getRoles(params);
    return response.data;
  },
);

export const fetchRole = createAsyncThunk(
  "roles/fetchRole",
  async (id: number) => {
    const response = await rolesService.getRole(id);
    return response.data;
  },
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (data: {
    name: string;
    description?: string;
    permissions?: number[];
  }) => {
    const response = await rolesService.createRole(data);
    return response.data;
  },
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({
    id,
    data,
  }: {
    id: number;
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      permissions?: number[];
    };
  }) => {
    const response = await rolesService.updateRole(id, data);
    return response.data;
  },
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id: number) => {
    await rolesService.deleteRole(id);
    return id;
  },
);

export const fetchPermissions = createAsyncThunk(
  "roles/fetchPermissions",
  async () => {
    const response = await rolesService.getPermissions();
    return response.data;
  },
);

export const fetchRoleStats = createAsyncThunk(
  "roles/fetchRoleStats",
  async () => {
    const response = await rolesService.getRoleStats();
    return response.data;
  },
);

export const fetchAdminUsers = createAsyncThunk(
  "roles/fetchAdminUsers",
  async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await rolesService.getAdminUsers(params);
    return response.data;
  },
);

export const createAdminUser = createAsyncThunk(
  "roles/createAdminUser",
  async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: number;
  }) => {
    const response = await rolesService.createAdminUser(data);
    return response.data;
  },
);

export const updateAdminUserRole = createAsyncThunk(
  "roles/updateAdminUserRole",
  async ({ userId, roleId }: { userId: number; roleId: number }) => {
    const response = await rolesService.updateAdminUserRole(userId, roleId);
    return response.data;
  },
);

export const deleteAdminUser = createAsyncThunk(
  "roles/deleteAdminUser",
  async (userId: number) => {
    await rolesService.deleteAdminUser(userId);
    return userId;
  },
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setSelectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch roles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        console.log("fetchRoles API response:", action.payload);
        const data = action.payload?.data || action.payload;
        console.log("Parsed data:", data);
        console.log("Roles from API:", data?.roles);
        state.roles = data?.roles || [];
        if (data?.pagination) {
          state.pagination = data.pagination;
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch roles";
        console.error("fetchRoles error:", action.error);
      });

    // Fetch single role
    builder
      .addCase(fetchRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.selectedRole = data?.role || null;
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch role";
      });

    // Create role
    builder
      .addCase(createRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        const data = action.payload?.data || action.payload;
        if (data?.role) {
          state.roles.push(data.role);
        }
      })
      .addCase(createRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to create role";
      });

    // Update role
    builder
      .addCase(updateRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        const data = action.payload?.data || action.payload;
        if (data?.role) {
          const index = state.roles.findIndex((r) => r.id === data.role.id);
          if (index !== -1) {
            state.roles[index] = data.role;
          }
          if (state.selectedRole?.id === data.role.id) {
            state.selectedRole = data.role;
          }
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to update role";
      });

    // Delete role
    builder
      .addCase(deleteRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to delete role";
      });

    // Fetch permissions
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.permissions = data?.permissions || {};
        state.allPermissions = data?.all || [];
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch permissions";
      });

    // Fetch stats
    builder
      .addCase(fetchRoleStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleStats.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.stats = data?.stats || null;
      })
      .addCase(fetchRoleStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch stats";
      });

    // Fetch admin users
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.adminUsers = data?.users || [];
        if (data?.pagination) {
          state.adminUsersPagination = data.pagination;
        }
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch admin users";
      });

    // Create admin user
    builder
      .addCase(createAdminUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const data = action.payload?.data || action.payload;
        if (data?.user) {
          state.adminUsers.unshift(data.user);
        }
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to create admin user";
      });

    // Update admin user role
    builder
      .addCase(updateAdminUserRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateAdminUserRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        const data = action.payload?.data || action.payload;
        if (data?.user) {
          const index = state.adminUsers.findIndex(
            (u) => u.id === data.user.id,
          );
          if (index !== -1) {
            state.adminUsers[index] = {
              ...state.adminUsers[index],
              ...data.user,
            };
          }
        }
      })
      .addCase(updateAdminUserRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to update user role";
      });

    // Delete admin user
    builder
      .addCase(deleteAdminUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.adminUsers = state.adminUsers.filter(
          (u) => u.id !== action.payload,
        );
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || "Failed to delete admin user";
      });
  },
});

export const { setSelectedRole, clearError } = rolesSlice.actions;
export default rolesSlice.reducer;
