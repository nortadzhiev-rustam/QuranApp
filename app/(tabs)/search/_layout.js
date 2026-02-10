import { Stack } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SearchLayot() {
  const colorScheme = useColorScheme();
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
            ? {
                backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
              }
            : undefined,
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : undefined,
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
          },
        }}
      />
    </Stack>
  );
}
