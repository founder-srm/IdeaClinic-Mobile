import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Image } from 'react-native';

import IntroScreen from './IntroScreen';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

const model1 = require('../assets/model1.png');

export default function WelcomeScreen() {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showScreen2, setShowScreen2] = useState(false);

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

  if (showScreen2) {
    return <IntroScreen />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-[#DCC1FF]">
      <Animated.Text
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }}
        className="text-center text-[50px] font-semibold leading-[60px]">
        Welcome
      </Animated.Text>

      <Animated.Text
        style={{ opacity: fadeAnim }}
        className="mt-1 text-center text-[40px] font-semibold leading-[50px]">
        to careerspace
      </Animated.Text>

      <Animated.Image
        source={model1}
        style={{ opacity: fadeAnim }}
        className="mt-5 h-[382px] w-[393px]"
      />

      <Button
        className="bottom-3 mt-5 h-[50px] w-[150px] rounded-full border-2 border-black bg-transparent"
        onPress={() => setShowScreen2(true)}>
        <Text className="font-bold text-black">Next</Text>
      </Button>
    </View>
  );
}
