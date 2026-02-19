import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { DateRangePicker } from "../components/DateRangePicker";
import {
  Users,
  Video,
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { dashboardService } from "../services/dashboardService";

interface Stats {
  totalUsers: number;
  totalVideos: number;
  totalViews: number;
  totalRevenue: number;
}

interface Growth {
  users: string;
  videos: string;
  views: string;
  revenue: string;
}

interface TrafficData {
  day: string;
  users: number;
  videos: number;
  views: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface ContentDistribution {
  name: string;
  value: number;
  color: string;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
  color: string;
  icon: string;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalRevenue: 0,
  });
  const [growth, setGrowth] = useState<Growth>({
    users: "+0%",
    videos: "+0%",
    views: "+0%",
    revenue: "+0%",
  });
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [contentDistribution, setContentDistribution] = useState<
    ContentDistribution[]
  >([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [overviewRes, trafficRes, revenueRes, contentRes, activitiesRes] =
        await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getTraffic(),
          dashboardService.getRevenue(),
          dashboardService.getContentDistribution(),
          dashboardService.getActivities(),
        ]);

      // Set overview stats
      if (overviewRes.data.status) {
        const data = overviewRes.data;
        console.log("Overview Data:", data);
        setStats({
          totalUsers: data.totalUsers || 0,
          totalVideos: data.totalVideos || 0,
          totalViews: data.totalViews || 0,
          totalRevenue: data.totalRevenue || 0,
        });
        if (data.growth) {
          setGrowth(data.growth);
        }
      }

      // Set traffic data
      if (trafficRes.data.status) {
        setTrafficData(trafficRes.data.data || []);
      }

      // Set revenue data
      if (revenueRes.data.status) {
        setRevenueData(revenueRes.data.data || []);
      }

      // Set content distribution
      if (contentRes.data.status) {
        setContentDistribution(contentRes.data.data || []);
      }

      // Set activities
      if (activitiesRes.data.status) {
        setActivities(activitiesRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredStats = async (
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    try {
      if (!startDate && !endDate) {
        // Reload all stats
        fetchDashboardData();
        return;
      }

      const startDateStr = startDate?.toISOString().split("T")[0];
      const endDateStr = endDate?.toISOString().split("T")[0];

      const response = await dashboardService.getFilteredStats(
        startDateStr,
        endDateStr,
      );

      if (response.data.status) {
        const data = response.data.data;
        setStats({
          totalUsers: data.totalUsers || 0,
          totalVideos: data.totalVideos || 0,
          totalViews: data.totalViews || 0,
          totalRevenue: data.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching filtered stats:", error);
    }
  };

  const handleCalendarClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    setIsDatePickerOpen(true);
  };

  const handleDateRangeApply = (
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    fetchFilteredStats(startDate, endDate);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="relative">
          <div className="w-20 h-20 border-8 border-purple-200 rounded-full animate-spin"></div>
          <div className="w-20 h-20 border-t-8 border-purple-600 rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header with Glassmorphism */}
      <div className="relative overflow-hidden bg-linear-to-r from-purple-600 via-purple-700 to-blue-600 rounded-3xl p-10 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-5xl font-black text-white">Dashboard</h1>
          </div>
          <p className="text-xl text-purple-100 font-medium">
            Welcome back! Here's your platform overview 🚀
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users size={22} strokeWidth={2.5} />}
          trend={growth.users}
          trendUp={growth.users.startsWith("+")}
          onCalendarClick={handleCalendarClick}
        />
        <Card
          title="Total Videos"
          value={stats.totalVideos.toLocaleString()}
          icon={<Video size={22} strokeWidth={2.5} />}
          trend={growth.videos}
          trendUp={growth.videos.startsWith("+")}
          onCalendarClick={handleCalendarClick}
        />
        <Card
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          icon={<Eye size={22} strokeWidth={2.5} />}
          trend={growth.views}
          trendUp={growth.views.startsWith("+")}
          onCalendarClick={handleCalendarClick}
        />
        <Card
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={22} strokeWidth={2.5} />}
          trend={growth.revenue}
          trendUp={growth.revenue.startsWith("+")}
          onCalendarClick={handleCalendarClick}
        />
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={handleDateRangeApply}
        anchorEl={anchorEl}
      />

      {/* Traffic Overview Chart */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Weekly Traffic Overview
          </h2>
          <p className="text-gray-500">
            Users, videos, and views for the past 7 days
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={trafficData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              style={{ fontSize: "14px", fontWeight: "600" }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "14px", fontWeight: "600" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "14px", fontWeight: "600" }} />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorUsers)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="videos"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorVideos)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorViews)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue & Content Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Revenue Trend
            </h2>
            <p className="text-gray-500">Last 6 months performance</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: "14px", fontWeight: "600" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "14px", fontWeight: "600" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "14px", fontWeight: "600" }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Content Distribution */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Content Distribution
            </h2>
            <p className="text-gray-500">Videos by category</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {contentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-purple-500 via-pink-500 to-blue-500"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Recent Activity
              </h2>
              <p className="text-sm text-gray-500">Live platform updates</p>
            </div>
          </div>

          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group flex items-center gap-4 p-4 bg-linear-to-r from-gray-50 to-gray-50 hover:from-purple-50 hover:to-blue-50 rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 bg-${activity.color}-500 rounded-full animate-pulse`}
                  ></div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="mx-auto mb-2" size={48} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-orange-500 via-red-500 to-pink-500"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-500">Navigate to key areas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/users")}
              className="group relative p-6 bg-linear-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <Users
                className="text-white mb-3 relative z-10"
                size={32}
                strokeWidth={2.5}
              />
              <p className="text-lg font-black text-white relative z-10">
                View Users
              </p>
              <ArrowUpRight
                className="absolute bottom-3 right-3 text-white/50 group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
                size={20}
              />
            </button>

            <button
              onClick={() => navigate("/videos")}
              className="group relative p-6 bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <Video
                className="text-white mb-3 relative z-10"
                size={32}
                strokeWidth={2.5}
              />
              <p className="text-lg font-black text-white relative z-10">
                Manage Videos
              </p>
              <ArrowUpRight
                className="absolute bottom-3 right-3 text-white/50 group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
                size={20}
              />
            </button>

            <button
              onClick={() => navigate("/analytics")}
              className="group relative p-6 bg-linear-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <TrendingUp
                className="text-white mb-3 relative z-10"
                size={32}
                strokeWidth={2.5}
              />
              <p className="text-lg font-black text-white relative z-10">
                View Analytics
              </p>
              <ArrowUpRight
                className="absolute bottom-3 right-3 text-white/50 group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
                size={20}
              />
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="group relative p-6 bg-linear-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-2xl text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <DollarSign
                className="text-white mb-3 relative z-10"
                size={32}
                strokeWidth={2.5}
              />
              <p className="text-lg font-black text-white relative z-10">
                Settings
              </p>
              <ArrowUpRight
                className="absolute bottom-3 right-3 text-white/50 group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
                size={20}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
