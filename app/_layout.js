import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '@/screens/CustomSplashScreen';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TajweedProvider } from '@/contexts/TajweedContext';

import 'react-native-gesture-handler';

export default function RootLayout() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  const handleSplashFinish = async () => {
    setShowCustomSplash(false);
    await SplashScreen.hideAsync();
  };

  if (showCustomSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <TajweedProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name='(tabs)'
              options={{ headerShown: false, animation: 'fade' }}
            />
          </Stack>
        </TajweedProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
