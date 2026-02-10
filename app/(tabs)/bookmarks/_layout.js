import { Stack } from 'expo-router';
import { DynamicColorIOS, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
export default function Layout() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: t.bookmarks,
        headerTransparent: Platform.OS === 'ios',
        headerTintColor: theme.colors.text,
        headerLargeTitleEnabled: Platform.OS === 'ios',
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBlurEffect: 'none',
      }}
    >
      <Stack.Screen name='index' />
    </Stack>
  );
}
