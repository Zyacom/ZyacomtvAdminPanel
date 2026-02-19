import { useState } from "react";
import {
  Bell,
  Video,
  UserPlus,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X,
  Filter,
} from "lucide-react";

interface Notification {
  id: string;
  type: "video" | "user" | "comment" | "payment" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "video",
    title: "New Video Uploaded",
    message: "John Doe uploaded 'Advanced React Patterns'",
    time: "5 minutes ago",
    read: false,
    link: "/videos",
  },
  {
    id: "2",
    type: "user",
    title: "New User Registration",
    message: "Sarah Williams just joined the platform",
    time: "15 minutes ago",
    read: false,
    link: "/users",
  },
  {
    id: "3",
    type: "comment",
    title: "Flagged Comment",
    message: "A comment has been flagged for review by multiple users",
    time: "1 hour ago",
    read: false,
    link: "/support",
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Received",
    message: "New subscription payment of $49.99 from Mike Johnson",
    time: "2 hours ago",
    read: true,
    link: "/analytics",
  },
  {
    id: "5",
    type: "alert",
    title: "Server Alert",
    message: "High CPU usage detected on server 3 - Action required",
    time: "3 hours ago",
    read: true,
    link: "/settings",
  },
  {
    id: "6",
    type: "video",
    title: "Video Reported",
    message: "Video 'Tutorial #45' has been reported for copyright",
    time: "5 hours ago",
    read: true,
    link: "/videos",
  },
  {
    id: "7",
    type: "user",
    title: "User Account Verified",
    message: "Emily Davis completed account verification",
    time: "1 day ago",
    read: true,
    link: "/users",
  },
  {
    id: "8",
    type: "payment",
    title: "Payment Failed",
    message: "Subscription payment failed for user Chris Wilson",
    time: "1 day ago",
    read: true,
    link: "/analytics",
  },
  {
    id: "9",
    type: "comment",
    title: "New Comment",
    message: "Lisa Anderson commented on 'React Best Practices'",
    time: "2 days ago",
    read: true,
    link: "/videos",
  },
  {
    id: "10",
    type: "alert",
    title: "Backup Completed",
    message: "Database backup completed successfully",
    time: "2 days ago",
    read: true,
    link: "/settings",
  },
];

export const Notifications = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<string>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleRemove = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video size={24} />;
      case "user":
        return <UserPlus size={24} />;
      case "comment":
        return <MessageSquare size={24} />;
      case "payment":
        return <DollarSign size={24} />;
      case "alert":
        return <AlertTriangle size={24} />;
      default:
        return <Bell size={24} />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "video":
        return "from-purple-500 to-purple-600";
      case "user":
        return "from-blue-500 to-blue-600";
      case "comment":
        return "from-green-500 to-green-600";
      case "payment":
        return "from-yellow-500 to-yellow-600";
      case "alert":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1 font-medium">
            You have {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCircle size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 text-gray-600 font-bold">
          <Filter size={20} />
          <span className="text-sm">Filter:</span>
        </div>
        {[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread" },
          { value: "video", label: "Videos" },
          { value: "user", label: "Users" },
          { value: "comment", label: "Comments" },
          { value: "payment", label: "Payments" },
          { value: "alert", label: "Alerts" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              filter === item.value
                ? "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-white text-gray-600 hover:bg-purple-50 border border-gray-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <Bell
              size={64}
              className="mx-auto text-gray-300 mb-4"
              strokeWidth={1.5}
            />
            <p className="text-xl font-bold text-gray-500">
              No notifications found
            </p>
            <p className="text-gray-400 mt-2 font-medium">
              You're all caught up!
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl shadow-lg p-6 border transition-all hover:shadow-xl group ${
                !notification.read
                  ? "border-purple-200 bg-purple-50/30"
                  : "border-gray-100"
              }`}
            >
              <div className="flex gap-5">
                <div
                  className={`shrink-0 w-14 h-14 bg-linear-to-br ${getIconColor(
                    notification.type,
                  )} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-black text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-3">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">
                        {notification.time}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemove(notification.id)}
                      className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex gap-3 mt-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Mark as read
                      </button>
                    )}
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="px-4 py-2 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-bold rounded-lg transition-all cursor-pointer shadow-md"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
