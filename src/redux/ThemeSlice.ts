import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
}

const getInitialTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem("theme");
  return (savedTheme as ThemeMode) || "light";
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      // Lưu vào localStorage
      localStorage.setItem("theme", state.mode);
    },
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      // Lưu vào localStorage
      localStorage.setItem("theme", state.mode);
    },
  },
});

export const { toggleMode, setMode } = themeSlice.actions;
export default themeSlice.reducer;
