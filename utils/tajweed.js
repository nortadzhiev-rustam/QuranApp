/**
 * Tajweed Rules Implementation
 *
 * This module implements Quranic Tajweed rules for text coloring
 * according to the standard Tajweed color-coding system.
 */

// Tajweed color definitions - Using distinct colors for each rule
export const TAJWEED_COLORS = {
  GHUNNA: '#A1A1A1', // Gray - Ghunna (nasal sound)
  IDGHAAM: '#169777', // Dark Green - Idghaam with ghunna
  IDGHAAM_WITHOUT_GHUNNA: '#169200', // Green - Idghaam without ghunna
  IKHFA: '#9500E0', // Purple - Ikhfa
  IQLAB: '#E67300', // Orange - Iqlab
  QALQALA: '#DD0008', // Red - Qalqala
  MADD: '#0050E6', // Blue - Madd (elongation)
  MADD_MUNFASIL: '#5DADE2', // Light Blue - Madd Munfasil
  MADD_LAZIM: '#0D47A1', // Dark Blue - Madd Lazim
  LAAM_SHAMSIYYA: '#E91E8C', // Pink - Laam Shamsiyya
  SILENT: '#A1A1A1', // Gray - Silent letters
};

// Arabic character definitions
const ARABIC_CHARS = {
  ALIF: 'ا',
  WAW: 'و',
  YAA: 'ي',
  NOON: 'ن',
  MEEM: 'م',
  LAM: 'ل',
  RA: 'ر',
  TANWEEN: ['ً', 'ٌ', 'ٍ'],
  SUKOON: 'ْ',
  SHADDA: 'ّ',
  FATHA: 'َ',
  DAMMA: 'ُ',
  KASRA: 'ِ',
  MADD: 'ٓ',
  HAMZA: ['ء', 'أ', 'ؤ', 'ئ', 'إ'],
};

// Shamsiyyah letters (Sun letters) - letters that assimilate the Laam
const SHAMSIYYAH_LETTERS = [
  'ت',
  'ث',
  'د',
  'ذ',
  'ر',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ل',
  'ن',
];

// Qamariyyah letters (Moon letters) - letters that don't assimilate the Laam
const QAMARIYYAH_LETTERS = [
  'ا',
  'ب',
  'ج',
  'ح',
  'خ',
  'ع',
  'غ',
  'ف',
  'ق',
  'ك',
  'م',
  'ه',
  'و',
  'ي',
];

// Qalqala letters
const QALQALA_LETTERS = ['ق', 'ط', 'ب', 'ج', 'د'];

// Ikhfa letters
const IKHFA_LETTERS = [
  'ت',
  'ث',
  'ج',
  'د',
  'ذ',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ظ',
  'ف',
  'ق',
  'ك',
];

// Idghaam letters (with ghunna)
const IDGHAAM_WITH_GHUNNA = ['ي', 'ن', 'م', 'و'];

// Idghaam letters (without ghunna)
const IDGHAAM_WITHOUT_GHUNNA = ['ل', 'ر'];

// Sukun can appear in different Qur'anic glyph forms depending on font/script
const SUKOON_MARKS = ['ْ', 'ۡ'];

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
 * Get the base character without diacritics
 */
const getBaseChar = (text, index) => {
  return text[index];
};

/**
 * Get all diacritics following a character
 */
const getDiacritics = (text, index) => {
  let diacritics = '';
  let i = index + 1;
  while (i < text.length && isDiacritic(text[i])) {
    diacritics += text[i];
    i++;
  }
  return diacritics;
};

/**
 * Check if character has Sukoon
 */
const hasSukoon = (text, index) => {
  const diacritics = getDiacritics(text, index);
  return SUKOON_MARKS.some((mark) => diacritics.includes(mark));
};

/**
 * Check if character has Shadda
 */
const hasShadda = (text, index) => {
  const diacritics = getDiacritics(text, index);
  return diacritics.includes('ّ');
};

/**
 * Check if character has Tanween
 */
const hasTanween = (text, index) => {
  const diacritics = getDiacritics(text, index);
  return ['ً', 'ٌ', 'ٍ'].some((t) => diacritics.includes(t));
};

/**
 * Get next non-diacritic character
 */
const getNextChar = (text, index) => {
  let i = index + 1;
  while (i < text.length && isDiacritic(text[i])) {
    i++;
  }
  return i < text.length ? text[i] : null;
};

/**
 * Get next non-diacritic character index
 */
