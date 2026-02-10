import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useLayoutEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { getBookmarks } from '@/utils/bookmarks';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFonts } from 'expo-font';

export default function SearchIndex() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t, language, getChapterData } = useLanguage();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [fontsLoaded] = useFonts({
    'uthmani-font': require('@/assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf'),
  });
  useEffect(() => {
    loadBookmarks();
    // Load chapters based on language
    const languageChapters = getChapterData();
    setChapters(languageChapters);
  }, [language, getChapterData]);

  // Set up native search bar handler
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: t.searchSurahsAndBookmarks,
        hideWhenScrolling: false,
        autoCapitalize: 'none',
        onChangeText: (event) => {
          setSearchQuery(event.nativeEvent.text);
        },
      },
    });
  }, [navigation, t]);

  const loadBookmarks = async () => {
    const stored = await getBookmarks();
    setBookmarks(stored);
  };

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return chapters.filter(
      (surah) =>
        surah.name.includes(query) ||
        surah.transliteration.toLowerCase().includes(query) ||
        surah.translation.toLowerCase().includes(query) ||
        surah.id.toString() === query,
    );
  }, [searchQuery]);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      (bookmark) =>
        bookmark.surahName?.toLowerCase().includes(query) ||
        bookmark.nameArabic?.includes(query) ||
        bookmark.verseText?.toLowerCase().includes(query) ||
        bookmark.verseId?.toString() === query,
    );
  }, [searchQuery, bookmarks]);

  const sections = useMemo(() => {
    const result = [];

    if (filteredSurahs.length > 0) {
      result.push({
        title: t.surahs,
        data: filteredSurahs,
        type: 'surah',
      });
    }

    if (filteredBookmarks.length > 0) {
      result.push({
        title: t.bookmarks,
        data: filteredBookmarks,
        type: 'bookmark',
      });
    }

    return result;
  }, [filteredSurahs, filteredBookmarks, t]);

  const handleSurahPress = useCallback(
    (item) => {
      router.push({
        pathname: '/(tabs)/surah/[id]',
        params: {
          id: item.id.toString(),
          surahName: item.transliteration,
          nameArabic: item.name,
          hasBismillah: item.bismillah ? 'true' : 'false',
          type: item.type,
          totalVerses: item.total_verses.toString(),
        },
      });
    },
    [router],
  );

  const handleBookmarkPress = useCallback(
    (bookmark) => {
      router.push({
        pathname: '/(tabs)/surah/[id]',
        params: {
          id: bookmark.surahId.toString(),
          surahName: bookmark.surahName,
          nameArabic: bookmark.nameArabic,
          hasBismillah: bookmark.hasBismillah ? 'true' : 'false',
          type: bookmark.type,
          verseId: bookmark.verseId.toString(),
        },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item, section }) => {
      if (section.type === 'surah') {
        return (
          <TouchableOpacity
            style={[
              styles.resultItem,
              {
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.border,
              },
            ]}
            onPress={() => handleSurahPress(item)}
          >
            <View style={styles.resultContent}>
              <View style={styles.surahHeader}>
                <Text
                  style={[styles.surahNumber, { color: theme.colors.accent }]}
                >
                  {item.id}
                </Text>
                <View style={styles.surahInfo}>
                  <Text
                    style={[styles.surahName, { color: theme.colors.text }]}
                  >
                    {item.transliteration}
                  </Text>
                  <Text
                    style={[
                      styles.surahTranslation,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {item.translation}
                  </Text>
                </View>
              </View>
              <Text style={[styles.surahArabic, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <Text
                style={[
                  styles.surahMeta,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {item.type === 'meccan' ? t.meccan : t.medinan} •{' '}
                {item.total_verses} {t.ayahs}
              </Text>
            </View>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity
            style={[
              styles.resultItem,
              {
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.border,
              },
            ]}
            onPress={() => handleBookmarkPress(item)}
          >
            <View style={styles.resultContent}>
              <Text
                style={[styles.bookmarkSurah, { color: theme.colors.text }]}
              >
                {item.surahName}
              </Text>
              <Text
                style={[
                  styles.bookmarkMeta,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {item.nameArabic} • {t.ayah} {item.verseId}
              </Text>
              <Text
                style={[
                  styles.bookmarkVerse,
                  { color: theme.colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {item.verseText}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [theme, handleSurahPress, handleBookmarkPress],
  );

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => (
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionHeaderText,
            { color: theme.colors.textSecondary },
          ]}
        >
          {title}
        </Text>
      </View>
    ),
    [theme],
  );

  const renderEmptyState = () => {
    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyState}>
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {t.searchSurahsAndBookmarks}
          </Text>
        </View>
      );
    }

    if (sections.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {t.noResultsFound}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SectionList
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item, index) =>
        item.id ? `surah-${item.id}` : `bookmark-${index}`
      }
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps='handled'
      stickySectionHeadersEnabled={false}
      contentInsetAdjustmentBehavior='automatic'
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  resultItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  resultContent: {
    flex: 1,
  },
  surahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  surahNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    width: 30,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
  },
  surahTranslation: {
    fontSize: 14,
    marginTop: 2,
  },
  surahArabic: {
    fontFamily: 'uthmani-font',
    fontSize: 20,
    textAlign: 'right',
    marginBottom: 4,
  },
  surahMeta: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  bookmarkSurah: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookmarkMeta: {
    fontSize: 14,
    marginBottom: 6,
  },
  bookmarkVerse: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
