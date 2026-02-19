import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  MapPin,
  Shield,
  Video,
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  Ban,
  CheckCircle,
  MessageSquare,
  Heart,
  Clock,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ConfirmModal } from "../components/ConfirmModal";
import { toast } from "react-toastify";
import { usersService } from "../services/usersService";

interface UserData {
  id: string | number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  userType: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  subscribers: number;
  totalVideos: number;
  totalViews: number;
  totalLikes?: number;
  totalComments?: number;
  revenue?: number;
  isVerified: boolean;
  channel?: {
    id: string | number;
    name: string;
    verified: boolean;
    subscribersCount: number;
    videosCount: number;
  };
  analytics?: {
    viewsThisMonth?: number;
    viewsGrowth?: number;
    subscribersThisMonth?: number;
    subscribersGrowth?: number;
    revenueThisMonth?: number;
    revenueGrowth?: number;
    engagementRate?: number;
  };
  recentVideos?: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    date: string;
  }>;
  activity?: Array<{
    id: number;
    action: string;
    details: string;
    time: string;
  }>;
}

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [banModal, setBanModal] = useState(false);
  const [restoreModal, setRestoreModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUserById(id!);
      if (response.data.status && response.data.data) {
        setUser(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch user details",
      );
      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!user) return;
    try {
      if (user.status === "active") {
        const response = await usersService.banUser(String(user.id));
        if (response.data.status) {
          toast.success("User banned successfully");
          fetchUser();
        }
      } else {
        const response = await usersService.unbanUser(String(user.id));
        if (response.data.status) {
          toast.success("User unbanned successfully");
          fetchUser();
        }
      }
      setBanModal(false);
    } catch (error: any) {
      console.error("Error updating user ban status:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = () => {
    setConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!user) return;
    try {
      const response = await usersService.deleteUser(String(user.id));
      if (response.data.status) {
        toast.success("User deleted successfully");
        navigate("/users");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleRestoreUser = async () => {
    if (!user) return;
    try {
      const response = await usersService.restoreUser(String(user.id));
      if (response.data.status) {
        toast.success("User restored successfully");
        setRestoreModal(false);
        fetchUser(); // Refresh user data
      }
    } catch (error: any) {
      console.error("Error restoring user:", error);
      toast.error(error.response?.data?.message || "Failed to restore user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
        <Button
          variant="secondary"
          onClick={() => navigate("/users")}
          className="mt-4"
        >
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/users")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to Users
        </button>
        <div className="flex gap-3">
          {user.status === "deleted" ? (
            <Button
              variant="success"
              size="sm"
              onClick={() => setRestoreModal(true)}
            >
              <RotateCcw size={16} className="mr-2" />
              Restore User
            </Button>
          ) : (
            <>
              {user.status === "active" ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setBanModal(true)}
                >
                  <Ban size={16} className="mr-2" />
                  Ban User
                </Button>
              ) : user.status === "banned" ? (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setBanModal(true)}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Unban User
                </Button>
              ) : null}
              <Button variant="danger" size="sm" onClick={handleDeleteUser}>
                Delete User
              </Button>
            </>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <User size={48} className="text-purple-600" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-white">
                {user.fullName}
              </h1>
              {user.status === "active" && (
                <span className="px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  Active
                </span>
              )}
              {user.status === "banned" && (
                <span className="px-4 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                  Banned
                </span>
              )}
              {user.status === "deleted" && (
                <span className="px-4 py-1 bg-gray-500 text-white text-sm font-bold rounded-full">
                  Deleted
                </span>
              )}
              {user.isVerified && (
                <CheckCircle
                  size={32}
                  className="text-blue-400"
                  fill="currentColor"
                />
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-white">
                <Mail size={18} />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Shield size={18} />
                <span className="text-sm font-medium">{user.role}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MapPin size={18} />
                <span className="text-sm font-medium">
                  {user.country || "Not specified"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Calendar size={18} />
                <span className="text-sm font-medium">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Additional User Info */}
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-white/90 text-sm leading-relaxed">
                {user.bio || "No bio available"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-white/60 text-xs font-semibold">Phone</p>
                  <p className="text-white text-sm font-bold">
                    {user.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold">Gender</p>
                  <p className="text-white text-sm font-bold capitalize">
                    {user.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold">
                    Date of Birth
                  </p>
                  <p className="text-white text-sm font-bold">
                    {user.dateOfBirth
                      ? new Date(user.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards - Only for Creators */}
      {user.userType === "creator" && (
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Creator Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              title="Total Views"
              value={(user.totalViews || 0).toLocaleString()}
              icon={<Eye size={28} strokeWidth={2.5} />}
              trend={
                user.analytics?.viewsGrowth
                  ? `+${user.analytics.viewsGrowth}%`
                  : undefined
              }
              trendUp={true}
            />
            <Card
              title="Subscribers"
              value={(user.subscribers || 0).toLocaleString()}
              icon={<Users size={28} strokeWidth={2.5} />}
              trend={
                user.analytics?.subscribersGrowth
                  ? `+${user.analytics.subscribersGrowth}%`
                  : undefined
              }
              trendUp={true}
            />
            <Card
              title="Total Videos"
              value={(user.totalVideos || 0).toLocaleString()}
              icon={<Video size={28} strokeWidth={2.5} />}
            />
            <Card
              title="Revenue"
              value={`$${(user.revenue || 0).toLocaleString()}`}
              icon={<DollarSign size={28} strokeWidth={2.5} />}
              trend={
                user.analytics?.revenueGrowth
                  ? `+${user.analytics.revenueGrowth}%`
                  : undefined
              }
              trendUp={true}
            />
          </div>
        </div>
      )}

      {/* Recent Videos - Only for Creators */}
      {user.userType === "creator" &&
        user.recentVideos &&
        user.recentVideos.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Recent Videos
            </h2>
            <div className="space-y-4">
              {user.recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <Video size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Eye size={12} /> {(video.views || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Heart size={12} />{" "}
                        {(video.likes || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Activity History */}
      {user.activity && user.activity.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {user.activity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.details}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Clock size={12} /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Stats - Only for Creators */}
      {user.userType === "creator" && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Engagement Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl">
              <Eye size={32} className="mx-auto text-blue-600 mb-3" />
              <p className="text-3xl font-black text-gray-900">
                {(user.totalViews || 0).toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-2">
                Total Views
              </p>
            </div>
            <div className="text-center p-6 bg-linear-to-br from-red-50 to-red-100 rounded-2xl">
              <Heart size={32} className="mx-auto text-red-600 mb-3" />
              <p className="text-3xl font-black text-gray-900">
                {(user.totalLikes || 0).toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-2">
                Total Likes
              </p>
            </div>
            <div className="text-center p-6 bg-linear-to-br from-green-50 to-green-100 rounded-2xl">
              <MessageSquare
                size={32}
                className="mx-auto text-green-600 mb-3"
              />
              <p className="text-3xl font-black text-gray-900">
                {(user.totalComments || 0).toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-2">
                Comments
              </p>
            </div>
            <div className="text-center p-6 bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl">
              <TrendingUp size={32} className="mx-auto text-purple-600 mb-3" />
              <p className="text-3xl font-black text-gray-900">
                {user.analytics?.engagementRate || 0}%
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-2">
                Engagement Rate
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Ban/Unban Confirmation Modal */}
      <ConfirmModal
        isOpen={banModal}
        onClose={() => setBanModal(false)}
        onConfirm={handleBanUser}
        title={user.status === "active" ? "Ban User" : "Unban User"}
        message={
          user.status === "active"
            ? "Are you sure you want to ban this user? They will no longer be able to access their account."
            : "Are you sure you want to unban this user? They will regain access to their account."
        }
        confirmText={user.status === "active" ? "Ban" : "Unban"}
        variant={user.status === "active" ? "danger" : "primary"}
      />

      {/* Restore User Confirmation Modal */}
      <ConfirmModal
        isOpen={restoreModal}
        onClose={() => setRestoreModal(false)}
        onConfirm={handleRestoreUser}
        title="Restore User"
        message="Are you sure you want to restore this user? They will regain access to their account."
        confirmText="Restore"
        variant="success"
      />
    </div>
  );
};
