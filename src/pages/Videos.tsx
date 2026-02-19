import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Table } from "../components/Table";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { VideoModal } from "../components/VideoModal";
import { VideoDetailModal } from "../components/VideoDetailModal";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import { videosService } from "../services/videosService";
import {
  Trash2,
  Search,
  Eye,
  Edit,
  Play,
  Filter,
  Video as VideoIcon,
  X,
  ThumbsUp,
  DollarSign,
  Ban,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { limitCharacters } from "../utils/textHelpers";

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  media: string | null;
  duration: number;
  category: string;
  categoryId: number;
  tags: string;
  isPublic: boolean;
  forKids: number;
  copyright: boolean;
  isPaid: boolean;
  price: number;
  currency: string;
  status: string;
  disableReason?: string;
  isDeleted: number;
  views: number;
  likes: number;
  comments: number;
  channelId: number;
  channelName: string;
  channelAvatar: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalVideos: number;
  totalDisabled: number;
  totalViews: number;
  totalLikes: number;
  totalPaid: number;
  totalFree: number;
  totalForKids: number;
  categories: { name: string; count: number }[];
}

interface Category {
  id: number | string;
  name: string;
}

export const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPaid, setFilterPaid] = useState("all");
  const [filterKids, setFilterKids] = useState("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [playlistFilter, setPlaylistFilter] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    videoId: string | null;
  }>({ isOpen: false, videoId: null });
  const [disableModal, setDisableModal] = useState<{
    isOpen: boolean;
    videoId: string | null;
  }>({ isOpen: false, videoId: null });
  const [disableReason, setDisableReason] = useState("");
  const [urlParamsLoaded, setUrlParamsLoaded] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const limit = 20;

  // Stats
  const [stats, setStats] = useState<Stats>({
    totalVideos: 0,
    totalDisabled: 0,
    totalViews: 0,
    totalLikes: 0,
    totalPaid: 0,
    totalFree: 0,
    totalForKids: 0,
    categories: [],
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
        status: filterStatus,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (filterCategory !== "all") {
        params.category = filterCategory;
        console.log("Filtering by category:", filterCategory);
      }
      if (filterPaid !== "all") params.isPaid = filterPaid;
      if (filterKids !== "all") params.forKids = filterKids;
      if (startDate) params.startDate = startDate.toISOString().split("T")[0];
      if (endDate) params.endDate = endDate.toISOString().split("T")[0];

      const response = await videosService.getVideos(params);
      console.log("API Response:", response);
      console.log("Response data:", response.data);
      if (response.data.status && response.data.data) {
        console.log("Videos array:", response.data.data);
        setVideos(response.data.data);
        setTotalPages(response.data.meta?.lastPage || 1);
        setTotalVideos(response.data.meta?.total || 0);
      }
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      toast.error(error.response?.data?.message || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    filterStatus,
    filterCategory,
    filterPaid,
    filterKids,
    startDate,
    endDate,
  ]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await videosService.getStats();
      if (response.data.status && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await videosService.getCategories();
      console.log("Categories response:", response.data);
      if (response.data.status && response.data.data) {
        console.log("Categories:", response.data.data);
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  // Handle playlist and category filters from URL params FIRST
  useEffect(() => {
    const playlistId = searchParams.get("playlist");
    if (playlistId) {
      setPlaylistFilter(playlistId);
    }

    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setFilterCategory(categoryParam);
    }

    // Mark URL params as loaded
    setUrlParamsLoaded(true);
  }, [searchParams]);

  // Fetch videos when filters change (only after URL params are loaded)
  useEffect(() => {
    if (urlParamsLoaded) {
      fetchVideos();
    }
  }, [fetchVideos, urlParamsLoaded]);

  // Reset page when filters change
  useEffect(() => {
    if (urlParamsLoaded) {
      setCurrentPage(1);
    }
  }, [
    debouncedSearch,
    filterStatus,
    filterCategory,
    filterPaid,
    filterKids,
    startDate,
    endDate,
    urlParamsLoaded,
  ]);

  const handleEditVideo = (video: any) => {
    setEditingVideo(video);
    setShowVideoModal(true);
    setShowDetailModal(false);
  };

  const handleUpdateVideo = async (videoData: any) => {
    try {
      const response = await videosService.updateVideo(
        String(editingVideo.id),
        videoData,
      );
      if (response.data.status) {
        toast.success("Video updated successfully");
        setShowVideoModal(false);
        setEditingVideo(null);
        fetchVideos();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Error updating video:", error);
      toast.error(error.response?.data?.message || "Failed to update video");
    }
  };

  const handleViewVideo = async (video: any) => {
    try {
      // Fetch full video details
      const response = await videosService.getVideoById(String(video.id));
      if (response.data.status && response.data.data) {
        setSelectedVideo(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      console.error("Error fetching video details:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch video details",
      );
    }
  };

  const handleEnableVideo = async (videoId: string) => {
    try {
      const response = await videosService.enableVideo(videoId);
      if (response.data.status) {
        toast.success("Video enabled successfully");
        setShowDetailModal(false);
        fetchVideos();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Error enabling video:", error);
      toast.error(error.response?.data?.message || "Failed to enable video");
    }
  };

  const handleDisableVideo = (videoId: string) => {
    setDisableModal({ isOpen: true, videoId });
    setShowDetailModal(false);
  };

  const confirmDisable = async () => {
    if (disableModal.videoId && disableReason.trim()) {
      try {
        const response = await videosService.disableVideo(
          disableModal.videoId,
          disableReason,
        );
        if (response.data.status) {
          toast.success("Video disabled successfully");
          setDisableModal({ isOpen: false, videoId: null });
          setDisableReason("");
          fetchVideos();
          fetchStats();
        }
      } catch (error: any) {
        console.error("Error disabling video:", error);
        toast.error(error.response?.data?.message || "Failed to disable video");
      }
    } else {
      toast.error("Please provide a reason for disabling the video");
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    setConfirmModal({ isOpen: true, videoId });
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    if (confirmModal.videoId) {
      try {
        const response = await videosService.deleteVideo(confirmModal.videoId);
        if (response.data.status) {
          toast.success("Video deleted successfully");
          setConfirmModal({ isOpen: false, videoId: null });
          fetchVideos();
          fetchStats();
        }
      } catch (error: any) {
        console.error("Error deleting video:", error);
        toast.error(error.response?.data?.message || "Failed to delete video");
      }
    }
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setEditingVideo(null);
  };

  const clearPlaylistFilter = () => {
    setPlaylistFilter(null);
    searchParams.delete("playlist");
    searchParams.delete("playlistName");
    setSearchParams(searchParams);
  };

  const clearCategoryFilter = () => {
    setFilterCategory("all");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterCategory("all");
    setFilterPaid("all");
    setFilterKids("all");
    setStartDate(null);
    setEndDate(null);
    setPlaylistFilter(null);
    searchParams.delete("playlist");
    searchParams.delete("playlistName");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      searchTerm.trim() !== "" ||
      filterStatus !== "all" ||
      filterCategory !== "all" ||
      filterPaid !== "all" ||
      filterKids !== "all" ||
      startDate !== null ||
      endDate !== null ||
      playlistFilter !== null
    );
  };

  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value: number) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs sm:text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200 whitespace-nowrap">
            #{value}
          </span>
        </div>
      ),
    },
    {
      key: "thumbnail",
      label: "Thumbnail",
      render: (value: string, row: any) => (
        <div
          className="w-20 sm:w-24 h-12 sm:h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all relative shrink-0"
          onClick={() => handleViewVideo(row)}
        >
          {" "}
          {value ? (
            <img
              src={value}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play size={20} className="text-gray-400" />
            </div>
          )}
          {row.duration && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              {formatDuration(row.duration)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (value: string, row: any) => (
        <div className="max-w-45 sm:max-w-50 md:max-w-xs">
          {" "}
          <p
            className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer text-xs sm:text-sm"
            onClick={() => handleViewVideo(row)}
            title={value}
          >
            {limitCharacters(value, 30)}
          </p>
          <p className="text-xs text-gray-500" title={row.channelName}>
            {limitCharacters(row.channelName, 25)}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value: string) => (
        <span className="inline-flex px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-semibold border border-blue-200 whitespace-nowrap">
          {value || "Uncategorized"}
        </span>
      ),
    },
    {
      key: "views",
      label: "Views",
      render: (value: number) => (
        <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
          <Eye size={12} className="text-gray-500 hidden sm:block" />
          <span className="font-semibold text-xs sm:text-sm">
            {value?.toLocaleString() || 0}
          </span>
        </div>
      ),
    },
    {
      key: "likes",
      label: "Likes",
      render: (value: number) => (
        <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
          <ThumbsUp size={12} className="text-gray-500 hidden sm:block" />
          <span className="font-semibold text-xs sm:text-sm">
            {value?.toLocaleString() || 0}
          </span>
        </div>
      ),
    },
    {
      key: "isPaid",
      label: "Type",
      render: (value: boolean, row: any) => (
        <div className="flex flex-col gap-1.5">
          {value ? (
            <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold items-center gap-1 whitespace-nowrap">
              <DollarSign size={10} />
              <span className="hidden sm:inline">
                {row.price} {row.currency || "USD"}
              </span>
              <span className="sm:hidden">Paid</span>
            </span>
          ) : (
            <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-bold whitespace-nowrap">
              Free
            </span>
          )}
          {row.forKids === 1 && (
            <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold whitespace-nowrap">
              Kids
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Uploaded",
      render: (value: string) => (
        <span className="text-xs sm:text-sm whitespace-nowrap">
          {new Date(value).toLocaleDateString("en-US", {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => (
        <div className="relative group">
          <span
            className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
              value === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value?.toUpperCase()}
          </span>
          {value === "disabled" && row.disableReason && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-normal w-64 pointer-events-none">
              <div className="font-semibold mb-1">Disable Reason:</div>
              <div>{row.disableReason}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-1 flex-wrap">
          {" "}
          <PermissionGuard permissions={["videos.view"]}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleViewVideo(row)}
              title="View"
            >
              <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={["videos.edit"]}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleEditVideo(row)}
              title="Edit"
            >
              <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={["videos.disable"]}>
            {row.status === "active" ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDisableVideo(String(row.id))}
                title="Disable"
              >
                <Ban size={12} className="sm:w-3.5 sm:h-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="success"
                onClick={() => handleEnableVideo(String(row.id))}
                title="Enable"
              >
                <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
              </Button>
            )}
          </PermissionGuard>
          <PermissionGuard permissions={["videos.delete"]}>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDeleteVideo(String(row.id))}
              title="Delete"
            >
              <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-lg font-semibold text-gray-700">
              Loading videos...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we fetch the data
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <VideoIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-5xl font-black text-white">
                  Video Management
                </h1>
              </div>
              <p className="text-xl text-blue-100 font-medium">
                Moderate and manage all user-uploaded videos
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                fetchVideos();
                fetchStats();
              }}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Total Videos
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalVideos.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-red-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Disabled
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalDisabled.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Total Views
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-pink-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Total Likes
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalLikes.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Paid Videos
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-cyan-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Kids Content
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalForKids.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div className="flex gap-3 sm:gap-4 flex-col">
          {/* Date Range Filter */}
          <div className="pb-4 border-b border-gray-200">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          {/* Playlist Filter Indicator */}
          {playlistFilter && (
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <VideoIcon size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Filtered by Playlist
                    </p>
                    <p className="text-xs text-gray-600">
                      {searchParams.get("playlistName") || "Unknown Playlist"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={clearPlaylistFilter}
                >
                  <X size={14} className="mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Category Filter Indicator */}
          {filterCategory !== "all" && searchParams.get("category") && (
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Filtered by Category
                    </p>
                    <p className="text-xs text-gray-600">{filterCategory}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={clearCategoryFilter}
                >
                  <X size={14} className="mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Search and Other Filters */}
          <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row flex-wrap">
            <div className="relative flex-1 min-w-50">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={filterPaid}
              onChange={(e) => setFilterPaid(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
            >
              <option value="all">All Types</option>
              <option value="paid">Paid Only</option>
              <option value="free">Free Only</option>
            </select>
            <select
              value={filterKids}
              onChange={(e) => setFilterKids(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
            >
              <option value="all">All Audiences</option>
              <option value="kids">Kids Content</option>
              <option value="general">General Content</option>
            </select>
            {hasActiveFilters() && (
              <Button
                variant="danger"
                onClick={clearAllFilters}
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                <X size={16} className="mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3 font-medium">
          Showing {videos.length} of {stats.totalVideos} videos{" "}
          {filterStatus !== "all" && `(filtered by ${filterStatus})`}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <Table columns={columns} data={videos} loading={false} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages} ({stats.totalVideos}{" "}
            total videos)
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
                        ? "bg-blue-600 text-white"
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

      {/* Video Modal - For Editing Only */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={handleCloseVideoModal}
        onSubmit={handleUpdateVideo}
        editVideo={editingVideo}
        categories={categories}
      />

      {/* Video Detail Modal */}
      <VideoDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        video={selectedVideo}
        onEdit={handleEditVideo}
        onDelete={handleDeleteVideo}
        onDisable={handleDisableVideo}
        onEnable={handleEnableVideo}
      />

      {/* Disable Video Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
          disableModal.isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setDisableModal({ isOpen: false, videoId: null });
            setDisableReason("");
          }}
        ></div>
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Disable Video
          </h2>
          <p className="text-gray-600 mb-6">
            Please provide a reason for disabling this video. This will be
            visible to the creator.
          </p>
          <textarea
            value={disableReason}
            onChange={(e) => setDisableReason(e.target.value)}
            placeholder="Enter reason for disabling (e.g., violates community guidelines, copyright issue, inappropriate content...)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 min-h-30 resize-none"
          />
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setDisableModal({ isOpen: false, videoId: null });
                setDisableReason("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDisable}
              className="flex-1"
            >
              Disable Video
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, videoId: null })}
        onConfirm={confirmDelete}
        title="Delete Video"
        message="Are you sure you want to permanently delete this video? This action cannot be undone and will also remove all views, likes, and comments."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Videos;
