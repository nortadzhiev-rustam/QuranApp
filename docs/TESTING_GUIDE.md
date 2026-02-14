# Testing Guide for Tajweed & Tawafuq Implementation

## Manual Testing Steps

### 1. Start the App
```bash
npm start
```

### 2. Test Tajweed Settings

1. Navigate to **Settings** tab
2. Scroll to "Tajweed Settings" section
3. You should see two toggle switches:
   - ✅ Enable Tajweed
   - ✅ Highlight Allah's Name
4. Toggle both switches and verify they work

### 3. Test Tajweed Colors

1. Enable **"Enable Tajweed"** in Settings
2. Navigate to any Surah (try Surah Al-Fatiha - Surah 1)
3. Look for colored text according to Tajweed rules:

#### What to Look For:

**🔴 Red (Qalqala)** - Letters ق، ط، ب، ج، د with Sukoon
- Example: Try Surah 112 (Al-Ikhlas): "أَحَدٌ" - the د with Sukoon should be red

**🟠 Orange (Iqlab)** - Noon/Tanween before ب
- Example: "مَن بَعْدِ" - noon before ba

**🟣 Purple (Ikhfa)** - Noon/Tanween before certain letters
- Common in many verses

**🟢 Green (Idghaam)** - Noon/Tanween merging with following letter
- Dark green (with ghunna): before ي، ن، م، و
- Light green (without ghunna): before ل، ر

**🔵 Blue (Madd)** - Elongated letters
- Regular blue: Alif after Fatha, etc.
- Light blue: Madd Munfasil
- Dark blue: Madd Lazim

**🟣 Pink (Laam Shamsiyya)** - Silent Laam in "Al" before sun letters

### 4. Test Allah Name Highlighting

1. Enable **"Highlight Allah's Name"** in Settings
2. Navigate to any Surah
3. Look for **gold-colored** occurrences of "الله"

#### Best Surahs to Test Allah Highlighting:
- **Surah Al-Fatiha (1)** - Contains "اللَّهِ" in verse 1
- **Surah Al-Baqarah (2)** - Multiple occurrences
- **Surah Al-Ikhlas (112)** - Contains "اللَّهُ"

### 5. Test Combined Mode

1. Enable both toggles:
   - ✅ Enable Tajweed
   - ✅ Highlight Allah's Name
2. Navigate to a Surah
3. Verify that:
   - Allah's name appears in GOLD (overrides Tajweed colors)
   - Other text has Tajweed colors
   - Both work together without conflicts

### 6. Test Settings Persistence

1. Enable both toggles
2. Close the app completely
3. Reopen the app
4. Check Settings - toggles should still be enabled
5. Check any Surah - colors should still be applied

### 7. Test Bismillah

1. Open any Surah (except Surah 9)
2. The Bismillah at the top should:
   - Apply Tajweed colors if enabled
   - Highlight "اللَّهِ" in gold if Tawafuq enabled

### 8. Test Different Themes

1. Go to Settings
2. Switch between Light/Dark themes
3. Navigate to a Surah
4. Verify Tajweed colors are visible in both themes

### 9. Test Edge Cases

- Open Surah 9 (At-Tawbah) - no Bismillah
- Scroll through long Surahs (Surah 2, 3, 4)
- Test with translation enabled/disabled
- Test bookmarked verses

## Expected Results

### ✅ Success Criteria:

- [ ] Settings toggles work smoothly
- [ ] Tajweed colors appear correctly
- [ ] Allah's name is highlighted in gold
- [ ] Settings persist after app restart
- [ ] No performance issues or lag
- [ ] Text remains readable
- [ ] Works in both light and dark mode
- [ ] No crashes or errors

### Example Test Verses:

**Surah Al-Fatiha (1:1):**
```
بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
```
- "اللَّهِ" should be GOLD (if Tawafuq enabled)
- Other Tajweed rules should apply

**Surah Al-Ikhlas (112:1):**
```
قُلْ هُوَ اللَّهُ أَحَدٌ
```
- "اللَّهُ" should be GOLD
- "أَحَدٌ" - the د with Sukoon should be RED (Qalqala)

## Troubleshooting

### Colors Not Appearing:
1. Check Settings - ensure toggles are enabled
2. Restart the app
3. Clear app cache (if needed)

### Colors Look Wrong:
1. Verify you're looking at Arabic text (not translation)
2. Check lighting/screen brightness
3. Compare with standard Tajweed color schemes

### Settings Not Saving:
1. Check AsyncStorage permissions
2. Reinstall the app if needed
3. Check for console errors

## Performance Testing

1. Open a long Surah (Surah 2 - 286 verses)
2. Scroll quickly through verses
3. Verify:
   - No lag or stuttering
   - Smooth scrolling
   - Text renders quickly
   - Memory usage is reasonable

## Visual Verification

Take screenshots of:
- Settings page with toggles
- Surah with Tajweed colors
- Surah with Allah name highlighted
- Both features combined

Compare with standard Tajweed Mushafs to verify color accuracy.

## Automated Testing (Future)

For automated testing, consider:
- Jest unit tests for rule detection
- Snapshot tests for rendered output
- Integration tests for Settings flow
- E2E tests with Detox

## Notes

- Tajweed implementation is educational and follows standard rules
- Some edge cases may need refinement
- Colors match common Tajweed Mushaf standards
- User feedback will help improve accuracy

## Report Issues

If you find issues, document:
1. Steps to reproduce
2. Expected vs actual behavior
3. Screenshots if applicable
4. Device/platform information
5. App version

