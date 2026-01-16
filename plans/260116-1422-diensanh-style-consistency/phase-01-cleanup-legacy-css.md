# Phase 1: Cleanup Legacy CSS

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Research:** [Target Styles](./research/researcher-01-website-styles.md) | [Current Styles](./research/researcher-02-current-styles.md)

## Overview
- **Date:** 2026-01-16
- **Priority:** P2
- **Status:** pending
- **Effort:** 30m

Remove legacy Vite template CSS files that conflict with Tailwind v4 design system. Files are not imported by components but pollute workspace and cause confusion.

## Key Insights
- `index.css` (69 lines): Dark theme defaults, blue accents (#646cff), generic button styles
- `App.css` (42 lines): Logo animations, max-width containers, generic card styles
- Neither file imported in current components (confirmed via grep)
- Both conflict with design tokens in globals.css

## Requirements

### Functional
- Remove unused CSS files
- Verify no import statements reference these files
- Ensure build still works after removal

### Non-Functional
- Zero visual regression
- Reduced codebase noise

## Architecture
No architectural changes. Simple file deletion.

## Related Code Files

### To Delete
- `web/src/index.css`
- `web/src/App.css`

### To Verify (no changes)
- `web/src/main.tsx` - ensure no import of index.css
- `web/src/App.tsx` - ensure no import of App.css
- `web/index.html` - ensure no CSS link references

## Implementation Steps

1. **Verify No Imports**
   ```bash
   grep -r "index.css\|App.css" web/src/ --include="*.tsx" --include="*.ts"
   ```

2. **Check index.html**
   - Verify no `<link>` tags referencing these files

3. **Delete Legacy Files**
   ```bash
   rm web/src/index.css
   rm web/src/App.css
   ```

4. **Run Build**
   ```bash
   cd web && npm run build
   ```

5. **Visual Verification**
   - Start dev server: `npm run dev`
   - Check home page renders correctly
   - Check login page renders correctly
   - Check dashboard renders correctly

## Todo List
- [ ] Grep for import statements
- [ ] Check index.html for CSS links
- [ ] Delete index.css
- [ ] Delete App.css
- [ ] Run build and verify success
- [ ] Visual check 3 pages

## Success Criteria
- Both legacy CSS files removed
- Build passes without errors
- No visual changes to any page
- Dev server starts and renders correctly

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hidden import somewhere | Low | Medium | Grep entire codebase first |
| Build failure | Low | Low | Git restore if issues |

## Security Considerations
None - file deletion only.

## Next Steps
Proceed to [Phase 2: Update Color Tokens](./phase-02-update-color-tokens.md)
