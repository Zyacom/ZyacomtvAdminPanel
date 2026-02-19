import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X } from "lucide-react";

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date | null, endDate: Date | null) => void;
  anchorEl?: HTMLElement | null;
}

export const DateRangePicker = ({
  isOpen,
  onClose,
  onApply,
  anchorEl,
}: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorEl]);

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onApply(null, null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose}></div>

      {/* Date Picker Modal */}
      <div
        ref={pickerRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-6 w-100 border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-purple-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">
              Select Date Range
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Date Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              From Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || new Date()}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select start date"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              To Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              maxDate={new Date()}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select end date"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate && !endDate}
            className="flex-1 px-4 py-2.5 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
          >
            Apply
          </button>
        </div>

        {/* Info Text */}
        {startDate && endDate && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs text-purple-800 font-medium">
              Showing data from{" "}
              <span className="font-bold">
                {startDate.toLocaleDateString()}
              </span>{" "}
              to{" "}
              <span className="font-bold">{endDate.toLocaleDateString()}</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
};
