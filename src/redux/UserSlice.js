import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isLoading: true,
  isAuth: false,
  user: {},
};
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
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
  },
});

export const { login, loginFail, logout } = userSlice.actions;