const getNextCharIndex = (text, index) => {
  let i = index + 1;
  while (i < text.length && isDiacritic(text[i])) {
    i++;
  }
  return i < text.length ? i : -1;
};

/**
 * Get next Arabic letter (skipping diacritics and spaces)
 * Used for Tajweed rules that apply across word boundaries
 */
const getNextArabicChar = (text, index) => {
  let i = index + 1;
  while (i < text.length && (isDiacritic(text[i]) || text[i] === ' ')) {
    i++;
  }
  return i < text.length ? text[i] : null;
};

/**
 * Get next Arabic letter index (skipping diacritics and spaces)
 */
const getNextArabicCharIndex = (text, index) => {
  let i = index + 1;
  while (i < text.length && (isDiacritic(text[i]) || text[i] === ' ')) {
    i++;
  }
  return i < text.length ? i : -1;
};

/**
 * Get previous non-diacritic character
 */
const getPrevChar = (text, index) => {
  let i = index - 1;
  while (i >= 0 && isDiacritic(text[i])) {
    i--;
  }
  return i >= 0 ? text[i] : null;
};

/**
 * Get previous non-diacritic character index
 */
const getPrevCharIndex = (text, index) => {
  let i = index - 1;
  while (i >= 0 && isDiacritic(text[i])) {
    i--;
  }
  return i;
};

/**
 * Check if position is at word boundary (space or end of text)
 */
const isWordBoundary = (text, index) => {
  const nextChar = getNextChar(text, index);
  return nextChar === null || nextChar === ' ' || nextChar === '\n';
};

/**
 * Check if it's a Madd letter (Alif, Waw, Yaa with proper conditions)
 */
const isMaddLetter = (text, index) => {
  const char = text[index];
  const diacritics = getDiacritics(text, index);

  // Find previous non-diacritic character index
  const prevIndex = getPrevCharIndex(text, index);
  const prevDiacritics = prevIndex >= 0 ? getDiacritics(text, prevIndex) : '';

  // Alif after Fatha or Alif Khanjariyah (superscript alif)
  if (char === 'ا' || char === 'ٱ') {
    // Check if current Alif has superscript alif (rare but possible)
    if (diacritics.includes('ٰ')) {
      return true;
    }
    // Check if previous letter has Fatha or superscript alif
    if (prevDiacritics.includes('َ') || prevDiacritics.includes('ٰ')) {
      return true;
    }
    // Alif without diacritics after a letter with Fatha is usually Madd
    if (
      prevIndex >= 0 &&
      !SUKOON_MARKS.some((mark) => diacritics.includes(mark)) &&
      !diacritics.includes('ّ')
    ) {
      if (prevDiacritics.includes('َ')) {
        return true;
      }
    }
  }

  // Waw with Sukoon after Damma (or Waw as Madd letter)
  if (char === 'و') {
    // Classic case: Waw with Sukoon after Damma
    if (hasSukoon(text, index) && prevDiacritics.includes('ُ')) {
      return true;
    }
    // Some fonts might have Waw with superscript alif indicating Madd
    if (diacritics.includes('ٰ')) {
      return true;
    }
  }

  // Yaa with Sukoon after Kasra
  if (char === 'ي' || char === 'ى') {
    if (hasSukoon(text, index) && prevDiacritics.includes('ِ')) {
      return true;
    }
    // Alif Maqsurah (ى) with superscript alif (ٰ) is always Madd
    if (char === 'ى' && diacritics.includes('ٰ')) {
      return true;
    }
  }

  return false;
};

/**
 * Check for Qalqala rule
 * Qalqala occurs on letters ق ط ب ج د when they have Sukoon
 */
const checkQalqala = (text, index) => {
  const char = text[index];
  if (!QALQALA_LETTERS.includes(char)) {
    return null;
  }

  const diacritics = getDiacritics(text, index);

  // Qalqala with explicit Sukoon
  if (hasSukoon(text, index)) {
    return TAJWEED_COLORS.QALQALA;
  }

  return null;
};

/**
 * Check for Noon Saakin or Tanween rules
 * These rules apply when Noon has Sukoon or any letter has Tanween
 */
