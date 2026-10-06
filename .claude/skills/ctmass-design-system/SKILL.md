---
name: ctmass-design-system
description: CTMASS web design system — brand tokens, section rhythm, typography and component rules for the React + MUI site (ctmass.com). Use whenever building, restyling or reviewing any user-facing web UI in this repo (home page, landing/marketing sections, specialist cards, listings, blog blocks, banners, CTAs), or when asked to make a page "prettier", "wow", "on-brand" or consistent with the rest of the site. Not for the React Native app in mobile/.
---

# CTMASS design system (web)

CTMASS is a free marketplace that connects homeowners in Connecticut and Massachusetts with local construction and home-improvement pros. The audience is homeowners first, contractors second. Every page has one primary job: get the visitor to describe a project or find a pro.

The visual identity is **"local blueprint"**: navy ink on clean white, one green for action, a faint drafting grid and the CT/MA map as the recurring motif. It must feel trustworthy and practical, not like a generic SaaS template.

## 1. Source of truth

All tokens live in code. Import them, never re-type hex values:

```js
import { BRAND, FONT, RADIUS, SHADOW, SECTION_PY, SECTION_BG, displayTitleSx, sectionTitleSx, reducedMotion } from 'src/theme/ctmass-tokens';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
```

If a value you need is missing, add it to `src/theme/ctmass-tokens.js` and update this file. Do not add one-off values inside a component.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `BRAND.navy` | `#1F2D77` | Headings, dark CTAs (search, "Describe a project"), step tiles |
| `BRAND.navyHover` | `#16337F` | Hover for navy buttons |
| `BRAND.navyDeep` | `#121B4D` | Dark surfaces, gradient ends |
| `BRAND.green` | `#16B364` | The single action/brand accent: primary buttons, highlights, success |
| `BRAND.greenDeep` | `#00AE7C` | Start of the green gradient (100% free card) |
| `BRAND.lavender` | `#7C83E5` | Process only (How it works). Never as a second CTA color |
| `BRAND.mist` | `#F5F8FB` | Alternating section background |
| `BRAND.ink` / `BRAND.muted` | `#111927` / `#6C737F` | Body text / secondary text |
| `BRAND.cardDark` | `#1E252E` | Dark band of the specialist card |

Theme palette is the MUI preset `green` (`src/theme`), so `color="success"` / `primary` already map to brand green.

**Type**
- Display and headings: `FONT.display` = Plus Jakarta Sans, weights 700/800, tracking `-0.02em` to `-0.03em`, line-height 1.02–1.1, `textWrap: balance`. Spread `displayTitleSx` or `sectionTitleSx`.
- Body and UI: `FONT.body` = Inter (theme default), 400/500/600.
- Loaded weights (`public/index.html`): Jakarta 500–800 plus italic 700–800, Inter 100–900. Do not use a weight or family that is not loaded (this caused faux-bold before). If you need a new one, add it to the Google Fonts link.
- Scale: hero 28 / 40 / 52 (xs / sm / md), hero accent line 38 / 52 / 68, section title 28 / 36 / 48, sub-heading 22 / 30, body 15–17, captions 11–13.

**Radius** (hierarchy, not one value everywhere): `RADIUS.tile` 14px (buttons, small tiles) · `RADIUS.inner` 16px (inner panels) · `RADIUS.card` 22px (cards) · `RADIUS.panel` 28px (big feature panels) · `RADIUS.pill` for status pills only.
Note: in MUI `sx`, a bare number for `borderRadius` is multiplied by `theme.shape.borderRadius` (8). `borderRadius: 3` = 24px. Use the tokens or explicit px strings.

**Shadows** are navy-tinted, never grey/black: `SHADOW.sm | md | lg`, and `SHADOW.green` under green surfaces.

## 3. Page rhythm (the most important rule)

Every block on a marketing page is wrapped in `HomeSection`, which owns vertical padding (`SECTION_PY` = 56px mobile / 96px desktop) and background. Sections never set their own outer `py`, and nothing should sit closer than one section padding to the previous block.

