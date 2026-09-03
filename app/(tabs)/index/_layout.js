import { Stack } from 'expo-router';
import { Platform, Pressable, Text } from 'react-native';
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
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: 'minimal',
          headerTitleAlign: 'center',
          headerStyle: {
            // A hardcoded white header hid the tinted title in dark mode.
            backgroundColor:
              Platform.OS === 'ios' ? 'transparent' : theme.colors.card,
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
            headerLeft:
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
            ...(Platform.OS === 'android' && {
              headerSearchBarOptions: {
                placeholder: t.searchSurahs,
                hideWhenScrolling: false,
                autoCapitalize: 'none',
              },
            }),
          }}
        >
          {Platform.OS === 'ios' && (
            <Stack.Toolbar placement='left'>
              <Stack.Toolbar.Button
                icon='gearshape.fill'
                onPress={() => router.push('/settings')}
              />
            </Stack.Toolbar>
          )}
        </Stack.Screen>
        <Stack.Screen
          name='surah/[id]'
          options={{
            title: '',
            headerLargeTitleEnabled: false,
          }}
        />
        <Stack.Screen
          name='settings'
          options={{ title: t.settings, headerLargeTitleEnabled: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = {
  settingsButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
  },
};
