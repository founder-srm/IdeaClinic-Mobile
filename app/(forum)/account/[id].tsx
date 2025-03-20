import { Ionicons } from '@expo/vector-icons';
import type { Tables } from 'database.types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { Container } from '~/components/Container';
import { UseSignOut } from '~/hooks/useSignOut';
import { useUser } from '~/hooks/useUser';
import { useStore } from '~/store/store';
import { COLORS } from '~/theme/colors';
import { supabase } from '~/utils/supabase';

// Define the profile data type based on your actual schema
type ProfileData = Tables<'profiles'>;

// Replacement for the imported fetchUserProfile function
const fetchUserProfile = async (): Promise<ProfileData | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

// Modify the getUserId function to safely handle params.id
// biome-ignore lint/suspicious/noExplicitAny: it is wat it is
const getUserId = (params: Record<string, any>, currentId: string | null): string | null => {
  if (params.id && typeof params.id === 'string' && params.id.includes('function')) {
    console.log('Detected function in params.id, using currentUserId instead');
    return currentId;
  }

  // Normal case - use the ID from params if available
  return params.id && typeof params.id === 'string'
    ? params.id
    : typeof params.id === 'object' && params.id !== null
      ? JSON.stringify(params.id)
      : currentId; // Default to current user's ID as fallback
};

