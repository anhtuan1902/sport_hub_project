// SportHub Color Palette - Brand Colors

import { Platform } from 'react-native';

export const Colors = {
  // Brand Colors
  brand: {
    neon: '#A4FF5E',
    neonLight: '#C4FF8E',
    neonDark: '#7FD93E',
    navy: '#0F172A',
    navySurface: '#1E293B',
    navyBorder: '#334155',
  },

  light: {
    // Primary colors - Neon Green
    primary: '#A4FF5E',
    primaryLight: '#C4FF8E',
    primaryDark: '#7FD93E',

    // Secondary colors
    secondary: '#FAB005',
    secondaryLight: '#FFC107',
    secondaryDark: '#E5AC00',

    // Background colors
    background: '#FFFFFF',
    surface: '#F8FAFC',
    card: '#FFFFFF',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textTertiary: '#CBD5E1',
    textInverse: '#0F172A',

    // Status colors
    success: '#22C55E',
    warning: '#FAB005',
    error: '#EF4444',
    info: '#3B82F6',

    // UI colors
    border: '#E2E8F0',
    divider: '#F1F5F9',
    overlay: 'rgba(15, 23, 42, 0.5)',

    // Tab bar
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#A4FF5E',

    // Match status colors
    matchOpen: '#22C55E',
    matchFull: '#FAB005',
    matchInProgress: '#3B82F6',
    matchCompleted: '#94A3B8',
    matchCancelled: '#EF4444',

    // Rating
    rating: '#FAB005',
    ratingEmpty: '#E2E8F0',
  },

  dark: {
    // Primary colors - Neon Green
    primary: '#A4FF5E',
    primaryLight: '#C4FF8E',
    primaryDark: '#7FD93E',

    // Secondary colors
    secondary: '#FAB005',
    secondaryLight: '#FFC107',
    secondaryDark: '#E5AC00',

    // Background colors - Navy
    background: '#0F172A',
    surface: '#1E293B',
    card: '#1E293B',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textInverse: '#0F172A',

    // Status colors
    success: '#22C55E',
    warning: '#FAB005',
    error: '#EF4444',
    info: '#3B82F6',

    // UI colors
    border: '#334155',
    divider: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Glassmorphism effect
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',

    // Tab bar
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#A4FF5E',

    // Match status colors
    matchOpen: '#22C55E',
    matchFull: '#FAB005',
    matchInProgress: '#3B82F6',
    matchCompleted: '#94A3B8',
    matchCancelled: '#EF4444',

    // Rating
    rating: '#FAB005',
    ratingEmpty: '#334155',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorKey = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
