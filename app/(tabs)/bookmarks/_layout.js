import { Stack } from 'expo-router';
import {DynamicColorIOS, Platform} from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: 'Bookmarks',
        headerTransparent: Platform.OS === 'ios',
        headerTintColor: Platform.OS==='ios'?DynamicColorIOS({
          light: '#03232c',
          dark: '#fff',
        }): 'auto',
        headerStyle: {
          backgroundColor: Platform.OS==='ios'?'transparent': '#fff',
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
