import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { TabBarContext } from '../../contexts/TabbarContext';
import { useState } from 'react';
export default function TabsLayout() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);

  return (
    <TabBarContext value={{ setIsTabBarHidden }}>
      <NativeTabs
        hidden={isTabBarHidden}
        minimizeBehavior={'onScrollDown'}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger name='index'>
          <NativeTabs.Trigger.Label>Quran</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'book', selected: 'book.fill' }}
            md='menu_book'
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name='bookmarks'>
          <NativeTabs.Trigger.Label>Bookmarks</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'bookmark', selected: 'bookmark.fill' }}
            md='bookmark'
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name='search' role='search'>
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'magnifyingglass', selected: 'magnifyingglass' }}
            md='search'
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabBarContext>
  );
}