```jsx
<HomeSection bg="mist">
    <SectionHeading title="PRO specialists" subtitle="Verified experts in CT & MA" action={<Button>Find</Button>} />
    {content}
</HomeSection>
```

- Backgrounds alternate so adjacent blocks never visually merge. Current home order: hero shell (gradient + blueprint grid) → How it works `white` → 100% free (white, banner, tight top) → PRO specialists `tint` → Best/Recent `white` → Use CTMASS `mist` → Fresh listings `white` → Blog `mist` → footer.
- When adding a section, pick the background that keeps the alternation.
- Shared components that are also used elsewhere (`LatestListings`, `LatestPosts`) get rhythm via their `sx` prop from the page, not by changing their defaults.
- `SectionHeading`: left-aligned by default (title left, action right). Center only for the How it works timeline and the Use CTMASS header on desktop.

## 4. Components to reuse

| Need | Use |
|---|---|
| Specialist preview card | `src/components/profiles/previewCards/vertical-preview-card.js` (container-query responsive, compact below 230px width). Feed it `mapWorkerToPreviewData` / `mapSpecialistToPreviewData` from `src/utils/preview-card-utils.js` |
| Grid of specialist cards | `specialistGridSx`, `SpecialistCardLink`, `SpecialistGridSkeleton` from `src/sections/home/home-specialist-gallery.js` (2 cols mobile / 3 md / 4 lg) |
| Horizontal card rail on mobile | CSS grid with `gridAutoFlow: column`, scroll-snap, edge-to-edge bleed (`mx: -2, px: 2`). See `home-bests.js` and `latest-listings.js` |
| Hero backdrop | `HomeHeroShell` in `src/sections/home/home-hero.js` |
| Store links | `APP_STORE_URL`, `GOOGLE_PLAY_URL` in `src/constants/mobile-apps.js` |
| Mascot | `/assets/Worker.png` (plumber character from the brand) |

## 5. Rules

Do:
- Spend boldness in one place per page. On the home page it is the hero (blueprint grid, rolling trade word, one load sequence). Everything else stays calm.
- Motion: one orchestrated entrance (hero title → subtitle → search, staggered ~0.12s) and motion that answers user actions (hover, tap, tab switch). Every keyframe animation must have a `[reducedMotion]: { animation: 'none' }` override.
- Mobile first: check 375 and 390px widths. No horizontal page scroll. Keep tap targets at least 44px. Prefer a segmented switcher or horizontal rail over a long vertical stack of tall cards.
- Copy in English, sentence case, plain verbs ("Describe a project", "View all PRO specialists"). Use real data in examples; no invented stats.
- No explanatory code comments (project rule).

Don't:
- Add a second accent color, purple/blue "AI gradients", or grey `rgba(0,0,0,.1)` shadows.
- Use all-caps eyebrow labels, `A · B · C` middle-dot meta strings, or numbered `01/02/03` markers unless the content really is a sequence (How it works is).
- Use infinite decorative animations, or fade-up on every section.
- Use fonts that are not loaded (e.g. Montserrat) or weights that are not loaded.
- Put cards inside cards inside cards.
- Hard-code section padding or hex colors inside components.

## 6. Verify before saying done

1. `npx eslint <changed files>`: no errors.
2. Run the dev server (port 3000 may be taken by another project; use `PORT=3017 BROWSER=none npx react-scripts start`).
3. With Playwright, take full-page screenshots at 390×844 and 1440×900, slice tall pages and look at every section: spacing between blocks, alignment, clipped text, overlap with the hero cloud, horizontal overflow (`document.documentElement.scrollWidth` vs `innerWidth`).
4. Accept the cookie banner and dismiss the app prompt before judging layout. They are overlays, not layout bugs.
5. Delete screenshot scratch files from the repo (`.playwright-mcp/`) when finished.
