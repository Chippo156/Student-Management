import { createTheme, Theme } from "@mui/material/styles";
import { red, blue, grey, green, orange, deepPurple } from "@mui/material/colors";

declare module "@mui/material/styles" {
  interface Theme {
    m: {
      heightBar: string;
      heightHeader: string;
      heightContent: string;
    };
  }
  
  interface ThemeOptions {
    m?: {
      heightBar?: string;
      heightHeader?: string;
      heightContent?: string;
    };
  }

  interface Palette {
    border: {
      main: string;
      focus: string;
    };
    icon: {
      main: string;
      secondary: string;
    };
    menu: {
      active: string;
      selected: string;
    };
  }

  interface PaletteOptions {
    border?: {
      main?: string;
      focus?: string;
    };
    icon?: {
      main?: string;
      secondary?: string;
    };
    menu?: {
      active?: string;
      selected?: string;
    };
  }

  interface TypeText {
    menu: string;
    hint: string;
  }

  interface TypeBackground {
    menu: string;
    header: string;
    secondary: string;
    hover: string;
  }
}

const HEIGHT_BAR = "58px";
const HEIGHT_HEADER = "60px";
const HEIGHT_CONTENT = `calc(100vh - ${HEIGHT_HEADER} - ${HEIGHT_BAR})`;

type ThemeMode = "light" | "dark";

const getTheme = (mode: ThemeMode = "light"): Theme => createTheme({
  m: {
    heightBar: HEIGHT_BAR,
    heightHeader: HEIGHT_HEADER,
    heightContent: HEIGHT_CONTENT,
  },
  palette: mode === "light"
    ? {
        primary: {
          main: '#1976d2', // blue[700]
          light: '#63a4ff', // blue[400]
          dark: '#004ba0', // blue[900]
          contrastText: '#fff',
        },
        secondary: {
          main: '#7c4dff', // deepPurple[400]
          light: '#b47cff', // deepPurple[200]
          dark: '#3f1dcb', // deepPurple[800]
          contrastText: '#fff',
        },
        success: {
          main: green[600],
          light: green[300],
          dark: green[800],
        },
        warning: {
          main: orange[700],
          light: orange[400],
          dark: orange[900],
        },
        error: {
          main: red[600],
          light: red[400],
          dark: red[800],
        },
        background: {
          default: '#f4f6fb', // sáng dịu
          paper: '#ffffff',
          menu: '#f7f9fc', // menu sáng hơn
          header: '#e3eafc', // header xanh nhạt
          secondary: '#f0f3fa', // nền phụ
          hover: '#e3f2fd', // hover xanh nhạt
        },
        text: {
          primary: '#222b45', // xanh đen đậm
          secondary: '#4b5563', // xám xanh
          disabled: '#b0b8c1',
          menu: '#222b45',
          hint: '#6b7280',
        },
        divider: '#e0e3e7',
        border: {
          main: '#e0e3e7',
          focus: '#1976d2',
        },
        icon: {
          main: '#1976d2',
          secondary: '#6b7280',
        },
        menu: {
          active: '#e3f2fd',
          selected: '#bbdefb',
        },
        common: {
          black: "#000000",
          white: "#ffffff",
        },
      }
    : {
        primary: {
          main: '#90caf9', // blue[200]
          light: '#e3f2fd', // blue[50]
          dark: '#42a5f5', // blue[400]
          contrastText: '#222b45',
        },
        secondary: {
          main: '#b39ddb', // deepPurple[200]
          light: '#ede7f6', // deepPurple[50]
          dark: '#7e57c2', // deepPurple[400]
          contrastText: '#fff',
        },
        success: {
          main: green[400],
          light: green[200],
          dark: green[600],
        },
        warning: {
          main: orange[400],
          light: orange[200],
          dark: orange[600],
        },
        error: {
          main: red.A400,
          light: red[300],
          dark: red[700],
        },
        background: {
          default: '#181c24', // tối dịu
          paper: '#23272f',
          menu: '#23272f',
          header: '#22304a', // header xanh đậm
          secondary: '#20232a',
          hover: '#26334d', // hover xanh đậm hơn
        },
        text: {
          primary: '#f4f6fb', // trắng xanh
          secondary: '#b0b8c1', // xám sáng
          disabled: '#6b7280',
          menu: '#f4f6fb',
          hint: '#b0b8c1',
        },
        divider: '#23272f',
        border: {
          main: '#23272f',
          focus: '#90caf9',
        },
        icon: {
          main: '#90caf9',
          secondary: '#b0b8c1',
        },
        menu: {
          active: '#26334d',
          selected: '#22304a',
        },
        common: {
          black: "#000000",
          white: "#ffffff",
        },
      },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "*::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "8px",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "1rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "& fieldset": { borderWidth: "1px !important" },
          "&:hover fieldset": { borderWidth: "2px !important" },
          "&.Mui-focused fieldset": { borderWidth: "1px !important" },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focused": {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          "&.MuiTypography-body1": {
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderWidth: "0.5px",
          "&:hover": {
            borderWidth: "1px",
          },
        },
      },
    },
  },
});

export default getTheme;