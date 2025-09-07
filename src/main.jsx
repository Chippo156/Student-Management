
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider, useSelector } from "react-redux";
import { store } from "./redux/store";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme.js";

import { useMemo } from "react";
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Main />
    </Provider>
  </StrictMode>
);
