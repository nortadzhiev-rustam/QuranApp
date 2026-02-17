# QuranApp

A cross-platform Quran reading app built with **Expo + React Native** using **Expo Router**.  
It provides multilingual translations, bookmarks, search, and Tajweed/Tawafuq highlighting for Arabic text.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the App](#running-the-app)
- [Configuration Notes](#configuration-notes)
- [Tajweed & Tawafuq](#tajweed--tawafuq)
- [Data Sources](#data-sources)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Available Scripts](#available-scripts)
- [Documentation](#documentation)
- [Roadmap Ideas](#roadmap-ideas)

## Overview

QuranApp is designed for daily Quran reading with a clean mobile experience and educational recitation support.

The app currently includes:

- Surah list with localized names/translations.
- Surah reader with optional verse translation.
- Bookmarks (persisted locally with AsyncStorage).
- Search across surahs and bookmarks.
- Theme mode (auto/light/dark).
- Language switching (`en`, `ru`, `tr`).
- Tajweed color rules + Allah name highlighting (Tawafuq).

## Core Features

### 1) Quran Reading

- Browse all surahs from chapter metadata.
- Open detailed Surah screen with Arabic text.
- Optional translation display toggle.
- Automatic Bismillah insertion where applicable.

### 2) Bookmarks

- Long-press verses to create/remove bookmarks.
- Bookmark list is persisted via AsyncStorage.
- Tap a bookmark to jump back to the exact verse.

### 3) Search

- Search surahs by Arabic name, transliteration, translation, or surah number.
- Search bookmarks by surah/verse text metadata.

### 4) Personalization

- Theme mode: Auto / Light / Dark.
- Language mode: English / Russian / Turkish.

### 5) Tajweed & Tawafuq

- Tajweed rules are applied to Arabic text and rendered as colored segments.
- Allah’s name (Lafz al-Jalala) can be highlighted in gold.
- Both features are independently toggleable in Settings and persisted across restarts.

## Tech Stack

- **Framework:** Expo SDK 55 preview + React Native 0.83
- **Routing:** Expo Router
- **State/Context:** React Context API
- **Storage:** `@react-native-async-storage/async-storage`
- **Navigation:** Native tabs / stack via Expo Router + React Navigation under the hood
- **Fonts:** Custom Uthmani Quran font loaded with `expo-font`
- **Platforms:** iOS, Android, Web (basic)

## Project Structure

```text
app/
  _layout.js                     # Root providers + splash + root stack
  index.js                       # Redirect to tabs
  (tabs)/
    _layout.js                   # Native tab layout
    index/
      _layout.js                 # Quran stack (list, surah, settings)
      index.js                   # Surah list
      settings.js                # Theme/language/tajweed settings
      surah/[id].js              # Surah reader
    bookmarks/
      _layout.js
      index.js                   # Bookmarks screen
    search/
      _layout.js
      index.js                   # Search screen
    tajweed/
      _layout.js
      index.js                   # Tajweed guide screen
    library.js                   # Library placeholder tab

components/
  TajweedText.jsx                # Colored Arabic segment renderer
  TajweedLegend.jsx              # Tajweed color legend
  TajweedDebug.jsx               # Debug helper component

contexts/
  ThemeContext.js
  LanguageContext.js
  TajweedContext.js
  TabBarContext.js

utils/
  tajweed.js                     # Tajweed rules engine
  tawafuq.js                     # Allah-name detection & merge logic
  bookmarks.js                   # Bookmark persistence helpers

quran/
  chapters.json                  # Chapter metadata
  quran.json                     # EN translation data
  quran_ru.json                  # RU translation data
  quran_tr.json                  # TR translation data
```

## Getting Started

### Prerequisites

Install the following:

- **Node.js** (LTS recommended)
- **npm**
- **Xcode** (for iOS builds/simulator on macOS)
- **Android Studio** (for Android emulator/device builds)
- **Expo CLI via npx** (already used in project scripts)

### Install dependencies

```bash
npm install
```

### iOS pods (if needed)

If you run native iOS builds and CocoaPods are out of sync:

```bash
cd ios && pod install && cd ..
```

## Running the App

### Start development server

```bash
npm run start
```

### Run Android (native)

```bash
npm run android
```

### Run iOS (native)

```bash
npm run ios
```

### Run iOS on a connected physical device

```bash
npm run device
```

### Run web

```bash
npm run web
```

## Configuration Notes

- Path alias `@` is configured in `babel.config.js` via `babel-plugin-module-resolver`.
- Metro is customized in `metro.config.js` (`inlineRequires` + `maxWorkers = 2`).
- EAS build profiles are defined in `eas.json`:
  - `development`
  - `preview`
  - `production`

## Tajweed & Tawafuq

### Supported Tajweed categories

- Qalqala
- Idghaam (with Ghunna)
- Idghaam (without Ghunna)
- Ikhfa
- Iqlab
- Madd
- Madd Munfasil
- Madd Lazim
- Laam Shamsiyyah

### Tawafuq

- Detects and highlights multiple forms of Allah’s name in red.
- In combined mode, Allah highlighting takes precedence over Tajweed segment colors.

### Key implementation files

- `utils/tajweed.js`
- `utils/tawafuq.js`
- `components/TajweedText.jsx`
- `contexts/TajweedContext.js`
- `components/TajweedLegend.jsx`

## Data Sources

Quran text and translations are loaded from local JSON files under `quran/`.

Language-based loading is handled by `contexts/LanguageContext.js`:

- `en` -> `quran/quran.json`
- `ru` -> `quran/quran_ru.json`
- `tr` -> `quran/quran_tr.json`

## Testing

### Manual app testing

Use the in-repo testing guide:

- `docs/TESTING_GUIDE.md`

### Node-based quick checks

Two utility scripts are available:

```bash
node test-tajweed-simple.js
node test-arabic-text.js
```

These scripts validate basic Arabic text handling and Tajweed/Tawafuq processing logic.

## Troubleshooting

### Tajweed colors not appearing

- Verify both toggles in Settings (`Enable Tajweed`, `Highlight Allah's Name`).
- Check console logs from `TajweedContext` and `TajweedText`.
- Reload app / clear cache if stale state persists.

See:

- `docs/TAJWEED_TROUBLESHOOTING.md`
- `docs/TEXT_NOT_COLORED_FIXED.md`
- `docs/DEBUG_TEXT_NOT_COLORED.md`

### iOS build issues

- Ensure pods are installed and in sync (`ios/Podfile`).
- Re-run `pod install` after dependency changes.

### Android build issues

- Ensure SDK/NDK and Gradle are configured correctly in Android Studio.
- Confirm local SDK path in `android/local.properties`.

## Available Scripts

From `package.json`:

- `npm run start` -> `npx expo start`
- `npm run android` -> `npx expo run:android`
- `npm run ios` -> `npx expo run:ios`
- `npm run web` -> `npx expo start --web`
- `npm run device` -> `npx expo run:ios --device`

## Documentation

Additional technical notes are in `docs/`:

- `docs/TAJWEED_IMPLEMENTATION.md`
- `docs/TESTING_GUIDE.md`
- `docs/TAJWEED_TROUBLESHOOTING.md`
- `docs/THEME_USAGE.md`
- `docs/LANGUAGE_PREFERENCE_IMPLEMENTATION.md`
- `docs/RESTORATION_COMPLETE.md`

## Roadmap Ideas

Potential improvements:

- Add formal unit/integration tests for Tajweed and bookmark flows.
- Add in-reader Tajweed legend modal and onboarding.
- Expand translation/language packs.
- Improve accessibility options (font scaling, contrast presets).

---

If you’re onboarding to this project, start with:

1. `npm install`
2. `npm run start`
3. Open `app/(tabs)/index/surah/[id].js` and `components/TajweedText.jsx` to understand the reading pipeline.
