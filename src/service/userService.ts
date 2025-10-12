import { notification } from "antd";
import axios from "../until/customize-axios";

export interface UserProfile {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  gender: number;
  address: string;
  avatarUrl: string;
  accountStatus: number;
  role: {
    roleId: number;
    roleName: string;
    description: string;
  };
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: number;
  address?: string;
  avatarUrl?: string;
}

export interface GetUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: number;
  status?: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userService = {
  // Get current user info
  getUserInfo: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/Student/byToken");
      if (response?.success === true) {
        return response.data;
      } else {
        notification.open({
          message: "Notification Title",
          description:
            "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
        });
        return {};
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Get user info failed");
    }
  },

  // Update user profile
  updateProfile: async (data: UpdateUserRequest): Promise<any> => {
    try {
      const response = await axios.put("/api/v1/User/profile", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Update profile failed");
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/User/change-password", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Change password failed"
      );
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.post(
        "/api/v1/User/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Upload avatar failed");
    }
  },

  // Get all users (Admin only)
  getAllUsers: async (params: GetUsersRequest): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/User/all", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Get all users failed");
    }
  },

  // Get user by ID (Admin only)
  getUserById: async (userId: number): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/User/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Get user by ID failed");
    }
  },

  // Create new user (Admin only)
  createUser: async (userData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/User/create", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Create user failed");
    }
  },

  // Update user (Admin only)
  updateUser: async (userId: number, userData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/User/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Update user failed");
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId: number): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/User/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Delete user failed");
    }
  },

  // Change user status (Admin only)
  changeUserStatus: async (userId: number, status: number): Promise<any> => {
    try {
      const response = await axios.patch(`/api/v1/User/${userId}/status`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Change user status failed"
      );
    }
  },
};
