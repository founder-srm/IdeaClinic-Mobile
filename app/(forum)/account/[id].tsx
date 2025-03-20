import { Ionicons } from '@expo/vector-icons';
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
  Platform
} from 'react-native';

import { Container } from '~/components/Container';
import { UseSignOut } from '~/hooks/useSignOut';
import { useStore } from "~/store/store";
import { supabase } from '~/utils/supabase';
import { Tables } from 'database.types'
import { useUser } from '~/hooks/useUser';

// Define the profile data type based on your actual schema
type ProfileData = Tables<'profiles'>;

// Colors based on your provided color scheme
const COLORS = Platform.OS === 'ios' 
  ? {
      background: 'rgb(255, 247, 230)',
      foreground: 'rgb(2, 8, 23)',
      root: 'rgb(255, 255, 255)',
      card: 'rgb(248, 236, 205)',
      destructive: 'rgb(239, 68, 68)',
      primary: 'rgb(100, 83, 49)',
      neutral: 'rgb(86, 82, 76)',
      grey: 'rgb(142, 142, 147)'
    }
  : {
      background: 'rgb(255, 247, 230)',
      foreground: 'rgb(236, 227, 202)',
      root: 'rgb(228, 216, 180)',
      card: 'rgb(248, 236, 205)',
      destructive: 'rgb(255, 98, 102)',
      primary: 'rgb(255, 159, 160)',
      neutral: 'rgb(86, 82, 76)',
      grey: 'rgb(86, 82, 76)'
    };

// Replacement for the imported fetchUserProfile function
const fetchUserProfile = async (): Promise<ProfileData | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

