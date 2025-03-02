import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';

import { getProfileById } from '~/actions/forum/profile';
import { Container } from '~/components/Container';
import { EnhancedAvatarHeader } from '~/components/EnhancedAvatarHeader';
import ForumPostsList from '~/components/ForumPostsList';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { UseSignOut } from '~/hooks/useSignOut';
import { useUser } from '~/hooks/useUser';
import { COLORS } from '~/theme/colors';
import { supabase } from '~/utils/supabase';

export default function ForumPage() {
  const { isAuthenticated, user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const signOut = UseSignOut();

  useEffect(() => {
    async function fetchProfile() {
      if (isAuthenticated && user?.id) {
        try {
          const userProfile = await getProfileById(user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isAuthenticated, user?.id]);

  const handleLogout = async () => {
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

  const handleSettings = () => {
    router.push(`/account/${user?.id}`);
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // Example: Search posts by title or content
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to perform search');
    } finally {
      setIsSearching(false);
    }
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
          <Text className="text-lg">Loading profile...</Text>
        </View>
      </Container>
    );
  }

  // Build profile data from both user and profile information
  const profileData = {
    color: COLORS.dark.foreground,
    image: profile?.avatar_url || 'https://via.placeholder.com/100',
    author: profile?.full_name || profile?.username || user?.id || 'User',
    about:
      profile?.bio ||
      (profile?.title && profile?.dept ? `${profile.title} at ${profile.dept}` : 'Forum Member'),
  };

  return (
    <EnhancedAvatarHeader
      backgroundColor={profileData.color}
      image={profileData.image}
      title={profileData.author}
      subtitle={profileData.about}
      onLogout={handleLogout}
      onSettings={handleSettings}
      onSearch={handleSearch}>
      <ScrollView className="flex-1">
        <View className="flex gap-4 p-4">
          {isSearching ? (
            <Text className="text-center text-lg">Searching...</Text>
          ) : searchResults.length > 0 ? (
            <>
              <Text className="text-center text-xl font-semibold">Search Results</Text>
              {searchResults.map((result) => (
                <View key={result.id} className="rounded-lg bg-primary p-3">
                  <Text className="font-bold text-white">{result.title}</Text>
                  <Text className="mt-1 text-white text-opacity-80" numberOfLines={2}>
                    {result.content}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <>
              <Text className="text-center text-2xl font-semibold">Welcome to the Forum</Text>
              <View className="flex gap-4">
                <Link href="/post/hello" className="rounded-lg bg-blue-500 p-4">
                  <Text className="text-center text-white">View Sample Post</Text>
                </Link>
                <Link href="/account/123" className="rounded-lg bg-green-500 p-4">
                  <Text className="text-center text-white">View Sample Account</Text>
                </Link>
              </View>
              <ForumPostsList />
            </>
          )}
        </View>
      </ScrollView>
    </EnhancedAvatarHeader>
  );
}
