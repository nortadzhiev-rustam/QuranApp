# Tajweed Not Enabling - Troubleshooting

## Issue
User reports that Tajweed is not being enabled even when toggled in Settings.

## Fixes Applied (February 13, 2026)

### 1. Added Children Support to TajweedText Component
**Problem:** TajweedText wasn't rendering the verse numbers (children)
**Fix:** Added `children` prop and render it after the colored segments

```jsx
// Before
<Text style={style} {...props}>
  {segments.map(...)}
</Text>

// After
<Text style={style} {...props}>
  {segments.map(...)}
  {children}
</Text>
```

### 2. Added Debug Logging
**Purpose:** Track when settings change and when components re-render

**In TajweedContext.js:**
- Logs when settings are loaded from AsyncStorage
- Logs when toggles are activated
- Logs when context re-renders

**In TajweedText.jsx:**
- Logs current enabled states
- Logs segment count

### 3. Fixed Context Value with useMemo
**Problem:** Context value object might not trigger re-renders properly
**Fix:** Wrapped value in useMemo with dependencies

```javascript
const value = useMemo(() => ({
  tajweedEnabled,
  tawafuqEnabled,
  toggleTajweed,
  toggleTawafuq,
  loading,
}), [tajweedEnabled, tawafuqEnabled, loading]);
```

### 4. Removed Memoization from VerseItem
**Problem:** memo() prevents VerseItem from re-rendering when context changes
**Fix:** Removed memo() wrapper from VerseItem component

```javascript
// Before
const VerseItem = memo(({ ... }) => { ... });

// After
const VerseItem = ({ ... }) => { ... };
```

**Note:** This may slightly impact performance but ensures proper updates.

## How to Test

### Step 1: Check Console Logs
1. Run the app: `npm start`
2. Open the app on device/simulator
3. Check Metro console for logs:
   - `📖 Loading Tajweed settings from AsyncStorage...`
   - `✅ Settings loaded - Tajweed: false Tawafuq: false`

### Step 2: Toggle Settings
1. Go to Settings tab
2. Toggle "Enable Tajweed" switch
3. Look for console logs:
   - `🎨 Toggling Tajweed from false to true`
   - `✅ Tajweed saved to AsyncStorage: true`
   - `🔄 TajweedContext re-rendering with values: { tajweedEnabled: true }`

### Step 3: Check Surah Display
1. Navigate to any Surah (try Surah 1 or 112)
2. Look for console logs:
   - `TajweedText - Tajweed enabled: true`
   - `TajweedText - Segments count: X` (should be > 0)
3. Verify colored text appears in the Surah

### Step 4: Test Persistence
1. Close the app completely
2. Reopen the app
3. Check Settings - toggle should still be ON
4. Open a Surah - colors should still be applied

## Expected Console Output

### On App Start:
```
📖 Loading Tajweed settings from AsyncStorage...
   Tajweed value: null (or "true" if previously enabled)
   Tawafuq value: null (or "true" if previously enabled)
✅ Settings loaded - Tajweed: false Tawafuq: false
🔄 TajweedContext re-rendering with values: { tajweedEnabled: false, tawafuqEnabled: false }
```

### When Toggling Tajweed ON:
```
🎨 Toggling Tajweed from false to true
✅ Tajweed saved to AsyncStorage: true
🔄 TajweedContext re-rendering with values: { tajweedEnabled: true, tawafuqEnabled: false }
```

### When Opening a Surah (with Tajweed ON):
```
TajweedText - Tajweed enabled: true Tawafuq enabled: false
TajweedText - Segments count: 15
TajweedText - Tajweed enabled: true Tawafuq enabled: false
TajweedText - Segments count: 12
... (one for each verse)
```

## Common Issues & Solutions

### Issue 1: No Console Logs Appearing
**Cause:** Metro bundler might not be showing logs
**Solution:** 
- Press `r` in Metro terminal to reload
- Or shake device and select "Reload"
- Check React Native Debugger if connected

### Issue 2: Settings Toggle Not Saving
**Cause:** AsyncStorage permission issue
**Solution:**
- Clear app data
- Reinstall the app
- Check for AsyncStorage errors in console

### Issue 3: Text Not Coloring Despite Toggle ON
**Cause A:** TajweedText might not be getting correct data
**Check:** Look for `Segments count: 0` in logs
**Solution:** Check if `applyTajweedRules` is working correctly

