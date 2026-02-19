import { useState } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  Video,
  DollarSign,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";
import reportsService from "../services/reportsService";

const REPORT_TYPES = [
  { id: "users", name: "User Reports", icon: Users, color: "blue" },
  { id: "revenue", name: "Revenue Reports", icon: DollarSign, color: "green" },
  { id: "content", name: "Content Reports", icon: Video, color: "purple" },
  { id: "analytics", name: "Analytics Reports", icon: Eye, color: "orange" },
  {
    id: "engagement",
    name: "Engagement Reports",
    icon: TrendingUp,
    color: "pink",
  },
];

export const Reports = () => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleGenerate = async (type: string) => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    try {
      setGenerating(type);
      const response = await reportsService.generateReport({
        type,
        startDate,
        endDate,
        format: "json",
      });

      if (response?.data?.report) {
        const report = response.data.report;

        // Download the report data immediately
        const reportName =
          REPORT_TYPES.find((r) => r.id === type)?.name || "Report";
        const filename = `${reportName.replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}`;

        // Download as JSON
        await reportsService.downloadReportData(report.data, filename, "json");

        toast.success(`${reportName} generated and downloaded successfully!`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || `Failed to generate ${type} report`);
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateCSV = async (type: string) => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    try {
      setGenerating(type);
      const response = await reportsService.generateReport({
        type,
        startDate,
        endDate,
        format: "csv",
      });

      if (response?.data?.report) {
        const report = response.data.report;

        // Download the report data as CSV
        const reportName =
          REPORT_TYPES.find((r) => r.id === type)?.name || "Report";
        const filename = `${reportName.replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}`;

        await reportsService.downloadReportData(report.data, filename, "csv");

        toast.success(`${reportName} generated and downloaded as CSV!`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || `Failed to generate ${type} report`);
    } finally {
      setGenerating(null);
    }
  };

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

      {/* Date Range Selector */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-lg font-black text-gray-900 mb-4">
          Select Date Range
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Generate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {REPORT_TYPES.map((type) => (
          <div
            key={type.id}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
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
                        : type.color === "orange"
                          ? "linear-gradient(to bottom right, #f97316, #ea580c)"
                          : "linear-gradient(to bottom right, #ec4899, #db2777)",
              }}
            >
              <type.icon className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">
              {type.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">Generate new report</p>
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleGenerate(type.id)}
                disabled={generating === type.id || !startDate || !endDate}
              >
                {generating === type.id ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    JSON
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleGenerateCSV(type.id)}
                disabled={generating === type.id || !startDate || !endDate}
              >
                {generating === type.id ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <FileText className="text-blue-600 shrink-0 mt-1" size={20} />
          <div>
            <h3 className="text-base font-bold text-blue-900 mb-1">
              How to Generate Reports
            </h3>
            <p className="text-sm text-blue-700">
              1. Select a date range above
              <br />
              2. Click on a report type to generate
              <br />
              3. Choose JSON or CSV format
              <br />
              4. The report will be downloaded automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
