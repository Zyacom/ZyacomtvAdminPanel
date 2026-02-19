import { useState } from "react";
import { CreditCard, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { toast } from "react-toastify";

// Mock payment gateways data
const MOCK_GATEWAYS = [
  {
    id: "1",
    name: "Stripe",
    type: "Card Payments",
    status: "active",
    apiKey: "sk_test_4eC39H...xYZ",
    isEnabled: true,
    fees: "2.9% + $0.30",
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD"],
    icon: "💳",
  },
  {
    id: "2",
    name: "PayPal",
    type: "Digital Wallet",
    status: "active",
    apiKey: "pk_live_51H...ABC",
    isEnabled: true,
    fees: "2.9% + $0.30",
    supportedCurrencies: ["USD", "EUR", "GBP"],
    icon: "🅿️",
  },
  {
    id: "3",
    name: "Razorpay",
    type: "Card & UPI",
    status: "inactive",
    apiKey: "rzp_test_1DP...XYZ",
    isEnabled: false,
    fees: "2.0%",
    supportedCurrencies: ["INR"],
    icon: "💎",
  },
  {
    id: "4",
    name: "Square",
    type: "Card Payments",
    status: "active",
    apiKey: "sq0idp-...789",
    isEnabled: true,
    fees: "2.6% + $0.10",
    supportedCurrencies: ["USD", "CAD", "AUD"],
    icon: "🔷",
  },
];

export const PaymentGateways = () => {
  const [gateways, setGateways] = useState(MOCK_GATEWAYS);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    gatewayId: string | null;
  }>({ isOpen: false, gatewayId: null });

  const handleToggleStatus = (id: string) => {
    setGateways(
      gateways.map((gw) =>
        gw.id === id
          ? {
              ...gw,
              isEnabled: !gw.isEnabled,
              status: !gw.isEnabled ? "active" : "inactive",
            }
          : gw,
      ),
    );
    toast.success(
      `Gateway ${gateways.find((gw) => gw.id === id)?.isEnabled ? "disabled" : "enabled"} successfully`,
    );
  };

  const handleDelete = (id: string) => {
    setConfirmModal({ isOpen: true, gatewayId: id });
  };

  const confirmDelete = () => {
    if (confirmModal.gatewayId) {
      setGateways(gateways.filter((gw) => gw.id !== confirmModal.gatewayId));
      toast.success("Payment gateway deleted successfully");
    }
    setConfirmModal({ isOpen: false, gatewayId: null });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-green-600 via-teal-600 to-blue-600 rounded-3xl p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <CreditCard
                    className="w-8 h-8 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <h1 className="text-5xl font-black text-white">
                  Payment Gateways
                </h1>
              </div>
              <p className="text-xl text-green-100 font-medium">
                Manage payment processing providers and configurations
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => toast.info("Add Gateway feature coming soon")}
            >
              <Plus size={20} className="mr-2" />
              Add Gateway
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Total Gateways
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {gateways.length}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Active
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {gateways.filter((gw) => gw.isEnabled).length}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-red-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Inactive
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {gateways.filter((gw) => !gw.isEnabled).length}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
            Currencies
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {new Set(gateways.flatMap((gw) => gw.supportedCurrencies)).size}
          </p>
        </div>
      </div>

      {/* Payment Gateways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gateways.map((gateway) => (
          <div
            key={gateway.id}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{gateway.icon}</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    {gateway.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {gateway.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(gateway.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  gateway.isEnabled
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {gateway.isEnabled ? (
                  <>
                    <Check size={14} />
                    Active
                  </>
                ) : (
                  <>
                    <X size={14} />
                    Inactive
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">
                  Transaction Fee
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {gateway.fees}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">
                  API Key
                </span>
                <span className="text-xs font-mono text-gray-600">
                  {gateway.apiKey}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Supported Currencies
                </p>
                <div className="flex flex-wrap gap-2">
                  {gateway.supportedCurrencies.map((currency) => (
                    <span
                      key={currency}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold"
                    >
                      {currency}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                size="sm"
                variant="primary"
                onClick={() => toast.info("Edit gateway feature coming soon")}
                className="flex-1"
              >
                <Edit2 size={14} className="mr-2" />
                Configure
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(gateway.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg mt-1">
            <CreditCard size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              About Payment Gateways
            </h3>
            <p className="text-gray-700 mb-3">
              Payment gateways enable secure transaction processing on your
              platform. Each gateway has different fees, supported currencies,
              and features. You can enable multiple gateways to provide
              flexibility for your users.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                Toggle gateways on/off as needed
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                Configure API keys securely
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                Monitor transaction fees and currencies
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, gatewayId: null })}
        onConfirm={confirmDelete}
        title="Delete Payment Gateway"
        message="Are you sure you want to delete this payment gateway? This action cannot be undone and may affect payment processing."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
