import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  MessageSquare,
  UserPlus,
  Heart,
  Share2,
  Upload,
  Clock,
  TrendingUp,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "upload" | "comment" | "like" | "subscribe" | "share";
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "upload",
    title: "Uploaded a new video",
    description: "Introduction to React Hooks",
    timestamp: "2024-03-15T10:30:00",
    metadata: { videoId: "vid1", views: 125000 },
  },
  {
    id: "2",
    type: "comment",
    title: "Commented on a video",
    description: "Great tutorial! Very helpful for beginners.",
    timestamp: "2024-03-14T15:45:00",
    metadata: { videoTitle: "JavaScript Basics" },
  },
  {
    id: "3",
    type: "like",
    title: "Liked a video",
    description: "Advanced TypeScript Patterns",
    timestamp: "2024-03-14T12:20:00",
  },
  {
    id: "4",
    type: "subscribe",
    title: "Subscribed to a channel",
    description: "Code Masters",
    timestamp: "2024-03-13T09:15:00",
    metadata: { channelId: "ch123" },
  },
  {
    id: "5",
    type: "share",
    title: "Shared a video",
    description: "Building REST APIs with Node.js",
    timestamp: "2024-03-13T08:00:00",
  },
  {
    id: "6",
    type: "upload",
    title: "Uploaded a new video",
    description: "Advanced TypeScript Tips",
    timestamp: "2024-03-10T14:20:00",
    metadata: { videoId: "vid2", views: 89000 },
  },
  {
    id: "7",
    type: "comment",
    title: "Commented on a video",
    description: "This solved my problem! Thanks!",
    timestamp: "2024-03-09T16:30:00",
    metadata: { videoTitle: "CSS Flexbox Guide" },
  },
  {
    id: "8",
    type: "like",
    title: "Liked a video",
    description: "Docker for Developers",
    timestamp: "2024-03-08T11:10:00",
  },
  {
    id: "9",
    type: "upload",
    title: "Uploaded a new video",
    description: "Building REST APIs with Node.js",
    timestamp: "2024-03-05T10:00:00",
    metadata: { videoId: "vid3", views: 67000 },
  },
  {
    id: "10",
    type: "subscribe",
    title: "Subscribed to a channel",
    description: "Web Dev Simplified",
    timestamp: "2024-03-04T13:45:00",
    metadata: { channelId: "ch456" },
  },
];

export const UserActivity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activities] = useState(MOCK_ACTIVITIES);
  const [filter, setFilter] = useState<string>("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Upload size={20} />;
      case "comment":
        return <MessageSquare size={20} />;
      case "like":
        return <Heart size={20} />;
      case "subscribe":
        return <UserPlus size={20} />;
      case "share":
        return <Share2 size={20} />;
      default:
        return <Activity size={20} />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "upload":
        return "from-purple-500 to-purple-600";
      case "comment":
        return "from-blue-500 to-blue-600";
      case "like":
        return "from-red-500 to-red-600";
      case "subscribe":
        return "from-green-500 to-green-600";
      case "share":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities =
    filter === "all" ? activities : activities.filter((a) => a.type === filter);

  const activityStats = {
    uploads: activities.filter((a) => a.type === "upload").length,
    comments: activities.filter((a) => a.type === "comment").length,
    likes: activities.filter((a) => a.type === "like").length,
    subscribes: activities.filter((a) => a.type === "subscribe").length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/users/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to User Details
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Uploads
            </h3>
            <div className="p-3 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl">
              <Upload size={20} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {activityStats.uploads}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Comments
            </h3>
            <div className="p-3 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl">
              <MessageSquare size={20} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {activityStats.comments}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Likes
            </h3>
            <div className="p-3 bg-linear-to-br from-red-500 to-red-600 rounded-xl">
              <Heart size={20} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {activityStats.likes}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Subscriptions
            </h3>
            <div className="p-3 bg-linear-to-br from-green-500 to-green-600 rounded-xl">
              <UserPlus size={20} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {activityStats.subscribes}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {["all", "upload", "comment", "like", "subscribe", "share"].map(
          (type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                filter === type
                  ? "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white text-gray-600 hover:bg-purple-50 border border-gray-200"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ),
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Activity Timeline
        </h2>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-linear-to-b from-purple-200 via-blue-200 to-purple-200"></div>

          <div className="space-y-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="relative pl-16">
                {/* Timeline Dot */}
                <div
                  className={`absolute left-0 w-12 h-12 bg-linear-to-br ${getIconColor(
                    activity.type,
                  )} rounded-xl flex items-center justify-center text-white shadow-lg`}
                >
                  {getIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="bg-linear-to-r from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-black text-gray-900">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                      <Clock size={14} />
                      {getTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {activity.description}
                  </p>
                  {activity.metadata && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                        {activity.metadata.views && (
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {activity.metadata.views.toLocaleString()} views
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
