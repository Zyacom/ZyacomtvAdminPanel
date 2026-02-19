import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "../config/Api";

export const categoriesService = {
  // Get all categories with video counts (add includeStats=true for counts)
  getCategories: async (type: "media" | "support" = "media") => {
    return await makeGetRequest(`categories?type=${type}&includeStats=true`);
  },

  // Get category statistics
  getStats: async () => {
    return await makeGetRequest("categories/stats");
  },

  // Create a new category
  createCategory: async (data: {
    name: string;
    type: "media" | "support";
    description?: string;
  }) => {
    return await makePostRequest("categories", data);
  },

  // Update a category
  updateCategory: async (
    categoryId: number,
    data: {
      name?: string;
      type?: "media" | "support";
      description?: string;
    },
  ) => {
    return await makePutRequest(`categories/${categoryId}`, data);
  },

  // Delete a category
  deleteCategory: async (categoryId: number) => {
    return await makeDeleteRequest(`categories/${categoryId}`);
  },
};

export default categoriesService;