export default function AccountPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id: cId } = useUser();
  const currentUserId = cId ? String(cId) : null;

  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = React.useState(false);
  const [isCurrentUser, setIsCurrentUser] = React.useState(false);
  const { user } = useStore();

  const signOut = UseSignOut();

  // Use the safer getUserId function to handle function references
  const userId = getUserId(params, currentUserId);

  //  Debug logs
  // console.log("Raw params:", JSON.stringify(params));
  // console.log("Raw params.id:", params.id, typeof params.id);
  // console.log("Raw cId:", cId, typeof cId);
  // console.log("Fixed userId:", userId);

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);

      if (userId) {
        // Fetch specific user profile by ID
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile by ID:', error);
          throw error;
        }

        // Check if this is the current logged-in user
        const isCurrentUserProfile = userId === currentUserId;
        // console.log('Current user check:', { userId, currentUserId, isCurrentUser: isCurrentUserProfile });
        setIsCurrentUser(isCurrentUserProfile);
        setProfile(profileData);
      } else if (currentUserId) {
        // No valid ID provided, load current user's profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId)
          .single();

        if (error) {
          console.error('Error fetching current user profile:', error);
          throw error;
        }

        setProfile(profileData);
        setIsCurrentUser(true);
      } else {
        // Fallback to fetchUserProfile if currentUserId is not available
        const currentUserProfile = await fetchUserProfile();
        setProfile(currentUserProfile);
        setIsCurrentUser(true);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, currentUserId]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, [loadProfile]);

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

  const handleEditProfile = () => {
    router.push('/settings');
  };

  const handleShowAdditionalInfo = () => {
    setShowAdditionalInfo(!showAdditionalInfo);
  };

  const menuItems = isCurrentUser
    ? [
        {
          title: 'Edit profile',
          icon: 'person-circle-outline' as const,
          onPress: handleEditProfile,
        },
        {
          title: 'Support',
          icon: 'help-circle-outline' as const,
          onPress: () => router.push('/support'),
        },
        {
          title: 'About the app',
          icon: 'information-circle-outline' as const,
          onPress: () => router.push('/about'),
        },
      ]
    : [];

  // Show loading indicator only when initially loading and no profile data
  if (loading && !profile) {
    return (
      <Container>
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: COLORS.dark.background }}>
          <ActivityIndicator size="large" color={COLORS.dark.primary} />
          <Text className="mt-4" style={{ color: COLORS.dark.neutral }}>
            Loading profile...
          </Text>
        </View>
      </Container>
    );
  }

  // Use fallback values from user store if profile data is incomplete
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || (isCurrentUser ? 'My Account' : 'User');
  const displayEmail = profile?.email || (isCurrentUser ? user?.email : 'Email not available');
  const displayUsername = profile?.username || user?.user_metadata?.username;
  const displayAvatar =
    profile?.avatar_url || user?.user_metadata?.avatar_url || 'https://via.placeholder.com/100';

  return (
    <Container>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: COLORS.dark.background }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Profile section */}
        <View
          className="mx-4 mb-4 mt-[7rem] items-center rounded-lg pb-6 pt-10 shadow-sm"
          style={{ backgroundColor: COLORS.dark.root }}>
          <View className="relative">
            <Image
              source={{ uri: displayAvatar }}
              className="h-24 w-24 rounded-full"
              style={{ borderWidth: 2, borderColor: COLORS.dark.primary }}
            />
            {isCurrentUser && (
              <TouchableOpacity
                className="absolute bottom-0 right-0 rounded-full p-1"
                style={{ backgroundColor: COLORS.dark.primary }}
                onPress={handleEditProfile}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>

          <Text className="mt-3 text-xl font-bold" style={{ color: COLORS.dark.neutral }}>
            {displayName}
          </Text>

          {displayUsername && (
            <Text className="text-sm" style={{ color: COLORS.dark.grey }}>
              @{displayUsername}
            </Text>
          )}

          <View className="mt-1 flex-row items-center">
            <Ionicons name="mail-outline" size={14} color={COLORS.dark.accent} />
            <Text className="ml-1 text-sm" style={{ color: COLORS.dark.neutral }}>
              {displayEmail}
            </Text>
          </View>

          {profile?.title && (
            <View
              className="mt-3 rounded-full px-3 py-1"
              style={{ backgroundColor: COLORS.dark.card }}>
              <Text style={{ color: COLORS.dark.accent }}>{profile.title}</Text>
            </View>
          )}

          <TouchableOpacity
            className="mt-3 flex-row items-center"
            onPress={handleShowAdditionalInfo}>
            <Text className="mr-1 text-sm" style={{ color: COLORS.dark.accent }}>
              {showAdditionalInfo ? 'Hide details' : 'Show more details'}
            </Text>
            <Ionicons
              name={showAdditionalInfo ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.dark.primary}
            />
          </TouchableOpacity>

          {showAdditionalInfo && (
            <View
              className="mt-4 w-full px-6 pt-4"
              style={{ borderTopWidth: 1, borderTopColor: COLORS.dark.card }}>
              {profile?.bio && (
                <View className="mb-3">
                  <Text className="mb-1 text-xs" style={{ color: COLORS.dark.grey }}>
                    BIO
                  </Text>
                  <Text style={{ color: COLORS.dark.neutral }}>{profile.bio}</Text>
                </View>
              )}

              {profile?.dept && (
                <View className="mb-3">
                  <Text className="mb-1 text-xs" style={{ color: COLORS.dark.grey }}>
                    DEPARTMENT
                  </Text>
                  <Text style={{ color: COLORS.dark.neutral }}>{profile.dept}</Text>
                </View>
              )}

              <View className="mb-3">
                <Text className="mb-1 text-xs" style={{ color: COLORS.dark.grey }}>
                  LAST UPDATED
                </Text>
                <Text style={{ color: COLORS.dark.neutral }}>
                  {profile?.updated_at
                    ? new Date(profile?.updated_at).toLocaleDateString()
                    : 'Not available'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Settings Menu - Only show for current user */}
        {isCurrentUser && (
          <View
            className="mx-4 mb-4 rounded-lg shadow-sm"
            style={{ backgroundColor: COLORS.dark.root }}>
            <Text
              className="px-5 pb-2 pt-4 text-sm font-medium"
              style={{ color: COLORS.dark.grey }}>
              SETTINGS
            </Text>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                className={`flex-row items-center justify-between px-5 py-4 ${
                  index !== menuItems.length - 1 ? 'border-b' : ''
                }`}
                style={{
                  borderBottomColor:
                    index !== menuItems.length - 1 ? COLORS.dark.card : 'transparent',
                }}
                onPress={item.onPress}>
                <View className="flex-row items-center">
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={COLORS.dark.accent}
                    className="mr-3"
                  />
                  <Text style={{ color: COLORS.dark.neutral }}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.dark.accent} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Account Actions - Only show for current user */}
        {isCurrentUser && (
          <View
            className="mx-4 mb-8 rounded-lg shadow-sm"
            style={{ backgroundColor: COLORS.dark.root }}>
            <Text
              className="px-5 pb-2 pt-4 text-sm font-medium"
              style={{ color: COLORS.dark.grey }}>
              ACCOUNT
            </Text>

            <TouchableOpacity
              className="flex-row items-center px-5 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: COLORS.dark.card }}
              onPress={() => Alert.alert('Coming soon', 'This feature is not yet available.')}>
              <Ionicons name="sync-outline" size={22} color={COLORS.dark.accent} className="mr-3" />
              <Text style={{ color: COLORS.dark.neutral }}>Sync account</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center px-5 py-4" onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={22}
                color={COLORS.dark.destructive}
                className="mr-3"
              />
              <Text style={{ color: COLORS.dark.destructive }}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back button for viewing other profiles */}
        {!isCurrentUser && (
          <View className="my-6 items-center">
            <TouchableOpacity
              className="flex-row items-center rounded-full px-6 py-3"
              style={{ backgroundColor: COLORS.dark.card }}
              onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={18} color={COLORS.dark.primary} className="mr-2" />
              <Text style={{ color: COLORS.dark.primary }}>Back to post</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mb-6 items-center py-6">
          <Text style={{ color: COLORS.dark.grey, fontSize: 12 }}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </Container>
  );
}
