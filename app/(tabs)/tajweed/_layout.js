import { Stack } from 'expo-router';

import { Platform, Pressable } from 'react-native';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
export default function Layout() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerTintColor: theme.colors.text,
          headerLargeTitleEnabled: Platform.OS === 'ios',
          headerBackButtonDisplayMode: 'minimal',
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
            title: t.tajweedGuide || 'Tajweed Guide',
            headerRight:
              Platform.OS === 'android'
                ? () => (
                    <Pressable
                      onPress={() => router.push('/settings')}
                      style={styles.settingsButton}
                    >
                      <Icon
                        name='settings'
                        size={24}
                        color={theme.colors.text}
                      />
                    </Pressable>
                  )
                : undefined,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = {
  settingsButton: {
    padding: 8,
  },
};      