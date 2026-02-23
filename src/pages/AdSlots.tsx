import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { X, Edit, Trash2, Eye } from "lucide-react";
import {
  getAdSlots,
  createAdSlot,
  updateAdSlot,
  deleteAdSlot,
  AdSlot,
  CreateAdSlotPayload,
} from "../services/adSlotsService";
import { getAdPages, AdPage } from "../services/adPagesService";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { PermissionGuard } from "../components/ProtectedRoute";

const AdSlots = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [currentPage, setCurrentPage] = useState<AdPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingSlot, setViewingSlot] = useState<AdSlot | null>(null);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<CreateAdSlotPayload>({
    title: "",
    description: "",
    price: 0,
    adPageId: Number(pageId),
  });

  useEffect(() => {
    if (pageId) {
      fetchPageInfo();
      fetchSlots();
    }
  }, [pageId]);

  const fetchPageInfo = async () => {
    try {
      const response = await getAdPages();
      if (response.data.status && response.data.data) {
        const page = response.data.data.find(
          (p: AdPage) => p.id === Number(pageId),
        );
        setCurrentPage(page || null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch page info");
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await getAdSlots(Number(pageId));
      if (response.data.status && response.data.data) {
        setSlots(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch ad slots");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (slot?: AdSlot) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        title: slot.title,
        description: slot.description || "",
        price: slot.price,
        adPageId: slot.adPageId,
      });
    } else {
      setEditingSlot(null);
      setFormData({
        title: "",
        description: "",
        price: 0,
        adPageId: Number(pageId),
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.price < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSlot) {
        await updateAdSlot(editingSlot.id, formData);
        toast.success("Ad slot updated successfully");
      } else {
        await createAdSlot(formData);
        toast.success("Ad slot created successfully");
      }
      setShowModal(false);
      fetchSlots();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAdSlot(deletingId);
      toast.success("Ad slot deleted successfully");
      setDeletingId(null);
      fetchSlots();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ad slot");
      setDeletingId(null);
    }
  };

  const filteredSlots = slots.filter(
    (slot) =>
      slot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    total: slots.length,
    avgPrice:
      slots.length > 0
        ? slots.reduce((sum, s) => sum + s.price, 0) / slots.length
        : 0,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate("/ad-pages")}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Back to Ad Pages
          </button>
          <h1 className="text-2xl font-bold">
            {currentPage
              ? `${currentPage.name} - Ad Slots`
              : "Ad Slots Management"}
          </h1>
        </div>
        <PermissionGuard permissions={["advertisements_create"]}>
          <Button onClick={() => handleOpenModal()}>Create New Slot</Button>
        </PermissionGuard>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Slots</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Average Price</h3>
          <p className="text-3xl font-bold">${stats.avgPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredSlots.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No ad slots found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSlots.map((slot) => (
                <tr key={slot.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {slot.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slot.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(slot.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setViewingSlot(slot)}
                        className="text-xs"
                      >
                        <Eye size={12} className="sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <PermissionGuard permissions={["advertisements_update"]}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenModal(slot)}
                          className="text-xs"
                        >
                          <Edit size={12} className="sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permissions={["advertisements_delete"]}>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeletingId(slot.id)}
                          className="text-xs"
                        >
                          <Trash2 size={12} className="sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fadeIn">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingSlot ? "Edit Ad Slot" : "Create Ad Slot"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingSlot
                      ? "Update the slot information"
                      : `Add a new advertisement slot to ${currentPage?.name || "this page"}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Slot Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="e.g., Header Banner, Sidebar Ad"
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
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
                  placeholder="Describe this ad slot placement and specifications..."
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Set the advertising price for this slot
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="primary">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : editingSlot ? (
                    "Update Slot"
                  ) : (
                    "Create Slot"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fadeIn">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Ad Slot Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    View complete information
                  </p>
                </div>
                <button
                  onClick={() => setViewingSlot(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  ID
                </label>
                <p className="text-gray-900 font-medium">{viewingSlot.id}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Title
                </label>
                <p className="text-gray-900 font-medium">{viewingSlot.title}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {viewingSlot.description || "No description provided"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Price
                </label>
                <p className="text-gray-900 font-medium text-lg">
                  ${Number(viewingSlot.price).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Ad Page
                </label>
                <p className="text-gray-900 font-medium">
                  {currentPage?.name || "N/A"}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => setViewingSlot(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Ad Slot"
        message="Are you sure you want to delete this ad slot? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdSlots;
