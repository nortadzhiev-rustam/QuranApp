import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTransparent: Platform.OS === 'ios',
        headerTintColor: '#333',
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
          title: "Al-Qur'an",
        }}
      />
      <Stack.Screen
        name='surah/[id]'
        options={{
          title: 'Surah',
        }}
      />
    </Stack>
  );
}
