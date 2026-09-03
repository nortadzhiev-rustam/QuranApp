import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SearchLayot() {
  // Read from the theme rather than useColorScheme so a manual light/dark
  // override in settings is honoured here too.
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: Platform.OS === 'ios',
        headerBlurEffect: 'none',
        headerBackVisible: true,
        headerBackButtonDisplayMode: 'minimal',
        headerStyle:
          Platform.OS === 'android'
            ? { backgroundColor: theme.colors.card }
            : undefined,
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t.search,
          headerSearchBarOptions: {
            placement: 'automatic',
            placeholder: t.search,
            hideWhenScrolling: false,
            autoCapitalize: 'none',
            autoFocus: true,
          },
        }}
      />
    </Stack>
  );
}
