# Tajweed and Tawafuq Implementation Guide

## Overview
Successfully restored and implemented Tajweed (Quranic recitation rules) and Tawafuq (Allah's name highlighting) features for the QuranApp.

## Implementation Date
February 13, 2026

## Features Implemented

### 1. Tajweed Rules (Color Coding)
The app now supports color-coded Quranic text according to standard Tajweed rules:

#### Tajweed Rules Supported:
- **Qalqala** (Red `#DD0008`) - Echoing/Bouncing sound
- **Idghaam with Ghunna** (Dark Green `#169777`) - Merging with nasal sound
- **Idghaam without Ghunna** (Green `#169200`) - Merging without nasal sound
- **Ikhfa** (Purple `#9400A8`) - Hiding
- **Iqlab** (Orange `#F26522`) - Changing
- **Madd** (Blue `#2144C1`) - Regular prolongation
- **Madd Munfasil** (Light Blue `#537FFF`) - Separated prolongation
- **Madd Lazim** (Dark Blue `#000EBC`) - Necessary prolongation
- **Laam Shamsiyyah** (Pink `#d500b3`) - Silent Laam (Sun letter)

### 2. Tawafuq (Lafz al-Jalala)
- Highlights all occurrences of Allah's name (الله) in gold color (`#FFD700`)
- Recognizes multiple variations:
  - ٱللَّهُ (nominative)
  - ٱللَّهِ (genitive)
  - ٱللَّهَ (accusative)
  - لِلَّهِ (for Allah)
  - بِٱللَّهِ (by Allah)
  - وَٱللَّهُ (and Allah)
  - فَٱللَّهُ (then Allah)

### 3. User Controls
Users can toggle both features independently from Settings:
- **Enable Tajweed** - Toggle on/off Tajweed color coding
- **Highlight Allah's Name** - Toggle on/off Allah name highlighting
- Settings are persisted using AsyncStorage

## Files Created

### Core Utilities
1. **`utils/tajweed.js`** (450+ lines)
   - Main Tajweed rules engine
   - Character analysis functions
   - Rule detection algorithms
   - Exports: `applyTajweedRules()`, `getTajweedRuleName()`, `TAJWEED_COLORS`

2. **`utils/tawafuq.js`** (220+ lines)
   - Allah name detection and highlighting
   - Pattern matching for different variations
   - Combination with Tajweed rules
   - Exports: `applyTawafuq()`, `applyTajweedWithTawafuq()`, `ALLAH_COLOR`

### Context
3. **`contexts/TajweedContext.js`** (80+ lines)
   - React Context for Tajweed state management
   - Persists user preferences to AsyncStorage
   - Provides `useTajweed()` hook
   - Exports: `TajweedProvider`, `useTajweed`

### Components
4. **`components/TajweedText.jsx`** (80+ lines)
   - React component that renders colored Arabic text
   - Integrates with TajweedContext
   - Applies both Tajweed and Tawafuq based on settings
   - Usage: `<TajweedText text={arabicText} baseColor={color} />`

5. **`components/TajweedLegend.jsx`** (100+ lines)
   - Visual legend explaining Tajweed colors
   - Shows all rules with descriptions
   - Responsive card-based layout

## Files Modified

### App Structure
6. **`app/_layout.js`**
   - Added `TajweedProvider` wrapper
   - Wraps the entire app to provide Tajweed context

### UI Integration
7. **`app/(tabs)/index/surah/[id].js`**
   - Updated `VerseItem` component to use `TajweedText`
   - Replaced plain `Text` with `TajweedText` for Arabic verses
   - Bismillah also uses `TajweedText`

8. **`app/(tabs)/settings.js`**
   - Added Tajweed Settings section
   - Two toggle switches:
     - Enable Tajweed
     - Highlight Allah's Name
   - Styled to match existing UI

## How It Works

### Tajweed Rule Detection

The `applyTajweedRules()` function:
1. Iterates through each Arabic character
2. Analyzes the character and its diacritics
3. Checks surrounding context (previous/next characters)
4. Applies rules in priority order:
   - Qalqala (highest priority)
   - Noon/Tanween rules
   - Meem rules
   - Laam rules
   - Madd rules (lowest priority)
5. Returns segments: `[{text, color}, ...]`

### Key Rule Implementations

#### Noon Saakin/Tanween Rules
- **Iqlab**: ن or Tanween + ب → Orange
- **Idghaam with Ghunna**: ن or Tanween + [ي، ن، م، و] → Dark Green
- **Idghaam without Ghunna**: ن or Tanween + [ل، ر] → Green
- **Ikhfa**: ن or Tanween + [ت، ث، ج، د، ذ، ز، س، ش، ص، ض، ظ، ف، ق، ك] → Purple

#### Madd Rules
- **Regular Madd**: Alif after Fatha, Waw Sukoon after Damma, Yaa Sukoon after Kasra → Blue
- **Madd Munfasil**: Madd letter + Hamza → Light Blue
- **Madd Lazim**: Madd letter + Shadda/Sukoon → Dark Blue

#### Qalqala Rule
- Letters [ق، ط، ب، ج، د] with Sukoon → Red

### Tawafuq Detection

The `applyTawafuq()` function:
1. Searches for Allah's name patterns
2. Normalizes text for flexible matching
3. Identifies all occurrences with exact positions
4. Returns segments: `[{text, isAllah}, ...]`

### Combined Mode

The `applyTajweedWithTawafuq()` function:
1. First identifies Allah's name occurrences
2. Applies Tajweed to text segments between Allah occurrences
3. Marks Allah occurrences (takes precedence over Tajweed colors)
4. Returns: `[{text, color, isAllah}, ...]`

## Usage

### In Components

```javascript
import TajweedText from '@/components/TajweedText';

// Simple usage
<TajweedText 
  text={arabicText} 
  baseColor={theme.colors.text}
  style={styles.verseText}
/>
```

### Accessing Settings

```javascript
import { useTajweed } from '@/contexts/TajweedContext';

function MyComponent() {
  const { tajweedEnabled, tawafuqEnabled, toggleTajweed, toggleTawafuq } = useTajweed();
  
  return (
    <Switch value={tajweedEnabled} onValueChange={toggleTajweed} />
  );
}
```

## User Experience

### Settings Flow
1. User opens Settings tab
2. Scrolls to "Tajweed Settings" section
3. Toggles "Enable Tajweed" and/or "Highlight Allah's Name"
4. Settings are saved automatically
5. Changes apply immediately to all Surah screens

### Reading Flow
1. User navigates to any Surah
2. If Tajweed is enabled, text displays with colors
3. If Tawafuq is enabled, Allah's name appears in gold
4. Both can be used together or separately
5. Settings persist across app restarts

## Technical Details

### Performance Optimizations
- `TajweedText` component is memoized
- Rule detection uses efficient string scanning
- Diacritic handling avoids redundant checks
- Context values are memoized in the provider

### Character Analysis
- Properly handles Arabic diacritics
- Distinguishes base characters from diacritics
- Analyzes character context (previous/next)
- Recognizes Sukoon, Shadda, Tanween, etc.

### Flexibility
- Works with any Arabic text
- Gracefully handles missing diacritics
- Supports different text lengths
- Compatible with existing styling

## Future Enhancements

Possible improvements:
1. Add Tajweed legend modal in Surah screen
2. Implement more advanced Madd rules
3. Add audio pronunciation for Tajweed rules
4. Create interactive Tajweed tutorial
5. Add user customization of colors
6. Implement Tajweed tests/quizzes

## Testing

To test the implementation:
1. Run the app: `npm start`
2. Navigate to Settings
3. Enable Tajweed and/or Tawafuq
4. Open any Surah
5. Verify colored text appears correctly
6. Test Bismillah rendering
7. Check Allah name highlighting
8. Toggle settings and verify changes

## Dependencies

No new dependencies added. Uses existing:
- React Native core components
- AsyncStorage (already installed)
- Expo Router (already installed)
- React Context API (built-in)

## Compatibility

- ✅ iOS
- ✅ Android
- ✅ Web (with limitations)
- ✅ Dark/Light themes
- ✅ All screen sizes
- ✅ RTL support

## Notes

- Tajweed rules are based on standard Quranic recitation rules
- Color scheme follows common Tajweed color conventions
- Implementation focuses on the most important and visible rules
- Some advanced rules may require future refinement
- Allah name detection is comprehensive but may need edge case handling

## Summary

The Tajweed and Tawafuq implementation provides users with a rich, educational Quranic reading experience. The color-coded text helps users learn proper recitation rules, while the Allah name highlighting adds spiritual emphasis. Both features are optional and user-controlled, ensuring flexibility for all users.

