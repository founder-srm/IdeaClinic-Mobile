import { Image } from 'expo-image';
import { router, Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, ScrollView } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { AuthAlert } from '~/components/auth/AuthAlert';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/cn';
import { useKeyboard } from '~/lib/useKeyboard';
import { useStore } from '~/store/store';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signUp = useStore((state) => state.signUp);

  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const handleSignUp = async () => {
    try {
      const result = await signUp(email, password);
      if (result.success) {
        router.replace('/(forum)/forum');
      }
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <View className="flex-1">
      <AuthAlert />
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
            key="signup-form"
            entering={FadeInUp.springify().damping(15).delay(100)}
            exiting={FadeOutDown.springify().damping(15)}
            className={cn('overflow-hidden rounded-t-[32px]', isKeyboardVisible && 'mb-4')}>
            <View className="p-8 pt-12">
              <Image
                source={require('~/assets/logo.png')}
                style={{ borderRadius: 8, width: 56, height: 56, marginBottom: 16 }}
                contentFit="cover"
                transition={1000}
                cachePolicy="memory-disk"
              />
              <Text className="mb-6 text-2xl font-bold text-primary">Create Account</Text>

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
                placeholder="Choose a password"
              />
              <Button onPress={handleSignUp} className="">
                <Text className="font-semibold text-white">Sign Up</Text>
              </Button>
              <Link href="/(auth)/login" className="mt-4 self-center">
                <Text className="text-muted-foreground">Already have an account?</Text>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
