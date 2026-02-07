import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'bookmarks';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
};

const normalizeBookmarks = (value) =>
  value.filter(
    (bookmark) =>
      bookmark &&
      Number.isFinite(Number(bookmark.surahId)) &&
      Number.isFinite(Number(bookmark.verseId)),
  );

export const getBookmarks = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = safeParse(raw);
  return Array.isArray(parsed) ? normalizeBookmarks(parsed) : [];
};

export const saveBookmarks = async (bookmarks) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
};

export const isVerseBookmarked = async (surahId, verseId) => {
  const bookmarks = await getBookmarks();
  return bookmarks.some(
    (bookmark) => bookmark.surahId === surahId && bookmark.verseId === verseId,
  );
};

export const toggleVerseBookmark = async (bookmarkItem) => {
  const bookmarks = await getBookmarks();
  const exists = bookmarks.some(
    (bookmark) =>
      bookmark.surahId === bookmarkItem.surahId &&
      bookmark.verseId === bookmarkItem.verseId,
  );

  const updated = exists
    ? bookmarks.filter(
        (bookmark) =>
          !(
            bookmark.surahId === bookmarkItem.surahId &&
            bookmark.verseId === bookmarkItem.verseId
          ),
      )
    : [bookmarkItem, ...bookmarks];

  await saveBookmarks(updated);

  return {
    bookmarks: updated,
    isBookmarked: !exists,
  };
};

export const removeBookmark = async (surahId, verseId) => {
  const bookmarks = await getBookmarks();
  const updated = bookmarks.filter(
    (bookmark) =>
      !(bookmark.surahId === surahId && bookmark.verseId === verseId),
  );
  await saveBookmarks(updated);
  return updated;
};
