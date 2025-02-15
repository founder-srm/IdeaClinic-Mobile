import { Link } from 'expo-router';
import { View } from 'react-native';
import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { ScreenContent } from '~/components/ScreenContent';

export default function ForumPage() {
  return (
    <Container>
      <ScreenContent path="app/forum" title="Forum">
        <View className="flex gap-4">
          <Link href="/post/hello" className="rounded-lg bg-blue-500 p-4">
            <Text className="text-center text-white">View Sample Post</Text>
          </Link>
          <Link href="/account/123" className="rounded-lg bg-green-500 p-4">
            <Text className="text-center text-white">View Sample Account</Text>
          </Link>
        </View>
      </ScreenContent>
    </Container>
  );
}
