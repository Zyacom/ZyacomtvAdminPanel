import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  X,
  Video,
  UserPlus,
  MessageSquare,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    message: "A comment has been flagged for review",
    time: "1 hour ago",
    read: false,
    link: "/support",
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Received",
    message: "New subscription payment of $49.99",
    time: "2 hours ago",
    read: true,
    link: "/analytics",
  },
  {
    id: "5",
    type: "alert",
    title: "Server Alert",
    message: "High CPU usage detected on server 3",
    time: "3 hours ago",
    read: true,
    link: "/settings",
  },
];

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video size={18} />;
      case "user":
        return <UserPlus size={18} />;
      case "comment":
        return <MessageSquare size={18} />;
      case "payment":
        return <DollarSign size={18} />;
      case "alert":
        return <AlertTriangle size={18} />;
      default:
        return <Bell size={18} />;
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-600 hover:bg-purple-50 rounded-xl transition-all duration-300 group cursor-pointer"
      >
        <Bell
          size={22}
          strokeWidth={2.5}
          className="group-hover:text-purple-600 transition-colors"
        />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg">
              {unreadCount}
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 border-b border-purple-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-white/90 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell
                  size={48}
                  className="mx-auto text-gray-300 mb-3"
                  strokeWidth={1.5}
                />
                <p className="text-gray-500 font-medium">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-6 py-4 border-b border-gray-100 hover:bg-purple-50/50 transition-all cursor-pointer group ${
                    !notification.read ? "bg-purple-50/30" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`shrink-0 w-10 h-10 bg-linear-to-br ${getIconColor(
                        notification.type,
                      )} rounded-xl flex items-center justify-center text-white shadow-lg`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleRemove(notification.id, e)}
                          className="shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 font-medium">
                          {notification.time}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate("/notifications");
                  setIsOpen(false);
                }}
                className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
