import { Calendar } from "lucide-react";

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  onCalendarClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Card = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  className = "",
  onCalendarClick,
}: CardProps) => {
  return (
    <div
      className={`relative bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-100/50 to-blue-100/50 rounded-bl-full -mr-16 -mt-16"></div>

      <div className="relative">
        {/* Icon at the top */}
        {icon && (
          <div className="mb-4 inline-block">
            <div className="p-3 bg-linear-to-br from-purple-500 via-purple-600 to-blue-600 rounded-xl shadow-lg">
              <div className="text-white">{icon}</div>
            </div>
          </div>
        )}

        {/* Title with calendar icon */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onCalendarClick}
            className="hover:bg-purple-100 p-1 rounded transition-colors group"
            title="Filter by date range"
          >
            <Calendar
              size={14}
              className="text-gray-400 group-hover:text-purple-600 transition-colors"
            />
          </button>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {title}
          </p>
        </div>

        {/* Value */}
        <p className="text-4xl font-black bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          {value}
        </p>

        {trend && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full ${
                trendUp
                  ? "bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-linear-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30"
              }`}
            >
              <span className="text-lg">{trendUp ? "↑" : "↓"}</span>
              {trend}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              vs last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
