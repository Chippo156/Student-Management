import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme || "light";
};

const initialState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("theme", state.mode);
    },
  },
});

export const { toggleMode, setMode } = themeSlice.actions;
export default themeSlice.reducer;
