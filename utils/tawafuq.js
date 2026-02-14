/**
 * Tawafuq Implementation - Highlighting Lafz al-Jalala (Allah's name)
 *
 * This module identifies and highlights occurrences of Allah's name (الله)
 * in Quranic text for special emphasis.
 */

// Color for highlighting Allah's name
export const ALLAH_COLOR = '#DD0008'; // Gold color

// Variations of Allah's name in Arabic
const ALLAH_VARIATIONS = [
  'ٱللَّهُ', // Allah (nominative)
  'ٱللَّهِ', // Allah (genitive)
  'ٱللَّهَ', // Allah (accusative)
  'لِلَّهِ', // For Allah
  'بِٱللَّهِ', // By Allah
  'وَٱللَّهُ', // And Allah
  'فَٱللَّهُ', // Then Allah
  'ٱللَّٰهُ', // Allah (with superscript alif)
  'ٱللَّٰهِ', // Allah (genitive, with superscript alif)
  'ٱللَّٰهَ', // Allah (accusative, with superscript alif)
];

/**
 * Check if a character is a diacritic mark
 */
const isDiacritic = (char) => {
  const diacritics = [
    'َ',
    'ُ',
    'ِ',
    'ْ',
    'ّ',
    'ً',
    'ٌ',
    'ٍ',
    'ٓ',
    'ٰ',
    '۠',
    'ۡ',
    'ۢ',
    'ۣ',
    'ۤ',
    'ۥ',
    'ۦ',
    'ۧ',
    'ۨ',
    '۟',
    '۪',
    '۫',
    '۬',
    'ۭ',
  ];
  return diacritics.includes(char);
};

/**
 * Normalize Arabic text by removing some diacritics for comparison
 * but keeping the essential structure
 */
const normalizeForComparison = (text) => {
  // Remove most diacritics but keep Shadda and Alif variations
  return text.replace(/[ًٌٍَُِْۣۡۢۤۥۦ۪ۭۧۨ۟۫۬]/g, '');
};

/**
 * Check if text at position contains Allah's name
 */
const matchesAllahName = (text, startIndex) => {
  // Extract a substring that could contain Allah's name
  // Allah's name is typically 4-6 characters with diacritics
  const maxLength = 15;
  const substring = text.substring(startIndex, startIndex + maxLength);

  // Check each variation
  for (const variation of ALLAH_VARIATIONS) {
    if (substring.startsWith(variation)) {
      return variation.length;
    }

    // Also check normalized version for more flexible matching
    const normalizedSubstring = normalizeForComparison(substring);
    const normalizedVariation = normalizeForComparison(variation);

    if (normalizedSubstring.startsWith(normalizedVariation)) {
      // Find the actual length in original text
      let length = 0;
      let normalizedCount = 0;
      while (
        normalizedCount < normalizedVariation.length &&
        startIndex + length < text.length
      ) {
        if (!isDiacritic(text[startIndex + length])) {
          normalizedCount++;
        }
        length++;
      }
      // Include trailing diacritics
      while (
        startIndex + length < text.length &&
        isDiacritic(text[startIndex + length])
      ) {
        length++;
      }
      return length;
    }
  }

  return 0;
};

/**
 * Find all occurrences of Allah's name in the text
 *
 * @param {string} text - Arabic text to search
 * @returns {Array} Array of {start, length} objects indicating positions
 */
export const findAllahOccurrences = (text) => {
  if (!text) return [];

  const occurrences = [];
  let i = 0;

  while (i < text.length) {
    const matchLength = matchesAllahName(text, i);

    if (matchLength > 0) {
      occurrences.push({
        start: i,
        length: matchLength,
      });
      i += matchLength;
    } else {
      i++;
    }
  }

  return occurrences;
};

/**
 * Apply Tawafuq (Allah name highlighting) to text
 * Returns segments with Allah's name highlighted
 *
 * @param {string} text - Arabic text
 * @returns {Array} Array of {text, isAllah} objects
 */
export const applyTawafuq = (text) => {
  if (!text) return [];

  const occurrences = findAllahOccurrences(text);

  if (occurrences.length === 0) {
    return [{ text, isAllah: false }];
  }

  const segments = [];
  let lastIndex = 0;

  for (const occurrence of occurrences) {
    // Add text before Allah's name
    if (occurrence.start > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, occurrence.start),
        isAllah: false,
      });
    }

    // Add Allah's name
    segments.push({
      text: text.substring(
        occurrence.start,
        occurrence.start + occurrence.length,
      ),
      isAllah: true,
    });

    lastIndex = occurrence.start + occurrence.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isAllah: false,
    });
  }

  return segments;
};

/**
 * Combine Tajweed and Tawafuq
 * Applies both Tajweed rules and Allah name highlighting
 * Tawafuq takes precedence over Tajweed coloring
 *
 * @param {string} text - Arabic text
 * @param {Function} applyTajweed - Function to apply Tajweed rules
 * @returns {Array} Array of {text, color, isAllah} objects
 */
export const applyTajweedWithTawafuq = (text, applyTajweed) => {
  if (!text) return [];

  const allahOccurrences = findAllahOccurrences(text);

  if (allahOccurrences.length === 0) {
    // No Allah occurrences, just apply Tajweed
    const tajweedSegments = applyTajweed(text);
    return tajweedSegments.map((seg) => ({ ...seg, isAllah: false }));
  }

  const segments = [];
  let lastIndex = 0;

  for (const occurrence of allahOccurrences) {
    // Apply Tajweed to text before Allah's name
    if (occurrence.start > lastIndex) {
      const beforeText = text.substring(lastIndex, occurrence.start);
      const tajweedSegments = applyTajweed(beforeText);
      segments.push(
        ...tajweedSegments.map((seg) => ({ ...seg, isAllah: false })),
      );
    }

    // Add Allah's name (without Tajweed coloring)
    segments.push({
      text: text.substring(
        occurrence.start,
        occurrence.start + occurrence.length,
      ),
      color: null,
      isAllah: true,
    });

    lastIndex = occurrence.start + occurrence.length;
  }

  // Apply Tajweed to remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    const tajweedSegments = applyTajweed(remainingText);
    segments.push(
      ...tajweedSegments.map((seg) => ({ ...seg, isAllah: false })),
    );
  }

  return segments;
};

export default {
  findAllahOccurrences,
  applyTawafuq,
  applyTajweedWithTawafuq,
  ALLAH_COLOR,
};
