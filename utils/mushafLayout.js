/**
 * Madani mushaf line layout.
 *
 * The printed mushaf's line breaks are what produce tawafuq - the vertical
 * alignment of لفظ الجلالة down a page. Reflowing text can never produce it, so
 * the reader lays each line out with exactly the words the mushaf puts on it.
 *
 * `quran/mushaf.json` stores only where each of the 8820 lines *starts*, as an
 * index into the app's own verse text. The Quran.com word text uses a slightly
 * different orthography (كَفَرُوا۟ vs كَفَرُواْ), so only the breaks are borrowed;
 * `overrides` re-tokenizes the ten verses the mushaf groups differently
 * (بَعۡدَ + مَا as one word, لَّوۡمَا as two, and so on).
 */

import layout from '@/quran/mushaf.json';

const { starts, overrides } = layout;

export const LINE_COUNT = starts.length;

/** Words of a verse, grouped the way the mushaf groups them. */
export const getVerseWords = (surahId, ayahId, text) => {
  const override = overrides[`${surahId}:${ayahId}`];
  if (override) {
    return override;
  }
  return text ? text.split(/\s+/).filter(Boolean) : [];
};

// surahId -> indices into `starts`. Every surah begins exactly at a line start
// and no line straddles two surahs, so a surah's lines are simply its entries.
const LINES_BY_SURAH = new Map();
starts.forEach((entry, index) => {
  const surahId = entry[2];
  const bucket = LINES_BY_SURAH.get(surahId);
  if (bucket) {
    bucket.push(index);
  } else {
    LINES_BY_SURAH.set(surahId, [index]);
  }
});

// Laying a surah out is pure work over text that never changes, so the result
// is cached: the reader rebuilds on every language switch otherwise.
const surahCache = new Map();

/**
 * The surah as mushaf lines.
 *
 * @param surahId 1-114
 * @param verses the surah's verses (no synthetic bismillah entry)
 * @returns [{ page, line, key, words: [{ ayahId, wordIndex, text, endsAyah }] }]
 */
export const getSurahLines = (surahId, verses) => {
  const cached = surahCache.get(surahId);
  if (cached) {
    return cached;
  }

  const lineIndices = LINES_BY_SURAH.get(surahId);
  if (!lineIndices || !verses?.length) {
    return [];
  }

  // Flatten the surah into the mushaf's token order once, remembering where
  // each ayah begins so a line's start can be resolved by index.
  const tokens = [];
  const ayahOffset = [];
  verses.forEach((verse, i) => {
    ayahOffset[i] = tokens.length;
    const ayahId = i + 1;
    const words = getVerseWords(surahId, ayahId, verse.text);
    words.forEach((text, wordIndex) => {
      tokens.push({ ayahId, wordIndex, text, endsAyah: wordIndex === words.length - 1 });
    });
  });

  const lines = lineIndices.map((startIndex, n) => {
    const [page, line, , ayahId, wordIndex] = starts[startIndex];
    const from = ayahOffset[ayahId - 1] + wordIndex;

    let to;
    if (n + 1 < lineIndices.length) {
      const [, , , nextAyah, nextWord] = starts[lineIndices[n + 1]];
      to = ayahOffset[nextAyah - 1] + nextWord;
    } else {
      to = tokens.length; // no line straddles a surah, so this surah ends here
    }

    return { page, line, key: `${page}:${line}`, words: tokens.slice(from, to) };
  });

  surahCache.set(surahId, lines);
  return lines;
};

/** Index of the first line holding a verse - used to scroll to it. */
export const findLineIndexForVerse = (lines, ayahId) =>
  lines.findIndex((entry) => entry.words.some((w) => w.ayahId === ayahId));

/**
 * Split colour segments produced for a whole line back onto its words.
 *
 * Tajweed rules run across word boundaries (idghaam and ikhfa join the end of
 * one word to the start of the next), so the engine has to see the whole line.
 * Words are then addressed by character range rather than by splitting on
 * spaces, because a merged token like "بَعۡدَ مَا" contains one.
 */
export const sliceSegmentsByWord = (segments, words) => {
  const result = words.map(() => []);
  let wordIndex = 0;
  let wordStart = 0;
  let wordEnd = words.length ? words[0].text.length : 0;
  let cursor = 0;

  for (const segment of segments) {
    let offset = 0;
    while (offset < segment.text.length && wordIndex < words.length) {
      const segStart = cursor + offset;
      if (segStart >= wordEnd) {
        // Step over the single space that separates two words.
        wordIndex += 1;
        if (wordIndex >= words.length) {
          break;
        }
        wordStart = wordEnd + 1;
        wordEnd = wordStart + words[wordIndex].text.length;
        continue;
      }

      if (segStart < wordStart) {
        // Sitting on the separator space itself - it belongs to no word.
        offset += wordStart - segStart;
        continue;
      }

      const take = Math.min(segment.text.length - offset, wordEnd - segStart);
      const piece = segment.text.substr(offset, take);
      if (piece.trim()) {
        result[wordIndex].push({ ...segment, text: piece });
      }
      offset += take;
    }
    cursor += segment.text.length;
  }

  return result;
};