const checkNoonRules = (text, index) => {
  const char = text[index];
  const diacritics = getDiacritics(text, index);

  const hasNoonSukoon = char === 'ن' && hasSukoon(text, index);
  const hasTanweenMark =
    diacritics.includes('ً') ||
    diacritics.includes('ٌ') ||
    diacritics.includes('ٍ');

  if (!hasNoonSukoon && !hasTanweenMark) {
    return null;
  }

  // For Tanween and Noon Saakin rules, we need to check the next Arabic letter
  // even if it's in the next word (across spaces)
  const nextCharIndex = getNextArabicCharIndex(text, index);
  if (nextCharIndex === -1) return null;

  const nextChar = text[nextCharIndex];
  if (!nextChar) return null;

  // Iqlab - change to Meem when followed by Ba
  if (nextChar === 'ب') {
    return TAJWEED_COLORS.IQLAB;
  }

  // Idghaam with Ghunna (ي ن م و)
  if (IDGHAAM_WITH_GHUNNA.includes(nextChar)) {
    return TAJWEED_COLORS.IDGHAAM;
  }

  // Idghaam without Ghunna (ل ر)
  if (IDGHAAM_WITHOUT_GHUNNA.includes(nextChar)) {
    return TAJWEED_COLORS.IDGHAAM_WITHOUT_GHUNNA;
  }

  // Ikhfa - hiding before 15 specific letters
  if (IKHFA_LETTERS.includes(nextChar)) {
    return TAJWEED_COLORS.IKHFA;
  }

  // If none of the above, it might be Izhar (clear pronunciation)
  // Izhar doesn't get colored in most Tajweed systems
  return null;
};

/**
 * Check for Meem Saakin rules
 * Meem with Sukoon has special rules when followed by certain letters
 */
const checkMeemRules = (text, index) => {
  const char = text[index];
  const diacritics = getDiacritics(text, index);

  if (char !== 'م' || !hasSukoon(text, index)) {
    return null;
  }

  // Meem Saakin rules also apply across word boundaries
  const nextCharIndex = getNextArabicCharIndex(text, index);
  if (nextCharIndex === -1) return null;

  const nextChar = text[nextCharIndex];
  if (!nextChar) return null;

  // Idghaam Shafawi (Oral Idghaam) - when followed by Meem
  if (nextChar === 'م') {
    return TAJWEED_COLORS.IDGHAAM;
  }

  // Ikhfa Shafawi (Oral Ikhfa) - when followed by Ba
  if (nextChar === 'ب') {
    return TAJWEED_COLORS.IKHFA;
  }

  // Otherwise it's Izhar Shafawi (clear pronunciation) - no coloring
  return null;
};

/**
 * Check for Idghaam represented by Shadda
 * When letters have Shadda, it often indicates Idghaam (merging/assimilation)
 */
const checkShaddaIdghaam = (text, index) => {
  const char = text[index];
  const diacritics = getDiacritics(text, index);

  // Check if the letter has Shadda
  if (!diacritics.includes('ّ')) {
    return null;
  }

  // Noon with Shadda (نّ) is always Idghaam (Noon Saakin assimilated into following Noon)
  if (char === 'ن') {
    return TAJWEED_COLORS.IDGHAAM;
  }

  // Letters that can have Idghaam with Ghunna when they have Shadda (ي م و)
  // This happens when a Noon Saakin before them gets assimilated
  if (['ي', 'م', 'و'].includes(char)) {
    // Check if previous character position could have been a Noon/Tanween
    // In Quranic text, Shadda on these letters often indicates Idghaam
    return TAJWEED_COLORS.IDGHAAM;
  }

  // Letters that can have Idghaam without Ghunna when they have Shadda (ل ر)
  if (['ل', 'ر'].includes(char)) {
    return TAJWEED_COLORS.IDGHAAM_WITHOUT_GHUNNA;
  }

  return null;
};

/**
 * Check for Laam Shamsiyyah/Qamariyyah
 */
const checkLaamRules = (text, index) => {
  const char = text[index];
  if (char !== 'ل') return null;

  // Check if it's part of "Al" (definite article)
  const prevChar = getPrevChar(text, index);
  if (prevChar !== 'ا') return null;

  const nextChar = getNextChar(text, index);
  if (!nextChar) return null;

  // Laam Shamsiyyah (silent)
  if (SHAMSIYYAH_LETTERS.includes(nextChar)) {
    return TAJWEED_COLORS.LAAM_SHAMSIYYA;
  }

  return null;
};

/**
 * Check for Madd rules
 * Madd (elongation) has different types based on what follows the Madd letter
 */
