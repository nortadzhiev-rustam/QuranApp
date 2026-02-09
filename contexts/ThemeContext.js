import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Extended theme with custom colors and values
const lightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#03232c',
    background: '#ffffff',
    card: '#f8f9fa',
    text: '#03232c',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    notification: '#4a9aff',
    accent: '#4a9aff',
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    cardBorder: '#e9ecef',
    inputBackground: '#f8f9fa',
    shadow: 'rgba(0, 0, 0, 0.1)',
    surahName: '#fffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    fontSizeSmall: 12,
    fontSizeRegular: 14,
    fontSizeMedium: 16,
    fontSizeLarge: 18,
    fontSizeXLarge: 24,
    fontWeightRegular: '400',
    fontWeightMedium: '500',
    fontWeightBold: '700',
  },
};

const darkTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: '#ffffff',
    background: '#000000',
    card: '#1c1c1e',
    text: '#ffffff',
    textSecondary: '#8e8e93',
    border: '#38383a',
    notification: '#4a9aff',
    accent: '#4a9aff',
    success: '#30d158',
    error: '#ff453a',
    warning: '#ffd60a',
    cardBorder: '#2c2c2e',
    inputBackground: '#1c1c1e',
    shadow: 'rgba(255, 255, 255, 0.1)',
    surahName: '#ffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    fontSizeSmall: 12,
    fontSizeRegular: 14,
    fontSizeMedium: 16,
    fontSizeLarge: 18,
    fontSizeXLarge: 24,
    fontWeightRegular: '400',
    fontWeightMedium: '500',
    fontWeightBold: '700',
  },
};

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  themeMode: 'auto', // 'auto', 'light', 'dark'
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('auto'); // 'auto', 'light', 'dark'

  const isDark =
    themeMode === 'auto' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    if (themeMode === 'auto') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('auto');
    }
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
    themeMode,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { lightTheme, darkTheme };
