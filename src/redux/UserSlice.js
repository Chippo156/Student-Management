import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../service/authService';

const initialState = {
  account: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk('user/logout', async () => {
  try {
    await authService.logout();
  } catch (error) {
    // Continue with logout even if API call fails
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    doLoginAction: (state, action) => {
      state.isAuthenticated = true;
      const { token, user } = action.payload;
      state.account = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        ...user,
        userId: user.studentId ?? user.user?.userId ?? undefined,
        role: user.user?.role ?? undefined,
      };
      localStorage.setItem('access_token', token.accessToken);
      localStorage.setItem('refresh_token', token.refreshToken);
      const persistedUserId = user.studentId ?? user.user?.userId ?? undefined;
      if (persistedUserId)
        localStorage.setItem('user_id', String(persistedUserId));
    },
    doGetAccountAction: (state, action) => {
      if (state.account) {
        state.account.username = action.payload.username;
        state.account.avatarUrl = action.payload.avatarUrl;
        state.account.userId = action.payload.userId;
      }
    },
    doLogoutAction: (state) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      state.isAuthenticated = false;
      state.account = null;
      state.error = null;
    },
    doLoadUserFromToken: (state) => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (token && refreshToken) {
        state.isAuthenticated = true;
        state.account = {
          accessToken: token,
          refreshToken: refreshToken,
        };
      } else {
        state.isAuthenticated = false;
        state.account = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTokens: (state, action) => {
      if (state.account) {
        state.account.accessToken = action.payload.accessToken;
        state.account.refreshToken = action.payload.refreshToken;
        localStorage.setItem('access_token', action.payload.accessToken);
        localStorage.setItem('refresh_token', action.payload.refreshToken);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        const token = action.payload.token;
        const user = action.payload.user;
        state.account = {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          ...user,
          userId: user.studentId ?? user.user?.userId ?? undefined,
          role: user.user?.role ?? undefined,
        };
        localStorage.setItem('access_token', token.accessToken);
        localStorage.setItem('refresh_token', token.refreshToken);
        const persistedUserId =
          user.studentId ?? user.user?.userId ?? undefined;
        if (persistedUserId)
          localStorage.setItem('user_id', String(persistedUserId));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message || 'Login failed';
        state.isAuthenticated = false;
        state.account = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        state.isAuthenticated = false;
        state.account = null;
        state.error = null;
      });
  },
});

export const {
  doLoginAction,
  doGetAccountAction,
  doLogoutAction,
  doLoadUserFromToken,
  clearError,
  updateTokens,
} = userSlice.actions;
