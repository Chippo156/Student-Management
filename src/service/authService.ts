import axios from "../until/customize-axios";

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  role?: number;
}

export interface AuthResponse {
  data: {
    result: {
      token: string;
      user: {
        id: string;
        username: string;
        email: string;
        role: number;
        image?: string;
      };
    };
  };
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post("/auth/token", data);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post("/auth/register", data);
      return response;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  introspect: async (token: string) => {
    try {
      const response = await axios.post("/auth/introspect", { token });
      return response;
    } catch (error) {
      console.error("Introspect error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post("/auth/logout");
      return response;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  refreshToken: async (token: string) => {
    try {
      const response = await axios.post("/auth/refresh", { token });
      return response;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },
};
