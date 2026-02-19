import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Video,
  Package,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "../components/Button";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { ConfirmModal } from "../components/ConfirmModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import paymentsService, {
  Transaction,
  PaymentStats,
  PackageWithStats,
} from "../services/paymentsService";

// Transaction Detail Modal
interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onRefund: (id: string, type: string) => void;
}

const TransactionDetailModal = ({
  isOpen,
  onClose,
  transaction,
  onRefund,
}: TransactionDetailModalProps) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">
              Transaction Details
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Transaction ID
              </p>
              <p className="text-base font-bold text-gray-900">
                {transaction.id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Type</p>
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 capitalize">
                {transaction.type.replace("_", " ")}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">User</p>
              <p className="text-base font-bold text-gray-900">
                {transaction.user}
              </p>
              <p className="text-xs text-gray-500">{transaction.userEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Amount</p>
              <p
                className={`text-xl font-black ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${transaction.amount.toFixed(2)} {transaction.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <div className="flex items-center gap-2">
                {transaction.status === "completed" ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : transaction.status === "failed" ? (
                  <XCircle size={16} className="text-red-600" />
                ) : transaction.status === "expired" ? (
                  <AlertTriangle size={16} className="text-orange-600" />
                ) : (
                  <Clock size={16} className="text-yellow-600" />
                )}
                <span className="font-bold capitalize">
                  {transaction.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(transaction.date).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 font-medium">Description</p>
            <p className="text-base font-medium text-gray-900">
              {transaction.description}
            </p>
          </div>

          {transaction.type === "subscription" && transaction.expiresAt && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 font-medium">
                Subscription Details
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <span className="text-gray-500">Package:</span>{" "}
                  <span className="font-bold">{transaction.packageName}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Billing Cycle:</span>{" "}
                  <span className="font-bold capitalize">
                    {transaction.billingCycle}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Expires:</span>{" "}
                  <span className="font-bold">
                    {new Date(transaction.expiresAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          )}

          {transaction.type === "video_purchase" && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 font-medium">Video Details</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <span className="text-gray-500">Video:</span>{" "}
                  <span className="font-bold">{transaction.videoTitle}</span>
                </p>
                {transaction.paymentIntentId && (
                  <p className="text-sm">
                    <span className="text-gray-500">Payment ID:</span>{" "}
                    <span className="font-mono text-xs">
                      {transaction.paymentIntentId}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          {transaction.status === "completed" && (
            <PermissionGuard permissions={["payments.refund"]}>
              <Button
                variant="danger"
                onClick={() => onRefund(transaction.id, transaction.type)}
              >
                <RotateCcw size={16} className="mr-2" />
                Process Refund
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

export const Payments = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [packages, setPackages] = useState<PackageWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(20);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTarget, setRefundTarget] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentsService.getTransactions({
        page,
        perPage,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        startDate: startDate
          ? startDate.toISOString().split("T")[0]
          : undefined,
        endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
      });

      if (response) {
        setTransactions(response.transactions || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotal(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchTerm, statusFilter, typeFilter, startDate, endDate]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await paymentsService.getStats(
        startDate ? startDate.toISOString().split("T")[0] : undefined,
        endDate ? endDate.toISOString().split("T")[0] : undefined,
      );

      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate]);

  // Fetch packages
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

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    fetchPackages();
  }, []);

  // Page change effect
  useEffect(() => {
    fetchTransactions();
  }, [page]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTransactions();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter changes
  useEffect(() => {
    setPage(1);
    fetchTransactions();
    fetchStats();
  }, [statusFilter, typeFilter, startDate, endDate]);

  const handleExport = async () => {
    try {
      toast.info("Exporting transactions...");
      const blob = await paymentsService.exportTransactions(
        startDate ? startDate.toISOString().split("T")[0] : undefined,
        endDate ? endDate.toISOString().split("T")[0] : undefined,
        typeFilter !== "all" ? typeFilter : undefined,
      );

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `transactions_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Transactions exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export transactions");
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleRefund = (id: string, type: string) => {
    setRefundTarget({ id, type });
    setShowRefundModal(true);
    setShowDetailModal(false);
  };

  const confirmRefund = async () => {
    if (!refundTarget) return;

    try {
      setActionLoading(true);
      await paymentsService.refund(
        refundTarget.id,
        refundTarget.type,
        "Admin refund",
      );
      toast.success("Refund processed successfully");
      setShowRefundModal(false);
      setRefundTarget(null);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error("Refund error:", error);
      toast.error("Failed to process refund");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "expired":
        return "text-orange-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-600" />;
      case "failed":
        return <XCircle size={16} className="text-red-600" />;
      case "expired":
        return <AlertTriangle size={16} className="text-orange-600" />;
      case "pending":
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "subscription":
        return <Package size={16} className="text-purple-600" />;
      case "video_purchase":
        return <Video size={16} className="text-blue-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <DollarSign
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                Payments & Transactions
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-green-100 font-medium">
              Track all financial transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30"
              onClick={() => {
                fetchTransactions();
                fetchStats();
              }}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
            <PermissionGuard permissions={["payments.export"]}>
              <Button
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={handleExport}
              >
                <Download size={18} className="mr-2" />
                Export CSV
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Total Revenue
          </p>
          <div className="flex items-center gap-2">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-black text-green-600">
                  $
                  {(stats?.totalRevenue || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <TrendingUp size={20} className="text-green-600" />
              </>
            )}
          </div>
          {stats?.growth?.revenue && (
            <p className="text-xs text-green-600 font-medium mt-1">
              {stats.growth.revenue} this month
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Subscriptions
          </p>
          <div className="flex items-center gap-2">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-black text-purple-600">
                  {stats?.activeSubscriptions || 0}
                </p>
                <Package size={20} className="text-purple-600" />
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Active subscriptions
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Video Purchases
          </p>
          <div className="flex items-center gap-2">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-black text-blue-600">
                  {stats?.totalVideoPurchases || 0}
                </p>
                <Video size={20} className="text-blue-600" />
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Completed purchases
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
          <div className="flex items-center gap-2">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-black text-orange-600">
                  {stats?.pendingTransactions || 0}
                </p>
                <Clock size={20} className="text-orange-600" />
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Awaiting completion
          </p>
        </div>
      </div>

      {/* Packages Overview */}
      {packages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">
            Subscription Packages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      pkg.type === "creator"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {pkg.type}
                  </span>
                </div>
                <p className="text-2xl font-black text-green-600">
                  ${pkg.price}
                  <span className="text-sm font-normal text-gray-500">
                    /{pkg.billingCycle}
                  </span>
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                  <span className="text-gray-500">
                    <span className="font-bold text-gray-900">
                      {pkg.subscribers}
                    </span>{" "}
                    subscribers
                  </span>
                  <span className="text-green-600 font-bold">
                    ${pkg.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex flex-col gap-4">
          {/* Date Range Filter */}
          <div className="pb-4 border-b border-gray-200">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          {/* Search and Other Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by ID, user, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="subscription">Subscription</option>
                  <option value="video_purchase">Video Purchase</option>
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(txn.type)}
                          <span className="ml-2 text-sm font-bold text-gray-900">
                            {txn.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {txn.user}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {txn.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                            txn.type === "subscription"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {txn.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-black text-green-600">
                          +${txn.amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          {txn.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(txn.status)}
                          <span
                            className={`text-sm font-semibold capitalize ${getStatusColor(txn.status)}`}
                          >
                            {txn.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(txn.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <PermissionGuard permissions={["payments.view"]}>
                          <button
                            onClick={() => handleViewTransaction(txn)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                        </PermissionGuard>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <DollarSign size={64} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No transactions found
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * perPage + 1} to{" "}
                  {Math.min(page * perPage, total)} of {total} transactions
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        transaction={selectedTransaction}
        onRefund={handleRefund}
      />

      {/* Refund Confirmation Modal */}
      <ConfirmModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setRefundTarget(null);
        }}
        onConfirm={confirmRefund}
        title="Process Refund"
        message="Are you sure you want to process a refund for this transaction? This action cannot be undone."
        confirmText={actionLoading ? "Processing..." : "Process Refund"}
        variant="danger"
      />
    </div>
  );
};
