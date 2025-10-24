import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  authService,
  LoginRequest,
  LoginResponse,
} from "../service/authService";

interface UserAccount {
  accessToken: string;
  refreshToken: string;
  userId?: number;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: number;
  address?: string;
  avatarUrl?: string;
  accountStatus?: number;
  role?: {
    roleId: number;
    roleName: string;
    description: string;
    permissions?: any[];
  };
  // student-level fields returned by /api/Student/byToken
  studentId?: number;
  mssv?: string;
  className?: string;
  programName?: string;
  departmentName?: string;
  yearOfAddmision?: number;
  trainningLevel?: string;
  totalCreditsRequired?: number;
}

interface UserState {
  account: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  // không lấy user_data từ localStorage nữa
  account: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,
  error: null,
};

// Async thunk for login với error handling tốt hơn
export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response: LoginResponse = await authService.login(credentials);

      if (!response.success) {
        // API returned success=false -> forward message to rejected action
        return rejectWithValue(response.message);
      }

      // success: return payload.data (expected shape: { token, user })
      return response.data;
    } catch (error: any) {
      console.error("Redux: Login error caught:", error);
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "user/logout",
  async () => {
    try {
      await authService.logout();
    } catch (error: any) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    doLoginAction: (
      state,
      action: PayloadAction<{
        token: { accessToken: string; refreshToken: string };
        user: any;
      }>
    ) => {
      state.isAuthenticated = true;
      const { token, user } = action.payload;

      // map dữ liệu trả về từ API vào account (bao gồm toàn bộ raw data)
      state.account = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        userId: user.studentId ?? user.user?.userId ?? undefined,
        username: user.user?.username ?? undefined,
        fullName: user.user?.fullName ?? undefined,
        email: user.user?.email ?? undefined,
        phone: user.user?.phone ?? undefined,
        gender: user.user?.gender ?? undefined,
        address: user.user?.address ?? undefined,
        avatarUrl: user.user?.avatarUrl ?? undefined,
        accountStatus: user.user?.accountStatus ?? undefined,
        role: user.user?.role ?? undefined,
        // student-level fields
        studentId: user.studentId ?? undefined,
        mssv: user.mssv ?? undefined,
        className: user.className ?? undefined,
        programName: user.programName ?? undefined,
        departmentName: user.departmentName ?? undefined,
        yearOfAddmision: user.yearOfAddmision ?? undefined,
        trainningLevel: user.trainningLevel ?? undefined,
        totalCreditsRequired: user.totalCreditsRequired ?? undefined,
      };

      // persist tokens ONLY
      localStorage.setItem("access_token", token.accessToken);
      localStorage.setItem("refresh_token", token.refreshToken);
  // persist user id for refresh flow
  const persistedUserId = user.studentId ?? user.user?.userId ?? undefined;
  if (persistedUserId) localStorage.setItem("user_id", String(persistedUserId));
    },

    doGetAccountAction: (
      state,
      action: PayloadAction<{
        username: string;
        avatarUrl: string;
        role: string;
        userId: number;
      }>
    ) => {
      if (state.account) {
        state.account.username = action.payload.username;
        state.account.avatarUrl = action.payload.avatarUrl;
        state.account.userId = action.payload.userId;
      }
    },

    doLogoutAction: (state) => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id");
      state.isAuthenticated = false;
      state.account = null;
      state.error = null;
    },

    // Load user from localStorage when app starts
    doLoadUserFromToken: (state) => {
      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (token && refreshToken) {
        state.isAuthenticated = true;
        state.account = {
          accessToken: token,
          refreshToken: refreshToken,
        } as UserAccount;
      } else {
        state.isAuthenticated = false;
        state.account = null;
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      if (state.account) {
        state.account.accessToken = action.payload.accessToken;
        state.account.refreshToken = action.payload.refreshToken;
        localStorage.setItem("access_token", action.payload.accessToken);
        localStorage.setItem("refresh_token", action.payload.refreshToken);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        console.log("Redux: Login pending");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;

        // action.payload expected to include { token: {accessToken, refreshToken}, user: data }
  const token = (action.payload as any).token;
  const user = (action.payload as any).user;

        state.account = {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          userId: user.studentId ?? user.user?.userId ?? undefined,
          username: user.user?.username ?? undefined,
          fullName: user.user?.fullName ?? undefined,
          email: user.user?.email ?? undefined,
          phone: user.user?.phone ?? undefined,
          gender: user.user?.gender ?? undefined,
          address: user.user?.address ?? undefined,
          avatarUrl: user.user?.avatarUrl ?? undefined,
          accountStatus: user.user?.accountStatus ?? undefined,
          role: user.user?.role ?? undefined,
          studentId: user.studentId ?? undefined,
          mssv: user.mssv ?? undefined,
          className: user.className ?? undefined,
          programName: user.programName ?? undefined,
          departmentName: user.departmentName ?? undefined,
          yearOfAddmision: user.yearOfAddmision ?? undefined,
          trainningLevel: user.trainningLevel ?? undefined,
          totalCreditsRequired: user.totalCreditsRequired ?? undefined,
        };

        // Persist tokens only
        localStorage.setItem("access_token", token.accessToken);
        localStorage.setItem("refresh_token", token.refreshToken);
  // persist user id for refresh flow
  const persistedUserId = user.studentId ?? user.user?.userId ?? undefined;
  if (persistedUserId) localStorage.setItem("user_id", String(persistedUserId));

        // DO NOT store user_data in localStorage any more
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.error("Redux: Login rejected");
        console.error("Redux: Error payload:", action.payload);
        console.error("Redux: Error object:", action.error);

        state.isLoading = false;
        state.error =
          (action.payload as string) || action.error.message || "Login failed";
        state.isAuthenticated = false;
        state.account = null;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id");
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
