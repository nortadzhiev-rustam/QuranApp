import React, {
  useEffect,
  useState,
  memo,
  useRef,
  use,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Switch,
  TouchableOpacity,
  I18nManager,
  Platform,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Picker } from '@react-native-picker/picker';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useLocalSearchParams,
  Stack,
  useFocusEffect,
  useRouter,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabBarContext } from '@/contexts/TabBarContext';
import { getBookmarks, toggleVerseBookmark } from '@/utils/bookmarks';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTajweed } from '@/contexts/TajweedContext';
import TajweedText from '@/components/TajweedText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Enable RTL for Arabic text
I18nManager.allowRTL(true);

// Screen dimensions
const { width, height } = Dimensions.get('window');

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

// VerseItem component (memo removed for Tajweed context updates)
const VerseItem = ({
  item = {},
  fontSize = 16,
  lineHeight = 1.5,
  isEnabled = false,
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
          baseColor={theme.colors.text}
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
            textAlign: isEnabled ? 'right' : 'justify',
          },
        ]}
        baseColor={isBookmarked ? '#D7233C' : theme.colors.text}
      >
        <Text style={{ color: isBookmarked ? '#D7233C' : theme.colors.text }}>
          {' '}
          {convertToArabicNumerals(item.id)}
        </Text>
      </TajweedText>

      {isEnabled && (
        <Text
          style={[
            styles.verseTranslation,
            {
              fontSize: Platform.isPad ? fontSize * 0.4 : fontSize * 0.6,
              lineHeight: Platform.isPad ? lineHeight * 0.6 : lineHeight * 0.5,
              marginTop: 10,
              color: theme.colors.textSecondary,
            },
          ]}
        >
          {item.translation}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// HeaderRight component for navigation bar
const HeaderRight = ({ isOpen, toggleOpen }) => (
  <TouchableOpacity style={{}} onPress={toggleOpen}>
    <Icon
      name={isOpen ? 'chevron-up' : 'chevron-down'}
      color='black'
      size={20}
    />
  </TouchableOpacity>
);

// Main SurahScreen component
const SurahScreen = () => {
  const { theme, isDark } = useTheme();
  const { t, language, getQuranData } = useLanguage(); // language is for UI only
  const params = useLocalSearchParams();
  const router = useRouter();
  const listRef = useRef(null);
  const inlineScrollRef = useRef(null);
  const inlineTextOffsetRef = useRef(0);
  const verseOffsetsRef = useRef({});
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
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [loadingMore] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false); // Translation switch
  const [isOpen, setIsOpen] = useState(false); // Translation toggle menu
  const [isScrolled, setIsScrolled] = useState(false); // Track scroll state
  const [bookmarkedVerseIds, setBookmarkedVerseIds] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null); // Track selected verse for bookmarking
  const [currentSurahName, setCurrentSurahName] = useState(surahName); // Track surah name based on language
  const [translationLanguage, setTranslationLanguage] = useState(language); // Separate translation language
  const { setIsTabBarHidden } = use(TabBarContext);
  const { tajweedEnabled } = useTajweed();
  // Font loading
  const [fontsLoaded] = useFonts({
    'uthmani-font': require('@/assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf'),
  });

  // Toggle switch state for translation
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const toggleOpen = () => setIsOpen((previousState) => !previousState);

  useFocusEffect(() => {
    setIsTabBarHidden(true);
    return () => setIsTabBarHidden(false);
  });

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
        setBookmarkedVerseIds(next);
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
    if (fontsLoaded) {
      // Load quran data based on selected translation language
      const quranData = getQuranData(translationLanguage);
      let surah = quranData.find((item) => item.id === surahNumber);

      // Bismillah translations by language
      const bismillahTranslations = {
        en: 'In the name of Allah, the Most Gracious, the Most Merciful',
        tr: "Rahman ve Rahim olan Allah'ın adıyla",
        ru: 'Во имя Аллаха, Милостивого, Милосердного',
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
      } else {
        setError('Surah not found');
      }
    }

    setLoading(false);
  }, [
    surahNumber,
    fontsLoaded,
    translationLanguage,
    getQuranData,
    hasBismillah,
  ]);

  useEffect(() => {
    if (!Number.isFinite(verseParam)) {
      return;
    }
    if (isEnabled) {
      const index = verses.findIndex(
        (verse) => Number(verse.id) === verseParam,
      );
      if (index > -1 && listRef.current) {
        listRef.current.scrollToIndex({ index, animated: true });
      }
      return;
    }

    const inlineOffset = verseOffsetsRef.current[verseParam];
    if (Number.isFinite(inlineOffset) && inlineScrollRef.current) {
      inlineScrollRef.current.scrollTo({ y: inlineOffset, animated: true });
      return;
    }
    const retry = setTimeout(() => {
      const nextOffset = verseOffsetsRef.current[verseParam];
      if (Number.isFinite(nextOffset) && inlineScrollRef.current) {
        inlineScrollRef.current.scrollTo({ y: nextOffset, animated: true });
      }
    }, 120);

    return () => clearTimeout(retry);
  }, [verseParam, verses, isEnabled]);

  const handleScrollToIndexFailed = useCallback((info) => {
    if (!listRef.current) {
      return;
    }
    const offset = info.averageItemLength * info.index;
    listRef.current.scrollToOffset({ offset, animated: true });
    setTimeout(() => {
      listRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 80);
  }, []);

  const handleVerseLongPress = async (verse) => {
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
  };

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

  // Load more verses for pagination
  const loadMoreVerses = () => {
    if (!loadingMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Handle scroll event
  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    setIsScrolled(currentOffset > 50); // Adjust threshold
  };

  // Loading and error views
  if (loading && currentPage === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' />
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

  const { fontSize, lineHeight } = calculateFontSize(width);

  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonDisplayMode: 'minimal',
          title: currentSurahName,
          headerRight:
            Platform.OS === 'android'
              ? () => <HeaderRight isOpen={isOpen} toggleOpen={toggleOpen} />
              : undefined,
        }}
      />
      {Platform.OS === 'ios' &&
        (selectedVerse ? (
          <Stack.Toolbar placement='right'>
            {/* Show bookmark menu when a verse is selected*/}
            <Stack.Toolbar.Menu icon='bookmark' title='Bookmark Options'>
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
          </Stack.Toolbar>
        ) : (
          // Show translation toggle by default
          <Stack.Toolbar placement='right'>
            <Stack.Toolbar.Button
              variant={isEnabled ? 'done' : 'plain'}
              icon='translate'
              isOn={isEnabled}
              onPress={toggleSwitch}
            />

            {isEnabled && (
              <Stack.Toolbar.Menu icon='globe' title='Translation Language'>
                <Stack.Toolbar.MenuAction
                  icon={translationLanguage === 'en' ? 'checkmark' : undefined}
                  onPress={() => setTranslationLanguage('en')}
                >
                  English
                </Stack.Toolbar.MenuAction>
                <Stack.Toolbar.MenuAction
                  icon={translationLanguage === 'ru' ? 'checkmark' : undefined}
                  onPress={() => setTranslationLanguage('ru')}
                >
                  Русский
                </Stack.Toolbar.MenuAction>
                <Stack.Toolbar.MenuAction
                  icon={translationLanguage === 'tr' ? 'checkmark' : undefined}
                  onPress={() => setTranslationLanguage('tr')}
                >
                  Türkçe
                </Stack.Toolbar.MenuAction>
              </Stack.Toolbar.Menu>
            )}
          </Stack.Toolbar>
        ))}
      <View style={{ flex: 1 }}>
        {/* Translation toggle menu */}
        {isOpen && Platform.OS === 'android' && (
          <View style={styles.headerContainer}>
            <View style={styles.translationToggle}>
              <Text style={{ marginRight: 10 }}>{t.translation}</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
            <View style={styles.languagePicker}>
              <Text style={{ marginRight: 10 }}>
                {t.language || 'Language'}:
              </Text>
              <Picker
                selectedValue={translationLanguage}
                style={styles.picker}
                onValueChange={(itemValue) => setTranslationLanguage(itemValue)}
              >
                <Picker.Item label='English' value='en' />
                <Picker.Item label='Русский' value='ru' />
                <Picker.Item label='Türkçe' value='tr' />
              </Picker>
            </View>
          </View>
        )}
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {/* Surah name and type, hidden when scrolled */}
          {!isScrolled && (surahNumber !== 1 || isEnabled) && (
            <SafeAreaView
              edges={[Platform.OS === 'ios' && 'top']}
              style={{ marginTop: Platform.OS === 'ios' ? 50 : 0 }}
            >
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
                  <Text style={[styles.verseText, styles.surahType]}>
                    {type === 'meccan' ? 'مَكِّيَّاتٌ' : 'مَدَنِيَّاتٌ'}
                  </Text>
                </ImageBackground>
              </View>
            </SafeAreaView>
          )}

          {/* Verses rendering */}
          {isEnabled ? (
            <FlatList
              ref={listRef}
              data={verses}
              renderItem={({ item }) => (
                <VerseItem
                  item={item}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  isEnabled={isEnabled}
                  isBookmarked={Boolean(bookmarkedVerseIds[item.id])}
                  onLongPress={() => handleVerseLongPress(item)}
                  theme={theme}
                />
              )}
              contentInsetAdjustmentBehavior='automatic'
              keyExtractor={(item) => item.id.toString() || item.text}
              contentContainerStyle={[
                styles.flatlistContent,
                { backgroundColor: theme.colors.background },
              ]}
              onEndReached={loadMoreVerses}
              onEndReachedThreshold={0.5}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onScrollToIndexFailed={handleScrollToIndexFailed}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator size='small' color='#0000ff' />
                ) : null
              }
            />
          ) : surahNumber !== 1 ? (
            <ScrollView
              ref={inlineScrollRef}
              style={{
                flex: 1,
                marginTop: isScrolled ? 0 : Platform.isPad ? 200 : 100,
                backgroundColor: theme.colors.background,
              }}
              onScroll={handleScroll}
              contentInsetAdjustmentBehavior='automatic'
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              scrollEventThrottle={16}
            >
              {/* Render Bismillah as a block at the top */}
              {verses.some((verse) => verse.id === 'bismillah') && (
                <View style={styles.bismillahContainer}>
                  <Text style={styles.bismillahText}>
                    {Platform.OS === 'ios'
                      ? '\uFDFD'
                      : 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'}
                  </Text>
                </View>
              )}

              {/* Render all verses inline after Bismillah */}
              <View
                onLayout={(event) => {
                  inlineTextOffsetRef.current = event.nativeEvent.layout.y;
                }}
              >
                <Text
                  style={[
                    styles.verseText,
                    {
                      fontSize,
                      lineHeight,
                      flexWrap: 'wrap',
                      padding: 10,
                      alignItems: 'justify',
                      color: theme.colors.text,
                    },
                  ]}
                >
                  {verses.map((verse) =>
                    verse.id !== 'bismillah' ? (
                      <Text
                        key={verse.id.toString()}
                        onLayout={(event) => {
                          const offset =
                            inlineTextOffsetRef.current +
                            event.nativeEvent.layout.y;
                          verseOffsetsRef.current[Number(verse.id)] = offset;
                        }}
                        onLongPress={() => handleVerseLongPress(verse)}
                      >
                        <TajweedText
                          text={verse.text}
                          baseColor={
                            bookmarkedVerseIds[verse.id]
                              ? theme.mode === 'dark'
                                ? theme.colors.text
                                : '#D7233C'
                              : theme.colors.text
                          }
                        />
                        <Text
                          style={{
                            color: bookmarkedVerseIds[verse.id]
                              ? theme.mode === 'dark'
                                ? theme.colors.text
                                : '#D7233C'
                              : theme.colors.text,
                          }}
                        >
                          {' '}
                          {convertToArabicNumerals(verse.id)}{' '}
                        </Text>
                      </Text>
                    ) : null,
                  )}
                </Text>
              </View>
            </ScrollView>
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
      </View>
    </>
  );
};

