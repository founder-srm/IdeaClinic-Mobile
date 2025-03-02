import { Link, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header';

import { getProfileById } from '~/actions/forum/profile';
import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { useUser } from '~/hooks/useUser';
import { COLORS } from '~/theme/colors';

const Logout = require('~/assets/icons/logout.png');
const IconMenu = require('~/assets/icons/menu.png');

export default function ForumPage() {
  const { isAuthenticated, user } = useUser();
  const navigation = useNavigation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  function goBack() {
    navigation.goBack();
  }

  if (!isAuthenticated || !user) {
    return (
      <Container>
        <ScrollView>
          <View className="flex gap-4 p-4">
            <Text className="text-center text-2xl font-semibold">Welcome to the Forum</Text>
            <Text className="mt-4 text-center text-lg">Please sign in to view the forum.</Text>
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
    color: COLORS.dark.primary,
    image: profile?.avatar_url || 'https://via.placeholder.com/100',
    author: profile?.full_name || profile?.username || user?.id || 'User',
    about:
      profile?.bio ||
      (profile?.title && profile?.dept ? `${profile.title} at ${profile.dept}` : 'Forum Member'),
  };

  return (
    <AvatarHeaderScrollView
      leftTopIcon={Logout}
      leftTopIconOnPress={goBack}
      rightTopIcon={IconMenu}
      contentContainerStyle={{
        backgroundColor: '#1A1A1A',
        padding: 0,
      }}
      containerStyle={{ flex: 1 }}
      backgroundColor={profileData.color}
      hasBorderRadius
      image={profileData.image}
      subtitle={profileData.about}
      title={profileData.author}
      titleStyle={{ color: 'white', fontWeight: 'bold' }}
      showsVerticalScrollIndicator={false}>
      <Container>
        <View className="flex gap-4 p-4">
          <Text className="text-center text-2xl font-semibold">Welcome to the Forum</Text>
          <View className="flex gap-4">
            <Link href="/post/hello" className="rounded-lg bg-blue-500 p-4">
              <Text className="text-center text-white">View Sample Post</Text>
            </Link>
            <Link href="/account/123" className="rounded-lg bg-green-500 p-4">
              <Text className="text-center text-white">View Sample Account</Text>
            </Link>
          </View>
          {profile && (
            <View className="mt-4 rounded-lg bg-gray-800 p-4">
              <Text className="mb-2 text-center text-xl font-bold text-white">
                Profile Information
              </Text>
              {profile.full_name && <Text className="text-white">Name: {profile.full_name}</Text>}
              {profile.username && <Text className="text-white">Username: {profile.username}</Text>}
              {profile.email && <Text className="text-white">Email: {profile.email}</Text>}
              {profile.dept && <Text className="text-white">Department: {profile.dept}</Text>}
              {profile.title && <Text className="text-white">Title: {profile.title}</Text>}
              {profile.bio && <Text className="mt-2 text-white">Bio: {profile.bio}</Text>}
              <Text className="mt-2 text-xs text-gray-400">
                Last updated: {new Date(profile.updated_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </Container>
    </AvatarHeaderScrollView>
  );
}
