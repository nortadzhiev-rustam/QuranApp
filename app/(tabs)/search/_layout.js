import { Stack } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';

export default function SearchLayot() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: Platform.OS === 'ios',
        headerBlurEffect: Platform.OS === 'ios' ? 'systemMaterial' : undefined,
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
          title: 'Search',
          headerSearchBarOptions: {
            placement: 'automatic',
            placeholder: 'Search',
            onChangeText: () => {},
          },
        }}
      />
    </Stack>
  );
}
