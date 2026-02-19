import { makeGetRequest, makePostRequest } from "../config/Api";

export const authService = {
  login: async (email: string, password: string) => {
    return await makePostRequest("admin/auth/login", { email, password });
  },

  logout: async () => {
    return await makePostRequest("admin/auth/logout", {});
  },

  getProfile: async () => {
    return await makeGetRequest("admin/auth/me");
  },

  updatePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    return await makePostRequest("admin/auth/update-password", {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
  },
};
