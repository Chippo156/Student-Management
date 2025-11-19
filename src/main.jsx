import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider, useSelector } from 'react-redux';
import { store } from './redux/store';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function Main() {
  const mode = useSelector((state) => state.theme.mode);

  // Tạo theme mới dựa trên mode
  const themed = useMemo(() => {
    return theme(mode);
  }, [mode]);

  return (
    <ThemeProvider theme={themed}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  // ⚠️ Tạm thời tắt StrictMode để test SignalR connection
  // <StrictMode>
    <Provider store={store}>
      <Main />
    </Provider>
  // </StrictMode>
);
