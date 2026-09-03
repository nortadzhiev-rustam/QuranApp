import { Stack } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
export default function Layout() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: t.bookmarks,
        headerTransparent: Platform.OS === 'ios',
        headerTintColor: theme.colors.text,
        headerLargeTitleEnabled: Platform.OS === 'ios',
        headerStyle: {
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
          headerLeft:
            Platform.OS === 'android'
              ? () => (
                  <Pressable
                    onPress={() => router.push('/settings')}
                    style={styles.settingsButton}
                  >
                    <Icon name='settings' size={24} color={theme.colors.text} />
                  </Pressable>
                )
              : undefined,
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
    </Stack>
  );
}

const styles = {
  settingsButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
};
