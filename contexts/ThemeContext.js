import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DefaultTheme, DarkTheme } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    surahName: '#ffffff',
    // Brand crimson used for Bismillah, bookmarked verses and loading spinners.
    brand: '#D7233C',
    // Foreground for text/icons sitting on top of `accent` or `brand`.
    onAccent: '#ffffff',
    // Resting track of a Switch; the "on" track uses `accent`.
    switchTrack: '#767577',
    switchThumb: '#ffffff',
    // Tinted informational panel (settings status card).
    infoBackground: 'rgba(0, 122, 255, 0.08)',
    infoBorder: 'rgba(0, 122, 255, 0.2)',
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
    // Lightened so the crimson stays legible against the black background.
    brand: '#ff6b7a',
    onAccent: '#ffffff',
    switchTrack: '#39393d',
    switchThumb: '#ffffff',
    infoBackground: 'rgba(0, 122, 255, 0.15)',
    infoBorder: 'rgba(0, 122, 255, 0.3)',
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

const THEME_MODE_STORAGE_KEY = '@quran_app_theme_mode';
const THEME_MODES = ['auto', 'light', 'dark'];

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState('auto'); // 'auto', 'light', 'dark'

  // Restore the saved preference on mount; 'auto' stands until it arrives.
  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (savedMode && THEME_MODES.includes(savedMode)) {
        setThemeModeState(savedMode);
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    }
  };

  const setThemeMode = async (mode) => {
    if (!THEME_MODES.includes(mode)) {
      return;
    }

    setThemeModeState(mode);

    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const isDark =
    themeMode === 'auto' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const nextIndex = (THEME_MODES.indexOf(themeMode) + 1) % THEME_MODES.length;
    setThemeMode(THEME_MODES[nextIndex]);
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
