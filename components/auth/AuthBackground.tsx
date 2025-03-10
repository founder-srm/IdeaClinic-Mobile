import { View } from 'react-native';

import BackgroundSVG from './BackgroundSVG';

import { cn } from '~/lib/utils';

export function AuthBackground() {
  return (
    <View className={cn('absolute inset-0 h-full w-full')}>
      <BackgroundSVG />
    </View>
  );
}
