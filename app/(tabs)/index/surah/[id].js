import React, {
  useEffect,
  useState,
  memo,
  useRef,
  use,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  FlatList,
  TouchableOpacity,
  I18nManager,
  Platform,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useLocalSearchParams,
  Stack,
  useFocusEffect,
  useRouter,
} from 'expo-router';
import { TabBarContext } from '@/contexts/TabBarContext';
import { getBookmarks, toggleVerseBookmark } from '@/utils/bookmarks';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useLanguage,
  TRANSLATION_LANGUAGES,
} from '@/contexts/LanguageContext';
import { useTajweed } from '@/contexts/TajweedContext';
import TajweedText from '@/components/TajweedText';
import ReadingPositionBar from '@/components/ReadingPositionBar';
import MushafLine from '@/components/MushafLine';
import {
  getSurahLines,
  findLineIndexForVerse,
} from '@/utils/mushafLayout';
// Enable RTL for Arabic text
I18nManager.allowRTL(true);

// Screen dimensions
const { width, height } = Dimensions.get('window');

// Android toolbar menus need an image source - SF Symbols are dropped there.
const translateIcon = require('@/assets/icons/translate.xml');
const textFormatIcon = require('@/assets/icons/text_format.xml');

// The topmost visible item is the anchor kept across a layout switch.
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 10 };

// Utility function to convert numbers to Arabic numerals
const convertToArabicNumerals = (number) => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number
    .toString()
    .split('')
    .map((digit) => arabicNumerals[Number.parseInt(digit, 10)])
    .join('');
};

// Calculate dynamic font size based on screen width
const calculateFontSize = (screenWidth) => {
  const multiplier = 0.0664;
  const baseSize = 26;
  const lineHeightMultiplier = 1.5;
  const fontSize = Math.max(baseSize, screenWidth * multiplier);
  const lineHeight = fontSize * lineHeightMultiplier;

  return { fontSize, lineHeight };
};

// VerseItem component - Memoized to prevent unnecessary re-renders
// This is critical for performance when Tajweed is enabled
const VerseItem = memo(
  ({
    item = {},
    fontSize = 16,
    lineHeight = 1.5,
    showTranslation = false,
    isBookmarked = false,
    onLongPress,
    theme,
  }) => {
    if (item.id === 'bismillah') {
      return (
        <View style={styles.bismillahContainer}>
          <TajweedText
            text={
              Platform.OS === 'ios'
                ? '\uFDFD'
                : 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
            }
            style={styles.bismillahText}
            baseColor={theme.colors.brand}
          />
        </View>
      );
    }

    const verseTextWithNumber = `${item.text} ${convertToArabicNumerals(item.id)}`;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={onLongPress}
        style={styles.verseContainer}
      >
        <TajweedText
          text={item.text}
          style={[
            styles.verseText,
            {
              fontSize: Platform.isPad ? fontSize * 0.8 : fontSize,
              lineHeight: Platform.isPad ? lineHeight * 0.8 : lineHeight,
              textAlign: 'justify',
            },
          ]}
          baseColor={isBookmarked ? theme.colors.brand : theme.colors.text}
        >
          <Text
            style={{
              color: isBookmarked ? theme.colors.brand : theme.colors.text,
            }}
          >
            {' '}
            {convertToArabicNumerals(item.id)}
          </Text>
        </TajweedText>

        {showTranslation && (
          <Text
            style={[
              styles.verseTranslation,
              {
                borderBottomColor: theme.colors.border,
                fontSize: Platform.isPad ? fontSize * 0.4 : fontSize * 0.6,
                lineHeight: Platform.isPad
                  ? lineHeight * 0.6
                  : lineHeight * 0.5,
                marginTop: 10,
                color: theme.colors.textSecondary,
                textAlign: 'justify',
              },
            ]}
          >
            {item.translation}
          </Text>
        )}
      </TouchableOpacity>
    );
  },
);

