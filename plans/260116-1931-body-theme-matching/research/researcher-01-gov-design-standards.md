# Research: Vietnamese Government Website Design Standards

**Date:** 2026-01-16
**Researcher:** researcher-01
**Focus:** Gov website color schemes, header-body transitions, typography, accessibility

---

## 1. Color Schemes

### Symbolic Colors (National Identity)
- **Red (#DA251D)**: Primary brand color, navigation accents, CTAs
- **Yellow/Gold**: Secondary accent (flag colors)
- Traditional use not legally mandated but widely adopted

### Portal Color Patterns
**chinhphu.vn (Reference Implementation):**
- Header: White (#FFFFFF) background
- Body: Light gray (#F5F5F5, #FAFAFA)
- Content cards: White (#FFFFFF)
- Borders: Neutral gray (#E0E0E0)
- Links: Blue (#0066CC range)

**Consistency Mandate:**
- Circular 22/2023/TT-BTTTT requires strict color/layout consistency
- Header and Footer must match across all portal pages
- Main portal → component pages consistency enforced

---

## 2. Header-to-Body Transitions

### Observed Patterns
**Smooth Transition Techniques:**
- White header → Light gray body via thin border/shadow
- Consistent left-right padding alignment
- White content cards echo header aesthetic
- No harsh color breaks

**Best Practice:**
- Avoid jarring color jumps
- Use subtle borders or shadows for separation
- Maintain visual continuity through shared whites/grays

---

## 3. Typography Conventions

### Font Standards
- **Family:** Sans-serif (Arial, system fonts)
- **Headings:** 18-24px, bold
- **Body:** 14-16px, regular weight
- **Metadata:** 12px, light gray

### Hierarchy
- Bold for headings/labels
- Regular for body text
- Gray tones for secondary info
- High contrast dark text on white backgrounds

---

## 4. WCAG Accessibility Requirements

### Mandated Standards
**Circular 22/2023/TT-BTTTT + e-Gov Architecture Framework 3.0:**
- **WCAG 2.1/2.2** compliance required
- Color contrast ratios:
  - **4.5:1** for normal text
  - **3:1** for large text + UI components

### Recommended Features
- Dark mode support (highly recommended)
- High-contrast options for visual impairments
- Responsive/Mobile First design mandatory

---

## 5. Technical Requirements

### Performance
- Modern image formats (WebP)
- CDN usage for fast loading
- SEO optimization (structured data, readability)

### Compliance
- Decree 147/2024/NĐ-CP (internet info management)
- Security standards per e-Gov Framework 3.0

---

## Implementation Recommendations

### For Header-Body Theme Matching
1. **Use light gray body** (#F5F5F5) vs white header (#FFFFFF)
2. **Add subtle shadow/border** under header (1px solid #E0E0E0)
3. **Maintain red accent** for nav/CTAs (#DA251D)
4. **White content cards** on gray background
5. **Ensure 4.5:1 contrast** for all text

### Color Palette Suggestion
```
Header:     #FFFFFF (white)
Body:       #F5F5F5 (light gray)
Cards:      #FFFFFF (white)
Borders:    #E0E0E0 (neutral gray)
Primary:    #DA251D (red)
Links:      #0066CC (blue)
Text:       #333333 (dark gray/black)
```

---

## Sources
- Circular 22/2023/TT-BTTTT (Ministry of Info & Comms)
- e-Government Architecture Framework 3.0 (Decision 2568/QĐ-BTTTT)
- Decree 147/2024/NĐ-CP
- WCAG 2.2 Guidelines
- Live analysis: chinhphu.vn

---

## Unresolved Questions
None - research complete.
