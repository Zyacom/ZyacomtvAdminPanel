import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  Users,
  DollarSign,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Crown,
  Star,
} from "lucide-react";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import subscriptionPlansService, {
  SubscriptionPlan,
  CreatePlanPayload,
  UpdatePlanPayload,
} from "../services/subscriptionPlansService";

// Create/Edit Plan Modal
interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onSave: (data: CreatePlanPayload | UpdatePlanPayload) => Promise<void>;
  isLoading: boolean;
}

const PlanModal = ({
  isOpen,
  onClose,
  plan,
  onSave,
  isLoading,
}: PlanModalProps) => {
  const [formData, setFormData] = useState<CreatePlanPayload>({
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    billingCycle: "monthly",
    type: "user",
    isActive: true,
    isPublic: true,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency || "USD",
        billingCycle: plan.billingCycle,
        type: plan.type,
        isActive: plan.isActive,
        isPublic: plan.isPublic,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        billingCycle: "monthly",
        type: "user",
        isActive: true,
        isPublic: true,
      });
    }
  }, [plan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (formData.price < 0) {
      toast.error("Price cannot be negative");
      return;
    }
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">
              {plan ? "Edit Plan" : "Create New Plan"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Plan Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium"
              placeholder="e.g., Creator Pro"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium resize-none"
              placeholder="Describe the plan features..."
              rows={3}
            />
          </div>

          {/* Price and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Billing Cycle and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Billing Cycle
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingCycle: e.target.value as "monthly" | "yearly",
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Plan Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "creator" | "user",
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="user">User</option>
                <option value="creator">Creator</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span className="font-medium text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span className="font-medium text-gray-700">Public</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : plan ? (
                "Update Plan"
              ) : (
                "Create Plan"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    planId: number | null;
  }>({ isOpen: false, planId: null });

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionPlansService.getPlansWithStats();
      if (response?.packages) {
        setPlans(response.packages);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch subscription plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, planId: id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.planId) return;

    try {
      setActionLoading(true);
      await subscriptionPlansService.deletePlan(confirmModal.planId);
      toast.success("Plan deleted successfully");
      setConfirmModal({ isOpen: false, planId: null });
      fetchPlans();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete plan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (data: CreatePlanPayload | UpdatePlanPayload) => {
    try {
      setActionLoading(true);
      if (editingPlan) {
        await subscriptionPlansService.updatePlan(editingPlan.id, data);
        toast.success("Plan updated successfully");
      } else {
        await subscriptionPlansService.createPlan(data as CreatePlanPayload);
        toast.success("Plan created successfully");
      }
      setShowModal(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        editingPlan ? "Failed to update plan" : "Failed to create plan",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return plans.reduce((sum, plan) => sum + (plan.totalRevenue || 0), 0);
  };

  const getTotalSubscribers = () => {
    return plans.reduce((sum, plan) => sum + (plan.subscribers || 0), 0);
  };

  const getTypeIcon = (type: string) => {
    if (type === "creator") {
      return <Crown size={16} className="text-yellow-500" />;
    }
    return <Users size={16} className="text-blue-500" />;
  };

  const getTypeColor = (type: string) => {
    if (type === "creator") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <CreditCard className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Subscription Plans
              </h1>
            </div>
            <p className="text-emerald-100 font-medium">
              Create and manage subscription packages for users and creators
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchPlans}>
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
            <PermissionGuard permissions={["subscriptions.create"]}>
              <Button
                onClick={handleCreate}
                className="bg-white text-emerald-600 hover:bg-gray-100"
              >
                <Plus size={18} className="mr-2" />
                Create Plan
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Plans</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-black text-purple-600">
              {plans.length}
            </p>
            <Package size={20} className="text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Active Subscribers
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-black text-blue-600">
              {getTotalSubscribers().toLocaleString()}
            </p>
            <Users size={20} className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">
            Total Revenue
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-black text-green-600">
              $
              {getTotalRevenue().toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <DollarSign size={20} className="text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Active Plans</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-black text-orange-600">
              {plans.filter((p) => p.isActive).length}
            </p>
            <Check size={20} className="text-orange-600" />
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              No subscription plans found
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Create your first plan to get started
            </p>
            <PermissionGuard permissions={["subscriptions.create"]}>
              <Button onClick={handleCreate}>
                <Plus size={18} className="mr-2" />
                Create Plan
              </Button>
            </PermissionGuard>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Billing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Subscribers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                          <Star size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {plan.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {plan.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full capitalize ${getTypeColor(plan.type)}`}
                      >
                        {getTypeIcon(plan.type)}
                        {plan.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-green-600">
                        ${plan.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {plan.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 capitalize">
                        {plan.billingCycle}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">
                          {(plan.subscribers || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-green-600">
                        $
                        {(plan.totalRevenue || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {plan.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                            <Check size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
                            <X size={12} />
                            Inactive
                          </span>
                        )}
                        {plan.isPublic ? (
                          <Eye size={14} className="text-gray-400" />
                        ) : (
                          <EyeOff size={14} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PermissionGuard permissions={["subscriptions.edit"]}>
                          <button
                            onClick={() => handleEdit(plan)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Plan"
                          >
                            <Edit2 size={16} className="text-gray-600" />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permissions={["subscriptions.delete"]}>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Plan"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plans Cards (Alternative View) */}
      {!loading && plans.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">
            Plans Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl p-4 border-2 ${
                  plan.isActive
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {plan.type === "creator" && (
                  <div className="absolute top-2 right-2">
                    <Crown size={16} className="text-yellow-500" />
                  </div>
                )}
                <div className="text-center">
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-black text-emerald-600 mt-2">
                    ${plan.price}
                    <span className="text-sm text-gray-500 font-medium">
                      /{plan.billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {plan.subscribers || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {(plan.totalRevenue || 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <PlanModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlan(null);
        }}
        plan={editingPlan}
        onSave={handleSave}
        isLoading={actionLoading}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, planId: null })}
        onConfirm={confirmDelete}
        title="Delete Subscription Plan"
        message="Are you sure you want to delete this subscription plan? Users with active subscriptions will not be affected, but new signups will not be possible."
        confirmText={actionLoading ? "Deleting..." : "Delete Plan"}
        variant="danger"
      />
    </div>
  );
};
