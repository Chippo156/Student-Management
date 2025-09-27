import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserAccount {
  access_token: string;
  refresh_token: string;
  username: string;
  image: string;
  role: string;
  userId: string;
}

interface UserState {
  account: UserAccount;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  account: {
    access_token: '',
    refresh_token: '',
    username: '',
    image: '',
    role: '',
    userId: ''
  },
  isAuthenticated: false
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    doLoginAction: (state, action: PayloadAction<UserAccount>) => {
      state.isAuthenticated = true;
      state.account = action.payload;
      // Lưu token vào localStorage
      if (action.payload.access_token) {
        localStorage.setItem('access_token', action.payload.access_token);
      }
      if (action.payload.refresh_token) {
        localStorage.setItem('refresh_token', action.payload.refresh_token);
      }
    },
    doGetAccountAction: (state, action: PayloadAction<{
      username: string;
      image: string;
      role: string;
      id: string;
    }>) => {
      state.isAuthenticated = true;
      state.account.username = action.payload.username;
      state.account.image = action.payload.image;
      state.account.role = action.payload.role;
      state.account.userId = action.payload.id;
    },
    doLogoutAction: (state) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      state.isAuthenticated = false;
      state.account = {
        access_token: '',
        refresh_token: '',
        username: '',
        image: '',
        role: '',
        userId: ''
      };
    },
    // Thêm action để load user từ localStorage khi app khởi động
    doLoadUserFromToken: (state, action: PayloadAction<{
      username: string;
      image?: string;
      role: string;
      id: string;
    }>) => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (token && action.payload) {
        state.isAuthenticated = true;
        state.account = {
          ...action.payload,
          access_token: token,
          refresh_token: refreshToken || '',
          username: action.payload.username,
          image: action.payload.image || '',
          role: action.payload.role,
          userId: action.payload.id
        };
      }
    }
  }
});

export const { doLoginAction, doGetAccountAction, doLogoutAction, doLoadUserFromToken } = userSlice.actions;