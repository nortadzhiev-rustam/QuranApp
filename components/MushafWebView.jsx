import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { WebView } from 'react-native-webview';
import { useTajweed } from '@/contexts/TajweedContext';
import { buildMushafHtml } from '@/utils/mushafHtml';
import FONT_BASE64 from '@/assets/fonts/quran/hafs/uthmanic_hafs/uthmaniHafsWoff2';
import BANNER_BASE64 from '@/assets/surahNameBase64';

/**
 * The continuous reader, drawn as a mushaf page in a WebView.
 *
 * Native flex layout could not justify a line - `space-between` only spreads
 * gaps, so lines that ran long overflowed the column and were clipped, and no
 * amount of measuring fixed it reliably. CSS justifies a line properly, and the
 * page can measure itself to scale the few lines that still overrun. Full,
 * evenly filled lines are what make tawafuq visible.
 */
const MushafWebView = ({
  lines,
  fontSize,
  lineHeight,
  theme,
  bookmarkedVerseIds,
  onVerseLongPress,
  onVisibleChange,
  targetAyah,
  header,
  loadingLabel,
}) => {
  const { tajweedEnabled, tawafuqEnabled } = useTajweed();
  const webRef = useRef(null);
  const isReady = useRef(false);
  // Laying out a long surah takes a moment; without this the reader is a blank
  // page for a few seconds.
  const [isRendered, setIsRendered] = useState(false);

  // Deliberately not keyed on bookmarks: rebuilding would reload the document
  // and throw away the reader's scroll position. Those go in through script.
  const html = useMemo(
    () =>
      buildMushafHtml({
        lines,
        fontSize,
        lineHeight,
        colors: {
          background: theme.colors.background,
          text: theme.colors.text,
          brand: theme.colors.brand,
          surahName: theme.colors.surahName,
        },
        tajweedEnabled,
        tawafuqEnabled,
        fontBase64: FONT_BASE64,
        header: header ? { ...header, bannerBase64: BANNER_BASE64 } : null,
      }),
    [
      lines,
      fontSize,
      lineHeight,
      theme,
      tajweedEnabled,
      tawafuqEnabled,
      header,
    ],
  );

  const run = useCallback((script) => {
    webRef.current?.injectJavaScript(`${script};true;`);
  }, []);

  const bookmarkList = useMemo(
    () => Object.keys(bookmarkedVerseIds).map(Number),
    [bookmarkedVerseIds],
  );

  useEffect(() => {
    if (isReady.current) {
      run(`window.setBookmarks(${JSON.stringify(bookmarkList)})`);
    }
  }, [bookmarkList, run]);

  useEffect(() => {
    if (isReady.current && Number.isFinite(targetAyah)) {
      run(`window.scrollToAyah(${targetAyah})`);
    }
  }, [targetAyah, run]);

  // A rebuilt document starts over, so re-apply everything once it reports in.
  const handleMessage = useCallback(
    (event) => {
      let message;
      try {
        message = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (message.type === 'ready') {
        isReady.current = true;
        setIsRendered(true);
        run(`window.setBookmarks(${JSON.stringify(bookmarkList)})`);
        if (Number.isFinite(targetAyah)) {
          run(`window.scrollToAyah(${targetAyah})`);
        }
        return;
      }

      if (message.type === 'longpress') {
        onVerseLongPress?.(message.ayah);
        return;
      }

      if (message.type === 'visible') {
        onVisibleChange?.(message);
      }
    },
    [bookmarkList, targetAyah, run, onVerseLongPress, onVisibleChange],
  );

  useEffect(() => {
    isReady.current = false;
    setIsRendered(false);
    // Never strand the reader behind a spinner if the page fails to report in.
    const failsafe = setTimeout(() => setIsRendered(true), 8000);
    return () => clearTimeout(failsafe);
  }, [html]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <WebView
        ref={webRef}
        source={{ html }}
        originWhitelist={['*']}
        onMessage={handleMessage}
        style={[styles.web, { backgroundColor: theme.colors.background }]}
        // The page is self-contained; nothing should navigate away from it.
        onShouldStartLoadWithRequest={(request) => request.url === 'about:blank'}
        javaScriptEnabled
        scrollEnabled
        // The stack header is transparent, so content scrolls underneath it.
        // The native list got this inset from the same prop.
        contentInsetAdjustmentBehavior='automatic'
        showsVerticalScrollIndicator={false}
        setSupportMultipleWindows={false}
        allowsLinkPreview={false}
        overScrollMode='never'
        androidLayerType='hardware'
      />

      {!isRendered && (
        <View
          style={[
            styles.loading,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <ActivityIndicator size='large' color={theme.colors.brand} />
          {!!loadingLabel && (
            <Text
              style={[
                styles.loadingText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {loadingLabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

MushafWebView.propTypes = {
  lines: PropTypes.array.isRequired,
  fontSize: PropTypes.number.isRequired,
  lineHeight: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  bookmarkedVerseIds: PropTypes.object.isRequired,
  onVerseLongPress: PropTypes.func,
  onVisibleChange: PropTypes.func,
  targetAyah: PropTypes.number,
  header: PropTypes.object,
  loadingLabel: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  web: {
    flex: 1,
  },
  loading: {
    // Spelled out rather than absoluteFillObject, with a stacking hint: a
    // native WebView sibling can otherwise draw over a JS-rendered overlay.
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default memo(MushafWebView);
