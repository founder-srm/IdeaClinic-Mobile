import { Icon } from '@roninoss/icons';
import { Stack } from 'expo-router';

import { Button } from '~/components/nativewindui/Button';
import { UseSignOut } from '~/hooks/useSignOut';

export default function PostsProtectedLayout() {
  //     const { session, isLoading } = useSession();

  //   // You can keep the splash screen open, or render a loading screen like we do here.
  //   if (isLoading) {
  //     return <Text>Loading...</Text>;
  //   }

  //   // Only require authentication within the (app) group's layout as users
  //   // need to be able to access the (auth) group and sign in again.
  //   if (!session) {
  //     // On web, static rendering will stop here as the user is not authenticated
  //     // in the headless Node process that the pages are rendered in.
  //     return <Redirect href="/sign-in" />;
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
          headerTitle: 'Post Details',
        }}
      />
      <Stack.Screen
        name="post/new"
        options={{
          headerShown: true,
          presentation: 'modal',
          animation: 'slide_from_right',
          headerTitle: 'New Post',
        }}
      />
      <Stack.Screen
        name="account/[id]"
        options={{
          headerShown: true,
          presentation: 'modal',
          animation: 'slide_from_left',
          headerTitle: 'Account Profile',
        }}
      />
    </Stack>
  );
}
