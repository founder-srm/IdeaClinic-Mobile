import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, TouchableOpacity, Image } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { router } from 'expo-router';

const model4 = require('../assets/model4.png');

export default function StartScreen() {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-[#DCC1FF] px-5">
      <Animated.Text
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }}
        className="text-center text-[50px] font-semibold leading-[60px]">
        Let's start
      </Animated.Text>

      <Animated.Text
        style={{ opacity: fadeAnim }}
        className="mt-1 text-center text-[40px] font-semibold leading-[50px]">
        your career!
      </Animated.Text>

      <Animated.Image
        source={model4}
        style={{ opacity: fadeAnim }}
        className="mt-5 h-[382px] w-[393px]"
      />

      {/* Terms and Conditions Checkbox */}
      <TouchableOpacity
        className="mt-5 flex-row items-center"
        onPress={() => setAccepted(!accepted)}>
        <View
          className={`bottom-5 h-6 w-6 rounded-full border-2 ${
            accepted ? 'border-black' : 'border-gray-400'
          } mr-2 flex items-center justify-center`}>
          {accepted && <View className="h-3 w-3 rounded-full bg-black" />}
        </View>
        <Text className="bottom-5">I accept the Terms and Conditions</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <Button
        className={`bottom-2 mt-5 h-[50px] w-[250px] rounded-full border-2 border-black bg-[#F5F378] ${
          !accepted ? 'opacity-50' : ''
        }`}
        onPress={() => router.push('/(auth)/login')}
        disabled={!accepted}>
        <Text className="font-bold text-black">Sign in</Text>
      </Button>

      {/* Sign Up Button */}
      <Button
        className={`bottom-1 mt-2 h-[50px] w-[250px] rounded-full border-2 border-black bg-white ${
          !accepted ? 'opacity-50' : ''
        }`}
        onPress={() => router.push('/(auth)/signup')}
        disabled={!accepted}>
        <Text className="font-bold text-black">Sign up</Text>
      </Button>
    </View>
  );
}