// Stylesheet for SurahScreen
const styles = StyleSheet.create({
  flatlistContent: {
    backgroundColor: '#F9F6EF',
    minHeight: '100%',
    marginTop: Platform.isPad ? 200 : 100,
    paddingBottom: Platform.isPad ? 200 : 100,
    paddingTop: 10,
  },
  verseContainer: {
    width: width * 0.95,
    marginBottom: 15,
    alignSelf: 'center',
  },
  verseText: {
    fontFamily: 'uthmani-font',
    color: '#333',
    writingDirection: 'rtl',
    textAlign: 'justify',
  },
  verseTranslation: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    borderStyle: 'solid',
    color: '#555',
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
    color: '#D7233C',
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
    flex: 1,
    margin: 0,
    padding: 0,
    width: width,
    maxHeight: 1,
    zIndex: 1,
    alignItems: 'center',
  },
  surahNameBackground: {
    width: width,
    height: Platform.isPad ? 200 : 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahName: {
    color: '#fff',
    fontSize: width * 0.07,
    lineHeight: width * 0.1,
    alignItems: 'center',
  },
  surahType: {
    color: '#fff',
    fontSize: width * 0.07,
    lineHeight: width * 0.1,
  },
  alFatihahImage: {
    margin: 0,
    maxWidth: width,
    height: Platform.isPad ? height * 0.9 : height * 0.78,
  },
  bottomNavigation: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navButton: {
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: width,
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '50%',
    color: '#000',
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: 70,
    padding: 5,
    justifyContent: 'space-between',
  },
  translationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
});

export default SurahScreen;
