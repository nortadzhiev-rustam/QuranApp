import { useEffect, useState } from 'react';
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '@/screens/CustomSplashScreen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TajweedProvider } from '@/contexts/TajweedContext';

import 'react-native-gesture-handler';

// Hands our palette to React Navigation. Without this the navigators fall back
// to React Navigation's built-in light theme, so every screen that does not
// paint its own background stays white in dark mode.
function ThemedNavigator({ showCustomSplash, onSplashFinish }) {
  const { theme } = useTheme();

  return (
    <NavigationThemeProvider value={theme}>
      {showCustomSplash ? (
        // Rendered inside ThemeProvider so the splash picks up the theme
        // background instead of flashing white in dark mode.
        <CustomSplashScreen onFinish={onSplashFinish} />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name='(tabs)'
            options={{ headerShown: false, animation: 'fade' }}
          />
        </Stack>
      )}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  const handleSplashFinish = async () => {
    setShowCustomSplash(false);
    await SplashScreen.hideAsync();
  };

  return (
    <LanguageProvider>
      <ThemeProvider>
        <TajweedProvider>
          <ThemedNavigator
            showCustomSplash={showCustomSplash}
            onSplashFinish={handleSplashFinish}
          />
        </TajweedProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
