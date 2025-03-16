import { Icon } from '@roninoss/icons';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { Button } from '~/components/nativewindui/Button';
import { UseSignOut } from '~/hooks/useSignOut';

export default function PostsProtectedLayout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    return () => {
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);
  const signOut = UseSignOut();
  return (
    <Stack>
      <Stack.Screen
        name="forum"
        options={{
          headerShown: false,
          headerRight: () => (
            <Button onPress={() => signOut} size="icon">
              <Icon name="stop" />
            </Button>
          ),
        }}
      />
      <Stack.Screen
        name="post/[slug]"
        options={{
          headerShown: true,
          presentation: 'modal',
          animation: 'slide_from_right',
          headerTransparent: true,
          headerBlurEffect: 'dark',
          headerTintColor: 'black',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="post/new"
        options={{
          headerShown: true,
          presentation: 'modal',
          animation: 'slide_from_right',
          headerTitle: 'New Post',
          headerTransparent: true,
          headerBlurEffect: 'dark',
          headerTintColor: 'black',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="account/[id]"
        options={{
          headerShown: true,
          presentation: 'modal',
          animation: 'slide_from_left',
          headerTitle: 'Account Profile',
          headerTransparent: true,
          headerBlurEffect: 'dark',
          headerTintColor: 'black',
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
