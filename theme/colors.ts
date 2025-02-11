import { Platform } from 'react-native';

const IOS_SYSTEM_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(242, 242, 247)',
    grey5: 'rgb(230, 230, 235)',
    grey4: 'rgb(210, 210, 215)',
    grey3: 'rgb(199, 199, 204)',
    grey2: 'rgb(175, 176, 180)',
    grey: 'rgb(142, 142, 147)',
    background: 'rgb(255, 247, 230)',
    foreground: 'rgb(2, 8, 23)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(248, 236, 205)',
    destructive: 'rgb(239, 68, 68)',
    primary: 'rgb(100, 83, 49)',
  },
  dark: {
    grey6: 'rgb(242, 242, 247)',
    grey5: 'rgb(230, 230, 235)',
    grey4: 'rgb(210, 210, 215)',
    grey3: 'rgb(199, 199, 204)',
    grey2: 'rgb(175, 176, 180)',
    grey: 'rgb(142, 142, 147)',
    background: 'rgb(255, 247, 230)',
    foreground: 'rgb(2, 8, 23)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(248, 236, 205)',
    destructive: 'rgb(239, 68, 68)',
    primary: 'rgb(100, 83, 49)',
  },
} as const;

const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(249, 249, 255)',
    grey5: 'rgb(215, 217, 228)',
    grey4: 'rgb(193, 198, 215)',
    grey3: 'rgb(113, 119, 134)',
    grey2: 'rgb(65, 71, 84)',
    grey: 'rgb(24, 28, 35)',
    background: 'rgb(255, 247, 230)',
    foreground: 'rgb(2, 8, 23)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(248, 236, 205)',
    destructive: 'rgb(239, 68, 68)',
    primary: 'rgb(100, 83, 49)',
  },
  dark: {
    grey6: 'rgb(249, 249, 255)',
    grey5: 'rgb(215, 217, 228)',
    grey4: 'rgb(193, 198, 215)',
    grey3: 'rgb(113, 119, 134)',
    grey2: 'rgb(65, 71, 84)',
    grey: 'rgb(24, 28, 35)',
    background: 'rgb(255, 247, 230)',
    foreground: 'rgb(2, 8, 23)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(248, 236, 205)',
    destructive: 'rgb(239, 68, 68)',
    primary: 'rgb(100, 83, 49)',
  },
} as const;

const COLORS = Platform.OS === 'ios' ? IOS_SYSTEM_COLORS : ANDROID_COLORS;

export { COLORS };
