import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { X, Edit, Trash2, FolderOpen, Eye } from "lucide-react";
import {
  getAdPages,
  createAdPage,
  updateAdPage,
  deleteAdPage,
  AdPage,
  CreateAdPagePayload,
} from "../services/adPagesService";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { useNavigate } from "react-router-dom";

const AdPages = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<AdPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingPage, setViewingPage] = useState<AdPage | null>(null);
  const [editingPage, setEditingPage] = useState<AdPage | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [formData, setFormData] = useState<CreateAdPagePayload>({
    name: "",
    slug: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await getAdPages();
      if (response.data.status && response.data.data) {
        setPages(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch ad pages");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (page?: AdPage) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        name: page.name,
        slug: page.slug,
        description: page.description || "",
        status: page.status,
      });
    } else {
      setEditingPage(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingPage) {
        await updateAdPage(editingPage.id, formData);
        toast.success("Ad page updated successfully");
      } else {
        await createAdPage(formData);
        toast.success("Ad page created successfully");
      }
      setShowModal(false);
      fetchPages();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAdPage(deletingId);
      toast.success("Ad page deleted successfully");
      setDeletingId(null);
      fetchPages();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ad page");
      setDeletingId(null);
    }
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: pages.length,
    active: pages.filter((p) => p.status === "active").length,
    inactive: pages.filter((p) => p.status === "inactive").length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ad Pages Management</h1>
        <PermissionGuard permissions={["advertisements_create"]}>
          <Button onClick={() => handleOpenModal()}>Create New Page</Button>
        </PermissionGuard>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Pages</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Pages</h3>
          <p className="text-3xl font-bold">{stats.active}</p>
        </div>
        <div className="bg-red-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Inactive Pages</h3>
          <p className="text-3xl font-bold">{stats.inactive}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredPages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No ad pages found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slots
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={page.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {page.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        page.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/ad-slots/${page.id}`)}
                      className="text-xs"
                    >
                      <FolderOpen size={12} className="sm:mr-1" />
                      <span className="hidden sm:inline">Manage Slots</span>
                      <span className="ml-1">({page.slots?.length || 0})</span>
                    </Button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setViewingPage(page)}
                        className="text-xs"
                      >
                        <Eye size={12} className="sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <PermissionGuard permissions={["advertisements_update"]}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenModal(page)}
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
                          onClick={() => setDeletingId(page.id)}
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
                    {editingPage ? "Edit Ad Page" : "Create Ad Page"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingPage
                      ? "Update the page information"
                      : "Add a new advertisement page to your platform"}
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
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Page Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const updates: any = { name };
                    // Auto-generate slug only when creating new page
                    if (!editingPage) {
                      updates.slug = name
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .trim();
                    }
                    setFormData({ ...formData, ...updates });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="e.g., Home Page, Video Page"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition font-mono text-sm"
                  placeholder="e.g., home-page, video-page"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  URL-friendly identifier (lowercase, use hyphens)
                </p>
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
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
                  placeholder="Describe this ad page and its purpose..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                >
                  <option value="active">✓ Active</option>
                  <option value="inactive">✕ Inactive</option>
                </select>
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
                  ) : editingPage ? (
                    "Update Page"
                  ) : (
                    "Create Page"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fadeIn">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Ad Page Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    View complete information
                  </p>
                </div>
                <button
                  onClick={() => setViewingPage(null)}
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
                <p className="text-gray-900 font-medium">{viewingPage.id}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Name
                </label>
                <p className="text-gray-900 font-medium">{viewingPage.name}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Slug
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {viewingPage.slug}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {viewingPage.description || "No description provided"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    viewingPage.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {viewingPage.status}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Total Slots
                </label>
                <p className="text-gray-900 font-medium">
                  {viewingPage.slots?.length || 0}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => setViewingPage(null)}
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
        title="Delete Ad Page"
        message="Are you sure you want to delete this ad page? All slots within this page will also be deleted."
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdPages;
