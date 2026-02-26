import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Eye,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Loader2,
  X,
  ExternalLink,
  Calendar,
  User,
  MonitorPlay,
  LayoutGrid,
  Zap,
  Clock,
  BadgeCheck,
  Ban,
  CircleDollarSign,
  ImageIcon,
  VideoIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  PowerOff,
  Play,
  MapPin,
  Layers,
  DollarSign,
  RotateCcw,
  Archive,
} from "lucide-react";
import {
  getAllBookings,
  getDeletedBookings,
  approveBooking,
  rejectBooking,
  disableBooking,
  enableBooking,
  deleteBooking,
  restoreBooking,
  permanentDeleteBooking,
  AdBooking,
  BookingStats,
  BookingStatus,
} from "../services/adBookingsService";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { PermissionGuard } from "../components/ProtectedRoute";

/* â”€â”€â”€ Status config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    badge:
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700",
    icon: <Zap size={11} />,
  },
  approved: {
    label: "Approved",
    badge:
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700",
    icon: <BadgeCheck size={11} />,
  },
  payment_pending: {
    label: "Payment Pending",
    badge:
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700",
    icon: <Clock size={11} />,
  },
  completed: {
    label: "Completed",
    badge:
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600",
    icon: <CheckCircle size={11} />,
  },
  rejected: {
    label: "Rejected",
    badge:
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700",
    icon: <Ban size={11} />,
  },
  disabled: {
    label: "Disabled",
    badge:
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700",
    icon: <PowerOff size={11} />,
  },
};

/* â”€â”€â”€ Stat card config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STAT_CARDS: {
  key: string;
  label: string;
  statKey: keyof BookingStats;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  activeBorder: string;
}[] = [
  {
    key: "",
    label: "All",
    statKey: "total",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: <LayoutGrid size={20} />,
    activeBorder: "border-purple-500 ring-2 ring-purple-200",
  },
  {
    key: "active",
    label: "Active",
    statKey: "active",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: <Zap size={20} />,
    activeBorder: "border-green-500 ring-2 ring-green-200",
  },
  {
    key: "approved",
    label: "Approved",
    statKey: "approved",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: <BadgeCheck size={20} />,
    activeBorder: "border-blue-500 ring-2 ring-blue-200",
  },
  {
    key: "payment_pending",
    label: "Pending",
    statKey: "payment_pending",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    icon: <Clock size={20} />,
    activeBorder: "border-yellow-500 ring-2 ring-yellow-200",
  },
  {
    key: "completed",
    label: "Completed",
    statKey: "completed",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    icon: <CheckCircle size={20} />,
    activeBorder: "border-gray-400 ring-2 ring-gray-200",
  },
  {
    key: "rejected",
    label: "Rejected",
    statKey: "rejected",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    icon: <Ban size={20} />,
    activeBorder: "border-red-500 ring-2 ring-red-200",
  },
];

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const AdBookings = () => {
  const [bookings, setBookings] = useState<AdBooking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    active: 0,
    approved: 0,
    payment_pending: 0,
    completed: 0,
    rejected: 0,
    disabled: 0,
    deleted: 0,
  });
  const [viewMode, setViewMode] = useState<"live" | "trash">("live");
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const navigate = useNavigate();

  const [viewingBooking, setViewingBooking] = useState<AdBooking | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [disablingId, setDisablingId] = useState<number | null>(null);
  const [enablingId, setEnablingId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [permDeletingId, setPermDeletingId] = useState<number | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (viewMode === "trash") {
        const response = await getDeletedBookings({
          page: currentPage,
          limit: 15,
          search: searchQuery || undefined,
        });
        if (response.data?.status) {
          setBookings(response.data.data || []);
          setMeta(response.data.meta || null);
        }
      } else {
        const response = await getAllBookings({
          page: currentPage,
          limit: 15,
          status: statusFilter || undefined,
          search: searchQuery || undefined,
        });
        if (response.data?.status) {
          setBookings(response.data.data || []);
          setMeta(response.data.meta || null);
          if (response.data.stats) setStats(response.data.stats);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch ad bookings");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, viewMode]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleStatFilter = (key: string) => {
    setStatusFilter(key);
    setCurrentPage(1);
  };

  const handleApprove = async () => {
    if (!approvingId) return;
    setProcessing(approvingId);
    try {
      await approveBooking(approvingId);
      toast.success(
        "Booking approved â€” ad will go live on its scheduled date",
      );
      setApprovingId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve booking");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    setProcessing(rejectingId);
    try {
      await rejectBooking(rejectingId, rejectReason);
      toast.success("Booking rejected");
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason("");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (id: number) => {
    setRejectingId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setProcessing(deletingId);
    try {
      await deleteBooking(deletingId);
      toast.success("Booking moved to trash");
      setDeletingId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete booking");
    } finally {
      setProcessing(null);
    }
  };

  const handleDisable = async () => {
    if (!disablingId) return;
    setProcessing(disablingId);
    try {
      await disableBooking(disablingId);
      toast.success("Ad disabled — status set to Disabled");
      setDisablingId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to disable booking");
    } finally {
      setProcessing(null);
    }
  };

  const switchToTrash = () => {
    setViewMode("trash");
    setStatusFilter("");
    setSearchQuery("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const switchToLive = () => {
    setViewMode("live");
    setSearchQuery("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const handleRestore = async () => {
    if (!restoringId) return;
    setProcessing(restoringId);
    try {
      await restoreBooking(restoringId);
      toast.success("Booking restored from trash");
      setRestoringId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to restore booking");
    } finally {
      setProcessing(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permDeletingId) return;
    setProcessing(permDeletingId);
    try {
      await permanentDeleteBooking(permDeletingId);
      toast.success("Booking permanently deleted");
      setPermDeletingId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to permanently delete",
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleEnable = async () => {
    if (!enablingId) return;
    setProcessing(enablingId);
    try {
      await enableBooking(enablingId);
      toast.success("Ad activated — status set to Active");
      setEnablingId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to enable booking");
    } finally {
      setProcessing(null);
    }
  };

  const totalPages = meta ? Math.ceil(meta.total / (meta.perPage || 15)) : 1;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* â”€â”€ Hero Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative overflow-hidden bg-linear-to-r from-purple-700 via-violet-700 to-purple-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl">
                <MonitorPlay className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Ad Bookings
              </h1>
            </div>
            <p className="text-purple-200 font-medium">
              Review, approve and manage all advertiser campaign bookings
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => fetchBookings()}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* â”€â”€ Stat Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((card) => {
          const isActive = statusFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => handleStatFilter(card.key)}
              className={`bg-white rounded-2xl shadow-md p-4 border-2 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none ${
                isActive
                  ? card.activeBorder
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className={`p-2.5 rounded-xl w-fit mb-3 ${card.iconBg}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-black text-gray-900">
                {stats[card.statKey]}
              </p>
            </button>
          );
        })}
      </div>

      {/* -- Secondary chips: Disabled + Trash -- */}
      <div className="flex items-center justify-between -mt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStatusFilter("disabled");
              setViewMode("live");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              viewMode === "live" && statusFilter === "disabled"
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50"
            }`}
          >
            <PowerOff size={11} />
            Disabled
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                viewMode === "live" && statusFilter === "disabled"
                  ? "bg-white/25 text-white"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {stats.disabled}
            </span>
          </button>
          <button
            onClick={() =>
              viewMode === "trash" ? switchToLive() : switchToTrash()
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              viewMode === "trash"
                ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
            }`}
          >
            <Archive size={11} />
            Trash
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                viewMode === "trash"
                  ? "bg-white/25 text-white"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {stats.deleted}
            </span>
          </button>
        </div>
        {viewMode === "trash" && (
          <button
            onClick={switchToLive}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-700 font-medium transition-colors"
          >
            <RotateCcw size={12} />
            Back to Live Bookings
          </button>
        )}
      </div>

      {/* -- Trash banner -- */}
      {viewMode === "trash" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700">
          <Archive size={16} className="shrink-0" />
          <span className="font-semibold">Trash</span>
          <span className="text-rose-500">
            — Deleted bookings are shown here. Restore to bring them back, or
            permanently delete to remove forever.
          </span>
        </div>
      )}

      {/* â”€â”€ Search Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by ad titleâ€¦"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm"
            />
          </div>
          <Button type="submit" variant="primary">
            <Search size={14} className="mr-2" />
            Search
          </Button>
          {(searchQuery || statusFilter) && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setStatusFilter("");
                setCurrentPage(1);
              }}
            >
              <X size={14} className="mr-2" />
              Clear
            </Button>
          )}
        </form>
        {statusFilter && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">Filtered:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              {STATUS_CONFIG[statusFilter as BookingStatus]?.label ??
                STAT_CARDS.find((c) => c.key === statusFilter)?.label ??
                statusFilter}
              <button
                onClick={() => setStatusFilter("")}
                className="hover:opacity-70"
              >
                <X size={11} />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* â”€â”€ Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 size={32} className="animate-spin text-purple-500" />
            <p className="text-sm font-medium">Loading bookingsâ€¦</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <MonitorPlay size={48} className="opacity-20" />
            <p className="text-sm font-medium">No ad bookings found</p>
            {(statusFilter || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setSearchQuery("");
                  setSearchInput("");
                }}
                className="text-purple-600 text-xs hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "#",
                    "Ad Campaign",
                    "Advertiser",
                    "Slot / Page",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const sc = STATUS_CONFIG[booking.status];
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-purple-50/30 transition-colors"
                    >
                      {/* ID */}
                      <td className="px-5 py-4 text-sm text-gray-400 font-mono">
                        #{booking.id}
                      </td>

                      {/* Campaign */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                            {booking.mediaType === "video" ? (
                              <VideoIcon
                                size={14}
                                className="text-purple-600"
                              />
                            ) : (
                              <ImageIcon
                                size={14}
                                className="text-purple-600"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                              {booking.title}
                            </p>
                            {booking.description && (
                              <p className="text-xs text-gray-400 mt-0.5 max-w-44 truncate">
                                {booking.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Advertiser */}
                      <td className="px-5 py-4">
                        {booking.user ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                              <User size={13} className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 leading-tight">
                                {booking.user.fullName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {booking.user.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">â€”</span>
                        )}
                      </td>

                      {/* Slot / Page */}
                      <td className="px-5 py-4">
                        {booking.adSlot ? (
                          <button
                            onClick={() =>
                              booking.adSlot?.adPage &&
                              navigate(`/ad-slots/${booking.adSlot.adPage.id}`)
                            }
                            className="group text-left w-full max-w-42.5"
                            title={`Go to ${booking.adSlot.adPage?.name ?? "slot page"}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5 p-1.5 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors shrink-0">
                                <Layers size={11} className="text-purple-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 leading-tight truncate group-hover:text-purple-700 transition-colors">
                                  {booking.adSlot.title}
                                </p>
                                {booking.adSlot.adPage && (
                                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-medium w-full">
                                    <MapPin size={8} className="shrink-0" />
                                    <span className="truncate">
                                      {booking.adSlot.adPage.name}
                                    </span>
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                                  <DollarSign size={8} />
                                  {booking.adSlot.price}
                                </span>
                              </div>
                            </div>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">â€”</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={sc.badge}>
                          {sc.icon}
                          {sc.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
                          <Calendar size={13} className="text-gray-400" />
                          {formatDate(booking.scheduledDate)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {/* View — live mode only */}
                          {viewMode !== "trash" && (
                            <button
                              onClick={() => setViewingBooking(booking)}
                              title="View details"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                          )}

                          {/* TRASH MODE actions */}
                          {viewMode === "trash" && (
                            <PermissionGuard
                              permissions={["advertisements_update"]}
                            >
                              <button
                                onClick={() => setRestoringId(booking.id)}
                                disabled={processing === booking.id}
                                title="Restore from trash"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-40 transition-colors"
                              >
                                {processing === booking.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={13} />
                                )}
                              </button>
                              <button
                                onClick={() => setPermDeletingId(booking.id)}
                                disabled={processing === booking.id}
                                title="Permanently delete"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 disabled:opacity-40 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </PermissionGuard>
                          )}

                          {/* LIVE MODE actions */}
                          {viewMode !== "trash" && (
                            <>
                              {/* Approve */}
                              {booking.status === "payment_pending" && (
                                <PermissionGuard
                                  permissions={["advertisements_update"]}
                                >
                                  <button
                                    onClick={() => setApprovingId(booking.id)}
                                    disabled={processing === booking.id}
                                    title="Approve booking"
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 disabled:opacity-40 transition-colors"
                                  >
                                    {processing === booking.id ? (
                                      <Loader2
                                        size={13}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle size={14} />
                                    )}
                                  </button>
                                </PermissionGuard>
                              )}

                              {/* Reject */}
                              {(booking.status === "payment_pending" ||
                                booking.status === "approved" ||
                                booking.status === "active" ||
                                booking.status === "disabled") && (
                                <PermissionGuard
                                  permissions={["advertisements_update"]}
                                >
                                  <button
                                    onClick={() => openRejectModal(booking.id)}
                                    disabled={processing === booking.id}
                                    title="Reject booking"
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-40 transition-colors"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                </PermissionGuard>
                              )}

                              {/* Disable (active → disabled) */}
                              {booking.status === "active" && (
                                <PermissionGuard
                                  permissions={["advertisements_update"]}
                                >
                                  <button
                                    onClick={() => setDisablingId(booking.id)}
                                    disabled={processing === booking.id}
                                    title="Pause / disable ad"
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-500 disabled:opacity-40 transition-colors"
                                  >
                                    <PowerOff size={13} />
                                  </button>
                                </PermissionGuard>
                              )}

                              {/* Enable (approved → active / disabled → active) */}
                              {(booking.status === "approved" ||
                                booking.status === "disabled") && (
                                <PermissionGuard
                                  permissions={["advertisements_update"]}
                                >
                                  <button
                                    onClick={() => setEnablingId(booking.id)}
                                    disabled={processing === booking.id}
                                    title="Enable / go live now"
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-40 transition-colors"
                                  >
                                    <Play size={13} />
                                  </button>
                                </PermissionGuard>
                              )}

                              {/* Delete → trash */}
                              <PermissionGuard
                                permissions={["advertisements_update"]}
                              >
                                <button
                                  onClick={() => setDeletingId(booking.id)}
                                  disabled={processing === booking.id}
                                  title="Move to trash"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 disabled:opacity-40 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </PermissionGuard>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && meta && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {(currentPage - 1) * (meta.perPage || 15) + 1}â€“
                {Math.min(currentPage * (meta.perPage || 15), meta.total)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">{meta.total}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page =
                  totalPages <= 5
                    ? i + 1
                    : currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition ${
                      page === currentPage
                        ? "bg-purple-600 text-white border-purple-600 shadow"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* â•â•â•â• Detail Modal â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-xl">
                  <MonitorPlay size={17} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    Booking Details
                  </h2>
                  <p className="text-xs text-gray-400">
                    Campaign #{viewingBooking.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={17} className="text-gray-500" />
              </button>
            </div>

            <div className="p-7 space-y-5">
              {/* Status + created */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={STATUS_CONFIG[viewingBooking.status].badge}>
                  {STATUS_CONFIG[viewingBooking.status].icon}
                  {STATUS_CONFIG[viewingBooking.status].label}
                </span>
                <span className="text-xs text-gray-400">
                  Booked {formatDate(viewingBooking.createdAt)}
                </span>
              </div>

              {/* Media */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  {viewingBooking.mediaType === "video" ? (
                    <>
                      <VideoIcon size={12} /> Video Creative
                    </>
                  ) : (
                    <>
                      <ImageIcon size={12} /> Image Creative
                    </>
                  )}
                </p>
                {viewingBooking.mediaUrl ? (
                  viewingBooking.mediaType === "image" ? (
                    <img
                      src={viewingBooking.mediaUrl}
                      alt="Ad creative"
                      className="w-full max-h-52 object-contain rounded-xl border border-gray-200"
                    />
                  ) : (
                    <video
                      src={viewingBooking.mediaUrl}
                      controls
                      className="w-full max-h-52 rounded-xl border border-gray-200 bg-gray-900"
                    />
                  )
                ) : (
                  <p className="text-sm text-gray-400">No media uploaded</p>
                )}
              </div>

              {/* Campaign details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Title
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {viewingBooking.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Scheduled
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Calendar size={13} className="text-purple-500" />
                    {formatDate(viewingBooking.scheduledDate)}
                  </div>
                </div>
              </div>

              {viewingBooking.description && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                    {viewingBooking.description}
                  </p>
                </div>
              )}

              {viewingBooking.websiteUrl && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Destination URL
                  </p>
                  <a
                    href={viewingBooking.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    {viewingBooking.websiteUrl}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Advertiser */}
              {viewingBooking.user && (
                <div className="bg-indigo-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User size={12} /> Advertiser
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center shrink-0">
                      <User size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {viewingBooking.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {viewingBooking.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Slot & Page */}
              {viewingBooking.adSlot && (
                <div className="bg-purple-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CircleDollarSign size={12} /> Ad Slot
                  </p>
                  <p className="font-bold text-gray-900">
                    {viewingBooking.adSlot.title}
                  </p>
                  {viewingBooking.adSlot.adPage && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      Page:{" "}
                      <span className="font-medium">
                        {viewingBooking.adSlot.adPage.name}
                      </span>{" "}
                      <span className="text-gray-400">
                        ({viewingBooking.adSlot.adPage.slug})
                      </span>
                    </p>
                  )}
                  <p className="text-sm font-bold text-purple-700 mt-1">
                    ${viewingBooking.adSlot.price}
                  </p>
                </div>
              )}

              {/* Modal actions */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {viewingBooking.status === "payment_pending" && (
                    <PermissionGuard permissions={["advertisements_update"]}>
                      <button
                        onClick={() => {
                          setViewingBooking(null);
                          setApprovingId(viewingBooking.id);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm transition-all"
                      >
                        <CheckCircle size={15} /> Approve
                      </button>
                    </PermissionGuard>
                  )}
                  {(viewingBooking.status === "payment_pending" ||
                    viewingBooking.status === "approved" ||
                    viewingBooking.status === "active") && (
                    <PermissionGuard permissions={["advertisements_update"]}>
                      <button
                        onClick={() => {
                          setViewingBooking(null);
                          openRejectModal(viewingBooking.id);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm transition-all"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </PermissionGuard>
                  )}
                  {viewingBooking.status === "active" && (
                    <PermissionGuard permissions={["advertisements_update"]}>
                      <button
                        onClick={() => {
                          setViewingBooking(null);
                          setDisablingId(viewingBooking.id);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-semibold border border-orange-200 transition-all"
                      >
                        <PowerOff size={15} /> Disable
                      </button>
                    </PermissionGuard>
                  )}
                  {viewingBooking.status === "approved" && (
                    <PermissionGuard permissions={["advertisements_update"]}>
                      <button
                        onClick={() => {
                          setViewingBooking(null);
                          setEnablingId(viewingBooking.id);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold border border-green-200 transition-all"
                      >
                        <Play size={15} /> Enable
                      </button>
                    </PermissionGuard>
                  )}
                  <PermissionGuard permissions={["advertisements_update"]}>
                    <button
                      onClick={() => {
                        setViewingBooking(null);
                        setDeletingId(viewingBooking.id);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold border border-rose-200 transition-all"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </PermissionGuard>
                  <button
                    onClick={() => setViewingBooking(null)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-all ml-auto"
                  >
                    <X size={15} /> Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* â•â•â•â• Approve Confirm â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <ConfirmModal
        isOpen={!!approvingId}
        title="Approve Ad Booking"
        message="Are you sure you want to approve this booking? The ad will go live automatically on its scheduled date."
        onConfirm={handleApprove}
        onClose={() => setApprovingId(null)}
      />

      {/* ════ Delete Confirm ════════════════════════════════════ */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Move to Trash"
        message="Are you sure you want to move this booking to trash? You can restore it later from the Trash view."
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />

      {/* ════ Disable Confirm ═══════════════════════════════════ */}
      <ConfirmModal
        isOpen={!!disablingId}
        title="Disable Active Ad"
        message="This will pause the currently active ad and set its status to Disabled. Are you sure?"
        onConfirm={handleDisable}
        onClose={() => setDisablingId(null)}
      />

      {/* ════ Enable Confirm ════════════════════════════════════ */}
      <ConfirmModal
        isOpen={!!enablingId}
        title="Enable Ad"
        message="This will manually activate this booking, setting its status to Active. Are you sure?"
        onConfirm={handleEnable}
        onClose={() => setEnablingId(null)}
      />

      {/* ════ Restore Confirm ═══════════════════════════════════ */}
      <ConfirmModal
        isOpen={!!restoringId}
        title="Restore Booking"
        message="Are you sure you want to restore this booking from trash? It will become visible again in your bookings list."
        onConfirm={handleRestore}
        onClose={() => setRestoringId(null)}
      />

      {/* ════ Permanent Delete Confirm ══════════════════════════ */}
      <ConfirmModal
        isOpen={!!permDeletingId}
        title="Permanently Delete"
        message="This will permanently remove the booking from the database and cannot be undone. Are you absolutely sure?"
        onConfirm={handlePermanentDelete}
        onClose={() => setPermDeletingId(null)}
      />

      {/* â•â•â•â• Reject Modal â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fadeIn">
            <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 rounded-xl">
                  <XCircle size={17} className="text-red-600" />
                </div>
                <h2 className="text-lg font-black text-gray-900">
                  Reject Booking
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={17} className="text-gray-500" />
              </button>
            </div>
            <div className="p-7 space-y-4">
              <p className="text-sm text-gray-500 leading-relaxed">
                Optionally provide a reason for rejection. This may be shown to
                the advertiser.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Reason for rejection (optional)â€¦"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none text-sm"
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  className="border border-gray-200"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingId(null);
                  }}
                  disabled={processing !== null}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={processing !== null}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Rejectingâ€¦
                    </span>
                  ) : (
                    <>
                      <XCircle size={14} className="mr-2" />
                      Confirm Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdBookings;
