# CTMASS Mobile

React Native + Expo (SDK 57) app for [ctmass.com](https://ctmass.com). Lives
inside the web repository but is a fully independent npm project: its own
`package.json`, lockfile and `node_modules`. The Firebase Hosting deploy builds
only the web app from the repository root and never touches this folder.

## Requirements

- Node `>= 24.3.0` (React Native 0.86 and Metro 0.84 refuse older 24.x builds)
- A development build on the device — MMKV and other native modules do not run
  in Expo Go

## Getting started

```bash
npm install
npm start
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run android` | Dev server targeting a connected Android device |
| `npm run lint` / `lint:fix` | ESLint (flat config, type-aware rules) |
| `npm run format` / `format:check` | Biome formatter |
| `npm run check-types` | `tsc --noEmit` |
| `npm run doctor` | `expo-doctor` dependency and config audit |

## Structure

```
src/
  app/                  expo-router routes
    index.tsx           entry redirect (onboarding vs auth)
    (onboarding)/       welcome → how-it-works → rewards → role
    (auth)/             sign-in
  components/           shared UI, SVG icons, onboarding building blocks
  constants/theme.ts    design tokens (brand colors, spacing, radii, gradients)
  lib/                  MMKV storage, haptics helpers
  store/                zustand state persisted to MMKV
```

## Conventions

- UI copy is English only — the product serves the US market
- Styling is `StyleSheet` plus tokens from `src/constants/theme.ts`
- Animations use `react-native-reanimated`
- ESLint handles rules, Biome handles formatting (80 columns, double quotes)
