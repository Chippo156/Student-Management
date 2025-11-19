import React, { useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { store } from './redux/store';
import getTheme from './theme';
import AppRoutes from './routes';
import ErrorBoundary from './component/ErrorBoundary';
import { ChatProvider } from './context/ChatContext';
import './App.scss';
import { doLoadUserFromToken, doLogoutAction } from './redux/UserSlice';

const AppContent = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const themeMode = useSelector((state) => state.theme.mode);

  // Tạo theme dựa trên mode từ Redux
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const handleLoadUser = () => {
    try {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userId = localStorage.getItem('user_id');

      if (token && refreshToken && userId && !user.isAuthenticated) {
        dispatch(doLoadUserFromToken());
      }
    } catch (error) {
      console.error('Load user failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      dispatch(doLogoutAction());
    }
  };

  useEffect(() => {
    handleLoadUser();
  }, []);

  // Smoothly animate theme switch and sync color-scheme
  useEffect(() => {
    const root = document.documentElement;
    if (theme.palette.mode === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    document.body.style.backgroundColor = theme.palette.background.default;
    document.body.style.color = theme.palette.text.primary;

    document.body.classList.add('theme-transition');
    const t = window.setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 350);

    return () => window.clearTimeout(t);
  }, [themeMode, theme]);

  // Ant Design theme configuration
  const antdThemeConfig = useMemo(() => ({
    algorithm: theme.palette.mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: theme.palette.primary.main,
      colorSuccess: theme.palette.success.main,
      colorWarning: theme.palette.warning.main,
      colorError: theme.palette.error.main,
      colorInfo: theme.palette.primary.main,
      colorBgBase: theme.palette.background.paper,
      colorTextBase: theme.palette.text.primary,
      borderRadius: 8,
      fontSize: 14,
    },
    components: {
      Table: {
        headerBg: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.primary.light + '20',
        headerColor: theme.palette.text.primary,
        rowHoverBg: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      },
      Card: {
        colorBgContainer: theme.palette.background.paper,
      },
      Modal: {
        contentBg: theme.palette.background.paper,
        headerBg: theme.palette.background.paper,
      },
    },
  }), [theme]);

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ChatProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </ChatProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
};

function App() {
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
