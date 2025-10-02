import { authService, LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest, ForgotPasswordRequest } from '../service/authService';

export class AuthController {
  // Login user
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      return await authService.login(data);
    } catch (error: any) {
      console.error('Login controller error:', error);
      throw error;
    }
  }

  // Register user
  static async register(data: RegisterRequest): Promise<any> {
    try {
      return await authService.register(data);
    } catch (error: any) {
      console.error('Register controller error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<any> {
    try {
      return await authService.logout();
    } catch (error: any) {
      console.error('Logout controller error:', error);
      throw error;
    }
  }

  // Refresh access token
  static async refreshToken(): Promise<any> {
    try {
      return await authService.refreshToken();
    } catch (error: any) {
      console.error('Refresh token controller error:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(data: ChangePasswordRequest): Promise<any> {
    try {
      return await authService.changePassword(data);
    } catch (error: any) {
      console.error('Change password controller error:', error);
      throw error;
    }
  }

  // Forgot password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<any> {
    try {
      return await authService.forgotPassword(data);
    } catch (error: any) {
      console.error('Forgot password controller error:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string): Promise<any> {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error: any) {
      console.error('Reset password controller error:', error);
      throw error;
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<any> {
    try {
      return await authService.verifyEmail(token);
    } catch (error: any) {
      console.error('Verify email controller error:', error);
      throw error;
    }
  }

  // Resend verification email
  static async resendVerificationEmail(email: string): Promise<any> {
    try {
      return await authService.resendVerificationEmail(email);
    } catch (error: any) {
      console.error('Resend verification email controller error:', error);
      throw error;
    }
  }

  // Introspect token
  static async introspectToken(): Promise<any> {
    try {
      return await authService.introspectToken();
    } catch (error: any) {
      console.error('Introspect token controller error:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getUserProfile(): Promise<any> {
    try {
      return await authService.getUserProfile();
    } catch (error: any) {
      console.error('Get user profile controller error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(data: any): Promise<any> {
    try {
      return await authService.updateUserProfile(data);
    } catch (error: any) {
      console.error('Update user profile controller error:', error);
      throw error;
    }
  }

  // Upload user avatar
  static async uploadAvatar(file: File): Promise<any> {
    try {
      return await authService.uploadAvatar(file);
    } catch (error: any) {
      console.error('Upload avatar controller error:', error);
      throw error;
    }
  }

  // Delete user avatar
  static async deleteAvatar(): Promise<any> {
    try {
      return await authService.deleteAvatar();
    } catch (error: any) {
      console.error('Delete avatar controller error:', error);
      throw error;
    }
  }

  // Enable two-factor authentication
  static async enableTwoFactorAuth(): Promise<any> {
    try {
      return await authService.enableTwoFactorAuth();
    } catch (error: any) {
      console.error('Enable 2FA controller error:', error);
      throw error;
    }
  }

  // Disable two-factor authentication
  static async disableTwoFactorAuth(code: string): Promise<any> {
    try {
      return await authService.disableTwoFactorAuth(code);
    } catch (error: any) {
      console.error('Disable 2FA controller error:', error);
      throw error;
    }
  }

  // Verify two-factor authentication
  static async verifyTwoFactorAuth(code: string): Promise<any> {
    try {
      return await authService.verifyTwoFactorAuth(code);
    } catch (error: any) {
      console.error('Verify 2FA controller error:', error);
      throw error;
    }
  }
}