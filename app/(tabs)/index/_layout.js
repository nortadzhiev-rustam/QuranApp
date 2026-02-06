import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: '#333',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
