import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

interface UserRole {
  id: number;
  name: string;
  slug: string;
  isSystem?: boolean;
}

interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  role: string;
  roleId?: number;
  assignedRole?: UserRole | null;
  permissions?: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
  refreshing: boolean;
}

// Try to load permissions from storage
const storedUser =
  localStorage.getItem("adminUser") || sessionStorage.getItem("adminUser");
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

const initialState: AuthState = {
  user: parsedUser,
  token: localStorage.getItem("token") || sessionStorage.getItem("token"),
  isAuthenticated: !!(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  ),
  permissions: parsedUser?.permissions || [],
  refreshing: false,
};

// Async thunk to refresh user permissions from backend
export const refreshUserPermissions = createAsyncThunk(
  "auth/refreshPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      if (response.data.status) {
        return response.data.user;
      }
      return rejectWithValue("Failed to fetch user profile");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to refresh permissions");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.permissions = action.payload.user.permissions || [];
    },
    updateUserPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
      if (state.user) {
        state.user.permissions = action.payload;
        // Also update storage
        const storedInLocal = localStorage.getItem("adminUser");
        const storedInSession = sessionStorage.getItem("adminUser");
        const updatedUser = { ...state.user, permissions: action.payload };
        if (storedInLocal) {
          localStorage.setItem("adminUser", JSON.stringify(updatedUser));
        }
        if (storedInSession) {
          sessionStorage.setItem("adminUser", JSON.stringify(updatedUser));
        }
      }
    },
    updateUserData: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.permissions = action.payload.permissions || [];
      // Update storage
      const storedInLocal = localStorage.getItem("adminUser");
      const storedInSession = sessionStorage.getItem("adminUser");
      if (storedInLocal) {
        localStorage.setItem("adminUser", JSON.stringify(action.payload));
      }
      if (storedInSession) {
        sessionStorage.setItem("adminUser", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = [];
      localStorage.removeItem("token");
      localStorage.removeItem("adminUser");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("adminUser");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshUserPermissions.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(refreshUserPermissions.fulfilled, (state, action) => {
        state.refreshing = false;
        if (action.payload) {
          const user = action.payload;
          state.user = user;
          state.permissions = user.permissions || [];
          // Update storage
          const storedInLocal = localStorage.getItem("adminUser");
          const storedInSession = sessionStorage.getItem("adminUser");
          if (storedInLocal) {
            localStorage.setItem("adminUser", JSON.stringify(user));
          }
          if (storedInSession) {
            sessionStorage.setItem("adminUser", JSON.stringify(user));
          }
        }
      })
      .addCase(refreshUserPermissions.rejected, (state) => {
        state.refreshing = false;
      });
  },
});

export const { setCredentials, updateUserPermissions, updateUserData, logout } =
  authSlice.actions;
export default authSlice.reducer;
