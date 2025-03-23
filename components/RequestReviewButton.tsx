import { MaterialIcons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from './nativewindui/Button';

import { COLORS } from '~/theme/colors';

export default function RatingsButton() {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = async () => {
    try {
      setIsPressed(true);
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsPressed(false), 1000);
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Button onPress={handlePress} disabled={isPressed} size="icon" variant="plain">
        <MaterialIcons name="storefront" size={24} color={COLORS.dark.accent} />
      </Button>
    </View>
  );
}
