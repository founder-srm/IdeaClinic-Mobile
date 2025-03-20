import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getProfileById } from '~/actions/forum/profile';
import { Container } from '~/components/Container';
import { EnhancedAvatarHeader } from '~/components/EnhancedAvatarHeader';
import ForumPostsList from '~/components/ForumPostsList';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import type { Database } from '~/database.types';
import { UseSignOut } from '~/hooks/useSignOut';
import { useUser } from '~/hooks/useUser';
import { COLORS } from '~/theme/colors';
import { supabase } from '~/utils/supabase';

export default function ForumPage() {
  const { isAuthenticated, user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<
    Database['public']['Tables']['posts']['Row'][]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
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

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .textSearch('title,content', query, {
          type: 'websearch',
          config: 'english',
        })
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isSearchActive) {
        await handleSearch(query);
      } else {
        await fetchProfile();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    setIsSearchActive(false);
    setQuery('');
    setSearchResults([]);
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
      {/* Search Bar UI */}
      <View className="relative w-full p-2">
        {isSearchActive ? (
          <View className="flex-row items-center gap-2 rounded-2xl bg-gray-100 px-3 py-2">
            {/* Back Button */}
            <TouchableOpacity onPress={handleBack}>
              <Text className="text-gray-600">←</Text>
            </TouchableOpacity>
            {/* Search Input */}
            <TextInput
              className="flex-1 text-base"
              placeholder="Search forum..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSearch(query)}
              autoFocus
            />
            {/* Clear Input Button */}
            {isSearching ? (
              <ActivityIndicator size="small" color="gray" />
            ) : query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text className="text-gray-500">✖</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsSearchActive(true)}
            className="flex-row items-center gap-2 rounded-2xl bg-gray-200 px-3 py-2">
            <Text className="text-gray-600">🔍 Search...</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
              <Button size="sm" onPress={() => router.push('/details')}>
                <Text className="text-center">Component lib</Text>
              </Button>
              <ForumPostsList />
            </>
          )}
        </View>
      </ScrollView>
    </EnhancedAvatarHeader>
  );
}