const checkMaddRules = (text, index) => {
  if (!isMaddLetter(text, index)) {
    return null;
  }

  const char = text[index];
  const nextCharIndex = getNextCharIndex(text, index);

  if (nextCharIndex === -1) {
    // Madd letter at end of text
    return TAJWEED_COLORS.MADD;
  }

  const nextChar = text[nextCharIndex];
  const nextDiacritics = getDiacritics(text, nextCharIndex);

  // Madd Lazim - Madd letter followed by Shadda or the same letter with Shadda
  if (nextDiacritics.includes('ّ')) {
    return TAJWEED_COLORS.MADD_LAZIM;
  }

  // Madd Lazim - Madd letter followed by Sukoon (not at word boundary)
  if (
    SUKOON_MARKS.some((mark) => nextDiacritics.includes(mark)) &&
    !isWordBoundary(text, nextCharIndex)
  ) {
    return TAJWEED_COLORS.MADD_LAZIM;
  }

  // Madd Munfasil - Madd letter followed by Hamza
  // Check both the current word and across space
  if (ARABIC_CHARS.HAMZA.includes(nextChar)) {
    return TAJWEED_COLORS.MADD_MUNFASIL;
  }

  // Check if next word starts with Hamza (across word boundary)
  if (nextChar === ' ') {
    const afterSpaceIndex = getNextCharIndex(text, nextCharIndex);
    if (afterSpaceIndex !== -1) {
      const afterSpaceChar = text[afterSpaceIndex];
      if (ARABIC_CHARS.HAMZA.includes(afterSpaceChar)) {
        return TAJWEED_COLORS.MADD_MUNFASIL;
      }
    }
  }

  // Regular Madd (Madd Tabi'i) - natural elongation
  return TAJWEED_COLORS.MADD;
};

/**
 * Apply Tajweed rules to text and return colored segments
 *
 * @param {string} text - Arabic text to apply Tajweed rules to
 * @returns {Array} Array of {text, color} objects
 */
export const applyTajweedRules = (text) => {
  if (!text) {
    return [];
  }

  const segments = [];
  let currentSegment = '';
  let currentColor = null;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Skip if it's a diacritic (will be included with base character)
    if (isDiacritic(char)) {
      continue;
    }

    // Check all Tajweed rules in priority order
    let color = null;

    // Only check rules for actual Arabic letters (not spaces, numbers, etc.)
    const isArabicLetter = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(
      char,
    );

    if (isArabicLetter) {
      // Priority 1: Idghaam with Shadda (very high priority)
      color = color || checkShaddaIdghaam(text, i);

      // Priority 2: Qalqala (high priority for specific letters)
      color = color || checkQalqala(text, i);

      // Priority 3: Noon/Tanween rules
      color = color || checkNoonRules(text, i);

      // Priority 4: Meem rules
      color = color || checkMeemRules(text, i);

      // Priority 5: Laam rules
      color = color || checkLaamRules(text, i);

      // Priority 6: Madd rules (only if no other rule applied)
      color = color || checkMaddRules(text, i);
    }

    // Get character with its diacritics
    const charWithDiacritics = char + getDiacritics(text, i);

    // If color changed, start new segment
    if (color !== currentColor) {
      if (currentSegment) {
        segments.push({
          text: currentSegment,
          color: currentColor,
        });
      }
      currentSegment = charWithDiacritics;
      currentColor = color;
    } else {
      currentSegment += charWithDiacritics;
    }
  }

  // Add final segment
  if (currentSegment) {
    segments.push({
      text: currentSegment,
      color: currentColor,
    });
  }

  return segments;
};

/**
 * Get Tajweed rule name for a color (for legend/tooltips)
 */
export const getTajweedRuleName = (color) => {
  const ruleNames = {
    [TAJWEED_COLORS.GHUNNA]: 'Ghunna',
    [TAJWEED_COLORS.IDGHAAM]: 'Idghaam (with Ghunna)',
    [TAJWEED_COLORS.IDGHAAM_WITHOUT_GHUNNA]: 'Idghaam (without Ghunna)',
    [TAJWEED_COLORS.IKHFA]: 'Ikhfa',
    [TAJWEED_COLORS.IQLAB]: 'Iqlab',
    [TAJWEED_COLORS.QALQALA]: 'Qalqala',
    [TAJWEED_COLORS.MADD]: 'Madd',
    [TAJWEED_COLORS.MADD_MUNFASIL]: 'Madd Munfasil',
    [TAJWEED_COLORS.MADD_LAZIM]: 'Madd Lazim',
    [TAJWEED_COLORS.LAAM_SHAMSIYYA]: 'Laam Shamsiyyah',
    [TAJWEED_COLORS.SILENT]: 'Silent Letter',
  };
  return ruleNames[color] || '';
};

export default {
  applyTajweedRules,
  getTajweedRuleName,
  TAJWEED_COLORS,
};
