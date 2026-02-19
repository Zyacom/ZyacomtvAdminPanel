import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  User,
  Calendar,
  DollarSign,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import paymentsService, {
  Subscription,
  PackageWithStats,
} from "../services/paymentsService";

// Subscription Detail Modal
interface SubscriptionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onCancel: (id: number) => void;
}

const SubscriptionDetailModal = ({
  isOpen,
  onClose,
  subscription,
  onCancel,
}: SubscriptionDetailModalProps) => {
  if (!isOpen || !subscription) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining(subscription.expiresAt);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">
              Subscription Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <XCircle size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Status</span>
            <span
              className={`px-3 py-1 text-sm font-bold rounded-full ${
                subscription.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {subscription.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Subscription ID */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">
              Subscription ID
            </span>
            <span className="text-sm font-bold text-gray-900">
              #{subscription.id}
            </span>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{subscription.user}</p>
                <p className="text-sm text-gray-500">
                  {subscription.userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Package Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Package</p>
              <p className="text-base font-bold text-gray-900">
                {subscription.packageName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Billing Cycle</p>
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 capitalize">
                {subscription.billingCycle}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-green-600" />
              <span className="text-sm font-medium text-gray-600">Price</span>
            </div>
            <span className="text-xl font-black text-green-600">
              ${subscription.price.toFixed(2)} {subscription.currency}
            </span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Purchased At</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(subscription.purchasedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Expires At</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(subscription.expiresAt)}
              </span>
            </div>
          </div>

          {/* Days Remaining */}
          {subscription.isActive && daysRemaining !== null && (
            <div
              className={`rounded-xl p-4 ${
                daysRemaining <= 7
                  ? "bg-orange-50"
                  : daysRemaining <= 30
                    ? "bg-yellow-50"
                    : "bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    daysRemaining <= 7
                      ? "text-orange-600"
                      : daysRemaining <= 30
                        ? "text-yellow-600"
                        : "text-blue-600"
                  }`}
                >
                  {daysRemaining <= 0
                    ? "Expired"
                    : daysRemaining === 1
                      ? "Expires tomorrow"
                      : `${daysRemaining} days remaining`}
                </span>
                {daysRemaining <= 7 && daysRemaining > 0 && (
                  <AlertTriangle size={18} className="text-orange-500" />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          {subscription.isActive && (
            <PermissionGuard permissions={["subscriptions.manage"]}>
              <Button
                variant="danger"
                onClick={() => onCancel(subscription.id)}
              >
                Cancel Subscription
              </Button>
            </PermissionGuard>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [packages, setPackages] = useState<PackageWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(20);

  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    revenue: 0,
  });

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentsService.getSubscriptions({
        page,
        perPage,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        packageId: packageFilter || undefined,
      });

      if (response) {
        setSubscriptions(response.subscriptions || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotal(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchTerm, statusFilter, packageFilter]);

  // Fetch packages for filter
  const fetchPackages = useCallback(async () => {
    try {
      const response = await paymentsService.getPackages();
      if (response?.packages) {
        setPackages(response.packages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await paymentsService.getStats();
      if (response) {
        setStats({
          total:
            response.activeSubscriptions +
            (response.totalTransactions -
              response.activeSubscriptions -
              response.totalVideoPurchases),
          active: response.activeSubscriptions || 0,
          expired:
            response.totalTransactions -
              response.activeSubscriptions -
              response.totalVideoPurchases || 0,
          revenue: response.subscriptionRevenue || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
    fetchPackages();
    fetchStats();
  }, []);

  // Page change effect
  useEffect(() => {
    fetchSubscriptions();
  }, [page]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSubscriptions();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter changes
  useEffect(() => {
    setPage(1);
    fetchSubscriptions();
  }, [statusFilter, packageFilter]);

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailModal(true);
  };

  const handleCancelSubscription = (id: number) => {
    setCancelTarget(id);
    setShowCancelModal(true);
    setShowDetailModal(false);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;

    try {
      setActionLoading(true);
      await paymentsService.refund(
        cancelTarget.toString(),
        "subscription",
        "Admin cancelled",
      );
      toast.success("Subscription cancelled successfully");
      setShowCancelModal(false);
      setCancelTarget(null);
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
          <CheckCircle size={12} />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
        <XCircle size={12} />
        Inactive
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Subscriptions
            </h1>
            <p className="text-purple-100 font-medium mt-1">
              Manage user subscription plans
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                fetchSubscriptions();
                fetchStats();
              }}
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Total Subscriptions
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-black text-purple-600">
              {stats.total}
            </p>
            <CreditCard size={20} className="text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Active</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-black text-green-600">
              {stats.active}
            </p>
            <CheckCircle size={20} className="text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Expired</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-black text-red-600">
              {stats.expired}
            </p>
            <XCircle size={20} className="text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Revenue</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-black text-blue-600">
              $
              {stats.revenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <DollarSign size={20} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium transition-colors"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Filters:
              </span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium text-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            {/* Package Filter */}
            <select
              value={packageFilter || ""}
              onChange={(e) =>
                setPackageFilter(e.target.value ? Number(e.target.value) : null)
              }
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium text-sm cursor-pointer"
            >
              <option value="">All Packages</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(statusFilter !== "all" || packageFilter || searchTerm) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter("all");
                  setPackageFilter(null);
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      S.No.
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Billing
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <Package
                          size={48}
                          className="mx-auto text-gray-300 mb-4"
                        />
                        <p className="text-gray-500 font-medium">
                          No subscriptions found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Subscriptions will appear here when users subscribe
                        </p>
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub, index) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-700">
                            {(page - 1) * perPage + index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User size={18} className="text-purple-600" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {sub.user}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                {sub.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-purple-500" />
                            <span className="text-sm font-bold text-gray-900">
                              {sub.packageName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 capitalize">
                            {sub.billingCycle}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-black text-green-600">
                            ${sub.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            {sub.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(sub.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(sub.expiresAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <PermissionGuard permissions={["subscriptions.view"]}>
                            <button
                              onClick={() => handleViewSubscription(sub)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={16} className="text-gray-600" />
                            </button>
                          </PermissionGuard>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-bold">{(page - 1) * perPage + 1}</span>{" "}
                  to{" "}
                  <span className="font-bold">
                    {Math.min(page * perPage, total)}
                  </span>{" "}
                  of <span className="font-bold">{total}</span> subscriptions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <span className="px-4 py-2 font-bold text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Subscription Detail Modal */}
      <SubscriptionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        subscription={selectedSubscription}
        onCancel={handleCancelSubscription}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelTarget(null);
        }}
        onConfirm={confirmCancel}
        title="Cancel Subscription"
        message="Are you sure you want to cancel this subscription? This will deactivate the user's subscription immediately."
        confirmText={actionLoading ? "Cancelling..." : "Cancel Subscription"}
        variant="danger"
      />
    </div>
  );
};
