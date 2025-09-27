import axios from "../until/customize-axios";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  code: number;
  message?: string;
  result: {
    token: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

interface IntrospectRequest {
  token: string;
}

interface IntrospectResponse {
  code: number;
  message?: string;
  result: {
    userId: string;
    username: string;
    email: string;
    roles?: string[];
    [key: string]: any;
  };
}

interface LogoutRequest {
  token: string;
}

interface LogoutResponse {
  code: number;
  message?: string;
  result?: any;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response: LoginResponse = await axios.post("/auth/token", {
      username: email,
      password: password,
    } as LoginRequest);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const reloadUser = async (token: string): Promise<IntrospectResponse> => {
  try {
    const response: IntrospectResponse = await axios.post("/auth/introspect", { 
      token: token 
    } as IntrospectRequest);
    return response;
  } catch (error) {
    console.error("Reload user error:", error);
    throw error;
  }
};

export const logoutUser = async (token: string): Promise<LogoutResponse> => {
  try {
    const response: LogoutResponse = await axios.post("/auth/logout", { 
      token: token 
    } as LogoutRequest);
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};