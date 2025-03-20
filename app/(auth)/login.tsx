import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { AuthAlert } from '~/components/auth/AuthAlert';
import { AuthBackground } from '~/components/auth/AuthBackground';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/cn';
import { useKeyboard } from '~/lib/useKeyboard';
import { useStore } from '~/store/store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.signIn);

  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const handleSignIn = async () => {
    console.log('Sign in Attempt');
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
      <AuthBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end',
            paddingBottom: isKeyboardVisible ? keyboardHeight / 2 : 0,
          }}
          keyboardShouldPersistTaps="handled">
          <Animated.View
            key="login-form"
            entering={FadeInUp.springify().damping(15).delay(100)}
            exiting={FadeOutDown.springify().damping(15)}
            className={cn('overflow-hidden rounded-t-[32px]', isKeyboardVisible && 'mb-4')}>
            <BlurView
              intensity={100}
              blurReductionFactor={8}
              tint="light"
              className="bg-background">
              <View className="p-8 pt-12">
                <Image
                  source={require('~/assets/logo.png')}
                  style={{
                    borderRadius: 8,
                    width: 56,
                    height: 56,
                    marginBottom: 16,
                  }}
                  contentFit="cover"
                  transition={1000}
                  cachePolicy="memory-disk"
                />
                <Text className="mb-6 text-2xl font-bold text-primary">Welcome Back</Text>

                {/* Form fields */}
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
                <Link href="/signup" className="mt-4 self-center">
                  <Text className="text-xl font-semibold text-muted-foreground">
                    Need an account?
                  </Text>
                </Link>
              </View>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
