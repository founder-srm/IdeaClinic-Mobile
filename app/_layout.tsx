import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import '../global.css';
import 'expo-dev-client';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { ThemeToggle } from '~/components/nativewindui/ThemeToggle';
import { NAV_THEME } from '~/theme';

export default function Layout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />

      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <ActionSheetProvider>
          <Stack
            screenOptions={{
              headerRight: () => <ThemeToggle />,
            }}
          />
        </ActionSheetProvider>
      </NavThemeProvider>
    </>
  );
}