**Cause B:** Colors might be too subtle to notice
**Solution:** Try Surah 112 (Al-Ikhlas) - has obvious Qalqala (red)

**Cause C:** Component not re-rendering
**Check:** Is TajweedText being re-rendered? (look for repeated logs)
**Solution:** Already fixed by removing memo()

### Issue 4: App Crashes on Toggle
**Cause:** Context provider not properly wrapped
**Check:** Verify TajweedProvider in app/_layout.js
**Solution:** Should be:
```jsx
<TajweedProvider>
  <Stack>...</Stack>
</TajweedProvider>
```

### Issue 5: Segments Count is 0
**Cause:** applyTajweedRules returning empty array
**Debug:**
- Add console.log in tajweed.js applyTajweedRules function
- Check if text parameter is valid Arabic text
- Verify TAJWEED_COLORS are defined

## Quick Debug Checklist

- [ ] Metro bundler is running
- [ ] No red error screens in app
- [ ] TajweedProvider is in _layout.js
- [ ] Console shows "Loading Tajweed settings" on start
- [ ] Toggle switch visually changes when clicked
- [ ] Console shows "Toggling Tajweed" when switch clicked
- [ ] Console shows "TajweedText - Tajweed enabled: true" in Surah
- [ ] Console shows "Segments count: X" where X > 0
- [ ] Verse numbers still appear (children rendered)

## Manual Verification

### Visual Check:
1. Enable Tajweed
2. Open Surah 112 (Al-Ikhlas)
3. Look for:
   - Verse 1: "اللَّهُ" should be GOLD (if Tawafuq also enabled)
   - Verse 1: "أَحَدٌ" - the "د" with Sukoon should be RED (Qalqala)
   
4. Open Surah 1 (Al-Fatiha)
5. Look for:
   - Bismillah: "اللَّهِ" should be GOLD
   - Blue colored letters (Madd)

### If Still Not Working:

1. **Clear AsyncStorage:**
   ```javascript
   // Add temporarily to Settings screen
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   // Add button
   <Button onPress={async () => {
     await AsyncStorage.clear();
     console.log('AsyncStorage cleared');
   }} />
   ```

2. **Force Tajweed ON (bypass toggle):**
   ```javascript
   // In TajweedContext.js, temporarily hardcode:
   const [tajweedEnabled, setTajweedEnabled] = useState(true); // Force to true
   ```

3. **Test with simple text:**
   ```jsx
   // Add to any screen
   <TajweedText 
     text="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
     baseColor="#000"
   />
   ```

## Files Modified

1. `/Users/developerone/QuranApp/components/TajweedText.jsx`
   - Added children prop support
   - Added debug console.logs

2. `/Users/developerone/QuranApp/contexts/TajweedContext.js`
   - Added useMemo for value
   - Added debug console.logs
   - Added logging to toggles and loadSettings

3. `/Users/developerone/QuranApp/app/(tabs)/index/surah/[id].js`
   - Removed memo() from VerseItem

4. `/Users/developerone/QuranApp/components/TajweedDebug.jsx` (NEW)
   - Debug component to verify context state

## Next Steps If Issue Persists

1. Add TajweedDebug component to Settings screen
2. Verify context value is actually changing
3. Check if there are multiple TajweedProviders accidentally
4. Verify expo-router version compatibility
5. Test on different device/platform (iOS vs Android)
6. Check React Native version (19.2.0) for known context issues

## Performance Note

Removing memo() from VerseItem may cause more re-renders. If performance becomes an issue, we can:

1. Re-add memo with custom comparison function
2. Add tajweedEnabled/tawafuqEnabled to dependency array
3. Use React.memo with second parameter:

```javascript
const VerseItem = memo(({ ... }) => { ... }, (prevProps, nextProps) => {
  // Custom comparison that includes context values
  return prevProps.item === nextProps.item 
    && prevProps.tajweedEnabled === nextProps.tajweedEnabled
    && prevProps.tawafuqEnabled === nextProps.tawafuqEnabled;
});
```

But first, let's make sure it works without memo.

## Success Indicators

✅ Console shows toggle changes
✅ Console shows segments being created
✅ Text has colored portions
✅ Settings persist after restart
✅ No crashes or errors

