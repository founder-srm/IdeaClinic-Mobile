import { ToastAndroid } from 'react-native';

import { useStore } from '~/store/store';
import { supabase } from '~/utils/supabase';

/**
 * Change user password
 *
 * This function handles password change requests by validating the new password
 * and updating it using Supabase authentication.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  // Validate inputs
  if (!currentPassword || !newPassword) {
    const message = 'Both current and new passwords are required';
    ToastAndroid.show(message, ToastAndroid.SHORT);
    throw new Error(message);
  }

  if (newPassword.length < 8) {
    const message = 'New password must be at least 8 characters long';
    ToastAndroid.show(message, ToastAndroid.LONG);
    throw new Error(message);
  }

  try {
    // Get current user's email
    const user = useStore.getState().user;

    if (!user || !user.email) {
      const message = 'User not found. Please sign in again.';
      ToastAndroid.show(message, ToastAndroid.LONG);
      throw new Error(message);
    }

    // First, verify the current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      const message = 'Current password is incorrect';
      ToastAndroid.show(message, ToastAndroid.LONG);
      throw new Error(message);
    }

    // Update password using Supabase
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      ToastAndroid.show(error.message, ToastAndroid.LONG);
      throw new Error(error.message);
    }

    if (!data.user) {
      const message = 'Failed to update password';
      ToastAndroid.show(message, ToastAndroid.LONG);
      throw new Error(message);
    }

    // Show success message
    ToastAndroid.show('Password changed successfully', ToastAndroid.SHORT);
  } catch (error) {
    console.error('Error changing password:', error);

    // If we haven't already shown a toast from the specific errors above
    if (!(error instanceof Error && error.message)) {
      ToastAndroid.show('Failed to change password. Please try again later.', ToastAndroid.LONG);
    }

    throw error instanceof Error
      ? error
      : new Error('Failed to change password. Please try again later.');
  }
}
