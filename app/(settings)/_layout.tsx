import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function PostsProtectedLayout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    return () => {
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);
  return (
    <Stack>
      <Stack.Screen
        name="settings"
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
    </Stack>
  );
}
