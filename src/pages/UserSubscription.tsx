import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Package,
} from "lucide-react";
import { Card } from "../components/Card";

interface Subscription {
  id: string;
  planName: string;
  planType: "monthly" | "yearly";
  price: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: "success" | "failed" | "pending";
  invoiceUrl: string;
}

const MOCK_SUBSCRIPTION: Subscription = {
  id: "sub_1",
  planName: "Premium Plan",
  planType: "monthly",
  price: 49.99,
  startDate: "2024-01-15",
  endDate: "2024-04-15",
  status: "active",
  autoRenew: true,
};

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay_1",
    amount: 49.99,
    date: "2024-03-15",
    method: "Visa •••• 4242",
    status: "success",
    invoiceUrl: "#",
  },
  {
    id: "pay_2",
    amount: 49.99,
    date: "2024-02-15",
    method: "Visa •••• 4242",
    status: "success",
    invoiceUrl: "#",
  },
  {
    id: "pay_3",
    amount: 49.99,
    date: "2024-01-15",
    method: "Visa •••• 4242",
    status: "success",
    invoiceUrl: "#",
  },
  {
    id: "pay_4",
    amount: 49.99,
    date: "2023-12-15",
    method: "Mastercard •••• 5555",
    status: "failed",
    invoiceUrl: "#",
  },
];

export const UserSubscription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription] = useState(MOCK_SUBSCRIPTION);
  const [payments] = useState(MOCK_PAYMENTS);

  const totalPaid = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg">
            Active
          </span>
        );
      case "expired":
        return (
          <span className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-bold rounded-full shadow-lg">
            Expired
          </span>
        );
      case "cancelled":
        return (
          <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-full shadow-lg">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return (
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle size={20} className="text-green-600" />
          </div>
        );
      case "failed":
        return (
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle size={20} className="text-red-600" />
          </div>
        );
      case "pending":
        return (
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock size={20} className="text-yellow-600" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/users/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to User Details
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          title="Current Plan"
          value={subscription.planName}
          icon={<Package size={28} strokeWidth={2.5} />}
        />
        <Card
          title="Monthly Cost"
          value={`$${subscription.price}`}
          icon={<DollarSign size={28} strokeWidth={2.5} />}
        />
        <Card
          title="Total Paid"
          value={`$${totalPaid.toFixed(2)}`}
          icon={<CreditCard size={28} strokeWidth={2.5} />}
        />
        <Card
          title="Payments"
          value={payments.length}
          icon={<TrendingUp size={28} strokeWidth={2.5} />}
        />
      </div>

      {/* Subscription Details */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              {subscription.planName}
            </h2>
            <p className="text-white/80 font-medium text-lg">
              ${subscription.price} / {subscription.planType}
            </p>
          </div>
          {getStatusBadge(subscription.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} className="text-white" />
              <p className="text-white/80 font-semibold">Start Date</p>
            </div>
            <p className="text-2xl font-black text-white">
              {new Date(subscription.startDate).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} className="text-white" />
              <p className="text-white/80 font-semibold">Next Billing</p>
            </div>
            <p className="text-2xl font-black text-white">
              {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={24} className="text-white" />
              <p className="text-white/80 font-semibold">Auto Renew</p>
            </div>
            <p className="text-2xl font-black text-white">
              {subscription.autoRenew ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Payment History
        </h2>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                {getPaymentStatusIcon(payment.status)}
                <div>
                  <p className="text-base font-black text-gray-900">
                    {payment.method}
                  </p>
                  <p className="text-sm text-gray-600 font-medium mt-0.5">
                    {new Date(payment.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">
                    ${payment.amount}
                  </p>
                  <p
                    className={`text-sm font-bold mt-0.5 ${
                      payment.status === "success"
                        ? "text-green-600"
                        : payment.status === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </p>
                </div>

                {payment.status === "success" && (
                  <a
                    href={payment.invoiceUrl}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    Invoice
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer">
          Upgrade Plan
        </button>
        <button className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer">
          Cancel Subscription
        </button>
      </div>
    </div>
  );
};
