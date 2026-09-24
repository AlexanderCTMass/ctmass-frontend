# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Safe area is mandatory

Every screen MUST respect the device safe area. Never let content sit under the status bar, notch, or system navigation bar.

- Use `SafeAreaView` from `react-native-safe-area-context` (with the right `edges`) for normal screens, and pinned footers/buttons go inside it so they clear the bottom nav bar.
- Inside a fullscreen `Modal`, `SafeAreaView` does not apply — use `useSafeAreaInsets()` and offset overlays manually (`insets.top` for top controls, `insets.bottom` for bottom controls). `SafeAreaProvider` is mounted at the app root, so insets resolve inside modals.
- This applies to overlays too (close buttons, action rails, captions, progress bars) — nothing interactive or important may overlap system UI.
