import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { Table } from "../components/Table";
import { Button } from "../components/Button";
import { CreateUserModal } from "../components/CreateUserModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { ChannelInfoModal } from "../components/ChannelInfoModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import { usersService } from "../services/usersService";
import { createAdminUser, getAdminUsers } from "../services/rolesService";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchRoles } from "../redux/slices/rolesSlice";
import {
  Ban,
  CheckCircle,
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users as UsersIcon,
  Video,
  Shield,
  Filter,
  Tv,
  RotateCcw,
  UserX,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

interface User {
  id: number | string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  status: string;
  userType: string;
  subscribers: number;
  videos: number;
  channelName?: string;
  isVerified: boolean;
  country?: string;
}

export const Users = () => {
  const dispatch = useAppDispatch();
  const { roles } = useAppSelector((state) => state.roles);

  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [channelModalUser, setChannelModalUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [viewMode, setViewMode] = useState<"active" | "deleted">("active");
  const [restoreModal, setRestoreModal] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalViewers: 0,
    totalBanned: 0,
    totalActive: 0,
    totalDeleted: 0,
  });
  const navigate = useNavigate();

  // Fetch roles on mount
  useEffect(() => {
    dispatch(fetchRoles({ limit: 100 }));
  }, [dispatch]);

  // Fetch users on mount and when filters change
  useEffect(() => {
    // Clear search when filters change to show fresh filtered results
    setSearchTerm("");
    if (viewMode === "active") {
      fetchUsers();
    } else {
      fetchDeletedUsers();
    }
    fetchStats();
  }, [currentPage, filterType, verifiedFilter, startDate, endDate, viewMode]);

  // Debounced search function using lodash
  const performSearch = useCallback(
    (searchValue: string, usersList: User[]) => {
      if (searchValue.trim()) {
        // Filter from allUsers client-side for smooth results
        const searchLower = searchValue.toLowerCase().trim();
        const filtered = usersList.filter((user) => {
          // Build full name from parts
          const fullName = user.fullName?.toLowerCase() || "";
          const firstName = user.firstName?.toLowerCase() || "";
          const lastName = user.lastName?.toLowerCase() || "";
          const email = user.email?.toLowerCase() || "";
          const username = user.username?.toLowerCase() || "";
          const combinedName = `${firstName} ${lastName}`.trim();

          // Check if search term matches any field
          return (
            fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            username.includes(searchLower) ||
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            combinedName.includes(searchLower)
          );
        });
        setUsers(filtered);
      } else {
        // No search term - show all users
        setUsers(usersList);
      }
      setIsSearching(false);
    },
    [],
  );

  // Create debounced search function with lodash
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string, usersList: User[]) => {
        performSearch(searchValue, usersList);
      }, 500),
    [performSearch],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search term changes
  useEffect(() => {
    // Set searching state immediately for instant feedback
    if (searchTerm.trim()) {
      setIsSearching(true);
      debouncedSearch(searchTerm, allUsers);
    } else {
      debouncedSearch.cancel();
      setUsers(allUsers);
      setIsSearching(false);
    }
  }, [searchTerm, allUsers, debouncedSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // If filtering by admin, use the admin users endpoint
      if (filterType === "admin") {
        const params: any = {
          page: currentPage,
          limit: 20,
        };
        // Don't send search to API - we handle it client-side

        const response = await getAdminUsers(params);

        if (response.data.status) {
          // Transform admin user data to match the User interface
          const adminUsers = (response.data.data?.users || []).map(
            (user: any) => ({
              id: user.id,
              fullName:
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatar: user.image,
              createdAt: user.createdAt,
              status: user.isBanned ? "banned" : "active",
              userType: "admin",
              subscribers: 0,
              videos: 0,
              isVerified: true,
              role: user.assignedRole?.name || "Admin",
              roleSlug: user.assignedRole?.slug,
            }),
          );
          setAllUsers(adminUsers);
          setUsers(adminUsers);
          if (response.data.data?.pagination) {
            setTotalPages(response.data.data.pagination.lastPage || 1);
            setTotalUsers(response.data.data.pagination.total || 0);
            setCurrentPage(response.data.data.pagination.currentPage || 1);
          }
        }
      } else {
        // Regular users (viewers/creators)
        const params: any = {
          page: currentPage,
          limit: 20,
        };

        // Don't send search to API - we handle it client-side for better full name matching
        if (filterType !== "all") params.userType = filterType;
        if (verifiedFilter !== "all") params.verified = verifiedFilter;
        if (startDate) params.startDate = startDate.toISOString().split("T")[0];
        if (endDate) params.endDate = endDate.toISOString().split("T")[0];

        const response = await usersService.getUsers(params);

        if (response.data.status) {
          const fetchedUsers = (response.data.data || []).map((user: any) => ({
            ...user,
            // Ensure fullName is always available for better search
            fullName:
              user.fullName ||
              (user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : user.username || user.email),
          }));
          setAllUsers(fetchedUsers);
          setUsers(fetchedUsers);
          if (response.data.meta) {
            setTotalPages(response.data.meta.lastPage || 1);
            setTotalUsers(response.data.meta.total || 0);
            setCurrentPage(response.data.meta.currentPage || 1);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
      };

      // Don't send search to API - we handle it client-side

      const response = await usersService.getDeletedUsers(params);

      if (response.data.status) {
        const fetchedUsers = (response.data.data || []).map((user: any) => ({
          ...user,
          // Ensure fullName is always available for better search
          fullName:
            user.fullName ||
            (user.firstName || user.lastName
              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
              : user.username || user.email),
        }));
        setAllUsers(fetchedUsers);
        setUsers(fetchedUsers);
        if (response.data.meta) {
          setTotalPages(response.data.meta.lastPage || 1);
          setTotalUsers(response.data.meta.total || 0);
          setCurrentPage(response.data.meta.currentPage || 1);
        }
      }
    } catch (error: any) {
      console.error("Error fetching deleted users:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch deleted users",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await usersService.getUserStats();
      if (response.data.status && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      // Split full name into first and last name
      const nameParts = userData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const response = await createAdminUser({
        firstName,
        lastName,
        email: userData.email,
        password: userData.password,
        roleId: parseInt(userData.role),
      });

      if (response.data.status) {
        toast.success("Admin user created successfully!");
        setCreateModalOpen(false);
        fetchUsers();
        fetchStats();
      } else {
        toast.error(response.data.message || "Failed to create user");
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create user",
      );
    }
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      const response = await usersService.updateUser(editUser.id, userData);
      if (response.data.status) {
        toast.success("User updated successfully!");
        setEditUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await usersService.deleteUser(userId);
      if (response.data.status) {
        toast.success("User deleted successfully!");
        setDeleteModal(null);
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const response = await usersService.banUser(userId);
      if (response.data.status) {
        toast.success("User banned successfully");
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Error banning user:", error);
      toast.error(error.response?.data?.message || "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await usersService.unbanUser(userId);
      if (response.data.status) {
        toast.success("User unbanned successfully");
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Error unbanning user:", error);
      toast.error(error.response?.data?.message || "Failed to unban user");
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      const response = await usersService.restoreUser(userId);
      if (response.data.status) {
        toast.success("User restored successfully");
        setRestoreModal(null);
        fetchDeletedUsers();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Error restoring user:", error);
      toast.error(error.response?.data?.message || "Failed to restore user");
    }
  };

  const handleViewModeChange = (mode: "active" | "deleted") => {
    setViewMode(mode);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "creator":
        return <Video size={14} className="text-purple-600" />;
      case "admin":
        return <Shield size={14} className="text-blue-600" />;
      default:
        return <UsersIcon size={14} className="text-gray-600" />;
    }
  };

  const getUserTypeBadge = (type: string) => {
    const styles = {
      creator: "bg-purple-100 text-purple-800 border-purple-200",
      admin: "bg-blue-100 text-blue-800 border-blue-200",
      viewer: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[type as keyof typeof styles] || styles.viewer;
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "fullName",
      label: "User",
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <img
            src={
              row.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`
            }
            alt={value}
            className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{value}</span>
              {row.userType === "creator" && row.channelName && (
                <button
                  onClick={() => setChannelModalUser(row)}
                  className="p-1 hover:bg-purple-100 rounded transition-colors group"
                  title="View Channel"
                >
                  <Tv
                    size={14}
                    className="text-purple-600 group-hover:text-purple-700"
                  />
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "userType",
      label: "Type",
      render: (value: string, row: any) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getUserTypeBadge(
              value,
            )}`}
          >
            {getUserTypeIcon(value)}
            {value.toUpperCase()}
          </span>
          {value === "admin" && row.role && (
            <span className="text-xs text-purple-600 font-medium">
              {row.role}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "channelName",
      label: "Channel/Role",
      render: (value: string, row: any) =>
        row.userType === "creator" ? (
          <span className="font-medium text-purple-600">{value || "—"}</span>
        ) : row.userType === "admin" ? (
          <span className="font-medium text-blue-600">{row.role || "—"}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "subscribers",
      label: "Subscribers",
      render: (value: number, row: any) =>
        row.userType === "creator" ? (
          <span className="font-semibold text-purple-600">
            {value?.toLocaleString() || 0}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : value === "banned"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: "isVerified",
      label: "Verified",
      render: (value: boolean) => (
        <div className="flex items-center justify-center">
          {value ? (
            <div className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm hover:shadow-md transition-all duration-200">
              <ShieldCheck size={14} className="text-white" strokeWidth={2.5} />
              <span className="text-xs font-bold text-white tracking-wide">
                VERIFIED
              </span>
            </div>
          ) : (
            <div className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-all duration-200">
              <X size={14} className="text-gray-500" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-600 tracking-wide">
                NOT VERIFIED
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <PermissionGuard permissions={["users.view"]}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/users/${row.id}`)}
              className="text-xs"
            >
              <Eye size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={["users.edit"]}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditUser(row)}
              className="text-xs"
            >
              <Edit size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={["users.ban"]}>
            {row.status === "active" ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleBanUser(row.id)}
                className="text-xs"
              >
                <Ban size={12} className="sm:mr-1" />
                <span className="hidden sm:inline">Ban</span>
              </Button>
            ) : row.status === "banned" ? (
              <Button
                size="sm"
                variant="success"
                onClick={() => handleUnbanUser(row.id)}
                className="text-xs"
              >
                <CheckCircle size={12} className="sm:mr-1" />
                <span className="hidden sm:inline">Unban</span>
              </Button>
            ) : null}
          </PermissionGuard>
          <PermissionGuard permissions={["users.delete"]}>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setDeleteModal(row)}
              className="text-xs"
            >
              <Trash2 size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  // Columns for deleted users view
  const deletedColumns = [
    { key: "id", label: "ID" },
    {
      key: "fullName",
      label: "User",
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <img
            src={
              row.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`
            }
            alt={value}
            className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover opacity-70"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-600">{value}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "userType",
      label: "Type",
      render: (value: string) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border opacity-70 ${getUserTypeBadge(
            value,
          )}`}
        >
          {getUserTypeIcon(value)}
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "isDelete",
      label: "Deleted On",
      render: (value: string) =>
        value
          ? new Date(value).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
    },
    {
      key: "isVerified",
      label: "Verified",
      render: (value: boolean) => (
        <div className="flex items-center justify-center">
          {value ? (
            <div className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm opacity-70">
              <ShieldCheck size={14} className="text-white" strokeWidth={2.5} />
              <span className="text-xs font-bold text-white tracking-wide">
                VERIFIED
              </span>
            </div>
          ) : (
            <div className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 border border-gray-300 opacity-70">
              <X size={14} className="text-gray-500" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-600 tracking-wide">
                NOT VERIFIED
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/users/${row.id}`)}
            className="text-xs"
          >
            <Eye size={12} className="sm:mr-1" />
            <span className="hidden sm:inline">View</span>
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={() => setRestoreModal(row)}
            className="text-xs"
          >
            <RotateCcw size={12} className="sm:mr-1" />
            <span className="hidden sm:inline">Restore</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
              User Management
            </h1>
            <p className="text-purple-100 text-sm sm:text-base md:text-lg">
              Manage and monitor all platform users
            </p>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-purple-600 hover:bg-gray-100 w-full sm:w-auto"
            onClick={() => setCreateModalOpen(true)}
          >
            <UserPlus size={18} className="mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-blue-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Users
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {stats.totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-purple-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Creators
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {stats.totalCreators.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-gray-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Viewers
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {stats.totalViewers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-green-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Active Users
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {stats.totalActive.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-red-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Banned Users
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {stats.totalBanned.toLocaleString()}
          </p>
        </div>
        <div
          className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleViewModeChange("deleted")}
        >
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Deleted Users
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {stats.totalDeleted.toLocaleString()}
          </p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-2">
        <div className="flex gap-2">
          <button
            onClick={() => handleViewModeChange("active")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
              viewMode === "active"
                ? "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <UsersIcon size={18} />
            Active Users ({stats.totalUsers})
          </button>
          <button
            onClick={() => handleViewModeChange("deleted")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
              viewMode === "deleted"
                ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <UserX size={18} />
            Deleted Users ({stats.totalDeleted})
          </button>
        </div>
      </div>

      {/* Filters - Only show for active users */}
      {viewMode === "active" && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4">
          {/* User Type Filter */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-3 mb-3 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 font-bold shrink-0">
              <Filter size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm hidden sm:inline">Type:</span>
            </div>
            {[
              { value: "all", label: "All Users", icon: UsersIcon },
              { value: "creator", label: "Creators", icon: Video },
              { value: "viewer", label: "Viewers", icon: UsersIcon },
              { value: "admin", label: "Admins", icon: Shield },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilterType(item.value)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
                  filterType === item.value
                    ? "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <item.icon size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">
                  {item.value === "all"
                    ? "All"
                    : item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                </span>
              </button>
            ))}
          </div>

          {/* Verification Filter */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
            <div className="flex items-center gap-2 text-gray-600 font-bold shrink-0">
              <CheckCircle size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm hidden sm:inline">
                Verified:
              </span>
            </div>
            {[
              { value: "all", label: "All" },
              { value: "verified", label: "Verified" },
              { value: "non-verified", label: "Non-Verified" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setVerifiedFilter(item.value)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
                  verifiedFilter === item.value
                    ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Date Filter - Show for active users only */}
      {viewMode === "active" && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 space-y-4">
          {/* Date Range Filter */}
          <div className="pb-3 border-b border-gray-200">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          {/* Search */}
          <div className="space-y-2">
            <div className="relative">
              {isSearching ? (
                <Loader2
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 animate-spin"
                  size={18}
                />
              ) : (
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              )}
              <input
                type="text"
                placeholder="Search by full name, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 pl-1">
                💡 Tip: Search supports full names (e.g., "John Doe"), email
                addresses, and usernames
              </p>
              {searchTerm.trim() && !isSearching && (
                <p className="text-xs font-medium text-purple-600 animate-fadeIn">
                  {users.length} result{users.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search for deleted users */}
      {viewMode === "deleted" && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4">
          <div className="space-y-2">
            <div className="relative">
              {isSearching ? (
                <Loader2
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-600 animate-spin"
                  size={18}
                />
              ) : (
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              )}
              <input
                type="text"
                placeholder="Search deleted users by full name, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 pl-1">
                💡 Tip: Search supports full names, email addresses, and
                usernames
              </p>
              {searchTerm.trim() && !isSearching && (
                <p className="text-xs font-medium text-orange-600 animate-fadeIn">
                  {users.length} result{users.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md">
        {/* Search Results Header */}
        {searchTerm.trim() && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin text-purple-600"
                    />
                    <span className="text-gray-600">Searching...</span>
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-purple-600">
                      {users.length}
                    </span>{" "}
                    result{users.length !== 1 ? "s" : ""} found
                    {users.length > 0 && (
                      <span className="text-gray-500">
                        {" "}
                        out of {allUsers.length} total users
                      </span>
                    )}
                  </>
                )}
              </p>
              {!isSearching && users.length === 0 && (
                <p className="text-xs text-gray-500">
                  Try a different search term
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay for Search */}
        {isSearching && searchTerm.trim() && (
          <div className="relative">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-purple-200 flex items-center gap-3">
                <Loader2 size={24} className="animate-spin text-purple-600" />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">
                    Searching users...
                  </p>
                  <p className="text-xs text-gray-500">
                    Filtering through {allUsers.length} users
                  </p>
                </div>
              </div>
            </div>
            <Table
              columns={viewMode === "active" ? columns : deletedColumns}
              data={users}
              loading={false}
            />
          </div>
        )}

        {/* Normal Table */}
        {(!isSearching || !searchTerm.trim()) && (
          <Table
            columns={viewMode === "active" ? columns : deletedColumns}
            data={users}
            loading={loading}
          />
        )}
      </div>

      {/* Pagination - hide when searching */}
      {!searchTerm.trim() && totalPages > 1 && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages} ({totalUsers} total
            {viewMode === "deleted" ? " deleted users" : " users"})
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      <CreateUserModal
        isOpen={createModalOpen || !!editUser}
        onClose={() => {
          setCreateModalOpen(false);
          setEditUser(null);
        }}
        onSubmit={editUser ? handleUpdateUser : handleCreateUser}
        editUser={editUser}
        roles={roles}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={() => handleDeleteUser(deleteModal.id)}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={!!restoreModal}
        onClose={() => setRestoreModal(null)}
        onConfirm={() => handleRestoreUser(restoreModal.id)}
        title="Restore User"
        message={`Are you sure you want to restore ${restoreModal?.fullName}? They will be able to access their account again.`}
        confirmText="Restore"
        variant="success"
      />

      {/* Channel Info Modal */}
      <ChannelInfoModal
        isOpen={!!channelModalUser}
        onClose={() => setChannelModalUser(null)}
        user={channelModalUser}
      />
    </div>
  );
};

export default Users;
