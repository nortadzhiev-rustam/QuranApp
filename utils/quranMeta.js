/**
 * Quran structural metadata - Juz, Hizb, Rub' al-Hizb, Page and Sajda.
 *
 * Boundaries come from `quran/meta.json` (Tanzil.net, CC BY 3.0) and were
 * cross-checked against the Quran.com API v4 over all 6236 ayahs. Every table
 * stores only where a unit *starts*, so a lookup is a binary search over
 * absolute ayah positions rather than a 6236-entry map.
 */

import meta from '@/quran/meta.json';

export const JUZ_COUNT = 30;
export const HIZB_COUNT = 60;
export const QUARTER_COUNT = 240;
export const PAGE_COUNT = 604;
export const SURAH_COUNT = 114;
export const TOTAL_AYAHS = 6236;

const { suraStart, suraAyas, sajda } = meta;

/**
 * Absolute 0-based position of an ayah within the whole Quran, or -1 when the
 * reference does not exist. Every table below is indexed in this space.
 */
export const toGlobalAyah = (surahId, ayahId) => {
  const surah = Number(surahId);
  const ayah = Number(ayahId);

  if (!Number.isInteger(surah) || surah < 1 || surah > SURAH_COUNT) {
    return -1;
  }
  if (!Number.isInteger(ayah) || ayah < 1 || ayah > suraAyas[surah - 1]) {
    return -1;
  }

  return suraStart[surah - 1] + (ayah - 1);
};

/** Inverse of `toGlobalAyah`. Returns null for a position outside the Quran. */
export const fromGlobalAyah = (globalIndex) => {
  if (!Number.isInteger(globalIndex) ||
      globalIndex < 0 ||
      globalIndex >= TOTAL_AYAHS) {
    return null;
  }

  // Rightmost surah whose start is <= globalIndex.
  let low = 0;
  let high = SURAH_COUNT - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (suraStart[mid] <= globalIndex) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return { surahId: low + 1, ayahId: globalIndex - suraStart[low] + 1 };
};

// Precompute each table in global-ayah space once, at module load.
const toGlobalTable = (pairs) =>
  pairs.map(([surah, ayah]) => suraStart[surah - 1] + (ayah - 1));

const JUZ_STARTS = toGlobalTable(meta.juz);
const QUARTER_STARTS = toGlobalTable(meta.hizbQuarter);
const PAGE_STARTS = toGlobalTable(meta.page);

/** 1-based index of the last start that is <= globalIndex. */
const unitAt = (starts, globalIndex) => {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (starts[mid] <= globalIndex) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low + 1;
};

/** Juz (1-30) containing the ayah, or null if the reference is invalid. */
export const getJuz = (surahId, ayahId) => {
  const globalIndex = toGlobalAyah(surahId, ayahId);
  return globalIndex < 0 ? null : unitAt(JUZ_STARTS, globalIndex);
};

/** Mushaf page (1-604) containing the ayah, or null. */
export const getPage = (surahId, ayahId) => {
  const globalIndex = toGlobalAyah(surahId, ayahId);
  return globalIndex < 0 ? null : unitAt(PAGE_STARTS, globalIndex);
};

/**
 * Hizb position of an ayah: the hizb (1-60), the absolute quarter (1-240) and
 * which quarter of that hizb it is (1-4).
 */
export const getHizb = (surahId, ayahId) => {
  const globalIndex = toGlobalAyah(surahId, ayahId);
  if (globalIndex < 0) {
    return null;
  }

  const quarter = unitAt(QUARTER_STARTS, globalIndex);
  return {
    hizb: Math.floor((quarter - 1) / 4) + 1,
    quarter,
    quarterInHizb: ((quarter - 1) % 4) + 1,
  };
};

const startOf = (pairs, number, count) =>
  Number.isInteger(number) && number >= 1 && number <= count
    ? { surahId: pairs[number - 1][0], ayahId: pairs[number - 1][1] }
    : null;

/** First ayah of a juz (1-30). */
export const getJuzStart = (juz) => startOf(meta.juz, juz, JUZ_COUNT);

/** First ayah of a mushaf page (1-604). */
export const getPageStart = (page) => startOf(meta.page, page, PAGE_COUNT);

/** First ayah of a hizb (1-60) - every 4th quarter. */
export const getHizbStart = (hizb) =>
  startOf(meta.hizbQuarter, Number.isInteger(hizb) ? hizb * 4 - 3 : hizb,
          QUARTER_COUNT);

const rangeOf = (starts, pairs, number, count) => {
  const start = startOf(pairs, number, count);
  if (!start) {
    return null;
  }

  const lastGlobal =
    number === count ? TOTAL_AYAHS - 1 : starts[number] - 1;

  return { start, end: fromGlobalAyah(lastGlobal) };
};

/** First and last ayah of a juz, as `{ start, end }`. */
export const getJuzRange = (juz) =>
  rangeOf(JUZ_STARTS, meta.juz, juz, JUZ_COUNT);

/** First and last ayah of a page, as `{ start, end }`. */
export const getPageRange = (page) =>
  rangeOf(PAGE_STARTS, meta.page, page, PAGE_COUNT);

/**
 * The surahs a juz covers, in order, each with the ayah span the juz includes.
 * Drives the range label on a juz row ("Al-Baqarah 142 - 252").
 */
export const getJuzSegments = (juz) => {
  const range = getJuzRange(juz);
  if (!range) {
    return [];
  }

  const segments = [];
  for (let surahId = range.start.surahId; surahId <= range.end.surahId; surahId += 1) {
    const fromAyah = surahId === range.start.surahId ? range.start.ayahId : 1;
    const toAyah =
      surahId === range.end.surahId ? range.end.ayahId : suraAyas[surahId - 1];

    segments.push({
      surahId,
      fromAyah,
      toAyah,
      ayahCount: toAyah - fromAyah + 1,
    });
  }

  return segments;
};

/** Total ayahs in a juz. */
export const getJuzAyahCount = (juz) => {
  const range = getJuzRange(juz);
  if (!range) {
    return 0;
  }
  return (
    toGlobalAyah(range.end.surahId, range.end.ayahId) -
    toGlobalAyah(range.start.surahId, range.start.ayahId) +
    1
  );
};

const SAJDA_KEYS = new Map(
  sajda.map(([surahId, ayahId, type]) => [`${surahId}:${ayahId}`, type]),
);

/**
 * Sajda type ('obligatory' | 'recommended') when the ayah carries a
 * prostration mark, otherwise null. 15 in total.
 */
export const getSajda = (surahId, ayahId) =>
  SAJDA_KEYS.get(`${Number(surahId)}:${Number(ayahId)}`) ?? null;

/** Ayah count of a surah (1-114), or 0 when out of range. */
export const getSurahAyahCount = (surahId) =>
  Number.isInteger(surahId) && surahId >= 1 && surahId <= SURAH_COUNT
    ? suraAyas[surahId - 1]
    : 0;
