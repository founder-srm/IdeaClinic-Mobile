import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View, RefreshControl, ToastAndroid } from 'react-native';

import { getProfileById } from '~/actions/forum/profile';
import { Container } from '~/components/Container';
import { EnhancedAvatarHeader } from '~/components/EnhancedAvatarHeader';
import ForumPostsList from '~/components/ForumPostsList';
import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import type { Database } from '~/database.types';
import { UseSignOut } from '~/hooks/useSignOut';
import { useUser } from '~/hooks/useUser';
import type { ForumPost } from '~/lib/types';
import { COLORS } from '~/theme/colors';
import { supabase } from '~/utils/supabase';

export default function ForumPage() {
  const { isAuthenticated, user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const signOut = UseSignOut();

  // Fetch user profile
  const fetchProfile = async () => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }
    try {
      const userProfile = await getProfileById(user.id);
      console.log('User profile:', userProfile);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);

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

      if (data) {
        const formattedPosts: ForumPost[] = data.map((post) => ({
          ...post,
          creator: post.profiles as { avatar_url: string; full_name: string },
          likesCount: post.likes?.length ?? 0,
          likes: post.likes ?? [], // Convert null to empty array
          isLiked: post.likes?.includes(user?.id ?? '') ?? false,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: callback later
  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      fetchPosts();
    } catch (error) {
      ToastAndroid.show(`Failed to refresh posts: ${error}`, ToastAndroid.SHORT);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <Container>
        <ScrollView>
          <View className="flex gap-4 p-4">
            <Text className="text-center text-2xl font-semibold">Welcome to the Forum</Text>
            <Text className="mt-4 text-center text-lg">Please sign in to view the forum.</Text>
            <Button
              className="mt-4 rounded-lg bg-blue-500 p-4"
              size="md"
              onPress={() => router.push('/login')}>
              <Text className="text-center text-white">Sign In</Text>
            </Button>
          </View>
        </ScrollView>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b7355" />
        </View>
      </Container>
    );
  }

  // Profile Data
  const profileData = {
    color: COLORS.dark.neutral,
    image:
      profile?.avatar_url ||
      'https://rzyymqwpkbvqhzkyvbsx.supabase.co/storage/v1/object/public/avatars/users/user_acc.png',
    author: profile?.full_name || profile?.username || user?.email || 'Forum Member',
    about:
      profile?.bio || `${profile?.title ?? ''} at ${profile?.dept ?? ''}`.trim() || 'Forum Member',
  };

  return (
    <EnhancedAvatarHeader
      backgroundColor={profileData.color}
      image={profileData.image}
      title={profileData.author}
      subtitle={profileData.about}
      onLogout={handleLogout}
      onSettings={user.id}>
      <ScrollView
        className="flex gap-4 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Button size="sm" onPress={() => router.push('/details')}>
          <Text className="text-center">Component lib</Text>
        </Button>
        <ForumPostsList
          posts={posts}
          isLoading={isLoading}
          error={error}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </ScrollView>
    </EnhancedAvatarHeader>
  );
}
