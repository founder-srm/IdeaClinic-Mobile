import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { COLORS } from './colors';

const NAV_THEME = {
  light: {
    ...DefaultTheme,
    colors: {
      // background: COLORS.light.background,
      // border: COLORS.light.grey5,
      // card: COLORS.light.card,
      // notification: COLORS.light.destructive,
      // primary: COLORS.light.primary,
      // text: COLORS.black,
      neutral: COLORS.light.neutral,
      background: COLORS.dark.background,
      border: COLORS.dark.grey5,
      card: COLORS.dark.grey6,
      notification: COLORS.dark.destructive,
      primary: COLORS.dark.primary,
      text: COLORS.white,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      neutral: COLORS.light.neutral,
      background: COLORS.dark.background,
      border: COLORS.dark.grey5,
      card: COLORS.dark.grey6,
      notification: COLORS.dark.destructive,
      primary: COLORS.dark.primary,
      text: COLORS.white,
    },
  },
};

export { NAV_THEME };
