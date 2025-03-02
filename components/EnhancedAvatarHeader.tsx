import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Animated,
  PanResponder,
} from 'react-native';

import { Text } from './nativewindui/Text';

interface EnhancedAvatarHeaderProps {
  backgroundColor?: string;
  image?: any;
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
  onSettings?: () => void;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
}

export const EnhancedAvatarHeader: React.FC<EnhancedAvatarHeaderProps> = ({
  backgroundColor = '#4B9CD3',
  image,
  title,
  subtitle,
  onLogout,
  onSettings,
  onSearch,
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  // For draggable elements
  const panY = useState(new Animated.Value(0))[0];

  // Create a PanResponder for dragging
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gestureState) => {
      // If dragged down more than 50px, collapse the header
      if (gestureState.dy > 50) {
        Animated.spring(panY, {
          toValue: 200,
          useNativeDriver: false,
        }).start();
      } else {
        // Otherwise, expand the header
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const headerHeight = panY.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [300, 220, 120], // Max, normal, min heights
    extrapolate: 'clamp',
  });

  const imageOpacity = panY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <View className="flex-1">
      <Animated.View
        style={[{ backgroundColor, height: headerHeight }]}
        {...panResponder.panHandlers}
        className="pb-0 pt-10">
        <View className="flex-row items-center justify-between px-4 py-2">
          <TouchableOpacity onPress={onLogout} className="p-2">
            <Image
              source={require('../assets/icons/logout.png')}
              className="h-6 w-6"
              style={{ tintColor: 'white' }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowSearchBar(!showSearchBar)} className="p-2">
            <Image
              source={require('../assets/icons/search.png')}
              className="h-6 w-6"
              style={{ tintColor: 'white' }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSettings} className="p-2">
            <Image
              source={require('../assets/icons/settings.png')}
              className="h-6 w-6"
              style={{ tintColor: 'white' }}
            />
          </TouchableOpacity>
        </View>

        {showSearchBar && (
          <View className="mx-4 mb-2 flex-row items-center rounded-lg bg-white bg-opacity-20 px-3 py-2">
            <TextInput
              placeholder="Search..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              className="flex-1 text-white"
            />
            <TouchableOpacity onPress={handleSearch} className="ml-2">
              <Image
                source={require('../assets/icons/search.png')}
                className="h-5 w-5"
                style={{ tintColor: 'white' }}
              />
            </TouchableOpacity>
          </View>
        )}

        <Animated.View className="items-center p-4" style={{ opacity: imageOpacity }}>
          <View className="items-center">
            {image && (
              <Image
                source={typeof image === 'string' ? { uri: image } : image}
                className="h-20 w-20 rounded-full border-2 border-white"
                style={{ borderWidth: 2, borderColor: 'white' }}
                resizeMode="cover"
              />
            )}
            <Text className="mt-2 text-xl font-bold text-white">{title}</Text>
            <Text className="text-sm text-white text-opacity-90">{subtitle}</Text>
          </View>
        </Animated.View>

        <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-center">
          <View className="h-1 w-10 rounded-full bg-white bg-opacity-50" />
        </View>
      </Animated.View>

      <View className="-mt-5 flex-1 rounded-t-3xl bg-gray-900">{children}</View>

      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} translucent />
    </View>
  );
};
