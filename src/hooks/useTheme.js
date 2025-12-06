import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  const customLightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#1976d2',
      primaryContainer: '#e3f2fd',
      secondary: '#0288d1',
      secondaryContainer: '#b3e5fc',
      error: '#d32f2f',
      errorContainer: '#ffcdd2',
      background: '#f5f5f5',
      surface: '#ffffff',
      surfaceVariant: '#f5f5f5',
    },
  };

  const customDarkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#90caf9',
      primaryContainer: '#1565c0',
      secondary: '#81d4fa',
      secondaryContainer: '#0277bd',
      error: '#ef5350',
      errorContainer: '#c62828',
      background: '#121212',
      surface: '#1e1e1e',
      surfaceVariant: '#2c2c2c',
    },
  };

  const paperTheme = isDark ? customDarkTheme : customLightTheme;
  const navigationTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, ...customDarkTheme.colors } }
    : { ...LightTheme, colors: { ...LightTheme.colors, ...customLightTheme.colors } };

  return {
    isDark,
    paperTheme,
    theme: navigationTheme,
  };
};
