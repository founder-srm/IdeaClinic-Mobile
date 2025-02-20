import { Link } from 'expo-router';
import { View } from 'react-native';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { Text } from '~/components/nativewindui/Text';
import { useUser } from '~/hooks/useUser';

export default function ForumPage() {
  const { email, isAuthenticated, user } = useUser();
  return (
    <Container>
      <ScreenContent path="app/forum" title="Forum">
        <Text className="text-center text-2xl font-semibold">Welcome to the Forum</Text>
        <View className="flex gap-4">
          <Link href="/post/hello" className="rounded-lg bg-blue-500 p-4">
            <Text className="text-center text-white">View Sample Post</Text>
          </Link>
          <Link href="/account/123" className="rounded-lg bg-green-500 p-4">
            <Text className="text-center text-white">View Sample Account</Text>
          </Link>
        </View>
        <Text className="text-center text-lg mt-4">
          {isAuthenticated ? `Welcome back, ${user?.id}!` : 'Please sign in to view the forum.'}
        </Text>
        <Text className="text-center text-lg mt-4">
          {isAuthenticated ? `Your email is ${email}.` : ''}
        </Text>
      </ScreenContent>
    </Container>
  );
}
