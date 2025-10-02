import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService, LoginRequest, LoginResponse } from "../service/authService";

interface UserAccount {
  accessToken: string;
  refreshToken: string;
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

interface UserState {
  account: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  account: localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data') as string) : null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null
};

// Async thunk for login với error handling tốt hơn
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      console.log('Redux: Starting login with credentials:', credentials);
      const response: LoginResponse = await authService.login(credentials);
      console.log('Redux: Auth service response:', response);
      
      if (!response.success) {
        console.error('Redux: Login failed - API returned success=false:', response.message);
        return rejectWithValue(response.message);
      }
      
      console.log('Redux: Login successful, returning data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Redux: Login error caught:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    doLoginAction: (state, action: PayloadAction<{
      token: { accessToken: string; refreshToken: string };
      user: any;
    }>) => {
      state.isAuthenticated = true;
      state.account = {
        accessToken: action.payload.token.accessToken,
        refreshToken: action.payload.token.refreshToken,
        userId: action.payload.user.userId,
        username: action.payload.user.username,
        fullName: action.payload.user.fullName,
        email: action.payload.user.email,
        phone: action.payload.user.phone,
        gender: action.payload.user.gender,
        address: action.payload.user.address,
        avatarUrl: action.payload.user.avatarUrl,
        accountStatus: action.payload.user.accountStatus,
        role: action.payload.user.role
      };
      
      // Store tokens and user data in localStorage
      localStorage.setItem('access_token', action.payload.token.accessToken);
      localStorage.setItem('refresh_token', action.payload.token.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(action.payload.user));
    },
    
    doGetAccountAction: (state, action: PayloadAction<{
      username: string;
      avatarUrl: string;
      role: string;
      userId: number;
    }>) => {
      if (state.account) {
        state.account.username = action.payload.username;
        state.account.avatarUrl = action.payload.avatarUrl;
        state.account.userId = action.payload.userId;
      }
    },
    
    doLogoutAction: (state) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      state.isAuthenticated = false;
      state.account = null;
      state.error = null;
    },
    
    // Load user from localStorage when app starts
    doLoadUserFromToken: (state) => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userDataStr = localStorage.getItem('user_data');
      
      if (token && refreshToken && userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          state.isAuthenticated = true;
          state.account = {
            accessToken: token,
            refreshToken: refreshToken,
            userId: userData.userId,
            username: userData.username,
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            gender: userData.gender,
            address: userData.address,
            avatarUrl: userData.avatarUrl,
            accountStatus: userData.accountStatus,
            role: userData.role
          };
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          // Clear invalid data
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          state.isAuthenticated = false;
          state.account = null;
        }
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    updateTokens: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
    }>) => {
      if (state.account) {
        state.account.accessToken = action.payload.accessToken;
        state.account.refreshToken = action.payload.refreshToken;
        localStorage.setItem('access_token', action.payload.accessToken);
        localStorage.setItem('refresh_token', action.payload.refreshToken);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        console.log('Redux: Login pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Redux: Login fulfilled with payload:', action.payload);
        
        state.isLoading = false;
        state.isAuthenticated = true;
        state.account = {
          accessToken: action.payload.token.accessToken,
          refreshToken: action.payload.token.refreshToken,
          userId: action.payload.user.userId,
          username: action.payload.user.username,
          fullName: action.payload.user.fullName,
          email: action.payload.user.email,
          phone: action.payload.user.phone,
          gender: action.payload.user.gender,
          address: action.payload.user.address,
          avatarUrl: action.payload.user.avatarUrl,
          accountStatus: action.payload.user.accountStatus,
          role: action.payload.user.role
        };
        
        console.log('Redux: Account set to:', state.account);
        
        // Store in localStorage
        localStorage.setItem('access_token', action.payload.token.accessToken);
        localStorage.setItem('refresh_token', action.payload.token.refreshToken);
        localStorage.setItem('user_data', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.error('Redux: Login rejected');
        console.error('Redux: Error payload:', action.payload);
        console.error('Redux: Error object:', action.error);
        
        state.isLoading = false;
        state.error = action.payload as string || action.error.message || 'Login failed';
        state.isAuthenticated = false;
        state.account = null;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        state.isAuthenticated = false;
        state.account = null;
        state.error = null;
      });
  }
});

export const { 
  doLoginAction, 
  doGetAccountAction, 
  doLogoutAction, 
  doLoadUserFromToken, 
  clearError, 
  updateTokens 
} = userSlice.actions;