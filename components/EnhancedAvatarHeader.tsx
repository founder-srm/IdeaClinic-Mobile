import { useActionSheet } from '@expo/react-native-action-sheet';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { NovuProvider } from '@novu/react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  PanResponder,
  Keyboard,
} from 'react-native';

import NovuInbox from './NovuInbox';
import { Avatar, AvatarFallback, AvatarImage } from './nativewindui/Avatar';
import { Button } from './nativewindui/Button';
import { Text } from './nativewindui/Text';
import { Input } from './ui/input';

interface EnhancedAvatarHeaderProps {
  backgroundColor?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  image?: any;
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
  onSettings?: string;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
}

export const EnhancedAvatarHeader: React.FC<EnhancedAvatarHeaderProps> = ({
  backgroundColor,
  image,
  onSettings,
  title,
  onLogout,
  onSearch,
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const router = useRouter();

  // Animation values
  const searchBarWidth = useRef(new Animated.Value(0)).current;
  const searchButtonOpacity = useRef(new Animated.Value(1)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;

  // For draggable elements
  const panY = useState(new Animated.Value(0))[0];

  const { showActionSheetWithOptions } = useActionSheet();

  const handlePress = () => {
    const options = ['Create Post', 'Cancel'];
    const destructiveButtonIndex = 1;
    showActionSheetWithOptions({ options, destructiveButtonIndex }, (index) => {
      if (index === 0) {
        router.push('/post/new');
      }
    });
  };

  const handleSettingsPress = () => {
    const options = ['My Profile', 'Settings', 'Cancel'];
    const destructiveButtonIndex = 2;
    showActionSheetWithOptions({ options, destructiveButtonIndex }, (index) => {
      if (index === 0) {
        router.push(`/account/${onSettings}`);
      } else if (index === 1) {
        router.push('/settings');
      }
    });
  };

  // Show search bar animation
  const showSearchAnimation = () => {
    // Start animations
    Animated.parallel([
      Animated.timing(searchBarWidth, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchButtonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(searchBarOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowSearchBar(true);
    });
  };

  // Hide search bar animation
  const hideSearchAnimation = () => {
    setShowSearchBar(false);
    Animated.parallel([
      Animated.timing(searchBarWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchButtonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchBarOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    return () => {
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  // Add keyboard listener to hide search bar when keyboard is dismissed
  // biome-ignore lint/correctness/useExhaustiveDependencies: rip
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (showSearchBar) {
        hideSearchAnimation();
      }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [showSearchBar]);

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

  // Calculate animated styles
  const searchBarStyle = {
    flex: searchBarWidth,
    opacity: searchBarOpacity,
    position: 'absolute' as const,
    left: 50,
    right: 50,
    zIndex: 10,
  };

  return (
    <View className="flex-1">
      <Animated.View
        style={[{ backgroundColor, height: headerHeight }]}
        {...panResponder.panHandlers}
        className="pb-0 pt-10">
        <View className="flex-row items-center justify-between px-4 py-2">
          {/* <TouchableOpacity onPress={onLogout} className="z-20 p-2">
            <Image
              source={require('../assets/icons/logout.png')}
              className="h-6 w-6"
              style={{ tintColor: 'white' }}
            />
          </TouchableOpacity> */}
          <NovuProvider
            // biome-ignore lint/style/noNonNullAssertion: its always gonna be there in this page
            subscriberId={onSettings!} // onSettings is user id
            applicationIdentifier="UnWOs2G6SZhx">
            <NovuInbox />
          </NovuProvider>
          <Animated.View
            style={searchBarStyle}
            className="rounded-lg bg-background bg-opacity-20 px-2">
            {showSearchBar && (
              <Input
                placeholder="Search..."
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                className="h-8 bg-transparent text-sm text-black"
                autoFocus
                onBlur={hideSearchAnimation}
              />
            )}
          </Animated.View>

          <View className="flex-1 items-center">
            <Animated.View style={{ opacity: searchButtonOpacity }}>
              <TouchableOpacity
                onPress={showSearchAnimation}
                className="p-2"
                disabled={showSearchBar}>
                <Image
                  source={require('../assets/icons/search.png')}
                  className="h-6 w-6"
                  style={{ tintColor: 'white' }}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <TouchableOpacity onPress={handleSettingsPress} className="z-20 p-2">
            <Image
              source={require('../assets/icons/settings.png')}
              className="h-6 w-6"
              style={{ tintColor: 'white' }}
            />
          </TouchableOpacity>
        </View>

        <Animated.View
          className="flex w-full flex-col items-center justify-center p-4"
          style={{ opacity: imageOpacity }}>
          <View className="flex w-full flex-col items-center justify-center gap-4">
            <Avatar alt="IdeaSpark Avatar" className="">
              <AvatarImage
                source={{
                  uri: image,
                }}
              />
              <AvatarFallback>
                <Text className="text-foreground">{title}</Text>
              </AvatarFallback>
            </Avatar>
            <Text className="ml-4 text-xl font-bold text-[rgb(236,227,202)]">Hello {title}!</Text>
          </View>
        </Animated.View>

        <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-center">
          <View className="h-1 w-10 rounded-full bg-white bg-opacity-50" />
        </View>
      </Animated.View>

      <View className="-mt-5 flex-1 rounded-t-3xl bg-background">
        {children}

        {/* Floating action button */}
        <View className="absolute bottom-6 left-6 z-50">
          <Button
            onPress={handlePress}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary shadow-lg">
            <FontAwesome name="plus" size={16} color="white" />
          </Button>
        </View>
      </View>

      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} translucent />
    </View>
  );
};
