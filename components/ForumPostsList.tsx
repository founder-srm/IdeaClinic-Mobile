import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ToastAndroid } from 'react-native';

import { Tables } from '../database.types';
import { Text } from './nativewindui/Text';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

import { cn } from '~/lib/cn';
import { supabase } from '~/utils/supabase';
// Assuming you have this setup

// Define the Post type with additional properties
type Post = Tables<'posts'> & {
  creator?: {
    avatar_url: string;
    full_name: string;
  };
  likesCount: number;
};

// Define the label categories
const LABEL_CATEGORIES = [
  'Help Required',
  'New Idea',
  'Looking for Team',
  'Needs Feedback',
  'Discussion',
  'Resource Sharing',
  'Question',
  'Tutorial',
  'Success Story',
  'Open Ended Discussion',
  'Professor Input Needed',
  'Student Project',
  'Other',
];

const ForumPostsList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch posts and creators data
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        // Fetch posts with their creators
        const { data, error } = await supabase
          .from('posts')
          .select(
            `
            *,
            profiles:creator_id (
              avatar_url,
              full_name
            )
          `
          )
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match Post type
        if (data) {
          const formattedPosts: Post[] = data.map((post) => ({
            ...post,
            creator: post.profiles as any,
            likesCount: post.likes ? post.likes.length : 0,
          }));

          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Group posts by label
  const postsByLabel = LABEL_CATEGORIES.reduce(
    (acc, label) => {
      acc[label] = posts.filter((post) => post.label === label);
      return acc;
    },
    {} as Record<string, Post[]>
  );

  // Render individual post card
  const renderPostCard = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => router.push(`/post/${item.id}`)}
      onLongPress={() => ToastAndroid.show('Like coming soon', ToastAndroid.SHORT)}>
      <Card
        className="mx-2 my-1 w-[300px] rounded-xl"
        style={{ backgroundColor: item.label_color + '20' }} // Add transparency to color
      >
        <CardHeader className="pb-2">
          <View className="flex-col justify-between">
            <CardTitle className="text-base">{item.title}</CardTitle>
            <CardDescription className="text-sm" style={{ color: item.label_color }}>
              {item.label}
            </CardDescription>
          </View>
          <CardDescription className="text-xs">
            {moment(item.created_at).format('MMM D, YYYY')}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          <Text className="text-sm" numberOfLines={2}>
            {item.content || 'No content'}
          </Text>
        </CardContent>

        <CardFooter className="pb-2 pt-0">
          <View className="w-full flex-row items-center justify-between">
            <View className="flex-row items-center">
              {item.creator?.avatar_url && (
                <Image source={{ uri: item.creator.avatar_url }} className="h-6 w-6 rounded-full" />
              )}
              <Text className="ml-2 text-xs">{item.creator?.full_name || 'Unknown'}</Text>
            </View>
            <View className="flex-row items-center">
              <Image source={require('../assets/icons/heart.png')} className="mr-1 h-4 w-4" />
              <Text className="text-xs">{item.likesCount}</Text>
            </View>
          </View>
        </CardFooter>
      </Card>
    </TouchableOpacity>
  );

  // Render section for each label category
  const renderLabelSection = (label: string) => {
    const labelPosts = postsByLabel[label] || [];

    if (labelPosts.length === 0) return null;

    return (
      <View className="mb-4" key={label}>
        <Text className="mb-2 ml-4 text-lg font-bold">{label}</Text>
        <FlashList
          data={labelPosts}
          renderItem={renderPostCard}
          estimatedItemSize={250}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList
        data={[...LABEL_CATEGORIES, 'all']}
        renderItem={({ item }) => {
          if (item === 'all') {
            return (
              <View className="mt-4">
                <Text className="mb-2 ml-4 text-xl font-bold">All Posts</Text>
                <FlashList
                  data={posts}
                  renderItem={renderPostCard}
                  estimatedItemSize={250}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.verticalList}
                  numColumns={1}
                />
              </View>
            );
          }
          return renderLabelSection(item);
        }}
        estimatedItemSize={350}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="pt-4">
            <Text className="mb-4 ml-4 text-2xl font-bold">Forum Posts</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  horizontalList: {
    paddingHorizontal: 8,
  },
  verticalList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

export default ForumPostsList;
