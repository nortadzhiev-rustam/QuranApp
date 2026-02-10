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
    (data, index) => ({
      length: 110, // item height (100 + margin 10)
      offset: 110 * index,
      index,
    }),
    [],
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior='automatic'
      />
    </View>
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
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
});

export default HomeScreen;
