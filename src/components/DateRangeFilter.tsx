import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X } from "lucide-react";

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClear?: () => void;
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangeFilterProps) => {
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleClear = () => {
    onStartDateChange(null);
    onEndDateChange(null);
    if (onClear) onClear();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* From Date */}
      <div className="relative">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          From Date
        </label>
        <div className="relative">
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              onStartDateChange(date);
              setShowFromPicker(false);
            }}
            maxDate={endDate || new Date()}
            dateFormat="MMM dd, yyyy"
            placeholderText="Select start date"
            open={showFromPicker}
            onClickOutside={() => setShowFromPicker(false)}
            onFocus={() => setShowFromPicker(true)}
            className="w-44 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm font-medium"
          />
          <Calendar
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* To Date */}
      <div className="relative">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          To Date
        </label>
        <div className="relative">
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              onEndDateChange(date);
              setShowToPicker(false);
            }}
            minDate={startDate || undefined}
            maxDate={new Date()}
            dateFormat="MMM dd, yyyy"
            placeholderText="Select end date"
            open={showToPicker}
            onClickOutside={() => setShowToPicker(false)}
            onFocus={() => setShowToPicker(true)}
            className="w-44 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm font-medium"
          />
          <Calendar
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Clear Button */}
      {(startDate || endDate) && (
        <button
          onClick={handleClear}
          className="mt-6 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
        >
          <X size={16} />
          Clear
        </button>
      )}
    </div>
  );
};
