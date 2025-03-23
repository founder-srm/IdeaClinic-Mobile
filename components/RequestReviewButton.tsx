import * as StoreReview from 'expo-store-review';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from './nativewindui/Button';
import { Text } from './nativewindui/Text';

export default function RatingsButton() {
  const [message, setMessage] = useState('');

  const handlePress = async () => {
    try {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
        setMessage('Review Requested');
      } else {
        setMessage('Review not available.');
      }
    } catch (error) {
      setMessage(`Could not request review: ${error}`);
    }
  };

  return (
    <View>
      <Button onPress={handlePress}>
        <Text>Request Review</Text>
      </Button>
      <Text>{message}</Text>
    </View>
  );
}
