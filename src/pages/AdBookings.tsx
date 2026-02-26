import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
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
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const [viewingBooking, setViewingBooking] = useState<AdBooking | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
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
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch ad bookings");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

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
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {booking.adSlot.title}
                            </p>
                            {booking.adSlot.adPage && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {booking.adSlot.adPage.name}
                              </p>
                            )}
                            <p className="text-xs text-purple-600 font-bold mt-0.5">
                              ${booking.adSlot.price}
                            </p>
                          </div>
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
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingBooking(booking)}
                            className="text-xs border border-gray-200 hover:border-purple-300 hover:text-purple-700"
                          >
                            <Eye size={13} className="mr-1" />
                            View
                          </Button>

                          {booking.status === "payment_pending" && (
                            <PermissionGuard
                              permissions={["advertisements_update"]}
                            >
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => setApprovingId(booking.id)}
                                disabled={processing === booking.id}
                                className="text-xs"
                              >
                                {processing === booking.id ? (
                                  <Loader2
                                    size={12}
                                    className="animate-spin mr-1"
                                  />
                                ) : (
                                  <CheckCircle size={12} className="mr-1" />
                                )}
                                Approve
                              </Button>
                            </PermissionGuard>
                          )}

                          {(booking.status === "payment_pending" ||
                            booking.status === "approved") && (
                            <PermissionGuard
                              permissions={["advertisements_update"]}
                            >
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => openRejectModal(booking.id)}
                                disabled={processing === booking.id}
                                className="text-xs"
                              >
                                <XCircle size={12} className="mr-1" />
                                Reject
                              </Button>
                            </PermissionGuard>
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
              <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                {viewingBooking.status === "payment_pending" && (
                  <PermissionGuard permissions={["advertisements_update"]}>
                    <Button
                      variant="success"
                      onClick={() => {
                        setViewingBooking(null);
                        setApprovingId(viewingBooking.id);
                      }}
                    >
                      <CheckCircle size={15} className="mr-2" />
                      Approve Booking
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setViewingBooking(null);
                        openRejectModal(viewingBooking.id);
                      }}
                    >
                      <XCircle size={15} className="mr-2" />
                      Reject
                    </Button>
                  </PermissionGuard>
                )}
                {viewingBooking.status === "approved" && (
                  <PermissionGuard permissions={["advertisements_update"]}>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setViewingBooking(null);
                        openRejectModal(viewingBooking.id);
                      }}
                    >
                      <XCircle size={15} className="mr-2" />
                      Reject Booking
                    </Button>
                  </PermissionGuard>
                )}
                <Button
                  variant="ghost"
                  className="border border-gray-200"
                  onClick={() => setViewingBooking(null)}
                >
                  Close
                </Button>
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
