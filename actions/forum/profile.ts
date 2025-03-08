import { Database } from '~/database.types';
import { supabase } from '~/utils/supabase';

/**
 * Fetches a user profile by ID from the database
 * @param userId - The user ID to fetch the profile for
 * @returns The user profile data or null if not found
 */
export async function getProfileById(
  userId: Database['public']['Tables']['profiles']['Row']['id']
) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      console.error('Error getting profile:', error.message);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getProfileById:', error);
    return null;
  }
}

/**
 * Updates a user profile in the database
 * @param userId - The user ID to update the profile for
 * @param profileData - The profile data to update
 * @returns Boolean indicating success or failure
 */
export async function updateProfile(userId: string, profileData: any) {
  try {
    const { error } = await supabase.from('profiles').update(profileData).eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return false;
  }
}
