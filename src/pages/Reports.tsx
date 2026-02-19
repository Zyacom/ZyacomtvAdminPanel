import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Video,
  DollarSign,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";

// Mock reports data
const MOCK_REPORTS = [
  {
    id: "1",
    name: "Monthly User Growth Report",
    type: "Users",
    period: "January 2026",
    generated: "2026-01-28",
    size: "2.4 MB",
    format: "PDF",
    icon: Users,
    color: "blue",
  },
  {
    id: "2",
    name: "Revenue Analysis Q4 2025",
    type: "Revenue",
    period: "Q4 2025",
    generated: "2026-01-15",
    size: "3.8 MB",
    format: "Excel",
    icon: DollarSign,
    color: "green",
  },
  {
    id: "3",
    name: "Content Performance Report",
    type: "Content",
    period: "December 2025",
    generated: "2026-01-10",
    size: "1.9 MB",
    format: "PDF",
    icon: Video,
    color: "purple",
  },
  {
    id: "4",
    name: "Traffic Analytics Report",
    type: "Analytics",
    period: "January 2026",
    generated: "2026-01-28",
    size: "4.2 MB",
    format: "PDF",
    icon: Eye,
    color: "orange",
  },
  {
    id: "5",
    name: "Engagement Metrics Report",
    type: "Engagement",
    period: "January 2026",
    generated: "2026-01-27",
    size: "2.1 MB",
    format: "Excel",
    icon: TrendingUp,
    color: "pink",
  },
];

const REPORT_TYPES = [
  { id: "users", name: "User Reports", icon: Users, color: "blue" },
  { id: "revenue", name: "Revenue Reports", icon: DollarSign, color: "green" },
  { id: "content", name: "Content Reports", icon: Video, color: "purple" },
  { id: "analytics", name: "Analytics Reports", icon: Eye, color: "orange" },
];

export const Reports = () => {
  const [reports] = useState(MOCK_REPORTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const handleDownload = (report: any) => {
    toast.success(`Downloading ${report.name}`);
  };

  const handleGenerate = (type: string) => {
    toast.success(`Generating ${type} report...`);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" ||
      report.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FileText
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                strokeWidth={2.5}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              Reports & Exports
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-purple-100 font-medium">
            Generate and download platform reports
          </p>
        </div>
      </div>

      {/* Quick Generate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {REPORT_TYPES.map((type) => (
          <div
            key={type.id}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
            onClick={() => handleGenerate(type.name)}
          >
            <div
              className="p-3 rounded-xl shadow-lg mb-4 w-fit"
              style={{
                background:
                  type.color === "blue"
                    ? "linear-gradient(to bottom right, #3b82f6, #2563eb)"
                    : type.color === "green"
                      ? "linear-gradient(to bottom right, #22c55e, #16a34a)"
                      : type.color === "purple"
                        ? "linear-gradient(to bottom right, #a855f7, #9333ea)"
                        : "linear-gradient(to bottom right, #f97316, #ea580c)",
              }}
            >
              <type.icon className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">
              {type.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">Generate new report</p>
            <Button
              variant="primary"
              className={`w-full bg-${type.color}-600 hover:bg-${type.color}-700`}
            >
              <Download size={16} className="mr-2" />
              Generate
            </Button>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            >
              <option value="all">All Types</option>
              <option value="users">Users</option>
              <option value="revenue">Revenue</option>
              <option value="content">Content</option>
              <option value="analytics">Analytics</option>
              <option value="engagement">Engagement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Recent Reports ({filteredReports.length})
        </h2>

        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4 sm:mb-0">
                <div
                  className="p-3 rounded-lg shadow-lg"
                  style={
                    {
                      background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                      "--tw-gradient-from": `var(--color-${report.color}-500)`,
                      "--tw-gradient-to": `var(--color-${report.color}-600)`,
                      "--tw-gradient-stops": `var(--tw-gradient-from), var(--tw-gradient-to)`,
                    } as any
                  }
                >
                  <report.icon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {report.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {report.period}
                    </span>
                    <span>•</span>
                    <span>Generated: {report.generated}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-bold">
                      {report.format}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleDownload(report)}
                className="w-full sm:w-auto"
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              No reports found
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
