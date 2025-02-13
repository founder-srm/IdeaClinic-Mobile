import { useActionSheet } from '@expo/react-native-action-sheet';
import { BottomSheetDraggableView } from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { Icon } from '@roninoss/icons';
import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { Linking, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { Button } from '~/components/nativewindui/Button';
import { DatePicker } from '~/components/nativewindui/DatePicker/DatePicker';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Slider } from '~/components/nativewindui/Slider';
import { Text } from '~/components/nativewindui/Text';
import { Toggle } from '~/components/nativewindui/Toggle';
import { useColorScheme } from '~/lib/useColorScheme';

cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export default function DetailsScreen() {
  const bottomSheetModalRef = useSheetRef();

  const handlePresentModalPress = React.useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = React.useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="py-4">
      <Text variant="title1" className="pb-4">
        Components
      </Text>
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        data={COMPONENTS}
        estimatedItemSize={200}
        contentContainerClassName="py-4"
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderItemSeparator}
        renderItem={renderItem}
        ListEmptyComponent={COMPONENTS.length === 0 ? ListEmptyComponent : undefined}
      />
      <View className="py-8">
        <Button onPress={handlePresentModalPress}>
          <Text>Open Sheet</Text>
        </Button>

        <Sheet ref={bottomSheetModalRef} onChange={handleSheetChanges} snapPoints={[300]}>
          <BottomSheetDraggableView>
            <View className="gap-4 p-4">
              <Text variant="title3" className="text-center font-semibold">
                Bottom Sheet Content
              </Text>
              <Button onPress={() => console.log('Button pressed')}>
                <Text>Click Me!</Text>
              </Button>
              <View className="flex-row items-center justify-between">
                <Text>Enable Feature</Text>
                <Toggle value onValueChange={() => {}} />
              </View>
              <ProgressIndicator value={75} max={100} />
              <View className="flex-row items-center gap-2">
                <Avatar alt="User">
                  <AvatarFallback>
                    <Text>UI</Text>
                  </AvatarFallback>
                </Avatar>
                <Text>John Doe</Text>
              </View>
            </View>
          </BottomSheetDraggableView>
        </Sheet>
      </View>
    </ScrollView>
  );
}

function ListEmptyComponent() {
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const { colors } = useColorScheme();
  const height = dimensions.height - headerHeight - insets.bottom - insets.top;

  return (
    <View style={{ height }} className="flex-1 items-center justify-center gap-1 px-12">
      <Icon name="file-plus-outline" size={42} color={colors.grey} />
      <Text variant="title3" className="pb-1 text-center font-semibold">
        No Components Installed
      </Text>
      <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
        <Button size="lg" variant="primary">
          <Text>Get Started</Text>
        </Button>
      </Link>
      <Text color="tertiary" variant="subhead" className="pb-4 text-center">
        You can install any of the free components from the{' '}
        <Text
          onPress={() => Linking.openURL('https://nativewindui.com')}
          variant="subhead"
          className="text-primary">
          NativeWindUI
        </Text>
        {' website.'}
      </Text>
    </View>
  );
}

type ComponentItem = { name: string; component: React.FC };

function keyExtractor(item: ComponentItem) {
  return item.name;
}

function renderItemSeparator() {
  return <View className="p-2" />;
}

function renderItem({ item }: { item: ComponentItem }) {
  return (
    <Card title={item.name}>
      <item.component />
    </Card>
  );
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View className="px-4">
      <View className="border-border bg-card gap-4 rounded-xl border p-4 pb-6 shadow-sm shadow-black/10 dark:shadow-none">
        <Text className="text-center text-sm font-medium tracking-wider opacity-60">{title}</Text>
        {children}
      </View>
    </View>
  );
}

function ActionSheetExample() {
  const { showActionSheetWithOptions } = useActionSheet();
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>();

  const handlePress = () => {
    const options = ['Delete', 'Save', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;
    showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex }, (index) =>
      setSelectedIndex(index)
    );
  };

  return (
    <View>
      <Button onPress={handlePress}>
        <Text>Show Action Sheet</Text>
      </Button>
      {selectedIndex !== undefined && <Text>Selected Index: {selectedIndex}</Text>}
    </View>
  );
}

function AvatarExample() {
  return (
    <Avatar alt="NativeWindUI Avatar">
      <AvatarImage
        source={{
          uri: 'https://avatars.githubusercontent.com/u/118198968?v=4',
        }}
      />
      <AvatarFallback>
        <Text className="text-foreground">NUI</Text>
      </AvatarFallback>
    </Avatar>
  );
}

function ButtonExample() {
  return (
    <Button onPress={() => console.log('Button Pressed')}>
      <Text>Press Me</Text>
    </Button>
  );
}

function DatePickerExample() {
  const [showPicker, setShowPicker] = React.useState(false);
  const [date, setDate] = React.useState(new Date());

  return (
    <View>
      {!showPicker && (
        <Button onPress={() => setShowPicker(true)}>
          <Text>Open Picker</Text>
        </Button>
      )}
      {showPicker && (
        <DatePicker
          value={date}
          mode="datetime"
          onChange={(ev) => setDate(new Date(ev.nativeEvent.timestamp))}
        />
      )}
      <Text>Selected Date: {date.toLocaleString()}</Text>
    </View>
  );
}

function PickerExample() {
  const [picker, setPicker] = React.useState('blue');

  return (
    <Picker selectedValue={picker} onValueChange={(itemValue) => setPicker(itemValue)}>
      <PickerItem label="Red" value="red" color="red" />
      <PickerItem label="Blue" value="blue" color="blue" />
    </Picker>
  );
}

function ProgressExample() {
  const [progress, setProgress] = React.useState(50);

  return (
    <View>
      <ProgressIndicator value={progress} max={100} />
      <Slider
        value={progress / 100}
        onValueChange={(value) => setProgress(Math.round(value * 100))}
      />
    </View>
  );
}

function RatingsExample() {
  const [message, setMessage] = React.useState('');

  const handlePress = async () => {
    try {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
        setMessage('Review Requested');
      } else {
        setMessage('Review not available.');
      }
    } catch (error) {
      setMessage('Could not request review: ' + error);
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

function SliderExample() {
  return <Slider value={0.5} />;
}

function SwitchExample() {
  const [switchValue, setSwitchValue] = React.useState(true);

  return <Toggle value={switchValue} onValueChange={setSwitchValue} />;
}

const COMPONENTS: ComponentItem[] = [
  {
    name: 'Activity Indicator',
    component: ActivityIndicator,
  },
  {
    name: 'Action Sheet Example',
    component: ActionSheetExample,
  },
  {
    name: 'Avatar Example',
    component: AvatarExample,
  },
  {
    name: 'Button',
    component: ButtonExample,
  },
  {
    name: 'Date Picker',
    component: DatePickerExample,
  },
  {
    name: 'Picker',
    component: PickerExample,
  },
  {
    name: 'Progress Indicator',
    component: ProgressExample,
  },
  {
    name: 'Ratings Example',
    component: RatingsExample,
  },
  {
    name: 'Slider',
    component: SliderExample,
  },
  {
    name: 'Switch',
    component: SwitchExample,
  },
];
