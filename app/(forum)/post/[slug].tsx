import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  Linking,
  Share,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Container } from '~/components/Container';
import { Button } from '~/components/nativewindui/Button';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Separator } from '~/components/ui/separator';
import { useUser } from '~/hooks/useUser';
import { cn } from '~/lib/cn';
import { COLORS } from '~/theme/colors';
import { supabase } from '~/utils/supabase';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Post {
  id: string;
  title: string;
  content: string | null;
  banner_url: string | null;
  label: string;
  label_color: string;
  created_at: string;
  likes: string[] | null;
  creator_id: string | null;
}

interface Creator {
  username: string;
  avatar_url: string | null;
  full_name: string | null;
}

interface Comment {
  id: string;
  content: string | null;
  created_at: string;
  creatorid: string | null;
  likes: string[] | null;
  postid: string | null;
  creator: {
    username: string | null;
    avatar_url: string;
    full_name: string | null;
  } | null;
}

export default function PostPage() {
  const { slug } = useLocalSearchParams();
  const { id: userId } = useUser();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  // Replace the commentsHeight and animatedCommentsStyle with Sheet ref
  const commentsSheetRef = useSheetRef();
  const postIdRef = useRef<string | null>(null);

  // Update the toggleComments function to use the Sheet
  const toggleComments = useCallback(() => {
    if (showComments) {
      commentsSheetRef.current?.dismiss();
      setShowComments(false);
    } else {
      commentsSheetRef.current?.present();
      setShowComments(true);
      // No need to fetch comments here as they're already loaded with the post
    }
  }, [showComments]);

  // Handle sheet changes callback
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setShowComments(false);
    }
  }, []);

  // Fetch more comments for pagination
  const fetchMoreComments = useCallback(async () => {
    if (!postIdRef.current || loadingComments || !hasMoreComments) return;

    try {
      setLoadingComments(true);

      // Get the last comment's ID for pagination
      const lastCommentId = comments.length > 0 ? comments[comments.length - 1].id : undefined;

      if (!lastCommentId) {
        setLoadingComments(false);
        return;
      }

      const { data, error: commentsError } = await supabase
        .from('comments')
        .select(
          `
          *,
          creator:profiles(username, avatar_url, full_name)
        `
        )
        .eq('postid', postIdRef.current)
        .order('created_at', { ascending: false })
        .lt('id', lastCommentId)
        .limit(20);

      if (commentsError) throw commentsError;

      if (data && data.length > 0) {
        setComments((prev) => [...prev, ...data]);
      } else {
        // No more comments to load
        setHasMoreComments(false);
      }
    } catch (err) {
      console.error('Error fetching more comments:', err);
      ToastAndroid.show('Failed to load more comments', ToastAndroid.SHORT);
    } finally {
      setLoadingComments(false);
    }
  }, [comments, loadingComments, hasMoreComments]);

  const submitComment = useCallback(async () => {
    if (!userId || !postIdRef.current || !newComment.trim() || commenting) return;

    setCommenting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          postid: postIdRef.current,
          creatorid: userId,
          likes: [],
        })
        .select(
          `
          *,
          creator:profiles(username, avatar_url, full_name)
        `
        )
        .single();

      if (error) throw error;

      if (data) {
        setComments((prev) => [data, ...prev]);
        setCommentCount((prev) => prev + 1);
        setNewComment('');
        inputRef.current?.blur();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      ToastAndroid.show('Failed to post comment', ToastAndroid.SHORT);
    } finally {
      setCommenting(false);
    }
  }, [userId, newComment, commenting]);

  const handleCommentLike = useCallback(
    async (comment: Comment) => {
      if (!userId) return;

      try {
        // Get current likes for this comment
        const isLiked = comment.likes?.includes(userId) || false;
        const currentLikes = comment.likes || [];

        // Update likes array - add or remove user ID
        let newLikes;
        if (isLiked) {
          newLikes = currentLikes.filter((id) => id !== userId);
        } else {
          newLikes = [...currentLikes, userId];
        }

        // Filter out any undefined values
        newLikes = newLikes.filter((id): id is string => id !== undefined);

        // Update the comment in the database
        const { error } = await supabase
          .from('comments')
          .update({ likes: newLikes })
          .eq('id', comment.id);

        if (error) throw error;

        // Update local state
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? { ...c, likes: newLikes } : c))
        );
      } catch (err) {
        console.error('Error updating comment like:', err);
        ToastAndroid.show('Failed to update like', ToastAndroid.SHORT);
      }
    },
    [userId]
  );

  const renderComment = ({ item: comment }: { item: Comment }) => {
    const isCommentLiked = userId ? comment.likes?.includes(userId) || false : false;

    return (
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="mb-3 rounded-lg bg-card p-3 shadow-sm">
        <View className="flex-row items-center">
          <View className="h-8 w-8 overflow-hidden rounded-full bg-card-foreground">
            {comment.creator?.avatar_url ? (
              <Image
                source={{ uri: comment.creator.avatar_url }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Text className="text-lg font-bold text-gray-700">
                  {comment.creator?.username?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <View className="ml-2 flex-1">
            <Text className="font-medium text-gray-800">
              {comment.creator?.full_name || comment.creator?.username || 'Anonymous'}
            </Text>
            <Text className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <Text className="mt-2 text-gray-700">{comment.content}</Text>
        <View className="mt-2 flex-row items-center">
          <Pressable
            onPress={() => handleCommentLike(comment)}
            disabled={!userId}
            className="mr-3 flex-row items-center">
            <AntDesign
              name={isCommentLiked ? 'heart' : 'hearto'}
              size={16}
              color={isCommentLiked ? '#d16969' : '#8b7355'}
            />
            <Text className="ml-1 text-xs text-gray-500">{comment.likes?.length || 0}</Text>
          </Pressable>
          {/* {userId === comment.creatorid && (
            <Pressable className="flex-row items-center">
              <AntDesign name="edit" size={16} color="#8b7355" />
              <Text className="ml-1 text-xs text-gray-500">Edit</Text>
            </Pressable>
          )} */}
        </View>
      </Animated.View>
    );
  };

  const navigateToUserProfile = () => {
    if (post?.creator_id) {
      router.push(`/account/${post.creator_id}`);
    }
  };

  const renderContent = (content: string) => {
    // Create a temporary div to parse HTML content
    const parseHTML = (htmlString: string) => {
      // Simple HTML tag parsing using regex
      // Find all HTML tags and their content
      const elements: { tag: string; content: string; attrs?: { [key: string]: string } }[] = [];

      // Process the HTML content
      let remainingContent = htmlString.trim();

      while (remainingContent.length > 0) {
        // Check if starts with a tag
        const tagMatch = remainingContent.match(
          /^<([a-zA-Z0-9]+)([^>]*)>([\s\S]*?)<\/\1>|^<([a-zA-Z0-9]+)([^>]*)\/>|^([^<]+)/
        );

        if (!tagMatch) break;

        if (tagMatch[6]) {
          // Text content without tags
          elements.push({ tag: 'text', content: tagMatch[6] });
          remainingContent = remainingContent.slice(tagMatch[0].length);
          continue;
        }

        const fullMatch = tagMatch[0];
        const tag = tagMatch[1] || tagMatch[4];
        const attrsString = (tagMatch[2] || tagMatch[5] || '').trim();
        const innerContent = tagMatch[3] || '';

        // Parse attributes
        const attrs: { [key: string]: string } = {};
        const attrMatches = attrsString.matchAll(/([a-zA-Z0-9_-]+)(?:=["']([^"']*)["'])?/g);
        for (const attrMatch of attrMatches) {
          attrs[attrMatch[1]] = attrMatch[2] || '';
        }

        elements.push({ tag, content: innerContent, attrs });
        remainingContent = remainingContent.slice(fullMatch.length);
      }

      return elements;
    };

    // Render elements recursively
    const renderElement = (
      element: { tag: string; content: string; attrs?: { [key: string]: string } },
      index: number | string
    ) => {
      switch (element.tag.toLowerCase()) {
        case 'text':
          return (
            <Text key={index} className="text-base text-gray-700">
              {element.content}
            </Text>
          );

        case 'h1':
          return (
            <Text key={index} className="mb-2 mt-4 text-3xl font-bold text-gray-800">
              {element.content}
            </Text>
          );

        case 'h2':
          return (
            <Text key={index} className="mb-2 mt-4 text-2xl font-bold text-gray-800">
              {element.content}
            </Text>
          );

        case 'h3':
          return (
            <Text key={index} className="mb-2 mt-3 text-xl font-bold text-gray-800">
              {element.content}
            </Text>
          );

        case 'p': {
          const parsedPContent = parseHTML(element.content);
          return (
            <View key={index} className="mb-4">
              {parsedPContent.map((subElement, i) => renderElement(subElement, `${index}-${i}`))}
            </View>
          );
        }

        case 'code':
          return (
            <Text
              key={index}
              className="rounded bg-gray-100 px-1 font-mono text-base text-gray-800">
              {element.content}
            </Text>
          );

        case 'pre':
          return (
            <View key={index} className="my-4 rounded-lg bg-[#2d2d2d] p-4">
              <Text className="font-mono text-white">{element.content}</Text>
            </View>
          );

        case 'blockquote':
          return (
            <View key={index} className="my-4 border-l-4 border-gray-300 pl-4">
              <Text className="text-base italic text-gray-600">{element.content}</Text>
            </View>
          );

        case 'ul': {
          const listItems = parseHTML(element.content);
          return (
            <View key={index} className="mb-4 ml-4">
              {listItems.map((item, i) => {
                if (item.tag.toLowerCase() === 'li') {
                  return (
                    <View key={`${index}-${i}`} className="mb-1 flex-row">
                      <Text className="mr-2 text-base">•</Text>
                      <Text className="flex-1 text-base text-gray-700">{item.content}</Text>
                    </View>
                  );
                }
                return null;
              })}
            </View>
          );
        }

        case 'ol': {
          const orderedItems = parseHTML(element.content);
          return (
            <View key={index} className="mb-4 ml-4">
              {orderedItems.map((item, i) => {
                if (item.tag.toLowerCase() === 'li') {
                  return (
                    <View key={`${index}-${i}`} className="mb-1 flex-row">
                      <Text className="mr-2 text-base">{i + 1}.</Text>
                      <Text className="flex-1 text-base text-gray-700">{item.content}</Text>
                    </View>
                  );
                }
                return null;
              })}
            </View>
          );
        }

        case 'br':
          return <View key={index} className="h-4" />;

        case 'img':
          return element.attrs?.src ? (
            <View key={index} className="my-4 overflow-hidden rounded-lg">
              <Image
                source={{ uri: element.attrs.src }}
                className="h-48 w-full"
                resizeMode="cover"
              />
              {element.attrs?.alt && (
                <Text className="mt-1 text-center text-sm text-gray-500">{element.attrs.alt}</Text>
              )}
            </View>
          ) : null;

        case 'a':
          return (
            <Text
              key={index}
              className="text-blue-600 underline"
              onPress={() => element.attrs?.href && Linking.openURL(element.attrs.href)}>
              {element.content}
            </Text>
          );

        default:
          return (
            <Text key={index} className="text-base text-gray-700">
              {element.content}
            </Text>
          );
      }
    };

    // Main render function
    const elements = parseHTML(content);

    return (
      <View className="space-y-2">
        {elements.map((element, index) => renderElement(element, index))}
      </View>
    );
  };

  useEffect(() => {
    async function fetchPostAndComments() {
      // Clear previous state
      setError(null);
      setComments([]);
      setHasMoreComments(true);

      if (!slug) {
        setError('Missing post identifier');
        setLoading(false);
        return;
      }

      const postId = Array.isArray(slug) ? slug[0] : slug;
      postIdRef.current = postId; // Store the post ID in the ref for access in callbacks

      try {
        // Start both post and comments fetching simultaneously
        const [postResult, commentsResult] = await Promise.all([
          supabase.from('posts').select('*').eq('id', postId).single(),
          supabase
            .from('comments')
            .select(
              `
            *,
            creator:profiles(username, avatar_url, full_name)
          `
            )
            .eq('postid', postId)
            .order('created_at', { ascending: false })
            .limit(20),
        ]);

        const { data: postData, error: postError } = postResult;
        const { data: commentsData, error: commentsError } = commentsResult;

        if (postError) throw postError;

        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
          // Continue with post data even if comments fail
        } else if (commentsData) {
          setComments(commentsData);
          setCommentCount(commentsData.length);
        }

        if (postData) {
          setPost(postData as Post);
          setLikeCount(postData.likes?.length || 0);
          setIsLiked(userId ? postData.likes?.includes(userId) || false : false);

          // Also fetch comment count to ensure we have the total
          try {
            const { count, error } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('postid', postId);

            if (!error && count !== null) {
              setCommentCount(count);
              // If count is higher than loaded comments, we know there are more
              setHasMoreComments(count > (commentsData?.length || 0));
            }
          } catch (countErr) {
            console.error('Error fetching comment count:', countErr);
          }

          if (postData.creator_id) {
            const { data: creatorData, error: creatorError } = await supabase
              .from('profiles')
              .select('username, avatar_url, full_name')
              .eq('id', postData.creator_id)
              .single();

            if (creatorError) {
              console.error('Error fetching creator:', creatorError);
            } else {
              setCreator(creatorData as Creator);
            }
          }
        } else {
          setError('Post not found');
        }
      } catch (err: any) {
        console.error('Error fetching post details:', err);
        setError(err.message || 'Failed to load post details');
        ToastAndroid.show('Failed to load post details', ToastAndroid.LONG);
      } finally {
        setLoading(false);
      }
    }

    fetchPostAndComments();
  }, [slug, userId]);

  async function handleLike() {
    if (updating || !userId || !post?.id) return;

    setUpdating(true);
    try {
      const { data: currentPost } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', post.id)
        .single();

      const currentLikes = currentPost?.likes || [];
      let newLikes;

      if (isLiked) {
        newLikes = currentLikes.filter((id) => id !== userId);
      } else {
        newLikes = [...currentLikes, userId];
      }

      newLikes = newLikes.filter((id): id is string => id !== undefined);

      const { error } = await supabase.from('posts').update({ likes: newLikes }).eq('id', post.id);

      if (error) throw error;

      setIsLiked(!isLiked);
      setLikeCount(newLikes.length);
    } catch (err: any) {
      console.error('Error updating like:', err);
      ToastAndroid.show('Failed to update like', ToastAndroid.SHORT);
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
          <Text className="text-xl font-bold text-red-500">Error</Text>
          <Text className="mt-2 text-center text-gray-600">
            {error || "This post doesn't exist or has been removed."}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 rounded-lg bg-gray-200 px-6 py-3">
            <Text className="font-medium text-gray-700">Go Back</Text>
          </Pressable>
        </View>
      </Container>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: `${post.title}` }} />
      <Container>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <View className="mt-[5rem] flex-1">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
              <View className="p-4">
                {/* Banner Image */}
                {post.banner_url && (
                  <Animated.View
                    entering={FadeInDown.duration(600)}
                    className="mb-6 overflow-hidden rounded-xl shadow">
                    <Image
                      source={{ uri: post.banner_url }}
                      className="h-48 w-full"
                      resizeMode="cover"
                    />
                  </Animated.View>
                )}

                {/* Title and Tag */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} className="mb-6">
                  <Text className="text-2xl font-bold text-gray-800">{post.title}</Text>
                  {post.label && (
                    <View className="mt-2 flex-row items-center">
                      <View
                        style={{ backgroundColor: post.label_color }}
                        className="mr-2 h-3 w-3 rounded-full"
                      />
                      <Text className="text-sm text-gray-600">{post.label}</Text>
                    </View>
                  )}
                </Animated.View>

                {/* Creator Info Card */}
                {creator && (
                  <AnimatedPressable
                    onPress={navigateToUserProfile}
                    entering={FadeInDown.duration(600).delay(400)}
                    className="mb-6 overflow-hidden rounded-xl border border-[#dfcfbd]/20 bg-[#dfcfbd] p-4 shadow-md">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center">
                        <View className="h-14 w-14 overflow-hidden rounded-full border-2 border-[#dfcfbd]/30 shadow-sm">
                          {creator.avatar_url ? (
                            <Image
                              source={{ uri: creator.avatar_url }}
                              className="h-full w-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="h-full w-full items-center justify-center bg-gradient-to-br from-[#dfcfbd]/50 to-[#dfcfbd]/30">
                              <Text className="text-xl font-bold text-[#5c4d3d]">
                                {creator.username?.[0]?.toUpperCase() || 'U'}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View className="ml-3 flex-1">
                          <View className="flex-row items-center">
                            <Text className="text-base font-semibold text-gray-800">
                              {creator.full_name || creator.username || 'Anonymous'}
                            </Text>
                            <View className="ml-2 rounded-full bg-[#dfcfbd]/20 px-2 py-0.5">
                              <Text className="text-xs text-[#5c4d3d]">Author</Text>
                            </View>
                          </View>

                          <View className="mt-1 flex-row items-center">
                            <AntDesign name="calendar" size={14} color="#8b7355" />
                            <Text className="ml-1 text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="rounded-full bg-[#dfcfbd]/10 p-2">
                        <AntDesign name="user" size={16} color="#8b7355" />
                      </View>
                    </View>
                  </AnimatedPressable>
                )}
                <Separator className="mb-6" />

                {/* Post Content */}
                <Animated.View entering={FadeInDown.duration(600).delay(600)} className="mb-8">
                  {post.content && renderContent(post.content)}
                </Animated.View>

                {/* Engagement Actions */}
                <Animated.View entering={FadeInDown.duration(600).delay(800)} className="mb-6">
                  <View className="flex-row flex-wrap items-center justify-center gap-8">
                    <Button
                      onPress={handleLike}
                      disabled={updating || !userId}
                      className={cn(isLiked ? 'bg-[#dfcfbd]' : 'bg-[#dfcfbd]', 'p-2')}
                      size="sm">
                      <AntDesign
                        name={isLiked ? 'heart' : 'hearto'}
                        size={24}
                        color={isLiked ? '#d16969' : '#8b7355'}
                      />
                      <Text className="ml-2">{likeCount}</Text>
                    </Button>

                    <Button onPress={toggleComments} className="bg-[#dfcfbd] p-2" size="sm">
                      <FontAwesome name="comments" size={24} color="#8b7355" />
                      <Text>{commentCount}</Text>
                    </Button>

                    <Button
                      onPress={() => {
                        if (post) {
                          Share.share({
                            title: post.title,
                            message: `Check out this post: ${post.title}`,
                            url: `https://ideaclinic-forum.vercel.app/forum/post/${post.id}`,
                          }).catch((err) => console.error('Error sharing:', err));
                        }
                      }}
                      size="icon"
                      className="bg-[#dfcfbd] p-1">
                      <AntDesign name="sharealt" size={24} color="#8b7355" />
                    </Button>
                  </View>
                </Animated.View>
              </View>
            </ScrollView>

            {/* Comments Sheet - Replace the previous animated view */}
          </View>
        </KeyboardAvoidingView>
      </Container>
      <Sheet
        ref={commentsSheetRef}
        onChange={handleSheetChanges}
        snapPoints={['70%']}
        enablePanDownToClose
        index={-1}>
        <BottomSheetScrollView style={{ flex: 1 }}>
          <View className="border-b border-accent bg-card p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-[#5c4d3d]">
                Comments ({commentCount})
              </Text>
              <Pressable onPress={toggleComments} className="rounded-full bg-[#dfcfbd]/30 p-2">
                <AntDesign name="close" size={20} color="#8b7355" />
              </Pressable>
            </View>
          </View>

          <View className="flex-1 bg-[#f9f5f0]/50 px-4 pb-4 pt-2">
            <FlashList
              data={comments}
              renderItem={renderComment}
              estimatedItemSize={100}
              onEndReached={hasMoreComments ? fetchMoreComments : null}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                loadingComments ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#8b7355" />
                  </View>
                ) : (
                  <View className="mt-6 items-center py-8">
                    <Text className="text-base text-[#5c4d3d]">No comments yet</Text>
                    <Text className="mt-2 text-center text-[#8b7355]">
                      Be the first to share your thoughts!
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={
                loadingComments && comments.length > 0 ? (
                  <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#8b7355" />
                  </View>
                ) : null
              }
            />

            <View className="mt-2 overflow-hidden rounded-lg border border-[#dfcfbd]/20 bg-background shadow-sm">
              <TextInput
                ref={inputRef}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Write a comment..."
                className="rounded-lg bg-card p-3 text-gray-800"
                multiline
                maxLength={500}
              />
              <View className="h-px w-full bg-[#dfcfbd]/20" />
              <Pressable
                onPress={submitComment}
                disabled={commenting || !newComment.trim() || !userId}
                className={`items-center justify-center bg-[#dfcfbd]/10 p-3 ${
                  commenting || !newComment.trim() || !userId ? 'opacity-50' : ''
                }`}>
                <Text className="text-center font-medium text-[#5c4d3d]">
                  {commenting ? 'Posting...' : 'Post Comment'}
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetScrollView>
      </Sheet>
    </>
  );
}
