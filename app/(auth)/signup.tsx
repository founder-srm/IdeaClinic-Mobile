import { router } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

export default function SignupPage() {
  return (
    <Container>
      <ScreenContent path="app/(auth)/signup" title="Signup Page" />
      <Button onPress={() => router.push('/(forum)/forum')}>
        <Text>Skip to Forum</Text>
      </Button>
    </Container>
  );
}
