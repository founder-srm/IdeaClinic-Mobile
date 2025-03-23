import { decode } from 'base64-arraybuffer';
import { ToastAndroid } from 'react-native';

import { useStore } from '~/store/store';
import { supabase } from '~/utils/supabase';

export interface ProfileData {
  avatar_url: string;
  bio: string | null;
  dept: string | null;
  full_name: string | null;
  title: string | null;
  username: string | null;
}

/**
 * Fetch the user profile data from Supabase
 */
export async function fetchUserProfile() {
  try {
    const user = useStore.getState().user;

    if (!user) {
      ToastAndroid.show('User not found. Please sign in again.', ToastAndroid.LONG);
      throw new Error('User not found');
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error) {
      ToastAndroid.show(`Error fetching profile: ${error.message}`, ToastAndroid.LONG);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    ToastAndroid.show('Failed to load profile data', ToastAndroid.LONG);
    throw error;
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(profileData: ProfileData) {
  try {
    const user = useStore.getState().user;

    if (!user) {
      ToastAndroid.show('User not found. Please sign in again.', ToastAndroid.LONG);
      throw new Error('User not found');
    }

    const { error } = await supabase.from('profiles').update(profileData).eq('id', user.id);

    if (error) {
      ToastAndroid.show(`Error updating profile: ${error.message}`, ToastAndroid.LONG);
      throw error;
    }

    ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    ToastAndroid.show('Failed to update profile', ToastAndroid.LONG);
    throw error;
  }
}

/**
 * Upload user avatar image
 */
export async function uploadUserAvatar(base64Image: string, fileExt = 'png') {
  try {
    const user = useStore.getState().user;

    if (!user) {
      ToastAndroid.show('User not found. Please sign in again.', ToastAndroid.LONG);
      throw new Error('User not found');
    }

    const fileName = `${user.id}.${fileExt}`;
    const contentType = `image/${fileExt}`;

    // Check if avatar already exists
    const { data: existingFiles } = await supabase.storage.from('avatars').list('users', {
      search: fileName,
    });

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let result: { data: any; error: any };

    // Convert base64 string to ArrayBuffer
    const fileBuffer = decode(base64Image);

    if (existingFiles && existingFiles.length > 0) {
      // Update existing avatar
      result = await supabase.storage.from('avatars').update(`users/${fileName}`, fileBuffer, {
        contentType,
        upsert: true,
      });
    } else {
      // Upload new avatar
      result = await supabase.storage.from('avatars').upload(`users/${fileName}`, fileBuffer, {
        contentType,
      });
    }

    if (result.error) {
      ToastAndroid.show(`Error uploading avatar: ${result.error.message}`, ToastAndroid.LONG);
      throw result.error;
    }

    // Get public URL for the avatar
    const { data: publicURL } = supabase.storage.from('avatars').getPublicUrl(`users/${fileName}`);

    // Update user profile with new avatar URL
    if (publicURL) {
      await updateUserProfile({
        ...(await fetchUserProfile()),
        avatar_url: publicURL.publicUrl,
      });
    }

    ToastAndroid.show('Avatar updated successfully', ToastAndroid.SHORT);
    return publicURL?.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    ToastAndroid.show('Failed to upload avatar', ToastAndroid.LONG);
    throw error;
  }
}
