# Theme Context Usage Guide

## Overview

The app now has a centralized theme system using React Context that integrates with React Navigation's theming system. The theme automatically follows the system appearance (light/dark mode) or can be manually controlled.

## Features

- ✅ Centralized theme colors and values
- ✅ Integrates with React Navigation
- ✅ Auto mode (follows system theme)
- ✅ Manual theme selection (light/dark)
- ✅ Consistent spacing, typography, and colors
- ✅ Easy-to-use hook API

## Usage in Components

### Import the hook

```javascript
import { useTheme } from '@/contexts/ThemeContext';
```

### Access theme values

```javascript
function MyComponent() {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello World</Text>
    </View>
  );
}
```

## Available Theme Properties

### Colors

```javascript
theme.colors.primary; // Main brand color
theme.colors.background; // Screen background
theme.colors.card; // Card/panel background
theme.colors.text; // Primary text color
theme.colors.textSecondary; // Secondary/muted text
theme.colors.border; // Border color
theme.colors.accent; // Accent color (blue)
theme.colors.success; // Success green
theme.colors.error; // Error red
theme.colors.warning; // Warning yellow
theme.colors.cardBorder; // Card border color
theme.colors.inputBackground; // Input field background
theme.colors.shadow; // Shadow color
```

### Spacing

```javascript
theme.spacing.xs; // 4px
theme.spacing.sm; // 8px
theme.spacing.md; // 16px
theme.spacing.lg; // 24px
theme.spacing.xl; // 32px
```

### Border Radius

```javascript
theme.borderRadius.sm; // 4px
theme.borderRadius.md; // 8px
theme.borderRadius.lg; // 12px
theme.borderRadius.xl; // 16px
```

### Typography

```javascript
theme.typography.fontSizeSmall; // 12
theme.typography.fontSizeRegular; // 14
theme.typography.fontSizeMedium; // 16
theme.typography.fontSizeLarge; // 18
theme.typography.fontSizeXLarge; // 24
theme.typography.fontWeightRegular; // '400'
theme.typography.fontWeightMedium; // '500'
theme.typography.fontWeightBold; // '700'
```

## Using isDark for conditional logic

```javascript
const { isDark } = useTheme();

// For icon selection
iconName={isDark ? 'moon' : 'sun'}

// For conditional rendering
{isDark && <DarkModeOnlyComponent />}
```

## Controlling Theme Mode

### In any component:

```javascript
const { themeMode, setThemeMode, toggleTheme } = useTheme();

// Set specific mode
setThemeMode('light'); // Force light theme
setThemeMode('dark'); // Force dark theme
setThemeMode('auto'); // Follow system theme

// Toggle through modes (auto -> light -> dark -> auto)
toggleTheme();
```

## Example: Converting Existing Component

### Before (using useColorScheme):

```javascript
import { useColorScheme } from 'react-native';

function MyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.text, isDark && styles.textDark]}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#000' },
  text: { color: '#000' },
  textDark: { color: '#fff' },
});
```

### After (using ThemeContext):

```javascript
import { useTheme } from '@/contexts/ThemeContext';

function MyScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
  // No more *Dark variants needed!
});
```

## Best Practices

1. **Use inline theme colors** instead of creating dark variants in StyleSheet
2. **Keep structural styles** in StyleSheet (layout, dimensions, fonts)
3. **Apply theme colors** inline using the theme object
4. **Use theme constants** for spacing and typography for consistency
5. **Access theme once** at the top of your component for better performance

## Integration with React Navigation

The theme automatically works with React Navigation since it extends `DefaultTheme` and `DarkTheme` from `@react-navigation/native`. Navigation headers, tab bars, and other navigation UI elements will automatically adapt.

## Files Modified

- ✅ `/contexts/ThemeContext.js` - Main theme context
- ✅ `/app/_layout.js` - ThemeProvider wrapper
- ✅ `/app/(tabs)/search/index.js` - Example usage
- ✅ `/screens/SettingsScreen.jsx` - Theme toggle UI

## Next Steps

You can now update other screens to use the theme:

- HomeScreen
- LibraryScreen
- SurahScreen
- Any other components

Just import `useTheme` and replace hardcoded colors with `theme.colors.*`!
