import axios from "../until/customize-axios";
import { message } from "antd";

// Auth interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  fullName: string;
  phone?: string;
  role?: number;
}

export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    token: {
      accessToken: string;
      refreshToken: string;
    };
    user: {
      userId: number;
      username: string;
      fullName: string;
      passwordHash: string;
      email: string;
      phone: string;
      gender: number;
      address: string;
      avatarUrl: string;
      accountStatus: number;
      refreshToken: string;
      refreshTokenExpiryTime: string;
      createdAt: string;
      role: {
        roleId: number;
        roleName: string;
        description: string;
        permissions: any[];
      };
    };
  };
}

export interface RefreshTokenRequest {
  userId: number;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export const authService = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse["data"]>("/api/v1/Auth/login", data);
    if (!response.success) {
      message.error(response.message || "Đăng nhập thất bại");
      throw new Error(response.message || "Login failed");
    }
    return response as LoginResponse;
  },

  // Register
  register: async (data: RegisterRequest): Promise<any> => {
    const response = await axios.post("/api/v1/Auth/register", data);
    if (!response.success) {
      message.error(response.message || "Đăng ký thất bại");
      throw new Error(response.message || "Registration failed");
    }
    return response;
  },

  // Logout
  logout: async (): Promise<any> => {
    const response = await axios.post("/api/v1/Auth/logout");
    if (!response.success) {
      message.error(response.message || "Đăng xuất thất bại");
      throw new Error(response.message || "Logout failed");
    }
    return response.data;
  },

  // Refresh Token
  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await axios.post("/api/v1/Auth/refresh-token", data);
    if (!response.success) {
      message.error(response.message || "Làm mới token thất bại");
      throw new Error(response.message || "Token refresh failed");
    }
    return response as RefreshTokenResponse;
  },

  // Change Password
  changePassword: async (data: ChangePasswordRequest): Promise<any> => {
    const response = await axios.post("/api/v1/Auth/change-password", data);
    if (!response.success) {
      message.error(response.message || "Đổi mật khẩu thất bại");
      throw new Error(response.message || "Change password failed");
    }
    return response.data;
  },

  introspect: async (token: string): Promise<any> => {
    const response = await axios.post("/api/v1/Auth/introspect", { token });
    if (!response.success) {
      message.error(response.message || "Kiểm tra token thất bại");
      throw new Error(response.message || "Token introspection failed");
    }
    return response.data;
  },

  // Get User Profile
  getUserProfile: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Auth/profile");
    if (!response.success) {
      message.error(response.message || "Lấy thông tin thất bại");
      throw new Error(response.message || "Get user profile failed");
    }
    return response.data;
  },

  // Update User Profile
  updateUserProfile: async (data: any): Promise<any> => {
    const response = await axios.put("/api/v1/Auth/profile", data);
    if (!response.success) {
      message.error(response.message || "Cập nhật thông tin thất bại");
      throw new Error(response.message || "Update user profile failed");
    }
    return response.data;
  }
};
