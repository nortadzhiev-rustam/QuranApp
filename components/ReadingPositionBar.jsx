import React, { memo, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  getJuz,
  getHizb,
  getPage,
  getPageStart,
  PAGE_COUNT,
} from '@/utils/quranMeta';

/**
 * Shows where the reader currently sits in the mushaf - juz, hizb and page - in
 * the bottom toolbar, and doubles as the entry point for jumping to a page. The
 * verse it reports is the topmost visible one, so the numbers track scrolling.
 */
const ReadingPositionBar = ({ surahId, verseId, theme, t, onJumpToPage }) => {
  const insets = useSafeAreaInsets();
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pageInput, setPageInput] = useState('');

  const position = useMemo(() => {
    if (!Number.isFinite(surahId) || !Number.isFinite(verseId)) {
      return null;
    }

    const juz = getJuz(surahId, verseId);
    const hizb = getHizb(surahId, verseId);
    const page = getPage(surahId, verseId);

    return juz && hizb && page ? { juz, hizb: hizb.hizb, page } : null;
  }, [surahId, verseId]);

  if (!position) {
    return null;
  }

  const requestedPage = Number.parseInt(pageInput, 10);
  const isRequestValid =
    Number.isInteger(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= PAGE_COUNT;

  const closePicker = () => {
    setPickerVisible(false);
    setPageInput('');
  };

  const confirmJump = () => {
    if (!isRequestValid) {
      return;
    }

    const target = getPageStart(requestedPage);
    closePicker();
    if (target) {
      onJumpToPage(target, requestedPage);
    }
  };

  const label = `${t.juz} ${position.juz}  ·  ${t.hizb} ${position.hizb}  ·  ${t.page} ${position.page}`;

  // iOS uses the native bottom toolbar, where a Button becomes a self-sizing
  // UIBarButtonItem title. Android gets a plain pinned bar instead: its toolbar
  // buttons are icon-only, and a hosted RN view there brings its own sizing
  // quirks for no benefit.
  const isIOS = Platform.OS === 'ios';

  const openPicker = () => setPickerVisible(true);

  return (
    <>
      {isIOS ? (
        <Stack.Toolbar
          placement='bottom'
          tintColor={theme.colors.text}
          backgroundColor={theme.colors.card}
        >
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button
            accessibilityLabel={t.goToPage}
            onPress={openPicker}
          >
            {label}
          </Stack.Toolbar.Button>
          <Stack.Toolbar.Spacer />
        </Stack.Toolbar>
      ) : (
        <View
          style={[
            styles.bar,
            {
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <Pressable
            onPress={openPicker}
            accessibilityRole='button'
            accessibilityLabel={t.goToPage}
            style={styles.barContent}
          >
            <Text style={[styles.barText, { color: theme.colors.text }]}>
              {label}
            </Text>
          </Pressable>
        </View>
      )}

      <Modal
        visible={isPickerVisible}
        transparent
        animationType='fade'
        onRequestClose={closePicker}
      >
        <Pressable style={styles.backdrop} onPress={closePicker}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Swallow taps inside the card so they do not dismiss it. */}
            <Pressable
              onPress={() => {}}
              style={[styles.card, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {t.goToPage}
              </Text>
              <Text
                style={[styles.cardHint, { color: theme.colors.textSecondary }]}
              >
                {t.pageRangeHint}
              </Text>

              <TextInput
                value={pageInput}
                onChangeText={setPageInput}
                onSubmitEditing={confirmJump}
                keyboardType='number-pad'
                returnKeyType='go'
                autoFocus
                maxLength={3}
                placeholder={String(position.page)}
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
              />

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={closePicker}
                  style={[styles.action, { borderColor: theme.colors.border }]}
                >
                  <Text style={{ color: theme.colors.text }}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmJump}
                  disabled={!isRequestValid}
                  style={[
                    styles.action,
                    {
                      backgroundColor: theme.colors.accent,
                      borderColor: theme.colors.accent,
                      opacity: isRequestValid ? 1 : 0.4,
                    },
                  ]}
                >
                  <Text
                    style={{ color: theme.colors.onAccent, fontWeight: '600' }}
                  >
                    {t.go}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
};

ReadingPositionBar.propTypes = {
  surahId: PropTypes.number,
  verseId: PropTypes.number,
  theme: PropTypes.object.isRequired,
  t: PropTypes.object.isRequired,
  onJumpToPage: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barContent: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barText: {
    fontSize: 12,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardHint: {
    fontSize: 13,
    marginTop: 6,
  },
  input: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 17,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  action: {
    minWidth: 88,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(ReadingPositionBar);
