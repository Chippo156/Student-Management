import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Student } from "~/types/database";

interface User {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  role?: string;
  studentInfo?: Student;
}

interface UserState {
  isLoading: boolean;
  isAuth: boolean;
  user: User;
}

const initialState: UserState = {
  isLoading: true,
  isAuth: false,
  user: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User }>) => {
      state.isLoading = false;
      state.isAuth = true;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.isLoading = false;
      state.isAuth = false;
      state.user = {};
    },
    loginFail: (state) => {
      state.isLoading = false;
      state.isAuth = false;
      state.user = {};
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      state.user = { ...state.user, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { login, loginFail, logout, updateUser, setLoading } = userSlice.actions;