import '../global.css';
import 'tailwindcss/base';
import 'tailwindcss/components';
import 'tailwindcss/utilities';
import 'expo-dev-client';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Link, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeToggle } from '~/components/nativewindui/ThemeToggle';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    'Onest-Black': require('../assets/fonts/Onest-Black.ttf'),
    'Onest-Bold': require('../assets/fonts/Onest-Bold.ttf'),
    'Onest-ExtraBold': require('../assets/fonts/Onest-ExtraBold.ttf'),
    'Onest-ExtraLight': require('../assets/fonts/Onest-ExtraLight.ttf'),
    'Onest-Medium': require('../assets/fonts/Onest-Medium.ttf'),
    'Onest-Regular': require('../assets/fonts/Onest-Regular.ttf'),
    'Onest-SemiBold': require('../assets/fonts/Onest-SemiBold.ttf'),
    'Onest-Thin': require('../assets/fonts/Onest-Thin.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    return () => {
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <NavThemeProvider value={NAV_THEME[colorScheme]}>
            <ActionSheetProvider>
              <Stack
                screenOptions={{
                  headerRight: () => <ThemeToggle />,
                }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="terms-and-conditions"
                  options={{ presentation: 'modal', headerShown: true }}
                />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(forum)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="details"
                  options={{
                    presentation: 'modal',
                    headerLeft: () => (
                      <Link href="/forum" className="my-auto px-4">
                        <FontAwesome name="arrow-left" size={12} />
                      </Link>
                    ),
                    // headerRight: () => <ThemeToggle />,
                  }}
                />
              </Stack>
            </ActionSheetProvider>
          </NavThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
