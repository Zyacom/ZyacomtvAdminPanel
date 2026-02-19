import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Plus, Edit2, Trash2, Video, Eye, Loader2 } from "lucide-react";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { CategoryModal } from "../components/CategoryModal";
import { PermissionGuard } from "../components/ProtectedRoute";
import { toast } from "react-toastify";
import categoriesService from "../services/categoriesService";

// Interface for category from API
interface Category {
  id: number;
  name: string;
  type: string;
  description: string | null;
  videoCount: number;
  channelCount: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for statistics
interface Stats {
  totalCategories: number;
  totalVideos: number;
  totalChannels: number;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  Technology: "💻",
  Education: "📚",
  Entertainment: "🎬",
  Gaming: "🎮",
  Music: "🎵",
  Sports: "⚽",
  News: "📰",
  Cooking: "🍳",
  Lifestyle: "🌟",
  Travel: "✈️",
  Health: "❤️",
  Science: "🔬",
  Business: "💼",
  Art: "🎨",
  Comedy: "😂",
  Documentary: "📹",
};

// Category colors mapping
const CATEGORY_COLORS: Record<string, string> = {
  Technology: "blue",
  Education: "green",
  Entertainment: "purple",
  Gaming: "red",
  Music: "pink",
  Sports: "orange",
  News: "indigo",
  Cooking: "yellow",
  Lifestyle: "teal",
  Travel: "cyan",
  Health: "rose",
  Science: "emerald",
  Business: "slate",
  Art: "violet",
  Comedy: "amber",
  Documentary: "gray",
};

export const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCategories: 0,
    totalVideos: 0,
    totalChannels: 0,
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    categoryId: number | null;
    categoryName: string;
    videoCount: number;
  }>({ isOpen: false, categoryId: null, categoryName: "", videoCount: 0 });
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    editCategory: Category | null;
  }>({ isOpen: false, editCategory: null });

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getCategories("media");
      if (response?.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await categoriesService.getStats();
      if (response?.data?.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  const getCategoryIcon = (name: string) => {
    return CATEGORY_ICONS[name] || "📁";
  };

  const getCategoryColor = (name: string) => {
    return CATEGORY_COLORS[name] || "gray";
  };

  const handleViewVideos = (categoryName: string) => {
    navigate(`/videos?category=${encodeURIComponent(categoryName)}`);
  };

  const handleDelete = (category: Category) => {
    setConfirmModal({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name,
      videoCount: category.videoCount,
    });
  };

  const confirmDelete = async () => {
    if (confirmModal.categoryId) {
      try {
        await categoriesService.deleteCategory(confirmModal.categoryId);
        toast.success("Category deleted successfully");
        fetchCategories();
        fetchStats();
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Failed to delete category";
        toast.error(message);
      }
    }
    setConfirmModal({
      isOpen: false,
      categoryId: null,
      categoryName: "",
      videoCount: 0,
    });
  };

  const handleCreateCategory = async (categoryData: any) => {
    try {
      await categoriesService.createCategory({
        name: categoryData.name,
        type: "media",
        description: categoryData.description,
      });
      toast.success("Category created successfully");
      fetchCategories();
      fetchStats();
      setCategoryModal({ isOpen: false, editCategory: null });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to create category";
      toast.error(message);
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    if (!categoryModal.editCategory) return;

    try {
      await categoriesService.updateCategory(categoryModal.editCategory.id, {
        name: categoryData.name,
        type: "media",
        description: categoryData.description,
      });
      toast.success("Category updated successfully");
      fetchCategories();
      setCategoryModal({ isOpen: false, editCategory: null });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update category";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-orange-600 via-red-600 to-pink-600 rounded-3xl p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Folder
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                Categories
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-orange-100 font-medium">
              Organize content by categories
            </p>
          </div>
          <PermissionGuard permissions={["categories.create"]}>
            <Button
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-gray-100 w-full sm:w-auto"
              onClick={() =>
                setCategoryModal({ isOpen: true, editCategory: null })
              }
            >
              <Plus size={18} className="mr-2" />
              Add Category
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Categories
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalCategories}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Videos
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalVideos.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500 col-span-2 md:col-span-1">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
            Total Channels
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalChannels}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : categories.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No Categories Found
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first category
          </p>
          <Button
            variant="primary"
            onClick={() =>
              setCategoryModal({ isOpen: true, editCategory: null })
            }
          >
            <Plus size={18} className="mr-2" />
            Add Category
          </Button>
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl p-6 sm:p-8 border border-gray-100 overflow-hidden hover:shadow-3xl transition-all duration-300 hover:-translate-y-2"
            >
              <div
                className={`absolute top-0 left-0 w-full h-2 bg-${getCategoryColor(category.name)}-500`}
              ></div>

              <div className="text-center">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="space-y-2 mb-4 sm:mb-6">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Video size={16} />
                    <span className="text-xs sm:text-sm font-semibold">
                      {category.videoCount.toLocaleString()} videos
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Folder size={16} />
                    <span className="text-xs sm:text-sm font-semibold">
                      {category.channelCount} channels
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <PermissionGuard permissions={["categories.view"]}>
                    <button
                      onClick={() => handleViewVideos(category.name)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="View Videos"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permissions={["categories.edit"]}>
                    <button
                      onClick={() =>
                        setCategoryModal({
                          isOpen: true,
                          editCategory: category,
                        })
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permissions={["categories.delete"]}>
                    <button
                      onClick={() => handleDelete(category)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            categoryId: null,
            categoryName: "",
            videoCount: 0,
          })
        }
        onConfirm={confirmDelete}
        title="Delete Category"
        message={
          confirmModal.videoCount > 0
            ? `This category "${confirmModal.categoryName}" has ${confirmModal.videoCount} videos. You must reassign or delete these videos before deleting this category.`
            : `Are you sure you want to delete "${confirmModal.categoryName}"? This action cannot be undone.`
        }
        confirmText="Delete"
        variant="danger"
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={() => setCategoryModal({ isOpen: false, editCategory: null })}
        onSubmit={
          categoryModal.editCategory
            ? handleUpdateCategory
            : handleCreateCategory
        }
        editCategory={categoryModal.editCategory}
      />
    </div>
  );
};
