import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Video,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  Play,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Card } from "../components/Card";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  uploadedAt: string;
  status: "published" | "draft" | "private";
}

const MOCK_USER_VIDEOS: Video[] = [
  {
    id: "1",
    title: "Introduction to React Hooks",
    thumbnail: "https://via.placeholder.com/320x180",
    views: 125000,
    likes: 8500,
    comments: 420,
    duration: "15:30",
    uploadedAt: "2024-03-15",
    status: "published",
  },
  {
    id: "2",
    title: "Advanced TypeScript Tips and Tricks",
    thumbnail: "https://via.placeholder.com/320x180",
    views: 89000,
    likes: 6200,
    comments: 310,
    duration: "22:45",
    uploadedAt: "2024-03-10",
    status: "published",
  },
  {
    id: "3",
    title: "Building REST APIs with Node.js",
    thumbnail: "https://via.placeholder.com/320x180",
    views: 67000,
    likes: 4800,
    comments: 250,
    duration: "18:20",
    uploadedAt: "2024-03-05",
    status: "published",
  },
  {
    id: "4",
    title: "Complete Guide to State Management",
    thumbnail: "https://via.placeholder.com/320x180",
    views: 54000,
    likes: 3900,
    comments: 180,
    duration: "25:15",
    uploadedAt: "2024-02-28",
    status: "published",
  },
  {
    id: "5",
    title: "Docker for Beginners",
    thumbnail: "https://via.placeholder.com/320x180",
    views: 43000,
    likes: 3100,
    comments: 150,
    duration: "20:10",
    uploadedAt: "2024-02-20",
    status: "draft",
  },
  {
    id: "6",
    title: "CSS Grid Layout Masterclass",
    thumbnail: "https://via.placeholder.com/320x180",
    views: 38000,
    likes: 2800,
    comments: 120,
    duration: "16:40",
    uploadedAt: "2024-02-15",
    status: "published",
  },
];

export const UserVideos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videos] = useState(MOCK_USER_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
  const totalComments = videos.reduce((sum, video) => sum + video.comments, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "private":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          title="Total Videos"
          value={videos.length}
          icon={<Video size={28} strokeWidth={2.5} />}
        />
        <Card
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={<Eye size={28} strokeWidth={2.5} />}
          trend="+12.5%"
          trendUp={true}
        />
        <Card
          title="Total Likes"
          value={totalLikes.toLocaleString()}
          icon={<Heart size={28} strokeWidth={2.5} />}
          trend="+8.3%"
          trendUp={true}
        />
        <Card
          title="Total Comments"
          value={totalComments.toLocaleString()}
          icon={<MessageSquare size={28} strokeWidth={2.5} />}
        />
      </div>

      {/* Videos Grid */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          User's Videos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-linear-to-br from-purple-100 to-blue-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play
                    size={48}
                    className="text-white opacity-90 group-hover:scale-110 transition-transform"
                    strokeWidth={2}
                  />
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-white text-xs font-bold">
                  {video.duration}
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() =>
                      setSelectedVideo(
                        selectedVideo === video.id ? null : video.id,
                      )
                    }
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all cursor-pointer"
                  >
                    <MoreVertical size={16} className="text-gray-700" />
                  </button>
                  {selectedVideo === video.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10">
                      <button className="w-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-2">
                        <Edit size={14} />
                        Edit
                      </button>
                      <button className="w-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                      video.status,
                    )}`}
                  >
                    {video.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {video.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span className="font-medium text-xs">
                      {new Date(video.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Eye size={14} className="text-purple-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {video.views >= 1000
                        ? `${(video.views / 1000).toFixed(1)}K`
                        : video.views}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <Heart size={14} className="text-red-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {video.likes >= 1000
                        ? `${(video.likes / 1000).toFixed(1)}K`
                        : video.likes}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <MessageSquare size={14} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {video.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
