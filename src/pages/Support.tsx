import { useState } from "react";
import {
  Headphones,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";

// Mock support tickets
const MOCK_TICKETS = [
  {
    id: "1",
    subject: "Payment Issue",
    user: "John Doe",
    email: "john@example.com",
    status: "open",
    priority: "high",
    category: "Payment",
    created: "2024-03-15",
    messages: 3,
  },
  {
    id: "2",
    subject: "Video Upload Problem",
    user: "Jane Smith",
    email: "jane@example.com",
    status: "in-progress",
    priority: "medium",
    category: "Technical",
    created: "2024-03-14",
    messages: 5,
  },
  {
    id: "3",
    subject: "Account Verification",
    user: "Mike Johnson",
    email: "mike@example.com",
    status: "open",
    priority: "low",
    category: "Account",
    created: "2024-03-13",
    messages: 2,
  },
  {
    id: "4",
    subject: "Monetization Query",
    user: "Sarah Williams",
    email: "sarah@example.com",
    status: "closed",
    priority: "medium",
    category: "Monetization",
    created: "2024-03-12",
    messages: 8,
  },
  {
    id: "5",
    subject: "Content Copyright Claim",
    user: "David Brown",
    email: "david@example.com",
    status: "open",
    priority: "high",
    category: "Legal",
    created: "2024-03-11",
    messages: 4,
  },
];

export const Support = () => {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleResolve = (ticketId: string) => {
    setTickets(
      tickets.map((t) => (t.id === ticketId ? { ...t, status: "closed" } : t)),
    );
    toast.success("Ticket marked as resolved");
  };

  const statusColors = {
    open: "bg-red-100 text-red-700",
    "in-progress": "bg-yellow-100 text-yellow-700",
    closed: "bg-green-100 text-green-700",
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Open Tickets</p>
          <p className="text-3xl font-black text-gray-900">
            {tickets.filter((t) => t.status === "open").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
          <p className="text-3xl font-black text-gray-900">
            {tickets.filter((t) => t.status === "in-progress").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Resolved</p>
          <p className="text-3xl font-black text-gray-900">
            {tickets.filter((t) => t.status === "closed").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Total Tickets
          </p>
          <p className="text-3xl font-black text-gray-900">{tickets.length}</p>
        </div>
      </div>

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
              placeholder="Search tickets by subject or user..."
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
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
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
                        {ticket.user}
                      </span>
                      <span className="text-sm text-gray-500">
                        {ticket.email}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[ticket.status as keyof typeof statusColors]}`}
                      >
                        {ticket.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ticket.status !== "closed" && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleResolve(ticket.id)}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Resolve
                      </Button>
                    )}
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>
                      Created: {new Date(ticket.created).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>{ticket.messages} messages</span>
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
    </div>
  );
};
