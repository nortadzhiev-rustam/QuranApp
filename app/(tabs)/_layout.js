import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { TabBarContext } from '@/contexts/TabBarContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Platform } from 'react-native';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
export default function TabsLayout() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <ThemeProvider>
      <TabBarContext value={{ setIsTabBarHidden }}>
        <NativeTabs
          hidden={isTabBarHidden}
          minimizeBehavior={'onScrollDown'}
          disableTransparentOnScrollEdge
          tintColor={theme.colors.primary}
        >
          <NativeTabs.Trigger name='index'>
            <NativeTabs.Trigger.Label>{t.quran}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{ default: 'book', selected: 'book.fill' }}
              md='menu_book'
            />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name='bookmarks'>
            <NativeTabs.Trigger.Label>{t.bookmarks}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{ default: 'bookmark', selected: 'bookmark.fill' }}
              md='bookmark'
            />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name='tajweed'>
            <NativeTabs.Trigger.Label>
              {t.tajweedGuide || 'Tajweed Guide'}
            </NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{ default: 'book.closed', selected: 'book.closed.fill' }}
              md='auto_stories'
            />
          </NativeTabs.Trigger>
          {Platform.OS === 'ios' && (
            <NativeTabs.Trigger name='search' role='search'>
              <NativeTabs.Trigger.Label>{t.search}</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf='magnifyingglass' md='search' />
            </NativeTabs.Trigger>
          )}
        </NativeTabs>
      </TabBarContext>
    </ThemeProvider>
  );
}
