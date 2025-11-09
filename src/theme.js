import { createTheme } from '@mui/material/styles';
import { red, green, orange } from '@mui/material/colors';

const HEIGHT_BAR = '58px';
const HEIGHT_HEADER = '60px';
const HEIGHT_CONTENT = `calc(100vh - ${HEIGHT_HEADER} - ${HEIGHT_BAR})`;

const getTheme = (mode = 'light') =>
  createTheme({
    m: {
      heightBar: HEIGHT_BAR,
      heightHeader: HEIGHT_HEADER,
      heightContent: HEIGHT_CONTENT,
    },
    palette:
      mode === 'light'
        ? {
            mode,
            primary: {
              main: '#4F46E5',
              light: '#818CF8',
              dark: '#3730A3',
              contrastText: '#fff',
            },
            secondary: {
              main: '#06B6D4',
              light: '#67E8F9',
              dark: '#0891B2',
              contrastText: '#fff',
            },
            success: {
              main: '#10B981',
              light: '#6EE7B7',
              dark: '#047857',
            },
            warning: {
              main: '#F59E0B',
              light: '#FCD34D',
              dark: '#D97706',
            },
            error: {
              main: '#EF4444',
              light: '#F87171',
              dark: '#DC2626',
            },
            background: {
              default: '#F1F5F9',
              paper: '#FFFFFF',
              menu: '#FFFFFF',
              header: '#FFFFFF',
              secondary: '#F8FAFC',
              hover: '#EEF2FF',
            },
            text: {
              primary: '#1E293B',
              secondary: '#64748B',
              disabled: '#CBD5E1',
              menu: '#334155',
              hint: '#94A3B8',
            },
            divider: '#E2E8F0',
            border: {
              main: '#E2E8F0',
              focus: '#4F46E5',
            },
            icon: {
              main: '#4F46E5',
              secondary: '#64748B',
            },
            menu: {
              active: '#EEF2FF',
              selected: '#DDD6FE',
            },
            common: {
              black: '#000000',
              white: '#ffffff',
            },
          }
        : {
            mode,
            primary: {
              main: '#818CF8',
              light: '#A5B4FC',
              dark: '#6366F1',
              contrastText: '#fff',
            },
            secondary: {
              main: '#22D3EE',
              light: '#67E8F9',
              dark: '#06B6D4',
              contrastText: '#0F172A',
            },
            success: {
              main: '#34D399',
              light: '#6EE7B7',
              dark: '#10B981',
            },
            warning: {
              main: '#FBBF24',
              light: '#FCD34D',
              dark: '#F59E0B',
            },
            error: {
              main: '#F87171',
              light: '#FCA5A5',
              dark: '#EF4444',
            },
            background: {
              default: '#0F172A',
              paper: '#1E293B',
              menu: '#1E293B',
              header: '#1E1B4B',
              secondary: '#1A1F2E',
              hover: '#312E81',
            },
            text: {
              primary: '#F1F5F9',
              secondary: '#94A3B8',
              disabled: '#475569',
              menu: '#E2E8F0',
              hint: '#64748B',
            },
            divider: '#334155',
            border: {
              main: '#334155',
              focus: '#818CF8',
            },
            icon: {
              main: '#818CF8',
              secondary: '#94A3B8',
            },
            menu: {
              active: '#312E81',
              selected: '#1E1B4B',
            },
            common: {
              black: '#000000',
              white: '#ffffff',
            },
          },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            '*::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '*::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '8px',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            ...(theme.palette.mode === 'light' && {
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              border: `1px solid ${theme.palette.divider}`,
            }),
          }),
          elevation1: ({ theme }) => ({
            ...(theme.palette.mode === 'light' && {
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            }),
          }),
          elevation2: ({ theme }) => ({
            ...(theme.palette.mode === 'light' && {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }),
          }),
          elevation3: ({ theme }) => ({
            ...(theme.palette.mode === 'light' && {
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            }),
          }),
          elevation4: ({ theme }) => ({
            ...(theme.palette.mode === 'light' && {
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            }),
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            ...(theme.palette.mode === 'light' && {
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                borderColor: theme.palette.primary.light,
              },
            }),
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontSize: '1rem',
            backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : 'transparent',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
            '& fieldset': { borderWidth: '1px !important' },
            '&:hover fieldset': { borderWidth: '2px !important' },
            '&.Mui-focused fieldset': { borderWidth: '2px !important' },
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            '&.Mui-focused': {
              color: theme.palette.primary.main,
              fontWeight: 500,
            },
          }),
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            '&.MuiTypography-body1': {
              fontSize: '0.875rem',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: theme.palette.mode === 'light'
                ? '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                : 'none',
            },
          }),
          contained: ({ theme }) => ({
            ...(theme.palette.mode === 'light' && {
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              },
            }),
          }),
          outlined: ({ theme }) => ({
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: theme.palette.mode === 'light'
                ? theme.palette.background.hover
                : 'rgba(255, 255, 255, 0.08)',
            },
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
          head: ({ theme }) => ({
            fontWeight: 600,
            backgroundColor: theme.palette.mode === 'light'
              ? theme.palette.background.secondary
              : theme.palette.background.paper,
          }),
        },
      },
    },
  });

export default getTheme;
