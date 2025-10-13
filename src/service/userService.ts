import { message } from "antd";
import axios from "../until/customize-axios";

// Cấu trúc dữ liệu trả về từ BE cho getUserInfo
export interface UserRole {
  roleId: number;
  roleName: string;
  description: string;
  permissions: any[];
}

export interface UserData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string;
  gender: number;
  placeOfBirth: string;
  religion: string;
  dateOfBirth: string;
  citizenIdCard: string;
  issuedDate: string;
  object: string;
  policyArea: string;
  dateOfJoinUnion: string;
  dateOfJoinParty: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  accountHolderName: string;
  accountStatus: number;
  role: UserRole;
}

export interface GetUserInfoResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    studentId: number;
    user: UserData;
    mssv: string;
    className: string;
    programName: string;
    departmentName: string;
    yearOfAddmision: number;
    trainningLevel: string;
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
  getUserInfo: async (): Promise<GetUserInfoResponse["data"]> => {
    const response: GetUserInfoResponse = await axios.get("/api/Student/byToken");
    if (!response.success) {
      message.error(response.message || "Lấy thông tin người dùng thất bại");
      throw new Error(response.message || "Get user info failed");
    }
    return response.data;
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
