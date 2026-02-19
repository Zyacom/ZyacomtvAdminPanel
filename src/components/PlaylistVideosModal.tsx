import { X, Video, Eye, ThumbsUp, Play, Trash2, Calendar } from "lucide-react";
import { Button } from "./Button";
import { useState } from "react";
import { toast } from "react-toastify";

interface PlaylistVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: any;
  onVideoClick?: (video: any) => void;
}

// Mock videos for the playlist
const getPlaylistVideos = (playlistId: string) => {
  const allVideos = [
    {
      id: "v1",
      playlistId: "1",
      title: "React Hooks Complete Guide - useState & useEffect",
      thumbnail: "https://picsum.photos/320/180?random=101",
      duration: "18:45",
      views: 125000,
      likes: 8900,
      channelName: "Tech Academy",
      uploadedAt: "2024-01-15",
      addedToPlaylist: "2024-01-16",
      description: "Learn React Hooks in depth with practical examples",
    },
    {
      id: "v2",
      playlistId: "1",
      title: "React Context API Tutorial for Beginners",
      thumbnail: "https://picsum.photos/320/180?random=102",
      duration: "22:30",
      views: 98000,
      likes: 6700,
      channelName: "Tech Academy",
      uploadedAt: "2024-01-18",
      addedToPlaylist: "2024-01-19",
      description: "Master state management with Context API",
    },
    {
      id: "v3",
      playlistId: "1",
      title: "React Router v6 - Complete Navigation Guide",
      thumbnail: "https://picsum.photos/320/180?random=103",
      duration: "25:15",
      views: 156000,
      likes: 11200,
      channelName: "Tech Academy",
      uploadedAt: "2024-01-20",
      addedToPlaylist: "2024-01-21",
      description: "Learn routing in React applications",
    },
    {
      id: "v4",
      playlistId: "1",
      title: "Redux Toolkit - Modern State Management",
      thumbnail: "https://picsum.photos/320/180?random=104",
      duration: "32:20",
      views: 203000,
      likes: 15600,
      channelName: "Tech Academy",
      uploadedAt: "2024-01-22",
      addedToPlaylist: "2024-01-23",
      description: "Simplified Redux with Redux Toolkit",
    },
    {
      id: "v5",
      playlistId: "1",
      title: "React Performance Optimization Techniques",
      thumbnail: "https://picsum.photos/320/180?random=105",
      duration: "28:10",
      views: 87000,
      likes: 5800,
      channelName: "Tech Academy",
      uploadedAt: "2024-01-25",
      addedToPlaylist: "2024-01-25",
      description: "Boost your React app performance",
    },
  ];

  return allVideos.filter((v) => v.playlistId === playlistId);
};

export const PlaylistVideosModal = ({
  isOpen,
  onClose,
  playlist,
  onVideoClick,
}: PlaylistVideosModalProps) => {
  const [videos, setVideos] = useState(
    playlist ? getPlaylistVideos(playlist.id) : [],
  );

  if (!isOpen || !playlist) return null;

  const handleRemoveVideo = (videoId: string) => {
    setVideos(videos.filter((v) => v.id !== videoId));
    toast.success("Video removed from playlist");
  };

  const handleVideoClick = (video: any) => {
    if (onVideoClick) {
      onVideoClick(video);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-4 my-8 animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden shrink-0">
          <div className="relative bg-linear-to-r from-purple-600/90 to-indigo-600/90 p-6 sm:p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-white" />
            </button>

            <div className="flex items-start gap-4 sm:gap-6">
              {/* Playlist Thumbnail */}
              <div className="shrink-0 w-32 sm:w-48 h-20 sm:h-32 bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                {playlist.thumbnail ? (
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-500 to-blue-500">
                    <Play size={32} className="text-white" />
                  </div>
                )}
              </div>

              {/* Playlist Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                  {playlist.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Video size={16} />
                    <span className="font-semibold">
                      {videos.length} videos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span className="font-semibold">
                      {playlist.totalViews?.toLocaleString() || 0} total views
                    </span>
                  </div>
                  <div className="text-white/80">
                    <span className="font-medium">{playlist.channelName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos List */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Video size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No videos in this playlist
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="group bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Index & Thumbnail */}
                    <div className="flex gap-3 sm:gap-4 shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-gray-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div
                        className="relative w-full sm:w-48 h-32 sm:h-28 bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => handleVideoClick(video)}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                          {video.duration}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                          <Play
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            size={32}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => handleVideoClick(video)}
                      >
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Eye size={14} />
                          <span className="font-medium">
                            {video.views.toLocaleString()} views
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp size={14} />
                          <span className="font-medium">
                            {video.likes.toLocaleString()} likes
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span className="font-medium">
                            Added{" "}
                            {new Date(video.addedToPlaylist).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 sm:gap-3 justify-end sm:justify-start">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleVideoClick(video)}
                        className="text-xs flex-1 sm:flex-initial"
                      >
                        <Eye size={12} className="sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveVideo(video.id)}
                        className="text-xs flex-1 sm:flex-initial"
                      >
                        <Trash2 size={12} className="sm:mr-1" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl shrink-0">
          <div className="text-sm text-gray-600">
            <span className="font-bold">{videos.length}</span> video
            {videos.length !== 1 ? "s" : ""} in this playlist
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
