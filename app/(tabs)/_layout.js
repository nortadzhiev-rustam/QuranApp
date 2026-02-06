import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Image, View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTransparent: true,
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Al Quran',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name='book-open' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name='search' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='bookmarks'
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => (
            <Icon name='bookmark' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='library'
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Icon name='books' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name='cog' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
