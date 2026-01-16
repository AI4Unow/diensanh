# Banner Color Analysis Report

**Date:** 2026-01-16
**Banner URL:** https://diensanh.quangtri.gov.vn/documents/790019/0/bannner-xa-dien-sanh.jpg

## Color Palette

### Primary Colors (Top Section)
- **Red:** #C62828 - #D32F2F (primary red accent, Communist Party emblem)
- **Gold:** #FFC107 - #FFB300 (star in emblem)

### Background Colors
- **Sky Blue:** #4FC3F7 - #29B6F6 (top half gradient)
- **White:** #FFFFFF (middle section behind text)
- **Deep Blue:** #1565C0 - #0D47A1 (bottom half gradient)

### Text Colors
- **Navy Blue:** #1A237E - #0D47A1 ("TRANG THÔNG TIN ĐIỆN TỬ")
- **Red:** #D32F2F ("XÃ DIÊN SANH" - larger text)

## Color Zones

### Top Section (Communist Emblem)
- Red background circle
- Gold star
- Sky blue background

### Middle Section
- White/light background
- Navy blue text (smaller header)
- Red text (main title)

### Bottom Section
- Deep blue gradient to darker blue
- Decorative pattern overlay

## Typography

### "TRANG THÔNG TIN ĐIỆN TỬ"
- Sans-serif font
- Bold weight
- Navy blue color (#1A237E)
- Smaller size (approx 18-24px)

### "XÃ DIÊN SANH"
- Sans-serif font
- Extra bold weight
- Red color (#D32F2F)
- Larger size (approx 36-48px)
- All caps

## Tailwind CSS Tokens

```css
/* Primary Colors */
--banner-red: #D32F2F;
--banner-gold: #FFC107;
--banner-sky-blue: #29B6F6;
--banner-deep-blue: #1565C0;
--banner-navy: #1A237E;

/* Tailwind Classes */
bg-red-700         /* #D32F2F */
bg-amber-400       /* #FFC107 */
bg-sky-400         /* #29B6F6 */
bg-blue-700        /* #1565C0 */
bg-indigo-900      /* #1A237E */
```

## Current Mismatch

**Current body colors:**
- `bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800`
- Navy blue gradient (#1E3A8A → #1E40AF → #1E4097)

**Banner colors:**
- Sky blue → White → Deep blue gradient
- Red accent (main text)
- Navy blue (secondary text)

## Recommendations

1. **Replace navy gradient** with sky-to-deep-blue gradient
2. **Add red accents** for CTAs, headings
3. **Use white sections** between colored zones
4. **Navy blue** for secondary text/buttons

## Unresolved Questions

- Exact font family names (requires font inspection tools)
- Responsive behavior of gradient zones
- Accessibility contrast ratios for red-on-blue combinations
