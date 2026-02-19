import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  Settings,
  Save,
  X,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";
import monetizationService, {
  MonetizationRequest,
  MonetizationStats,
  MonetizationRules,
  PaginationInfo,
} from "../services/monetizationService";

export const Monetization = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MonetizationRequest[]>([]);
  const [stats, setStats] = useState<MonetizationStats | null>(null);
  const [rules, setRules] = useState<MonetizationRules | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MonetizationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editedRules, setEditedRules] = useState({
    watchHours: 0,
    subscribers: 0,
  });

  // Processing states
  const [processing, setProcessing] = useState<number | null>(null);
  const [savingRules, setSavingRules] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await monetizationService.getStats();
      if (response?.stats) {
        setStats(response.stats);
      }
      if (response?.rules) {
        setRules(response.rules);
        setEditedRules({
          watchHours: response.rules.watchHours,
          subscribers: response.rules.subscribers,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await monetizationService.getRequests({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      if (response?.requests) {
        setRequests(response.requests);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load monetization requests");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle approve
  const handleApprove = async (id: number) => {
    if (
      !confirm("Are you sure you want to approve this monetization request?")
    ) {
      return;
    }

    try {
      setProcessing(id);
      await monetizationService.approveRequest(id);
      toast.success("Monetization request approved successfully!");
      fetchRequests();
      fetchStats();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to approve request");
    } finally {
      setProcessing(null);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessing(selectedRequest.id);
      await monetizationService.rejectRequest(selectedRequest.id, rejectReason);
      toast.success("Monetization request rejected");
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
      fetchRequests();
      fetchStats();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  // Handle save rules
  const handleSaveRules = async () => {
    try {
      setSavingRules(true);
      await monetizationService.updateRules(editedRules);
      toast.success("Monetization rules updated successfully!");
      setShowRulesModal(false);
      fetchStats();
    } catch (error) {
      toast.error("Failed to update rules");
    } finally {
      setSavingRules(false);
    }
  };

  // Open reject modal
  const openRejectModal = (request: MonetizationRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowRejectModal(true);
  };

  // Open detail modal
  const openDetailModal = (request: MonetizationRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
            <AlertCircle size={14} />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <XCircle size={14} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Check eligibility
  const isEligible = (request: MonetizationRequest) => {
    if (!rules) return true;
    return (
      request.subscriberCount >= rules.subscribers &&
      request.watchHours >= rules.watchHours
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-700 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <DollarSign className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Monetization Requests
              </h1>
            </div>
            <p className="text-gray-200 font-medium">
              Review and manage creator monetization applications
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => setShowRulesModal(true)}>
              <Settings size={18} className="mr-2" />
              Rules
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                fetchStats();
                fetchRequests();
              }}
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-black text-gray-900">
                {stats?.pending || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-black text-gray-900">
                {stats?.approved || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-black text-gray-900">
                {stats?.rejected || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Requests
              </p>
              <p className="text-2xl font-black text-gray-900">
                {stats?.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Info */}
      {rules && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-bold text-blue-800">
              Current Requirements:
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-blue-700 shadow-sm">
              <Users size={14} />
              {rules.subscribers} Subscribers
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-blue-700 shadow-sm">
              <Clock size={14} />
              {rules.watchHours} Watch Hours
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by channel name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No monetization requests found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Subscribers
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Watch Hours
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.channel.avatar || "/default-avatar.png"}
                          alt={request.channel.name}
                          className="w-10 h-10 rounded-full object-cover bg-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/default-avatar.png";
                          }}
                        />
                        <div>
                          <p className="font-bold text-gray-900">
                            {request.channel.name || "Unnamed Channel"}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {request.channel.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {request.channel.user?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.channel.user?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-bold ${
                          rules && request.subscriberCount >= rules.subscribers
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {request.subscriberCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-bold ${
                          rules && request.watchHours >= rules.watchHours
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {request.watchHours}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openDetailModal(request)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={processing === request.id}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {processing === request.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <CheckCircle size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => openRejectModal(request)}
                              disabled={processing === request.id}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.lastPage > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.total,
              )}{" "}
              of {pagination.total} requests
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pagination.hasMore}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Reject Request
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              You are about to reject the monetization request for{" "}
              <strong>{selectedRequest.channel.name}</strong>. Please provide a
              reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={
                  processing === selectedRequest.id || !rejectReason.trim()
                }
                className="flex-1"
              >
                {processing === selectedRequest.id ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  <XCircle size={18} className="mr-2" />
                )}
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Monetization Requirements
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Set the minimum requirements creators must meet to apply for
              monetization.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Minimum Subscribers
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="number"
                    value={editedRules.subscribers}
                    onChange={(e) =>
                      setEditedRules((prev) => ({
                        ...prev,
                        subscribers: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Minimum Watch Hours
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="number"
                    value={editedRules.watchHours}
                    onChange={(e) =>
                      setEditedRules((prev) => ({
                        ...prev,
                        watchHours: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowRulesModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleSaveRules}
                disabled={savingRules}
                className="flex-1"
              >
                {savingRules ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  <Save size={18} className="mr-2" />
                )}
                Save Rules
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Request Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Channel Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={selectedRequest.channel.avatar || "/default-avatar.png"}
                  alt={selectedRequest.channel.name}
                  className="w-16 h-16 rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    {selectedRequest.channel.name || "Unnamed Channel"}
                  </p>
                  <p className="text-gray-500">
                    {selectedRequest.channel.user?.fullName} (
                    {selectedRequest.channel.user?.email})
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={18} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Subscribers
                    </span>
                  </div>
                  <p className="text-2xl font-black text-blue-700">
                    {selectedRequest.subscriberCount}
                  </p>
                  {rules && (
                    <p className="text-xs text-blue-500">
                      Required: {rules.subscribers}
                      {selectedRequest.subscriberCount >= rules.subscribers
                        ? " ✓"
                        : " ✗"}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={18} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">
                      Watch Hours
                    </span>
                  </div>
                  <p className="text-2xl font-black text-purple-700">
                    {selectedRequest.watchHours}
                  </p>
                  {rules && (
                    <p className="text-xs text-purple-500">
                      Required: {rules.watchHours}
                      {selectedRequest.watchHours >= rules.watchHours
                        ? " ✓"
                        : " ✗"}
                    </p>
                  )}
                </div>
              </div>

              {/* Eligibility */}
              <div
                className={`p-4 rounded-xl ${
                  isEligible(selectedRequest)
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`font-bold ${
                    isEligible(selectedRequest)
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {isEligible(selectedRequest)
                    ? "✓ Meets all requirements"
                    : "✗ Does not meet requirements"}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">Status</span>
                {getStatusBadge(selectedRequest.status)}
              </div>

              {/* Rejection Reason */}
              {selectedRequest.status === "rejected" &&
                selectedRequest.reason && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm font-bold text-red-700 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-red-600">{selectedRequest.reason}</p>
                  </div>
                )}

              {/* Dates */}
              <div className="text-sm text-gray-500">
                <p>
                  Applied:{" "}
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
                <p>
                  Last Updated:{" "}
                  {new Date(selectedRequest.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              {selectedRequest.status === "pending" && (
                <>
                  <Button
                    variant="success"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApprove(selectedRequest.id);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowDetailModal(false);
                      openRejectModal(selectedRequest);
                    }}
                    className="flex-1"
                  >
                    <XCircle size={18} className="mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monetization;
