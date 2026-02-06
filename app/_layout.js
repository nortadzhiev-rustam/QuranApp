import { Stack } from 'expo-router';
import { View } from 'react-native';
import 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    </Stack>
  );
}
