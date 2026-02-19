import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "../components/Table";
import {
  Tv,
  Search,
  Eye,
  Edit,
  CheckCircle,
  Users,
  Video,
  RefreshCw,
  XCircle,
  Award,
} from "lucide-react";
import { Button } from "../components/Button";
import { ChannelDetailModal } from "../components/ChannelDetailModal";
import { ChannelModal } from "../components/ChannelModal";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "../redux/store";
import {
  fetchChannels,
  fetchChannelStats,
  updateChannel,
  verifyChannel,
  revokeChannelVerification,
  disableChannel,
  enableChannel,
  setFilters,
  setSelectedChannel,
  Channel,
} from "../redux/slices/channelsSlice";
import { LOCAL_HOST } from "../config/config";

export const Channels = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    channels,
    selectedChannel,
    stats,
    filters,
    pagination,
    loading,
    statsLoading,
    actionLoading,
  } = useSelector((state: RootState) => state.channels);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [disableModal, setDisableModal] = useState<{
    isOpen: boolean;
    channelId: number | null;
  }>({ isOpen: false, channelId: null });
  const [disableReason, setDisableReason] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Fetch channels and stats on mount
  useEffect(() => {
    dispatch(fetchChannels(filters));
    dispatch(fetchChannelStats());
  }, [dispatch]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      dispatch(
        setFilters({
          search: searchTerm,
          page: 1,
        }),
      );
      dispatch(
        fetchChannels({
          ...filters,
          search: searchTerm,
          page: 1,
        }),
      );
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm]);

  // Handle date filter changes
  useEffect(() => {
    const newFilters = {
      ...filters,
      startDate: startDate ? startDate.toISOString().split("T")[0] : "",
      endDate: endDate ? endDate.toISOString().split("T")[0] : "",
      page: 1,
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchChannels(newFilters));
  }, [startDate, endDate]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchChannels(filters));
    dispatch(fetchChannelStats());
  }, [dispatch, filters]);

  const handleViewChannel = (channel: Channel) => {
    dispatch(setSelectedChannel(channel));
    setShowDetailModal(true);
  };

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    setShowEditModal(true);
    setShowDetailModal(false);
  };

  const handleUpdateChannel = async (channelData: any) => {
    if (!editingChannel) return;

    try {
      const updateData: any = {};

      // Only update name if changed
      if (channelData.name !== editingChannel.name) {
        updateData.name = channelData.name;
      }

      // Handle verification status change
      if (
        channelData.isVerified &&
        editingChannel.verificationStatus !== "verified"
      ) {
        await dispatch(verifyChannel(editingChannel.id)).unwrap();
        toast.success("Channel verified successfully");
      } else if (
        !channelData.isVerified &&
        editingChannel.verificationStatus === "verified"
      ) {
        await dispatch(revokeChannelVerification(editingChannel.id)).unwrap();
        toast.success("Channel verification revoked");
      }

      // Handle status change (enable/disable)
      if (channelData.status === "disabled" && !editingChannel.isDisabled) {
        setDisableModal({ isOpen: true, channelId: editingChannel.id });
        setShowEditModal(false);
        return;
      } else if (channelData.status === "active" && editingChannel.isDisabled) {
        await dispatch(enableChannel(editingChannel.id)).unwrap();
        toast.success("Channel enabled successfully");
      }

      // Update other fields if needed
      if (Object.keys(updateData).length > 0) {
        await dispatch(
          updateChannel({ channelId: editingChannel.id, data: updateData }),
        ).unwrap();
        toast.success("Channel updated successfully");
      }

      setShowEditModal(false);
      setEditingChannel(null);
      handleRefresh();
    } catch (error: any) {
      toast.error(error || "Failed to update channel");
    }
  };

  const handleEnableChannel = async (channelId: number) => {
    try {
      await dispatch(enableChannel(channelId)).unwrap();
      toast.success("Channel enabled successfully");
      setShowDetailModal(false);
      handleRefresh();
    } catch (error: any) {
      toast.error(error || "Failed to enable channel");
    }
  };

  const handleDisableChannel = (channelId: number) => {
    setDisableModal({ isOpen: true, channelId });
    setShowDetailModal(false);
  };

  const confirmDisable = async () => {
    if (disableModal.channelId && disableReason.trim()) {
      try {
        await dispatch(
          disableChannel({
            channelId: disableModal.channelId,
            reason: disableReason,
          }),
        ).unwrap();
        toast.success("Channel disabled successfully");
        setDisableModal({ isOpen: false, channelId: null });
        setDisableReason("");
        handleRefresh();
      } catch (error: any) {
        toast.error(error || "Failed to disable channel");
      }
    } else {
      toast.error("Please provide a reason for disabling the channel");
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    dispatch(setFilters(newFilters));
    dispatch(fetchChannels(newFilters));
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${LOCAL_HOST}${path}`;
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Channel",
      render: (value: string, row: Channel) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={getImageUrl(row.avatar) || undefined}
              alt={value || "Channel"}
              className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://api.dicebear.com/7.x/initials/svg?seed=${value || "C"}`;
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {(value || "C").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                {value || "Unnamed"}
              </span>
              {row.verificationStatus === "verified" && (
                <CheckCircle
                  size={14}
                  className="text-blue-500"
                  fill="currentColor"
                />
              )}
            </div>
            <span className="text-xs text-gray-500">
              @{(value || "channel").toLowerCase().replace(/\s+/g, "")}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (_: any, row: Channel) => (
        <span className="text-purple-600 font-semibold">
          {row.owner?.name || "Unknown"}
        </span>
      ),
    },
    {
      key: "subscribersCount",
      label: "Subscribers",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-500" />
          <span className="font-bold">{(value || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "videosCount",
      label: "Videos",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Video size={14} className="text-gray-500" />
          <span className="font-bold">{(value || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "totalViews",
      label: "Total Views",
      render: (value: number) => (
        <span className="font-bold text-green-600">
          {(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "isDisabled",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            !value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {!value ? "ACTIVE" : "DISABLED"}
        </span>
      ),
    },
    {
      key: "verificationStatus",
      label: "Verification",
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
            value === "verified"
              ? "bg-blue-100 text-blue-800"
              : value === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {value === "verified" && <Award size={12} />}
          {(value || "unverified").toUpperCase()}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Channel) => (
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <PermissionGuard permissions={["channels.view"]}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleViewChannel(row)}
              className="text-xs"
            >
              <Eye size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={["channels.edit"]}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleEditChannel(row)}
              className="text-xs"
            >
              <Edit size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  // Transform channels for display
  const displayChannels = channels.map((channel) => ({
    ...channel,
    status: channel.isDisabled ? "disabled" : "active",
    isVerified: channel.verificationStatus === "verified",
    ownerName: channel.owner?.name || "Unknown",
    ownerEmail: channel.owner?.email || "",
    ownerPhone: channel.owner?.phone || "",
    logo: getImageUrl(channel.avatar),
    banner: getImageUrl(channel.coverImage),
  }));

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Tv size={32} className="sm:w-10 sm:h-10" />
              <h1 className="text-3xl sm:text-4xl font-bold">Channels</h1>
            </div>
            <p className="text-indigo-100 text-sm sm:text-base md:text-lg">
              Monitor and moderate all content channels
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-indigo-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Channels
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading ? "..." : stats?.totalChannels || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-blue-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Verified
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading ? "..." : stats?.verifiedChannels || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-purple-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Subscribers
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading
              ? "..."
              : (stats?.totalSubscribers || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-pink-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Videos
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading ? "..." : (stats?.totalVideos || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-yellow-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Pending Verification
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading ? "..." : stats?.pendingVerification || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-red-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Disabled
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading ? "..." : stats?.disabledChannels || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-green-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            New This Month
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading ? "..." : stats?.newChannelsThisMonth || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-cyan-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Views
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading ? "..." : (stats?.totalViews || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Date Filter */}
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
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search channels by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Status Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const newFilters = { ...filters, status: "", page: 1 };
              dispatch(setFilters(newFilters));
              dispatch(fetchChannels(newFilters));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !filters.status
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              const newFilters = { ...filters, status: "active", page: 1 };
              dispatch(setFilters(newFilters));
              dispatch(fetchChannels(newFilters));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filters.status === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <CheckCircle size={14} className="inline mr-1" />
            Active
          </button>
          <button
            onClick={() => {
              const newFilters = { ...filters, status: "disabled", page: 1 };
              dispatch(setFilters(newFilters));
              dispatch(fetchChannels(newFilters));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filters.status === "disabled"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <XCircle size={14} className="inline mr-1" />
            Disabled
          </button>
          <button
            onClick={() => {
              const newFilters = {
                ...filters,
                verified: filters.verified === "true" ? "" : "true",
                page: 1,
              };
              dispatch(setFilters(newFilters));
              dispatch(fetchChannels(newFilters));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filters.verified === "true"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Award size={14} className="inline mr-1" />
            Verified Only
          </button>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={displayChannels} loading={loading} />

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.lastPage}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Channel Detail Modal */}
      <ChannelDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        channel={
          selectedChannel
            ? {
                ...selectedChannel,
                status: selectedChannel.isDisabled ? "disabled" : "active",
                isVerified: selectedChannel.verificationStatus === "verified",
                ownerName: selectedChannel.owner?.name || "Unknown",
                ownerEmail: selectedChannel.owner?.email || "",
                ownerPhone: selectedChannel.owner?.phone || "",
                logo: getImageUrl(selectedChannel.avatar),
                banner: getImageUrl(selectedChannel.coverImage),
                handle: (selectedChannel.name || "channel")
                  .toLowerCase()
                  .replace(/\s+/g, ""),
              }
            : null
        }
        onEdit={handleEditChannel}
        onDisable={(id) => handleDisableChannel(Number(id))}
        onEnable={(id) => handleEnableChannel(Number(id))}
      />

      {/* Edit Channel Modal */}
      <ChannelModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingChannel(null);
        }}
        onSubmit={handleUpdateChannel}
        editChannel={
          editingChannel
            ? {
                ...editingChannel,
                status: editingChannel.isDisabled ? "disabled" : "active",
                isVerified: editingChannel.verificationStatus === "verified",
              }
            : null
        }
      />

      {/* Disable Channel Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
          disableModal.isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setDisableModal({ isOpen: false, channelId: null });
            setDisableReason("");
          }}
        ></div>
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Disable Channel
          </h2>
          <p className="text-gray-600 mb-6">
            Please provide a reason for disabling this channel. This will be
            visible to the channel owner.
          </p>
          <textarea
            value={disableReason}
            onChange={(e) => setDisableReason(e.target.value)}
            placeholder="Enter reason for disabling (e.g., violates community guidelines, copyright issues, spam content...)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 min-h-30 resize-none"
          />
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setDisableModal({ isOpen: false, channelId: null });
                setDisableReason("");
              }}
              className="flex-1"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDisable}
              className="flex-1"
              disabled={actionLoading}
            >
              {actionLoading ? "Disabling..." : "Disable Channel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Channels;
