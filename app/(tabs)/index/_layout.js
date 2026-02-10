import { Stack } from 'expo-router';
import { DynamicColorIOS, Platform } from 'react-native';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MaterialIcons } from 'react-native-vector-icons';
export default function Layout() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitleVisible: false,
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
        <Stack.Screen
          name='index'
          options={{
            title: t.alQuran,
            ...(Platform.OS === 'android' && {
              headerSearchBarOptions: {
                placeholder: t.searchSurahs,
                hideWhenScrolling: false,
                autoCapitalize: 'none',
                autoFocus: true,
              },
            }),
          }}
        />
        <Stack.Screen
          name='surah/[id]'
          options={{
            title: t.surah,
            headerLargeTitleEnabled: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
