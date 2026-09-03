import React, {
  useEffect,
  useState,
  useCallback,
  memo,
  useMemo,
  useLayoutEffect,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { useFonts } from 'expo-font';
import { useRouter, useNavigation } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  JUZ_COUNT,
  getJuzRange,
  getJuzSegments,
  getJuzAyahCount,
} from '@/utils/quranMeta';

// Row metrics. getItemLayout has to account for the segmented control in the
// list header, otherwise every offset it reports is short by its height.
const SURAH_ROW_HEIGHT = 110;
const JUZ_ROW_HEIGHT = 92;
const LIST_HEADER_HEIGHT = 52;

const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

const toArabicNumerals = (number) =>
  number
    .toString()
    .split('')
    .map((digit) => ARABIC_NUMERALS[Number.parseInt(digit, 10)])
    .join('');

// Memoized juz row - one of the thirty parts, with the span it covers.
const JuzListItem = memo(({ item, onPress, theme, t }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.juzContainer,
        {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <View
        style={[styles.juzBadge, { backgroundColor: theme.colors.accent }]}
      >
        <Text style={[styles.juzBadgeText, { color: theme.colors.onAccent }]}>
          {item.juz}
        </Text>
      </View>

      <View style={styles.juzTextContainer}>
        <Text style={[styles.juzTitle, { color: theme.colors.text }]}>
          {t.juz} {item.juz}
        </Text>
        <Text
          style={[styles.juzRange, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.startName} {item.start.ayahId} - {item.endName}{' '}
          {item.end.ayahId}
        </Text>
      </View>

      <View style={styles.juzInfoContainer}>
        <Text style={[styles.juzArabic, { color: theme.colors.text }]}>
          الجزء {toArabicNumerals(item.juz)}
        </Text>
        <Text style={[styles.verseCount, { color: theme.colors.textSecondary }]}>
          {item.ayahCount} {t.ayahs}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

JuzListItem.displayName = 'JuzListItem';
JuzListItem.propTypes = {
  item: PropTypes.shape({
    juz: PropTypes.number.isRequired,
    start: PropTypes.object.isRequired,
    end: PropTypes.object.isRequired,
    startName: PropTypes.string,
    endName: PropTypes.string,
    ayahCount: PropTypes.number.isRequired,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.object.isRequired,
};

// Memoized list item component for optimal performance
const SurahListItem = memo(({ item, onPress, theme, t }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.verseContainer,
        {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <Image
        source={
          item.type === 'meccan'
            ? require('@/assets/10171102.png')
            : require('@/assets/6152869.png')
        }
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <View style={styles.centerContent}>
          <Text style={[styles.verseText, { color: theme.colors.text }]}>
            {item.transliteration}
          </Text>
          <View style={styles.dividerContainer}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <View />
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
          </View>
          <Text style={[styles.verseText, { color: theme.colors.text }]}>
            "{item.translation}"
          </Text>
        </View>
        <View style={styles.verseInfoContainer}>
          <Text style={[styles.verseTextArabic, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.verseCount, { color: theme.colors.textSecondary }]}
          >
            {item.total_verses} {t.ayahs}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

SurahListItem.displayName = 'SurahListItem';
SurahListItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    transliteration: PropTypes.string.isRequired,
    translation: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    total_verses: PropTypes.number.isRequired,
    bismillah: PropTypes.bool,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.object.isRequired,
};

const HomeScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, language, getChapterData } = useLanguage();
  const [chapters, setChapters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('surah');
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [fontsLoaded] = useFonts({
    'custom-font': require('@/assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Load chapters data with language-specific translations
      const chaptersData = getChapterData();
      setChapters(chaptersData);
    }
    setLoading(false);
  }, [fontsLoaded, language, getChapterData]);

  // Set up native search bar handler for Android
  useLayoutEffect(() => {
    if (Platform.OS === 'android') {
      navigation.setOptions({
        headerSearchBarOptions: {
          placeholder: t.searchSurahs,
          hideWhenScrolling: false,
          autoCapitalize: 'none',
          onChangeText: (event) => {
            setSearchQuery(event.nativeEvent.text);
          },
        },
      });
    }
  }, [navigation, t]);

  // Filter surahs based on search query
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return chapters;

    const query = searchQuery.toLowerCase();
    return chapters.filter(
      (surah) =>
        surah.name.includes(query) ||
        surah.transliteration.toLowerCase().includes(query) ||
        surah.translation.toLowerCase().includes(query) ||
        surah.id.toString() === query,
    );
  }, [searchQuery, chapters]);

  // Handler for surah press
  const handleSurahPress = useCallback(
    (item) => () => {
      router.push({
        pathname: 'surah/[id]',
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

  // The thirty juz, labelled with the surahs they span. Rebuilt only when the
  // chapter list changes, i.e. on a language switch.
  const juzRows = useMemo(() => {
    if (chapters.length === 0) {
      return [];
    }

    const nameById = new Map(
      chapters.map((chapter) => [chapter.id, chapter.transliteration]),
    );

    return Array.from({ length: JUZ_COUNT }, (unused, index) => {
      const juz = index + 1;
      const range = getJuzRange(juz);

      return {
        juz,
        start: range.start,
        end: range.end,
        startName: nameById.get(range.start.surahId),
        endName: nameById.get(range.end.surahId),
        surahCount: getJuzSegments(juz).length,
        ayahCount: getJuzAyahCount(juz),
      };
    });
  }, [chapters]);

  // A juz is searchable by its number or by the surahs at either end.
  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return juzRows;

    const query = searchQuery.toLowerCase();
    return juzRows.filter(
      (row) =>
        row.juz.toString() === query ||
        row.startName?.toLowerCase().includes(query) ||
        row.endName?.toLowerCase().includes(query),
    );
  }, [searchQuery, juzRows]);

  // Opening a juz lands on its first verse, which is rarely the start of a surah.
  const handleJuzPress = useCallback(
    (row) => () => {
      const chapter = chapters.find(
        (item) => item.id === row.start.surahId,
      );

      router.push({
        pathname: 'surah/[id]',
        params: {
          id: row.start.surahId.toString(),
          surahName: chapter?.transliteration,
          nameArabic: chapter?.name,
          hasBismillah: chapter?.bismillah ? 'true' : 'false',
          type: chapter?.type,
          totalVerses: chapter?.total_verses?.toString(),
          verseId: row.start.ayahId.toString(),
        },
      });
    },
    [chapters, router],
  );

  const renderJuzItem = useCallback(
    ({ item }) => (
      <JuzListItem
        item={item}
        onPress={handleJuzPress(item)}
        theme={theme}
        t={t}
      />
    ),
    [handleJuzPress, theme, t],
  );

  // Memoized render function to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item }) => (
      <SurahListItem
        item={item}
        onPress={handleSurahPress(item)}
        theme={theme}
        t={t}
      />
    ),
    [handleSurahPress, theme, t],
  );

  // Implement getItemLayout if all items have the same height
  const getItemLayout = useCallback(
    (data, index) => {
      const length =
        viewMode === 'juz' ? JUZ_ROW_HEIGHT : SURAH_ROW_HEIGHT;
      return {
        length,
        offset: LIST_HEADER_HEIGHT + length * index,
        index,
      };
    },
    [viewMode],
  );

  const keyExtractor = useCallback(
    (item) => (viewMode === 'juz' ? `juz-${item.juz}` : item.id.toString()),
    [viewMode],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.segmentedControl}>
        {[
          { mode: 'surah', label: t.surahs },
          { mode: 'juz', label: t.juz },
        ].map(({ mode, label }) => {
          const isActive = viewMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => setViewMode(mode)}
              activeOpacity={0.8}
              accessibilityRole='button'
              accessibilityState={{ selected: isActive }}
              style={[
                styles.segment,
                {
                  backgroundColor: isActive
                    ? theme.colors.accent
                    : theme.colors.card,
                  borderColor: isActive
                    ? theme.colors.accent
                    : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color: isActive ? theme.colors.onAccent : theme.colors.text,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ),
    [viewMode, theme, t],
  );

  // Handle loading and error states
  if (loading) {
    return (
      <View
        style={[styles.loading, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text }}>{t.loading}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.text }}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      data={viewMode === 'juz' ? filteredJuz : filteredSurahs}
      keyExtractor={keyExtractor}
      renderItem={viewMode === 'juz' ? renderJuzItem : renderItem}
      ListHeaderComponent={listHeader}
      getItemLayout={getItemLayout}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={5}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior='automatic'
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    minWidth: '100%',
  },
  verseContainer: {
    marginVertical: 5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { height: 1, width: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
    borderRadius: 20,
    height: 100,
    margin: 5,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  verseText: {
    fontSize: Platform.isPad ? 20 : 14,
  },
  verseTextArabic: {
    fontSize: 20,
    fontFamily: 'custom-font',
  },
  verseInfoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: 10,
  },
  verseCount: {
    fontSize: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
    height: LIST_HEADER_HEIGHT - 8,
    marginBottom: 8,
    marginHorizontal: 5,
  },
  segment: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  juzContainer: {
    marginVertical: 5,
    margin: 5,
    padding: 10,
    height: JUZ_ROW_HEIGHT - 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    shadowOffset: { height: 1, width: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
  },
  juzBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  juzBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  juzTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  juzTitle: {
    fontSize: Platform.isPad ? 20 : 15,
    fontWeight: '600',
  },
  juzRange: {
    fontSize: 12,
    marginTop: 3,
  },
  juzInfoContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  juzArabic: {
    fontSize: 16,
    fontFamily: 'custom-font',
  },
});

export default HomeScreen;
