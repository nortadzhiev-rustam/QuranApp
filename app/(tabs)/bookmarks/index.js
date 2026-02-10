import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter, Stack } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { getBookmarks, removeBookmark } from '@/utils/bookmarks';
import { List, Host, Label, Button } from '@expo/ui/swift-ui';
import { listStyle, environment, tag } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
export default function BookmarksScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const loadBookmarks = useCallback(async () => {
    const stored = await getBookmarks();
    setBookmarks(stored);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [loadBookmarks]),
  );

  const handleOpenSurah = (bookmark) => {
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
  };

  const handleRemove = async (surahId, verseId) => {
    const updated = await removeBookmark(surahId, verseId);
    setBookmarks(updated);
  };

  const handleDelete = async (indices) => {
    const itemsToDelete = indices.map((index) => bookmarks[index]);
    for (const item of itemsToDelete) {
      await removeBookmark(item.surahId, item.verseId);
    }
    const updated = await getBookmarks();
    setBookmarks(updated);
  };

  const toggleEditMode = () => setEditMode((prev) => !prev);

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={[styles.text, { color: theme.colors.text }]}>
          {t.loadingBookmarks}
        </Text>
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={[styles.text, { color: theme.colors.text }]}>
          {t.noBookmarksYet}
        </Text>
      </View>
    );
  }

  const renderRow = (item) => (
    <View style={styles.bookmarkRow}>
      <TouchableOpacity
        onPress={() => handleOpenSurah(item)}
        style={styles.bookmarkInfo}
      >
        <Text style={[styles.bookmarkTitle, { color: theme.colors.text }]}>
          {item.surahName}
        </Text>
        <Text
          style={[
            styles.bookmarkSubtitle,
            { color: theme.colors.textSecondary },
          ]}
        >
          {item.nameArabic} • {t.ayah} {item.verseId}
        </Text>
        <Text
          style={[styles.bookmarkVerse, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {item.verseText}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleRemove(item.surahId, item.verseId)}
        accessibilityLabel='Remove bookmark'
      >
        <Icon name='trash' size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <>
        <Stack.Toolbar placement='right'>
          <Stack.Toolbar.Button
            onPress={toggleEditMode}
            variant={editMode ? 'done' : 'plain'}
          >
            {!editMode && <Stack.Toolbar.Label>{t.edit}</Stack.Toolbar.Label>}
            {editMode && <Stack.Toolbar.Icon sf='checkmark' />}
          </Stack.Toolbar.Button>
        </Stack.Toolbar>

        <Host
          style={[
            styles.hostContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <List
            modifiers={[
              listStyle('plain'),
              environment('editMode', editMode ? 'active' : 'inactive'),
            ]}
          >
            <List.ForEach onDelete={handleDelete}>
              {bookmarks.map((item, index) => (
                <Button key={index} onPress={() => handleOpenSurah(item)}>
                  <Label
                    title={`${item.surahName} • ${t.ayah} ${item.verseId}`}
                    onPress={() => handleOpenSurah(item)}
                    modifiers={[tag(`${item.surahId}:${item.verseId}`)]}
                  />
                </Button>
              ))}
            </List.ForEach>
          </List>
        </Host>
      </>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      data={bookmarks}
      keyExtractor={(item) => `${item.surahId}:${item.verseId}`}
      renderItem={({ item }) => renderRow(item)}
      ItemSeparatorComponent={() => (
        <View
          style={[styles.separator, { backgroundColor: theme.colors.border }]}
        />
      )}
      contentContainerStyle={[
        styles.listContent,
        { backgroundColor: theme.colors.background },
      ]}
      contentInsetAdjustmentBehavior='automatic'
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 16,
  },
  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bookmarkInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookmarkSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  bookmarkVerse: {
    fontSize: 13,
    marginTop: 6,
  },
  separator: {
    height: 1,
  },
});
