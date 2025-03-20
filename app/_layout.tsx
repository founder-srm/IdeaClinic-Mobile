import '../global.css';
import 'tailwindcss/base';
import 'tailwindcss/components';
import 'tailwindcss/utilities';
import 'expo-dev-client';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Link, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeToggle } from '~/components/nativewindui/ThemeToggle';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { AuthProvider } from '~/providers/AuthProvider';
import { NAV_THEME } from '~/theme';
import { supabase } from '~/utils/supabase';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useInitialAndroidBarSync();
  const [appIsReady, setAppIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    async function prepare() {
      try {
        supabase.auth.getSession().then(({ data: { session } }) => {
          const inAuthGroup = segments[0] === '(auth)';
          const inProtectedGroup = segments[0] === '(forum)' || segments[0] === '(settings)';
          if (!session && inProtectedGroup) {
            // If not authenticated and trying to access protected routes
            router.replace('/(auth)/signup');
          } else if (session && inAuthGroup) {
            // If authenticated and trying to access auth routes
            router.replace('/(forum)/forum');
          }
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (loaded || error || appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    NavigationBar.setBehaviorAsync('overlay-swipe');
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setVisibilityAsync('hidden');
    return () => {
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
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
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: 'minimal',
                    headerTitle: 'Settings',
                    headerTransparent: true,
                    headerBlurEffect: 'dark',
                    headerTintColor: 'black',
                    headerBackVisible: true,
                    presentation: 'fullScreenModal',
                    animation: 'slide_from_bottom',
                  }}
                />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(settings)" options={{ headerShown: false }} />
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
      <PortalHost />
    </AuthProvider>
  );
}
