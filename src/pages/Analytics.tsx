import { useState } from "react";
import { Card } from "../components/Card";
import { TrendingUp, Users, Video, DollarSign, Eye, Clock } from "lucide-react";
import {
  LineChart,
  Line,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Mock data
const MOCK_ANALYTICS = {
  userGrowth: 24.5,
  videoGrowth: 18.3,
  revenueGrowth: 32.7,
  engagementRate: 67.8,
  avgWatchTime: "12:45",
  totalWatchTime: "2.4M hours",
};

// User Growth Over Time (Last 12 months)
const USER_GROWTH_DATA = [
  { month: "Feb", users: 12500, activeUsers: 8900 },
  { month: "Mar", users: 15200, activeUsers: 11200 },
  { month: "Apr", users: 18900, activeUsers: 13800 },
  { month: "May", users: 22400, activeUsers: 16500 },
  { month: "Jun", users: 26800, activeUsers: 19800 },
  { month: "Jul", users: 31500, activeUsers: 23400 },
  { month: "Aug", users: 35200, activeUsers: 26100 },
  { month: "Sep", users: 38900, activeUsers: 29200 },
  { month: "Oct", users: 41200, activeUsers: 31500 },
  { month: "Nov", users: 43800, activeUsers: 33800 },
  { month: "Dec", users: 45100, activeUsers: 35200 },
  { month: "Jan", users: 48900, activeUsers: 38100 },
];

// Video Performance Data
const VIDEO_PERFORMANCE_DATA = [
  { day: "1", uploads: 45, views: 12500, likes: 3200 },
  { day: "2", uploads: 52, views: 15800, likes: 4100 },
  { day: "3", uploads: 48, views: 14200, likes: 3800 },
  { day: "4", uploads: 61, views: 18900, likes: 5200 },
  { day: "5", uploads: 58, views: 17400, likes: 4900 },
  { day: "6", uploads: 72, views: 22100, likes: 6500 },
  { day: "7", uploads: 68, views: 20800, likes: 6100 },
  { day: "8", uploads: 55, views: 16700, likes: 4600 },
  { day: "9", uploads: 63, views: 19200, likes: 5400 },
  { day: "10", uploads: 70, views: 21500, likes: 6300 },
];

// Engagement Metrics
const ENGAGEMENT_DATA = [
  { metric: "Likes", value: 85, fullMark: 100 },
  { metric: "Comments", value: 72, fullMark: 100 },
  { metric: "Shares", value: 68, fullMark: 100 },
  { metric: "Saves", value: 78, fullMark: 100 },
  { metric: "Watch Time", value: 92, fullMark: 100 },
  { metric: "Completion", value: 65, fullMark: 100 },
];

// Device Distribution
const DEVICE_DATA = [
  { name: "Mobile", value: 5840, color: "#3b82f6" },
  { name: "Desktop", value: 3420, color: "#8b5cf6" },
  { name: "Tablet", value: 1890, color: "#10b981" },
  { name: "Smart TV", value: 1240, color: "#f59e0b" },
];

// Revenue by Source
const REVENUE_SOURCE_DATA = [
  { source: "Subscriptions", amount: 45000, percentage: 45 },
  { source: "Ads", amount: 32000, percentage: 32 },
  { source: "Sponsorships", amount: 15000, percentage: 15 },
  { source: "Donations", amount: 8000, percentage: 8 },
];

// Traffic Source Data
const TRAFFIC_SOURCE_DATA = [
  { source: "Direct", visitors: 12500, color: "#8b5cf6" },
  { source: "Search", visitors: 18900, color: "#3b82f6" },
  { source: "Social Media", visitors: 15200, color: "#ec4899" },
  { source: "Referral", visitors: 8400, color: "#10b981" },
  { source: "Email", visitors: 5800, color: "#f59e0b" },
];

export const Analytics = () => {
  const [analytics] = useState(MOCK_ANALYTICS);
  // const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-green-600 to-teal-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <TrendingUp className="w-7 h-7 sm:w-10 sm:h-10" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              Analytics
            </h1>
          </div>
          <p className="text-green-100 text-base sm:text-lg lg:text-xl font-medium">
            Platform performance metrics and insights
          </p>
        </div>
      </div>

      {/* Growth Metrics */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          Growth Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card
            title="User Growth"
            value={`${analytics.userGrowth}%`}
            icon={<Users size={24} />}
            trend={`+${analytics.userGrowth}%`}
            trendUp={true}
            className="bg-linear-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500"
          />
          <Card
            title="Video Growth"
            value={`${analytics.videoGrowth}%`}
            icon={<Video size={24} />}
            trend={`+${analytics.videoGrowth}%`}
            trendUp={true}
            className="bg-linear-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500"
          />
          <Card
            title="Revenue Growth"
            value={`${analytics.revenueGrowth}%`}
            icon={<DollarSign size={24} />}
            trend={`+${analytics.revenueGrowth}%`}
            trendUp={true}
            className="bg-linear-to-br from-green-50 to-green-100 border-l-4 border-green-500"
          />
          <Card
            title="Engagement Rate"
            value={`${analytics.engagementRate}%`}
            icon={<TrendingUp size={24} />}
            trend={`+${analytics.engagementRate}%`}
            trendUp={true}
            className="bg-linear-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500"
          />
        </div>
      </div>

      {/* Watch Time Metrics */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          Watch Time
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card
            title="Average Watch Time"
            value={analytics.avgWatchTime}
            icon={<Clock size={24} />}
            trend="+8.2%"
            trendUp={true}
            className="bg-linear-to-br from-indigo-50 to-indigo-100 border-l-4 border-indigo-500"
          />
          <Card
            title="Total Watch Time"
            value={analytics.totalWatchTime}
            icon={<Eye size={24} />}
            trend="+15.3%"
            trendUp={true}
            className="bg-linear-to-br from-pink-50 to-pink-100 border-l-4 border-pink-500"
          />
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">
            User Growth Trend
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Total and active users over the last 12 months
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={USER_GROWTH_DATA}>
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
            <Line
              type="monotone"
              dataKey="users"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: "#8b5cf6", r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="activeUsers"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Video Performance Chart */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">
            Video Performance (Last 10 Days)
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Daily uploads, views, and engagement
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={VIDEO_PERFORMANCE_DATA}>
            <defs>
              <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="colorViewsAnalytics"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="uploads"
              stroke="#ec4899"
              fillOpacity={1}
              fill="url(#colorUploads)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorViewsAnalytics)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="likes"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorLikes)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement & Device Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Engagement Radar Chart */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">
              Engagement Metrics
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Multi-dimensional engagement analysis
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={ENGAGEMENT_DATA}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="metric"
                style={{ fontSize: "12px", fontWeight: "600" }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Engagement"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">
              Device Distribution
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              User traffic by device type
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={DEVICE_DATA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
              >
                {DEVICE_DATA.map((entry, index) => (
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

      {/* Revenue & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue by Source */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">
              Revenue by Source
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Income breakdown by category
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {REVENUE_SOURCE_DATA.map((item, idx) => (
              <div key={idx} className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    {item.source}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600">
                    ${item.amount.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div
                    className={`h-2 sm:h-3 rounded-full ${
                      idx === 0
                        ? "bg-linear-to-r from-purple-500 to-purple-600"
                        : idx === 1
                          ? "bg-linear-to-r from-blue-500 to-blue-600"
                          : idx === 2
                            ? "bg-linear-to-r from-green-500 to-green-600"
                            : "bg-linear-to-r from-orange-500 to-orange-600"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="pt-3 sm:pt-4 border-t border-gray-200 mt-3 sm:mt-4">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-black text-gray-900">
                  Total Revenue
                </span>
                <span className="text-xl sm:text-2xl font-black text-green-600">
                  $
                  {REVENUE_SOURCE_DATA.reduce(
                    (sum, item) => sum + item.amount,
                    0,
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">
              Traffic Sources
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Visitor origins and channels
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={TRAFFIC_SOURCE_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                stroke="#6b7280"
                style={{ fontSize: "14px", fontWeight: "600" }}
              />
              <YAxis
                dataKey="source"
                type="category"
                stroke="#6b7280"
                style={{ fontSize: "14px", fontWeight: "600" }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="visitors" radius={[0, 8, 8, 0]}>
                {TRAFFIC_SOURCE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Videos</h2>
          <div className="space-y-3">
            {[
              { title: "CSS Grid Layout Tutorial", views: "234K" },
              { title: "React Performance", views: "189K" },
              { title: "Node.js Best Practices", views: "156K" },
              { title: "Introduction to React Hooks", views: "125K" },
            ].map((video, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-purple-600">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-gray-900">
                    {video.title}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {video.views} views
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Channels</h2>
          <div className="space-y-3">
            {[
              { name: "Design Hub", subscribers: "234K" },
              { name: "Frontend Masters", subscribers: "189K" },
              { name: "Backend Pro", subscribers: "156K" },
              { name: "Tech Academy", subscribers: "125K" },
            ].map((channel, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-600">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-gray-900">
                    {channel.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {channel.subscribers} subs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
