import React, { useEffect, useState, useCallback, memo } from 'react';
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
import { useRouter } from 'expo-router';

// Memoized list item component for optimal performance
const SurahListItem = memo(({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.verseContainer}>
      <Image
        source={
          item.type === 'meccan'
            ? require('../../../assets/10171102.png')
            : require('../../../assets/6152869.png')
        }
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <View style={styles.centerContent}>
          <Text style={styles.verseText}>{item.transliteration}</Text>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View />
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.verseText}>"{item.translation}"</Text>
        </View>
        <View style={styles.verseInfoContainer}>
          <Text style={styles.verseTextArabic}>{item.name}</Text>
          <Text style={styles.verseCount}>{item.total_verses} ayahs</Text>
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
};

const HomeScreen = () => {
  const router = useRouter();
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [fontsLoaded] = useFonts({
    'custom-font': require('../../../assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Lazy load chapters data to prevent Metro freeze
      const chapters = require('../../../quran/chapters.json');
      setFilteredSurahs(chapters);
    }
    setLoading(false);
  }, [fontsLoaded]);

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
      <SurahListItem item={item} onPress={handleSurahPress(item)} />
    ),
    [handleSurahPress],
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
      <View style={styles.loading}>
        <ActivityIndicator size='large' color='#333' />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    backgroundColor: '#fff',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
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
    shadowColor: 'rgba(0,0,0, .4)', // iOS
    shadowOffset: { height: 1, width: 1 }, // iOS
    shadowOpacity: 1, // iOS
    shadowRadius: 1, // iOS
    backgroundColor: '#fff',
    elevation: 2, // Android
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
    backgroundColor: 'black',
  },
  verseText: {
    fontSize: Platform.isPad ? 20 : 14,
    color: '#333',
  },
  verseTextArabic: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'custom-font',
  },
  verseInfoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: 10,
  },
  verseCount: {
    fontSize: 10,
    color: '#999',
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
