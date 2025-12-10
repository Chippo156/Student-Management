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
      // Save user info to localStorage for reload
      localStorage.setItem('user_info', JSON.stringify(state.account));
      // localStorage.setItem('role', user.role?.roleId ?? user.role ?? '1');
    },
    doGetAccountAction: (state, action) => {
      if (state.account) {
        // Merge all payload data into account, keeping tokens
        state.account = {
          ...state.account, // Keep existing data (tokens, etc.)
          ...action.payload, // Merge new data
          // Ensure tokens are preserved
          accessToken: state.account.accessToken,
          refreshToken: state.account.refreshToken,
        };
        // Update localStorage when user info changes
        localStorage.setItem('user_info', JSON.stringify(state.account));
      }
    },
    doLogoutAction: (state) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_info');
      state.isAuthenticated = false;
      state.account = null;
      state.error = null;
    },
    doLoadUserFromToken: (state) => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userInfoStr = localStorage.getItem('user_info');

      if (token && refreshToken) {
        state.isAuthenticated = true;

        // Try to restore full user info from localStorage
        if (userInfoStr) {
          try {
            const userInfo = JSON.parse(userInfoStr);
            state.account = {
              ...userInfo,
              accessToken: token,
              refreshToken: refreshToken,
            };
          } catch (error) {
            console.error('Failed to parse user_info:', error);
            // Fallback to just tokens
            state.account = {
              accessToken: token,
              refreshToken: refreshToken,
            };
          }
        } else {
          // Fallback to just tokens
          state.account = {
            accessToken: token,
            refreshToken: refreshToken,
          };
        }
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
        state.error = null;
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
        localStorage.setItem('role', user.role?.roleId ?? user.role ?? '1');
        // Save user info to localStorage for reload
        localStorage.setItem('user_info', JSON.stringify(state.account));
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
        localStorage.removeItem('role');
        localStorage.removeItem('user_info');
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
