import { FontAwesome5, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '@novu/react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, RefreshControl, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator } from './nativewindui/ActivityIndicator';

import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

interface NotificationNovu {
  id: string;
  subject?: string;
  body: string;
  // to: Subscriber;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  readAt?: string | null;
  archivedAt?: string | null;
  avatar?: string;
  // primaryAction?: Action;
  // secondaryAction?: Action;
  // channelType: ChannelType;
  tags?: string[];
  // data?: Record<string, unknown>;
  redirect?: { url: string; target?: '_self' | '_blank' | '_parent' | '_top' | '_unfencedTop' };
}

const parseNotificationContent = (htmlContent: string) => {
  try {
    // Extract title (h2 content)
    const titleMatch = htmlContent.match(/<h2>(.*?)<\/h2>/i);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract comment (text between <i> tags)
    const commentMatch = htmlContent.match(/<i>(.*?)<\/i>/i);
    const comment = commentMatch ? commentMatch[1] : '';

    return {
      title,
      comment,
    };
  } catch (error) {
    console.error('Error parsing notification content:', error);
    return { title: '', comment: '' };
  }
};

// Format date to a more readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    // Today - show time
    return `Today at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  if (diffInDays === 1) {
    // Yesterday
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    // Within a week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
  // More than a week
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

function NovuInbox() {
  const { notifications, isLoading, fetchMore, hasMore, refetch, readAll, archiveAllRead } =
    useNotifications();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (notifications === undefined || notifications.length === 0) {
      refetch();
    }
  }, []);

  const handleNotificationPress = (item: NotificationNovu) => {
    // Close the popover
    setOpen(false);

    // Navigate to the redirect URL if it exists, otherwise to the forum
    setTimeout(() => {
      if (item.redirect?.url) {
        const url = item.redirect.url as string;
        // Extract just the "/post/[id]" part if the URL contains "/forum"
        const postPath = url.includes('/forum') ? url.replace('/forum', '') : url;
        // biome-ignore lint/suspicious/noExplicitAny: f u typescript
        router.push(postPath as any);
      } else {
        router.push('/forum');
      }
    }, 300); // Small delay to ensure popover closes smoothly first
  };

  const renderItem = ({ item }: { item: NotificationNovu }) => {
    const content = parseNotificationContent(item.body || '');
    const formattedDate = formatDate(item.createdAt);

    // Determine the icon based on notification content
    const getNotificationIcon = () => {
      if (
        content.title?.includes('comment') ||
        content.title?.toLowerCase().includes('commented')
      ) {
        return <FontAwesome5 name="comment-alt" size={16} color="#4D7FCA" />;
      }
      if (content.title?.includes('like') || content.title?.toLowerCase().includes('liked')) {
        return <FontAwesome5 name="heart" size={16} color="#E94A65" />;
      }
      if (content.title?.includes('post') || content.title?.toLowerCase().includes('posted')) {
        return <FontAwesome5 name="sticky-note" size={16} color="#5AAC69" />;
      }
      return <FontAwesome5 name="bell" size={16} color="#F59E0B" />;
    };

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        className={`bg-primary/30 m-2 rounded-lg border-b border-accent p-4 ${item.isRead ? '' : 'bg-blue-50'}`}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? '#E6F0FF' : item.isRead ? 'white' : '#EBF5FF',
          },
        ]}>
        <View className="flex-row">
          {/* Icon column */}
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            {getNotificationIcon()}
          </View>

          {/* Content column */}
          <View className="flex-1">
            {/* Header with title and time */}
            <View className="mb-1 flex-row items-center justify-between">
              {content.title ? (
                <Text
                  numberOfLines={1}
                  className={`flex-1 font-medium ${item.isRead ? 'text-gray-800' : 'text-black'}`}>
                  {content.title}
                </Text>
              ) : null}
            </View>

            {/* Comment content */}
            {content.comment ? (
              <Text
                numberOfLines={2}
                className={`text-sm ${item.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                {content.comment}
              </Text>
            ) : (
              <Text
                numberOfLines={2}
                className={`text-sm ${item.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                {item.body}
              </Text>
            )}

            {/* Time and read status */}
            <View className="mt-1.5 flex-row items-center justify-end">
              <Text className="text-xs text-gray-500">{formattedDate}</Text>
              {!item.isRead && <View className="ml-2 h-2 w-2 rounded-full bg-blue-500" />}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View className="flex items-center justify-center py-4">
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center justify-center py-8">
      <Text className="text-lg text-gray-500">No updates available</Text>
      <Button variant="outline" onPress={refetch} className="mt-3 flex-row items-center">
        <MaterialIcons name="refresh" size={18} color="#2196F3" style={{ marginRight: 6 }} />
        <Text className="text-blue-500">Refresh</Text>
      </Button>
    </View>
  );

  const renderNotificationsList = () => {
    if (isLoading) {
      return (
        <View className="h-64 items-center justify-center">
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      );
    }

    return (
      <ScrollView className="h-96">
        <FlashList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingVertical: 8 }}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#2196F3']} />
          }
        />
      </ScrollView>
    );
  };

  return (
    <Popover onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
          <FontAwesome6 name="bell" size={20} color="white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={Platform.OS === 'web' ? 'bottom' : 'top'}
        insets={contentInsets}
        className="w-96 border-accent bg-background">
        <View className="px-1">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-medium">Notifications</Text>
            <View className="w-fit flex-row items-center justify-end gap-2">
              <MaterialIcons
                name="archive"
                size={20}
                color="black"
                onPress={archiveAllRead}
                className="px-2"
              />
              <MaterialIcons
                name="mark-email-read"
                size={20}
                color="black"
                onPress={readAll}
                className="px-2"
              />
              <Button variant="ghost" size="icon" className="h-8" onPress={() => refetch()}>
                <MaterialIcons name="refresh" size={16} color="#2196F3" />
              </Button>
            </View>
          </View>
          {renderNotificationsList()}
        </View>
      </PopoverContent>
    </Popover>
  );
}

export default NovuInbox;
