import { useState, useEffect } from "react";
import {
  Headphones,
  MessageSquare,
  Clock,
  AlertCircle,
  Search,
  X,
  Send,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";
import {
  supportService,
  SupportTicket,
  SupportTicketDetail,
  SupportStats,
} from "../services/supportService";

export const Support = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicketDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch tickets and stats on mount
  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportService.getTickets({
        page: 1,
        limit: 100,
      });
      if (response.data?.data?.tickets) {
        setTickets(response.data.data.tickets);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await supportService.getStats();
      if (response.data?.data?.stats) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await supportService.getTicketById(ticketId);
      if (response.data?.data?.ticket) {
        setSelectedTicket(response.data.data.ticket);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch ticket details",
      );
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await supportService.updateTicketStatus(ticketId, newStatus);
      toast.success(`Ticket status updated to ${newStatus}`);

      // Refresh ticket list and selected ticket
      fetchTickets();
      fetchStats();
      if (selectedTicket) {
        fetchTicketDetails(ticketId);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update ticket status",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;

    try {
      setSubmittingComment(true);
      await supportService.addComment(selectedTicket.id, newComment);
      toast.success("Comment added successfully");
      setNewComment("");

      // Refresh ticket details
      fetchTicketDetails(selectedTicket.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    pending: "bg-gray-100 text-gray-700",
    open: "bg-red-100 text-red-700",
    "in-progress": "bg-blue-100 text-blue-700",
    "on-hold": "bg-orange-100 text-orange-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  };

  const priorityColors = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Headphones className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-black text-white">Support Center</h1>
          </div>
          <p className="text-xl text-blue-100 font-medium">
            Manage user tickets and support requests
          </p>
        </div>
      </div>

      {/* Stats */}
      {loading && !stats ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Pending/Open
            </p>
            <p className="text-3xl font-black text-gray-900">
              {stats.byStatus.pending + stats.byStatus.open}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium mb-1">
              In Progress
            </p>
            <p className="text-3xl font-black text-gray-900">
              {stats.byStatus.inProgress}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-medium mb-1">On Hold</p>
            <p className="text-3xl font-black text-gray-900">
              {stats.byStatus.onHold}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Resolved</p>
            <p className="text-3xl font-black text-gray-900">
              {stats.byStatus.resolved + stats.byStatus.closed}
            </p>
          </div>
        </div>
      ) : null}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tickets by subject, user, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No support tickets found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-6">
                <div
                  className={`w-1 h-full ${priorityColors[ticket.priority as keyof typeof priorityColors]} rounded-full`}
                ></div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">
                          {ticket.user.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {ticket.user.email}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[ticket.status as keyof typeof statusColors]}`}
                        >
                          {ticket.status.toUpperCase().replace("-", " ")}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                          {ticket.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => fetchTicketDetails(ticket.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>Created: {ticket.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      <span>{ticket.messagesCount} messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle
                        size={16}
                        className={
                          ticket.priority === "high"
                            ? "text-red-600"
                            : ticket.priority === "medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                        }
                      />
                      <span className="font-semibold capitalize">
                        {ticket.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-600 to-cyan-600 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  {selectedTicket.subject}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[selectedTicket.status as keyof typeof statusColors]}`}
                >
                  {selectedTicket.status.toUpperCase().replace("-", " ")}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTicket(null);
                  setNewComment("");
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">User</p>
                    <p className="font-bold text-gray-900">
                      {selectedTicket.user.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedTicket.user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-bold text-gray-900">
                      {selectedTicket.category.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priority</p>
                    <p className="font-bold text-gray-900 capitalize">
                      {selectedTicket.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created</p>
                    <p className="font-bold text-gray-900">
                      {selectedTicket.createdAt}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 font-medium mb-3">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "pending",
                    "open",
                    "in-progress",
                    "on-hold",
                    "resolved",
                    "closed",
                  ].map((status) => (
                    <Button
                      key={status}
                      variant={
                        selectedTicket.status === status ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleStatusUpdate(selectedTicket.id, status)
                      }
                      disabled={
                        updatingStatus || selectedTicket.status === status
                      }
                    >
                      {updatingStatus && selectedTicket.status === status ? (
                        <Loader2 className="animate-spin mr-2" size={14} />
                      ) : null}
                      {status.replace("-", " ").toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="mb-6">
                <p className="text-lg font-bold text-gray-900 mb-4">
                  Comments ({selectedTicket.comments.length})
                </p>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTicket.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-2xl ${
                        comment.user.role === "user"
                          ? "bg-gray-100"
                          : "bg-blue-50 border-l-4 border-blue-500"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-300 rounded-full p-2">
                          <User size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">
                              {comment.user.name}
                            </p>
                            {comment.user.role !== "user" && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {comment.createdAt}
                          </p>
                          <p className="text-gray-800 whitespace-pre-wrap">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Comment */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-3">
                  Add Comment
                </p>
                <div className="flex gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <Button
                    variant="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="self-end"
                  >
                    {submittingComment ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