// Modify the getUserId function to safely handle params.id
const getUserId = (params: Record<string, any>, currentId: string | null): string | null => {
  if (
    params.id && 
    typeof params.id === 'string' && 
    params.id.includes('function')
  ) {
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
  const { id:cId } = useUser();
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

  const menuItems = isCurrentUser ? [
    { 
      title: 'Edit profile', 
      icon: 'person-circle-outline', 
      onPress: handleEditProfile 
    },
    { 
      title: 'Support', 
      icon: 'help-circle-outline',
      onPress: () => router.push('/support')
    },
    { 
      title: 'About the app', 
      icon: 'information-circle-outline',
      onPress: () => router.push('/about')
    },
  ] : [];

  // Show loading indicator only when initially loading and no profile data
  if (loading && !profile) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.background }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="mt-4" style={{ color: COLORS.neutral }}>Loading profile...</Text>
        </View>
      </Container>
    );
  }

  // Use fallback values from user store if profile data is incomplete
  const displayName = profile?.full_name || (user?.user_metadata?.full_name || (isCurrentUser ? 'My Account' : 'User'));
  const displayEmail = profile?.email || (isCurrentUser ? user?.email : 'Email not available');
  const displayUsername = profile?.username || user?.user_metadata?.username;
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || 'https://via.placeholder.com/100';

  return (
    <Container>
      <ScrollView 
        className="flex-1" 
        style={{ backgroundColor: COLORS.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile section */}
        <View 
          className="items-center pt-10 pb-6 shadow-sm mb-4 mt-[7rem] mx-4 rounded-lg" 
          style={{ backgroundColor: COLORS.root }}
        >
          <View className="relative">
            <Image 
              source={{ uri: displayAvatar }} 
              className="w-24 h-24 rounded-full"
              style={{ borderWidth: 2, borderColor: COLORS.primary }}
            />
            {isCurrentUser && (
              <TouchableOpacity 
                className="absolute bottom-0 right-0 rounded-full p-1"
                style={{ backgroundColor: COLORS.primary }}
                onPress={handleEditProfile}
              >
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
          
          <Text className="text-xl font-bold mt-3" style={{ color: COLORS.neutral }}>
            {displayName}
          </Text>
          
          {displayUsername && (
            <Text className="text-sm" style={{ color: COLORS.grey }}>@{displayUsername}</Text>
          )}
          
          <View className="flex-row items-center mt-1">
            <Ionicons name="mail-outline" size={14} color={COLORS.primary} />
            <Text className="text-sm ml-1" style={{ color: COLORS.neutral }}>
              {displayEmail}
            </Text>
          </View>
          
          {profile?.title && (
            <View 
              className="px-3 py-1 rounded-full mt-3" 
              style={{ backgroundColor: COLORS.card }}
            >
              <Text style={{ color: COLORS.primary }}>{profile.title}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            className="mt-3 flex-row items-center" 
            onPress={handleShowAdditionalInfo}
          >
            <Text className="text-sm mr-1" style={{ color: COLORS.primary }}>
              {showAdditionalInfo ? 'Hide details' : 'Show more details'}
            </Text>
            <Ionicons 
              name={showAdditionalInfo ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
          
          {showAdditionalInfo && (
            <View className="w-full px-6 mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: COLORS.card }}>
              {profile?.bio && (
                <View className="mb-3">
                  <Text className="text-xs mb-1" style={{ color: COLORS.grey }}>BIO</Text>
                  <Text style={{ color: COLORS.neutral }}>{profile.bio}</Text>
                </View>
              )}
              
              {profile?.dept && (
                <View className="mb-3">
                  <Text className="text-xs mb-1" style={{ color: COLORS.grey }}>DEPARTMENT</Text>
                  <Text style={{ color: COLORS.neutral }}>{profile.dept}</Text>
                </View>
              )}
              
              <View className="mb-3">
                <Text className="text-xs mb-1" style={{ color: COLORS.grey }}>LAST UPDATED</Text>
                <Text style={{ color: COLORS.neutral }}>
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
            className="rounded-lg shadow-sm mx-4 mb-4" 
            style={{ backgroundColor: COLORS.root }}
          >
            <Text className="px-5 pt-4 pb-2 text-sm font-medium" style={{ color: COLORS.grey }}>SETTINGS</Text>
            
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                className={`flex-row justify-between items-center px-5 py-4 ${
                  index !== menuItems.length - 1 ? 'border-b' : ''
                }`}
                style={{ 
                  borderBottomColor: index !== menuItems.length - 1 ? COLORS.card : 'transparent' 
                }}
                onPress={item.onPress}
              >
                <View className="flex-row items-center">
                  <Ionicons name={item.icon} size={22} color={COLORS.primary} className="mr-3" />
                  <Text style={{ color: COLORS.neutral }}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Account Actions - Only show for current user */}
        {isCurrentUser && (
          <View 
            className="rounded-lg shadow-sm mx-4 mb-8" 
            style={{ backgroundColor: COLORS.root }}
          >
            <Text className="px-5 pt-4 pb-2 text-sm font-medium" style={{ color: COLORS.grey }}>ACCOUNT</Text>
            
            <TouchableOpacity 
              className="flex-row items-center px-5 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: COLORS.card }}
              onPress={() => Alert.alert('Coming soon', 'This feature is not yet available.')}
            >
              <Ionicons name="sync-outline" size={22} color={COLORS.primary} className="mr-3" />
              <Text style={{ color: COLORS.neutral }}>Sync account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center px-5 py-4"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={COLORS.destructive} className="mr-3" />
              <Text style={{ color: COLORS.destructive }}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back button for viewing other profiles */}
        {!isCurrentUser && (
          <View className="items-center my-6">
            <TouchableOpacity 
              className="flex-row items-center px-6 py-3 rounded-full" 
              style={{ backgroundColor: COLORS.card }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={18} color={COLORS.primary} className="mr-2" />
              <Text style={{ color: COLORS.primary }}>Back to post</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="items-center py-6 mb-6">
          <Text style={{ color: COLORS.grey, fontSize: 12 }}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </Container>
  );
}