import React, { useEffect, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useDispatch, useSelector } from "react-redux";
import { store } from "./redux/store";
import getTheme from "./theme";
import AppRoutes from "./routes";
import ErrorBoundary from "./component/ErrorBoundary";
import "./App.scss";
import { RootState, AppDispatch } from "./redux/store";
import { doLoadUserFromToken, doLogoutAction } from "./redux/UserSlice";

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  // Tạo theme dựa trên mode từ Redux
  const theme = useMemo(() => {
    return getTheme(themeMode);
  }, [themeMode]);

  const handleLoadUser = (): void => {
    try {
      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const userDataStr = localStorage.getItem("user_data");
      
      if (token && refreshToken && userDataStr && !user.isAuthenticated) {
        // Load user from localStorage
        dispatch(doLoadUserFromToken());
      }
    } catch (error) {
      console.error("Load user failed:", error);
      // Clear invalid data
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      dispatch(doLogoutAction());
    }
  };

  useEffect(() => {
    handleLoadUser();
  }, []);

  // Smoothly animate theme switch and sync color-scheme
  useEffect(() => {
    const root = document.documentElement;
    if (theme.palette.mode === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    // Sync body colors with current theme for immediate visual feedback
    document.body.style.backgroundColor = theme.palette.background.default;
    document.body.style.color = theme.palette.text.primary;

    // Add transition class briefly for smooth animation
    document.body.classList.add("theme-transition");
    const t = window.setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 350);

    return () => window.clearTimeout(t);
  }, [themeMode, theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </ThemeProvider>
  );
};

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="container">
          <AppContent />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
