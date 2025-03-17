import React, { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';

import LearnScreen from './LearnScreen';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

const model2 = require('../assets/model2.png');

export default function IntroScreen() {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showScreen3, setShowScreen3] = useState(false);

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

  if (showScreen3) {
    return <LearnScreen />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-[#F7CE45]">
      <Animated.Text
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }}
        className="text-center text-[50px] font-semibold leading-[60px]">
        Get support
      </Animated.Text>

      <Animated.Text
        style={{ opacity: fadeAnim }}
        className="mt-1 text-center text-[40px] font-semibold leading-[50px]">
        from Experienced Professors
      </Animated.Text>

      <Animated.Image
        source={model2}
        style={{ opacity: fadeAnim }}
        className="mt-5 h-[382px] w-[393px]"
      />

      <Button
        className="bottom-3 mt-5 h-[50px] w-[150px] rounded-full border-2 border-black bg-transparent"
        onPress={() => setShowScreen3(true)}>
        <Text className="font-bold text-black">Next</Text>
      </Button>
    </View>
  );
}
