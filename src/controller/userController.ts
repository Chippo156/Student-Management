import { userService, UserProfile, CreateUserRequest, UpdateUserRequest } from '../service/userService';

export class UserController {
  // Get current user profile
  static async getUserProfile(): Promise<UserProfile> {
    try {
      return await userService.getUserProfile();
    } catch (error: any) {
      console.error('Get user profile controller error:', error);
      throw error;
    }
  }

  // Update current user profile
  static async updateUserProfile(data: Partial<UserProfile>): Promise<any> {
    try {
      return await userService.updateUserProfile(data);
    } catch (error: any) {
      console.error('Update user profile controller error:', error);
      throw error;
    }
  }

  // Upload user avatar
  static async uploadAvatar(file: File): Promise<any> {
    try {
      return await userService.uploadAvatar(file);
    } catch (error: any) {
      console.error('Upload avatar controller error:', error);
      throw error;
    }
  }

  // Delete user avatar
  static async deleteAvatar(): Promise<any> {
    try {
      return await userService.deleteAvatar();
    } catch (error: any) {
      console.error('Delete avatar controller error:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    try {
      return await userService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      console.error('Change password controller error:', error);
      throw error;
    }
  }

  // Get user preferences
  static async getUserPreferences(): Promise<any> {
    try {
      return await userService.getUserPreferences();
    } catch (error: any) {
      console.error('Get user preferences controller error:', error);
      throw error;
    }
  }

  // Update user preferences
  static async updateUserPreferences(preferences: any): Promise<any> {
    try {
      return await userService.updateUserPreferences(preferences);
    } catch (error: any) {
      console.error('Update user preferences controller error:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }): Promise<any> {
    try {
      return await userService.getUserNotifications(params);
    } catch (error: any) {
      console.error('Get user notifications controller error:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<any> {
    try {
      return await userService.markNotificationAsRead(notificationId);
    } catch (error: any) {
      console.error('Mark notification as read controller error:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(): Promise<any> {
    try {
      return await userService.markAllNotificationsAsRead();
    } catch (error: any) {
      console.error('Mark all notifications as read controller error:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<any> {
    try {
      return await userService.deleteNotification(notificationId);
    } catch (error: any) {
      console.error('Delete notification controller error:', error);
      throw error;
    }
  }

  // Get user activity logs
  static async getUserActivityLogs(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      return await userService.getUserActivityLogs(params);
    } catch (error: any) {
      console.error('Get user activity logs controller error:', error);
      throw error;
    }
  }

  // Get user sessions
  static async getUserSessions(): Promise<any> {
    try {
      return await userService.getUserSessions();
    } catch (error: any) {
      console.error('Get user sessions controller error:', error);
      throw error;
    }
  }

  // Revoke user session
  static async revokeUserSession(sessionId: string): Promise<any> {
    try {
      return await userService.revokeUserSession(sessionId);
    } catch (error: any) {
      console.error('Revoke user session controller error:', error);
      throw error;
    }
  }

  // Revoke all user sessions
  static async revokeAllUserSessions(): Promise<any> {
    try {
      return await userService.revokeAllUserSessions();
    } catch (error: any) {
      console.error('Revoke all user sessions controller error:', error);
      throw error;
    }
  }

  // Get user dashboard data
  static async getUserDashboard(): Promise<any> {
    try {
      return await userService.getUserDashboard();
    } catch (error: any) {
      console.error('Get user dashboard controller error:', error);
      throw error;
    }
  }

  // Admin functions
  // Get all users (Admin only)
  static async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: number;
    status?: number;
  }): Promise<any> {
    try {
      return await userService.getAllUsers(params);
    } catch (error: any) {
      console.error('Get all users controller error:', error);
      throw error;
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(userId: number): Promise<any> {
    try {
      return await userService.getUserById(userId);
    } catch (error: any) {
      console.error('Get user by id controller error:', error);
      throw error;
    }
  }

  // Create user (Admin only)
  static async createUser(userData: CreateUserRequest): Promise<any> {
    try {
      return await userService.createUser(userData);
    } catch (error: any) {
      console.error('Create user controller error:', error);
      throw error;
    }
  }

  // Update user (Admin only)
  static async updateUser(userId: number, userData: UpdateUserRequest): Promise<any> {
    try {
      return await userService.updateUser(userId, userData);
    } catch (error: any) {
      console.error('Update user controller error:', error);
      throw error;
    }
  }

  // Delete user (Admin only)
  static async deleteUser(userId: number): Promise<any> {
    try {
      return await userService.deleteUser(userId);
    } catch (error: any) {
      console.error('Delete user controller error:', error);
      throw error;
    }
  }

  // Change user status (Admin only)
  static async changeUserStatus(userId: number, status: number): Promise<any> {
    try {
      return await userService.changeUserStatus(userId, status);
    } catch (error: any) {
      console.error('Change user status controller error:', error);
      throw error;
    }
  }

  // Reset user password (Admin only)
  static async resetUserPassword(userId: number, newPassword: string): Promise<any> {
    try {
      return await userService.resetUserPassword(userId, newPassword);
    } catch (error: any) {
      console.error('Reset user password controller error:', error);
      throw error;
    }
  }

  // Get user roles (Admin only)
  static async getUserRoles(): Promise<any> {
    try {
      return await userService.getUserRoles();
    } catch (error: any) {
      console.error('Get user roles controller error:', error);
      throw error;
    }
  }

  // Assign role to user (Admin only)
  static async assignRoleToUser(userId: number, roleId: number): Promise<any> {
    try {
      return await userService.assignRoleToUser(userId, roleId);
    } catch (error: any) {
      console.error('Assign role to user controller error:', error);
      throw error;
    }
  }

  // Remove role from user (Admin only)
  static async removeRoleFromUser(userId: number, roleId: number): Promise<any> {
    try {
      return await userService.removeRoleFromUser(userId, roleId);
    } catch (error: any) {
      console.error('Remove role from user controller error:', error);
      throw error;
    }
  }
}

// Legacy export functions for backward compatibility
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
    return await UserController.getAllUsers();
  } catch (error) {
    console.error("Get all users error:", error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<{ code: number; result: User; message?: string }> => {
  try {
    return await UserController.getUserById(parseInt(userId));
  } catch (error) {
    console.error("Get user by ID error:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<{ code: number; result: User; message?: string }> => {
  try {
    return await UserController.updateUser(parseInt(userId), userData);
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<{ code: number; message?: string }> => {
  try {
    return await UserController.deleteUser(parseInt(userId));
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};