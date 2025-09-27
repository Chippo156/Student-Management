import axios from "../until/customize-axios";

// User interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  role: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  image?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: number;
}

export const userService = {
  getUserInfo: async () => {
    try {
      const response = await axios.get("/users/my-info");
      return response;
    } catch (error) {
      console.error("Get user info error:", error);
      throw error;
    }
  },

  updateUserInfo: async (data: UpdateUserRequest) => {
    try {
      const response = await axios.put("/users/update", data);
      return response;
    } catch (error) {
      console.error("Update user info error:", error);
      throw error;
    }
  },

  changePassword: async (data: ChangePasswordRequest) => {
    try {
      const response = await axios.put("/users/change-password", data);
      return response;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  uploadAvatar: async (formData: FormData) => {
    try {
      const response = await axios.post("/users/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error("Upload avatar error:", error);
      throw error;
    }
  },

  getAllUsers: async (params?: GetUsersParams) => {
    try {
      const response = await axios.get("/users", { params });
      return response;
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  },

  getUserById: async (id: string) => {
    try {
      const response = await axios.get(`/users/${id}`);
      return response;
    } catch (error) {
      console.error("Get user by id error:", error);
      throw error;
    }
  },

  createUser: async (data: User) => {
    try {
      const response = await axios.post("/users", data);
      return response;
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    try {
      const response = await axios.put(`/users/${id}`, data);
      return response;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await axios.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  },
};
