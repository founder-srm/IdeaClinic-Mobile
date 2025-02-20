import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, KeyboardAvoidingView, Platform, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { AuthAlert } from '~/components/auth/AuthAlert';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { useKeyboard } from '~/lib/useKeyboard';
import { useStore } from '~/store/store';
import { cn } from '~/lib/cn';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.signIn);

  const { isKeyboardVisible } = useKeyboard();

  const handleSignIn = async () => {
    try {
      const result = await login(email, password);
      if (result.success) {
        router.replace('/(forum)/forum');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <View className="flex-1">
      
      <AuthAlert />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className={cn(isKeyboardVisible === false && 'mb-12', 'flex-1 justify-end')}>
          <Animated.View
            key="login-form"
            entering={FadeInUp.springify().damping(15).delay(100)}
            exiting={FadeOutDown.springify().damping(15)}
            className="overflow-hidden rounded-t-[32px]"
          >
            <View className="p-8 pt-12">
              <Image
                source={require('~/assets/logo.png')}
                style={{ borderRadius: 8, width: 56, height: 56, marginBottom: 16 }}
                contentFit="cover"
                transition={1000}
                cachePolicy="memory-disk"
              />
              <Text className="mb-6 text-2xl font-bold text-primary">
                Welcome Back
              </Text>
              <Label nativeID="email" className="text-primary">
                Email
              </Label>
              <Input
                aria-label="Email"
                value={email}
                onChangeText={setEmail}
                className="mb-3"
                placeholder="Enter your email"
              />
              <Label nativeID="password" className="text-primary">
                Password
              </Label>
              <Input
                aria-label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="mb-6"
                placeholder="Enter your password"
              />
              <Button onPress={handleSignIn}>
                <Text className="font-semibold text-white">Login</Text>
              </Button>
              <Link href="/(auth)/signup" className="self-center mt-4">
                <Text className="text-muted-foreground">Need an account?</Text>
              </Link>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
