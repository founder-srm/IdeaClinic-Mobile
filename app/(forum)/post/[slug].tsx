import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  Pressable,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Container } from '~/components/Container';
import { Separator } from '~/components/ui/separator';
import { useUser } from '~/hooks/useUser';
import { supabase } from '~/utils/supabase';
import { COLORS } from '~/theme/colors';
import { Heart, MessageCircle, Share2 } from '~/lib/icons/Slug';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PostPage() {
  const { slug } = useLocalSearchParams();
  const { id: userId } = useUser();

  interface Post {
    id: string;
    title: string;
    content: string | null;
    banner_url: string | null;
    label: string | null;
    label_color: string | null;
    created_at: string;
    likes: string[] | null;
    creator_id: string | null;
  }

  interface Creator {
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  }

  const [post, setPost] = useState<Post | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchPostData() {
      try {
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', Array.isArray(slug) ? slug[0] : slug)
          .single();

        if (postError) throw postError;

        if (postData) {
          setPost(postData as Post);
          setLikeCount(postData.likes?.length || 0);
          setIsLiked(userId ? postData.likes?.includes(userId) || false : false);

          const { data: creatorData, error: creatorError } = await supabase
            .from('profiles')
            .select('username, avatar_url, full_name')
            .eq('id', postData.creator_id as string)
            .single();

          if (creatorError) {
            console.error('Error fetching creator:', creatorError);
          } else {
            setCreator(creatorData as Creator);
          }
        }
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.message);
        if (Platform.OS === 'android') {
          ToastAndroid.show('Failed to load post details', ToastAndroid.LONG);
        }
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchPostData();
  }, [slug, userId]);

  async function handleLike() {
    if (updating || !userId) return;

    setUpdating(true);
    try {
      const { data: currentPost } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', Array.isArray(slug) ? slug[0] : slug)
        .single();

      const currentLikes = currentPost?.likes || [];
      let newLikes = isLiked
        ? currentLikes.filter((id) => id !== userId)
        : [...currentLikes, userId];

      newLikes = newLikes.filter((id): id is string => id !== undefined);

      const { error } = await supabase
        .from('posts')
        .update({ likes: newLikes })
        .eq('id', Array.isArray(slug) ? slug[0] : slug);

      if (error) throw error;

      setIsLiked(!isLiked);
      setLikeCount(newLikes.length);
    } catch (err: any) {
      console.error('Error updating like:', err);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to update like', ToastAndroid.SHORT);
      }
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.light.primary} />
          <Text className="mt-4 text-gray-600">Loading post details...</Text>
        </View>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-xl font-bold text-destructive">Error</Text>
          <Text className="mt-2 text-center text-gray-600">
            {error || "This post doesn't exist or has been removed."}
          </Text>
        </View>
      </Container>
    );
  }

  const isCodeBlock = (text: string): boolean => {
    return text.trim().startsWith('```') || text.trim().startsWith('    ');
  };

  const renderContent = (content: string) => {
    const paragraphs = content.split('\n\n');

    return paragraphs.map((paragraph, index) => {
      if (isCodeBlock(paragraph)) {
        return (
          <View key={index} className="my-4 overflow-hidden rounded-lg bg-gray-900">
            <View className="flex-row items-center justify-between border-b border-gray-700 px-4 py-2">
              <Text className="text-sm font-medium text-gray-400">Code</Text>
              <Text className="text-xs text-gray-500">TypeScript</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
              <Text className="font-mono text-sm text-gray-100">
                {paragraph.replace(/```/g, '').trim()}
              </Text>
            </ScrollView>
          </View>
        );
      } else {
        return (
          <View key={index} className="my-2">
            <Text className="text-base leading-7 text-gray-800">{paragraph}</Text>
          </View>
        );
      }
    });
  };

  return (
    <Container>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8">
        {/* Banner Image with Overlay */}
        {post.banner_url && (
          <Animated.View entering={FadeIn.duration(500)} className="relative mb-4 h-72 w-full">
            <Image source={{ uri: post.banner_url }} className="h-full w-full" resizeMode="cover" />
            <View className="absolute inset-0 bg-black/20" />
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <Text className="text-3xl font-bold text-white">{post.title}</Text>
              {post.label && (
                <View className="mt-2 flex-row items-center">
                  <View
                    style={{ backgroundColor: post.label_color || COLORS.light.primary }}
                    className="mr-2 h-2.5 w-2.5 rounded-full"
                  />
                  <Text className="text-sm font-medium text-gray-200">{post.label}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <View className="px-4">
          {/* Title (if no banner) */}
          {!post.banner_url && (
            <Animated.View entering={FadeInDown.duration(600).delay(200)} className="mb-6">
              <Text className="text-3xl font-bold text-gray-900">{post.title}</Text>
              {post.label && (
                <View className="mt-3 flex-row items-center">
                  <View
                    style={{ backgroundColor: post.label_color || COLORS.light.primary }}
                    className="mr-2 h-2.5 w-2.5 rounded-full"
                  />
                  <Text className="text-sm font-medium text-gray-600">{post.label}</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Creator Info Card */}
          {creator && (
            <Animated.View
              entering={FadeInDown.duration(600).delay(400)}
              className="mb-6 overflow-hidden rounded-xl bg-[#dfcfbd] p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-14 w-14 overflow-hidden rounded-full bg-gray-200">
                    {creator.avatar_url ? (
                      <Image
                        source={{ uri: creator.avatar_url }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-full w-full items-center justify-center">
                        <Text className="text-xl font-bold text-gray-500">
                          {creator.username?.[0]?.toUpperCase() || 'U'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="ml-4">
                    <Text className="text-lg font-semibold text-gray-900">
                      {creator.full_name || creator.username || 'Anonymous'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          <Separator className="mb-6" />

          {/* Post Content with Different Containers */}
          <Animated.View entering={FadeInDown.duration(600).delay(600)} className="mb-8">
            {post.content && renderContent(post.content)}
          </Animated.View>

          {/* Engagement Actions */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(800)}
            className="flex-row items-center gap-5 space-x-3">
            <AnimatedPressable
              onPress={handleLike}
              disabled={updating || !userId}
              className={`flex-1 flex-row items-center justify-center rounded-xl bg-[#dfcfbd] px-4 py-3`}>
              <Heart
                size={20}
                fill={isLiked} // This will use "heart" when isLiked is true, "heart-o" when false
                className={isLiked ? 'text-primary' : 'text-gray-700'}
              />
              <Text className={`ml-2 font-medium ${isLiked ? 'text-primary' : 'text-gray-700'}`}>
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </Text>
            </AnimatedPressable>

            {/* <AnimatedPressable className="flex-1 flex-row items-center justify-center rounded-xl bg-[#dfcfbd] px-4 py-3">
                <MessageCircle size={20} className="text-gray-700" />
                <Text className="ml-2 font-medium text-gray-700">Comments</Text>
              </AnimatedPressable> */}

            <AnimatedPressable className="flex-1 flex-row items-center justify-center rounded-xl bg-[#dfcfbd] px-4 py-3">
              <Share2 size={20} className="text-gray-700" />
              <Text className="ml-2 font-medium">Share</Text>
            </AnimatedPressable>
          </Animated.View>
        </View>
      </ScrollView>
    </Container>
  );
}

