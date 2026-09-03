import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import PropTypes from 'prop-types';
import { applyTajweedRules } from '@/utils/tajweed';
import {
  applyTajweedWithTawafuq,
  applyTawafuq,
  ALLAH_COLOR,
} from '@/utils/tawafuq';
import { useTajweed } from '@/contexts/TajweedContext';
import { sliceSegmentsByWord } from '@/utils/mushafLayout';

const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

const toArabicNumerals = (number) =>
  number
    .toString()
    .split('')
    .map((digit) => ARABIC_NUMERALS[Number.parseInt(digit, 10)])
    .join('');

/** Colour segments for a whole line, mirroring TajweedText's rule selection. */
const segmentsForLine = (text, tajweedEnabled, tawafuqEnabled) => {
  if (!text || (!tajweedEnabled && !tawafuqEnabled)) {
    return null;
  }
  if (tajweedEnabled && tawafuqEnabled) {
    return applyTajweedWithTawafuq(text, applyTajweedRules);
  }
  if (tawafuqEnabled) {
    return applyTawafuq(text).map((seg) => ({
      text: seg.text,
      color: null,
      isAllah: seg.isAllah,
    }));
  }
  return applyTajweedRules(text).map((seg) => ({ ...seg, isAllah: false }));
};

/**
 * One line of the mushaf, laid out with exactly the words the printed page puts
 * on it and spread to fill the column width. That spreading is what makes
 * tawafuq visible: لفظ الجلالة lands in the same column line after line.
 *
 * Tajweed is computed for the whole line before being split across words,
 * because idghaam and ikhfa join the end of one word to the start of the next.
 */
const MushafLine = memo(
  ({
    words,
    fontSize,
    lineHeight,
    theme,
    bookmarkedVerseIds,
    onVerseLongPress,
    stretch,
  }) => {
    const { tajweedEnabled, tawafuqEnabled } = useTajweed();

    const perWord = useMemo(() => {
      const lineText = words.map((w) => w.text).join(' ');
      const segments = segmentsForLine(lineText, tajweedEnabled, tawafuqEnabled);
      return segments ? sliceSegmentsByWord(segments, words) : null;
    }, [words, tajweedEnabled, tawafuqEnabled]);

    const textStyle = { fontSize, lineHeight };

    return (
      <View
        style={[
          styles.line,
          { justifyContent: stretch ? 'space-between' : 'center' },
        ]}
      >
        {words.map((word, index) => {
          const baseColor = bookmarkedVerseIds[word.ayahId]
            ? theme.colors.brand
            : theme.colors.text;
          const pieces = perWord?.[index];

          return (
            <React.Fragment key={`${word.ayahId}-${word.wordIndex}`}>
              <Pressable onLongPress={() => onVerseLongPress(word.ayahId)}>
                <Text style={[styles.word, textStyle, { color: baseColor }]}>
                  {pieces?.length
                    ? pieces.map((piece, i) => (
                        <Text
                          key={i}
                          style={{
                            color: piece.isAllah
                              ? ALLAH_COLOR
                              : piece.color || baseColor,
                          }}
                        >
                          {piece.text}
                        </Text>
                      ))
                    : word.text}
                </Text>
              </Pressable>

              {word.endsAyah && (
                <Text
                  style={[styles.word, textStyle, { color: theme.colors.text }]}
                >
                  {`۝${toArabicNumerals(word.ayahId)}`}
                </Text>
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  },
);

MushafLine.displayName = 'MushafLine';

MushafLine.propTypes = {
  words: PropTypes.array.isRequired,
  fontSize: PropTypes.number.isRequired,
  lineHeight: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  bookmarkedVerseIds: PropTypes.object.isRequired,
  onVerseLongPress: PropTypes.func.isRequired,
  stretch: PropTypes.bool,
};

const styles = StyleSheet.create({
  line: {
    // row-reverse puts the first word on the right without depending on the
    // app being in RTL layout mode.
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  word: {
    fontFamily: 'uthmani-font',
    writingDirection: 'rtl',
  },
});

export default MushafLine;