// Main SurahScreen component
const SurahScreen = () => {
  const { theme, isDark } = useTheme();
  // The shown translation is a global preference, not per-surah state.
  const {
    t,
    getQuranData,
    getChapterData,
    translationLanguage,
    setTranslationLanguage,
  } = useLanguage();
  const params = useLocalSearchParams();
  const router = useRouter();
  const listRef = useRef(null);
  const inlineListRef = useRef(null);
  const surahNumber = Number.parseInt(params.id, 10);
  const hasBismillah =
    params.hasBismillah === 'true' || params.hasBismillah === true;
  const nameArabic = params.nameArabic;
  const type = params.type;
  const surahName = params.surahName;
  const verseParam = Number.parseInt(params.verseId, 10);

  // States
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedVerseIds, setBookmarkedVerseIds] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null); // Track selected verse for bookmarking
  const [anchorVerse, setAnchorVerse] = useState(null); // Topmost visible verse
  const [currentSurahName, setCurrentSurahName] = useState(surahName); // Track surah name based on language
  // A translation language implies the verse-by-verse layout; null is Arabic only.
  const showTranslation = translationLanguage !== null;
  const { setIsTabBarHidden } = use(TabBarContext);
  const { tajweedEnabled, tawafuqEnabled, toggleTajweed, toggleTawafuq } =
    useTajweed();
  // Font loading
  const [fontsLoaded] = useFonts({
    'uthmani-font': require('@/assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf'),
  });

  // Memoized so the effect runs on focus/blur only, not on every render
  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => setIsTabBarHidden(false);
    }, [setIsTabBarHidden]),
  );

  useEffect(() => {
    let isMounted = true;

    const loadBookmarkState = async () => {
      const stored = await getBookmarks();
      const next = {};
      stored
        .filter((bookmark) => bookmark.surahId === surahNumber)
        .forEach((bookmark) => {
          next[bookmark.verseId] = true;
        });

      if (isMounted) {
        // Keep the previous object when nothing changed - a fresh object here
        // would invalidate the memoized verse blocks and re-render the surah.
        setBookmarkedVerseIds((prev) => {
          const nextIds = Object.keys(next);
          const isUnchanged =
            nextIds.length === Object.keys(prev).length &&
            nextIds.every((verseId) => prev[verseId]);
          return isUnchanged ? prev : next;
        });
      }
    };

    if (Number.isFinite(surahNumber)) {
      loadBookmarkState();
    }

    return () => {
      isMounted = false;
    };
  }, [surahNumber]);
  // Load Surah data
  useEffect(() => {
    // Show loading when data is being reloaded
    setLoading(true);

    if (fontsLoaded) {
      // Load quran data based on selected translation language
      const quranData = getQuranData(translationLanguage);
      let surah = quranData.find((item) => item.id === surahNumber);

      // Bismillah translations by language
      const bismillahTranslations = {
        en: 'In the name of Allah, the Most Gracious, the Most Merciful',
        tr: "Rahman ve Rahim olan Allah'ın adıyla",
        ru: 'Во имя Аллаха, Милостивого, Милосердного',
        uz: 'Mehribon va rahmli Allohning nomi bilan boshlayman.',
        tj: 'Ба номи Худованди бахшандаи меҳрубон.',
      };

      const bismillahItem = {
        id: 'bismillah',
        text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        translation:
          bismillahTranslations[translationLanguage] ||
          bismillahTranslations.en,
      };

      if (surah?.verses) {
        if (
          hasBismillah &&
          !surah.verses.some((verse) => verse.id === 'bismillah')
        ) {
          surah = { ...surah, verses: [bismillahItem, ...surah.verses] }; // Add Bismillah if required
        }
        setVerses(surah.verses);
        setCurrentSurahName(surah.translation || surahName); // Update surah name based on language
        setLoading(false);
      } else {
        setError('Surah not found');
        setLoading(false);
      }
    }
  }, [
    surahNumber,
    fontsLoaded,
    translationLanguage,
    getQuranData,
    hasBismillah,
  ]);

  // The continuous view follows the printed mushaf's own line breaks rather
  // than reflowing. That is what produces tawafuq - لفظ الجلالة lining up
  // vertically - and it also means no block ever ends on a stranded short line.
  const mushafLines = useMemo(() => {
    const readableVerses = verses.filter((verse) => verse.id !== 'bismillah');
    return getSurahLines(surahNumber, readableVerses);
  }, [verses, surahNumber]);

  useEffect(() => {
    if (!Number.isFinite(verseParam) || verses.length === 0) {
      return;
    }

    if (showTranslation) {
      const index = verses.findIndex(
        (verse) => Number(verse.id) === verseParam,
      );
      if (index > -1) {
        listRef.current?.scrollToIndex({ index, animated: true });
      }
      return;
    }

    // Continuous mode scrolls to the mushaf line holding the verse
    const lineIndex = findLineIndexForVerse(mushafLines, verseParam);
    if (lineIndex > -1) {
      inlineListRef.current?.scrollToIndex({
        index: lineIndex,
        animated: true,
      });
    }
  }, [verseParam, verses, showTranslation, mushafLines]);

  // Remember the verse on screen so switching layouts lands on it again
  // instead of jumping back to the top of a freshly mounted list.
  const anchorVerseRef = useRef(null);
  const renderedLayoutRef = useRef(showTranslation);

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    const verseId = Number(viewableItems[0]?.item?.id);
    if (Number.isFinite(verseId)) {
      anchorVerseRef.current = verseId;
      setAnchorVerse(verseId);
    }
  }, []);

  const handleInlineViewableItemsChanged = useCallback(({ viewableItems }) => {
    // Items here are mushaf lines, so the anchor is the line's first word.
    const verseId = Number(viewableItems[0]?.item?.words?.[0]?.ayahId);
    if (Number.isFinite(verseId)) {
      anchorVerseRef.current = verseId;
      setAnchorVerse(verseId);
    }
  }, []);

  useEffect(() => {
    if (renderedLayoutRef.current === showTranslation || verses.length === 0) {
      return;
    }
    renderedLayoutRef.current = showTranslation;

    const verseId = anchorVerseRef.current;
    if (!Number.isFinite(verseId)) {
      return;
    }

    if (showTranslation) {
      const index = verses.findIndex((verse) => Number(verse.id) === verseId);
      if (index > -1) {
        listRef.current?.scrollToIndex({ index, animated: false });
      }
      return;
    }

    const lineIndex = findLineIndexForVerse(mushafLines, verseId);
    if (lineIndex > -1) {
      inlineListRef.current?.scrollToIndex({
        index: lineIndex,
        animated: false,
      });
    }
  }, [showTranslation, verses, mushafLines]);

  useEffect(() => {
    setAnchorVerse(Number.isFinite(verseParam) ? verseParam : 1);
  }, [surahNumber, verseParam]);

  // A page rarely starts on a surah boundary, so jumping means re-entering the
  // reader on the surah that owns it. `replace` keeps the back stack flat.
  const handleJumpToPage = useCallback(
    (target) => {
      const chapter = getChapterData().find(
        (item) => item.id === target.surahId,
      );

      router.replace({
        pathname: '/surah/[id]',
        params: {
          id: target.surahId.toString(),
          surahName: chapter?.transliteration,
          nameArabic: chapter?.name,
          hasBismillah: chapter?.bismillah ? 'true' : 'false',
          type: chapter?.type,
          totalVerses: chapter?.total_verses?.toString(),
          verseId: target.ayahId.toString(),
        },
      });
    },
    [getChapterData, router],
  );

  const handleScrollToIndexFailed = useCallback((info) => {
    const offset = info.averageItemLength * info.index;
    listRef.current?.scrollToOffset({ offset, animated: true });
    setTimeout(() => {
      listRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 80);
  }, []);

  const handleInlineScrollToIndexFailed = useCallback((info) => {
    const offset = info.averageItemLength * info.index;
    inlineListRef.current?.scrollToOffset({ offset, animated: true });
    setTimeout(() => {
      inlineListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    }, 80);
  }, []);

  const handleVerseLongPress = useCallback(async (verse) => {
    if (verse.id === 'bismillah') {
      return;
    }
    const verseId = Number(verse.id);
    if (!Number.isFinite(verseId)) {
      return;
    }

    if (Platform.OS === 'android') {
      // Show Alert dialog on Android
      const isCurrentlyBookmarked = bookmarkedVerseIds[verseId];

      Alert.alert(
        'Bookmark',
        `Verse ${verseId}`,
        [
          {
            text: isCurrentlyBookmarked ? 'Remove Bookmark' : 'Create Bookmark',
            onPress: async () => {
              const result = await toggleVerseBookmark({
                surahId: surahNumber,
                verseId: verseId,
                verseText: verse.text,
                translation: verse.translation,
                surahName,
                nameArabic,
                hasBismillah,
                type,
                createdAt: Date.now(),
              });

              setBookmarkedVerseIds((prev) => {
                const next = { ...prev };
                if (result.isBookmarked) {
                  next[verseId] = true;
                } else {
                  delete next[verseId];
                }
                return next;
              });
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true },
      );
    } else {
      // Set the selected verse to show bookmark button in toolbar on iOS
      setSelectedVerse({
        verseId,
        verseText: verse.text,
        translation: verse.translation,
      });
    }
  }, [
    bookmarkedVerseIds,
    surahNumber,
    surahName,
    nameArabic,
    hasBismillah,
    type,
  ]);

  const handleBookmarkAction = async () => {
    if (!selectedVerse) {
      return;
    }

    const result = await toggleVerseBookmark({
      surahId: surahNumber,
      verseId: selectedVerse.verseId,
      verseText: selectedVerse.verseText,
      translation: selectedVerse.translation,
      surahName,
      nameArabic,
      hasBismillah,
      type,
      createdAt: Date.now(),
    });

    setBookmarkedVerseIds((prev) => {
      const next = { ...prev };
      if (result.isBookmarked) {
        next[selectedVerse.verseId] = true;
      } else {
        delete next[selectedVerse.verseId];
      }
      return next;
    });

    // Clear selected verse after action
    setSelectedVerse(null);
  };

  // Calculate font size for rendering
  const { fontSize, lineHeight } = calculateFontSize(width);

  // Memoize the renderItem callback for FlatList performance
  const renderVerseItem = useCallback(
    ({ item }) => (
      <VerseItem
        item={item}
        fontSize={fontSize}
        lineHeight={lineHeight}
        showTranslation={showTranslation}
        isBookmarked={Boolean(bookmarkedVerseIds[item.id])}
        onLongPress={() => handleVerseLongPress(item)}
        theme={theme}
      />
    ),
    [
      fontSize,
      lineHeight,
      showTranslation,
      bookmarkedVerseIds,
      theme,
      handleVerseLongPress,
    ],
  );

  // Memoize keyExtractor for FlatList performance
  const keyExtractor = useCallback(
    (item) => item.id.toString() || item.text,
    [],
  );

  // A line reports the ayah it was pressed on; the sheet needs the verse.
  const handleLineVerseLongPress = useCallback(
    (ayahId) => {
      const verse = verses.find((item) => Number(item.id) === ayahId);
      if (verse) {
        handleVerseLongPress(verse);
      }
    },
    [verses, handleVerseLongPress],
  );

  // Render one mushaf line. Every line but the surah's last is spread to fill
  // the column, the way the printed page justifies it; the last one is centred
  // instead of flinging two words to opposite edges.
  const renderMushafLine = useCallback(
    ({ item, index }) => (
      <MushafLine
        words={item.words}
        fontSize={fontSize}
        lineHeight={lineHeight}
        theme={theme}
        bookmarkedVerseIds={bookmarkedVerseIds}
        onVerseLongPress={handleLineVerseLongPress}
        stretch={index < mushafLines.length - 1}
      />
    ),
    [
      fontSize,
      lineHeight,
      theme,
      bookmarkedVerseIds,
      handleLineVerseLongPress,
      mushafLines.length,
    ],
  );

  const mushafKeyExtractor = useCallback((line) => line.key, []);

  // Loading and error views
  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size='large' color={theme.colors.brand} />
        <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonDisplayMode: 'minimal',
          title: currentSurahName,
        }}
      />
      <Stack.Toolbar
        placement='right'
        tintColor={theme.colors.text}
        backgroundColor={theme.colors.card}
      >
        {/* Bookmarking joins the translation menu rather than replacing it */}
        {Platform.OS === 'ios' && selectedVerse && (
          <Stack.Toolbar.Menu
            icon={
              bookmarkedVerseIds[selectedVerse.verseId]
                ? 'bookmark.fill'
                : 'bookmark'
            }
            title='Bookmark Options'
          >
            <Stack.Toolbar.MenuAction
              icon={
                bookmarkedVerseIds[selectedVerse.verseId]
                  ? 'bookmark.fill'
                  : 'bookmark'
              }
              onPress={handleBookmarkAction}
            >
              {bookmarkedVerseIds[selectedVerse.verseId]
                ? 'Remove Bookmark'
                : 'Create Bookmark'}
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon='xmark'
              onPress={() => setSelectedVerse(null)}
            >
              Cancel
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        )}

        {/* One menu owns the whole decision: no translation, or which one */}
        <Stack.Toolbar.Menu
          // 'globe' over 'translate': the latter is a wide, heavy glyph next
          // to the neighbouring 'textformat', and SF Symbols in a header item
          // can't be resized - RNSBarButtonItem calls systemImageNamed: with
          // no symbol configuration.
          icon={Platform.OS === 'ios' ? 'globe' : translateIcon}
          // Without 'template' the drawable keeps its own black and vanishes
          // against a dark header.
          iconRenderingMode='template'
          title={t.translation}
          accessibilityLabel={t.translation}
        >
          <Stack.Toolbar.MenuAction
            isOn={!showTranslation}
            onPress={() => setTranslationLanguage(null)}
          >
            {t.arabicOnly}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.Menu inline>
            {TRANSLATION_LANGUAGES.map(({ code, label }) => (
              <Stack.Toolbar.MenuAction
                key={code}
                isOn={translationLanguage === code}
                onPress={() => setTranslationLanguage(code)}
              >
                {label}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>

        {/* Tajweed changes how the verses below are drawn, so it belongs here
            rather than three taps away in Settings. */}
        <Stack.Toolbar.Menu
          icon={Platform.OS === 'ios' ? 'textformat' : textFormatIcon}
          iconRenderingMode='template'
          title={t.tajweedSettings}
          accessibilityLabel={t.tajweedSettings}
        >
          <Stack.Toolbar.MenuAction
            isOn={tajweedEnabled}
            onPress={toggleTajweed}
          >
            {t.enableTajweed}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            isOn={tawafuqEnabled}
            onPress={toggleTawafuq}
          >
            {t.highlightAllah}
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <View style={{ flex: 1 }}>
        {/* Verses rendering */}
        {showTranslation ? (
          <FlatList
            ref={listRef}
            data={verses}
            renderItem={renderVerseItem}
            keyExtractor={keyExtractor}
            contentInsetAdjustmentBehavior='automatic'
            contentContainerStyle={[
              styles.flatlistContent,
              { backgroundColor: theme.colors.background },
            ]}
            ListHeaderComponent={
              surahNumber !== 1 || showTranslation ? (
                <View style={styles.surahNameContainer}>
                  <ImageBackground
                    style={styles.surahNameBackground}
                    resizeMode='cover'
                    source={require('@/assets/surahName.jpeg')}
                  >
                    <Text
                      style={[
                        styles.verseText,
                        styles.surahName,
                        { color: theme.colors.surahName },
                      ]}
                    >
                      سُورَةٌ {nameArabic}
                    </Text>
                    <Text
                      style={[
                        styles.verseText,
                        styles.surahType,
                        { color: theme.colors.surahName },
                      ]}
                    >
                      {type === 'meccan' ? 'مَكِّيَّاتٌ' : 'مَدَنِيَّاتٌ'}
                    </Text>
                  </ImageBackground>
                </View>
              ) : null
            }
            onScrollToIndexFailed={handleScrollToIndexFailed}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={VIEWABILITY_CONFIG}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={10}
          />
        ) : surahNumber !== 1 ? (
          <FlatList
            ref={inlineListRef}
            data={mushafLines}
            renderItem={renderMushafLine}
            keyExtractor={mushafKeyExtractor}
            contentInsetAdjustmentBehavior='automatic'
            contentContainerStyle={[
              styles.flatlistContent,
              { backgroundColor: theme.colors.background },
            ]}
            ListHeaderComponent={
              <>
                {/* Surah name and type header */}
                <View style={styles.surahNameContainer}>
                  <ImageBackground
                    style={styles.surahNameBackground}
                    resizeMode='cover'
                    source={require('@/assets/surahName.jpeg')}
                  >
                    <Text
                      style={[
                        styles.verseText,
                        styles.surahName,
                        { color: theme.colors.surahName },
                      ]}
                    >
                      سُورَةٌ {nameArabic}
                    </Text>
                    <Text
                      style={[
                        styles.verseText,
                        styles.surahType,
                        { color: theme.colors.surahName },
                      ]}
                    >
                      {type === 'meccan' ? 'مَكِّيَّاتٌ' : 'مَدَنِيَّاتٌ'}
                    </Text>
                  </ImageBackground>
                </View>

                {/* Render Bismillah as a block at the top */}
                {verses.some((verse) => verse.id === 'bismillah') && (
                  <View style={styles.bismillahContainer}>
                    <Text
                      style={[
                        styles.bismillahText,
                        { color: theme.colors.brand },
                      ]}
                    >
                      {Platform.OS === 'ios'
                        ? '\uFDFD'
                        : 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'}
                    </Text>
                  </View>
                )}
              </>
            }
            onScrollToIndexFailed={handleInlineScrollToIndexFailed}
            onViewableItemsChanged={handleInlineViewableItemsChanged}
            viewabilityConfig={VIEWABILITY_CONFIG}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            // Rows are single mushaf lines now, not ten-verse blocks, so a
            // couple of rows would leave the screen half empty on open.
            maxToRenderPerBatch={12}
            updateCellsBatchingPeriod={50}
            initialNumToRender={20}
            windowSize={10}
          />
        ) : (
          <SafeAreaView
            edges={[Platform.OS === 'ios' && 'top']}
            style={{ marginTop: Platform.OS === 'ios' ? 50 : 0 }}
          >
            <View style={{ flex: 1 }}>
              <Image
                style={styles.alFatihahImage}
                source={require('@/assets/fatiha.png')}
              />
            </View>
          </SafeAreaView>
        )}
      </View>
      {/* Last in the column: on Android this renders a real bottom bar, so it
          has to follow the flex:1 content to sit under it. On iOS it renders
          the native toolbar, where position in the tree does not matter. */}
      <ReadingPositionBar
        surahId={surahNumber}
        verseId={anchorVerse}
        theme={theme}
        t={t}
        onJumpToPage={handleJumpToPage}
      />
    </>
  );
};

// Stylesheet for SurahScreen
const styles = StyleSheet.create({
  flatlistContent: {
    minHeight: '100%',
    paddingBottom: Platform.isPad ? 200 : 100,
  },
  verseContainer: {
    width: width * 0.95,
    marginBottom: 15,
    alignSelf: 'center',
  },
  verseText: {
    fontFamily: 'uthmani-font',
    writingDirection: 'rtl',
    textAlign: 'justify',
  },
  verseTranslation: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  bismillahContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 1,
  },
  bismillahText: {
    fontFamily: 'uthmani-font',
    fontSize: Platform.OS === 'ios' ? width * 0.145 : width * 0.12,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNameContainer: {
    margin: 0,
    padding: 0,
    width: width,
    alignItems: 'center',
  },
  surahNameBackground: {
    width: width,
    height: Platform.isPad ? 200 : 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahName: {
    fontSize: width * 0.07,
    lineHeight: width * 0.1,
    alignItems: 'center',
  },
  surahType: {
    fontSize: width * 0.07,
    lineHeight: width * 0.1,
  },
  alFatihahImage: {
    margin: 0,
    maxWidth: width,
    height: Platform.isPad ? height * 0.9 : height * 0.78,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default SurahScreen;
