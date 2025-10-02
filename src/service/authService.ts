import axios from "../until/customize-axios";

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
    try {
      const response = await axios.post("/api/v1/Auth/login", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register
  register: async (data: RegisterRequest): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Auth/register", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout
  logout: async (): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Auth/logout");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  // Refresh Token
  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    try {
      const response = await axios.post("/api/v1/Auth/refresh-token", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  // Change Password
  changePassword: async (data: ChangePasswordRequest): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Auth/change-password", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Change password failed');
    }
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Auth/forgot-password", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Forgot password failed');
    }
  },

  // Introspect Token
  introspect: async (token: string): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Auth/introspect", { token });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token introspection failed');
    }
  },

  // Get User Profile
  getUserProfile: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Auth/profile");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get user profile failed');
    }
  },

  // Update User Profile
  updateUserProfile: async (data: any): Promise<any> => {
    try {
      const response = await axios.put("/api/v1/Auth/profile", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update user profile failed');
    }
  }
};
