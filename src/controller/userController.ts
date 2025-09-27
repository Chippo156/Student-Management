import axios from "../until/customize-axios";

interface User {
  userId: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface GetAllUsersResponse {
  code: number;
  message?: string;
  result: {
    users: User[];
    total?: number;
    page?: number;
    limit?: number;
  };
}

export const getAllUsers = async (): Promise<GetAllUsersResponse> => {
  try {
    const response: GetAllUsersResponse = await axios.get(`/users`);
    return response;
  } catch (error) {
    console.error("Get all users error:", error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<{ code: number; result: User; message?: string }> => {
  try {
    const response = await axios.get(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error("Get user by ID error:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<{ code: number; result: User; message?: string }> => {
  try {
    const response = await axios.put(`/users/${userId}`, userData);
    return response;
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<{ code: number; message?: string }> => {
  try {
    const response = await axios.delete(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};