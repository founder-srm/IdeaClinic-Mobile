import type { AuthError, Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../utils/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  signOut: () => Promise<void>;
  authError: AuthError | null;
  authSuccess: boolean;
  clearAuthStatus: () => void;
}

export const useStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  authError: null,
  authSuccess: false,
  clearAuthStatus: () => set({ authError: null, authSuccess: false }),
  signIn: async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        set({ authError: error, authSuccess: false });
        return { success: false, error };
      }
      set({
        session: data.session,
        user: data.user,
        authSuccess: true,
        authError: null,
      });
      return { success: true };
    } catch (error) {
      set({ authError: error as AuthError, authSuccess: false });
      return { success: false, error: error as AuthError };
    }
  },
  signUp: async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        set({ authError: error, authSuccess: false });
        return { success: false, error };
      }
      set({
        session: data.session,
        user: data.user,
        authSuccess: true,
        authError: null,
      });
      return { success: true };
    } catch (error) {
      set({ authError: error as AuthError, authSuccess: false });
      return { success: false, error: error as AuthError };
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));

export const useUser = () => useStore((state) => state.user);
export const useSession = () => useStore((state) => state.session);
export const useAuthStatus = () =>
  useStore((state) => ({
    loading: state.loading,
    error: state.authError,
    success: state.authSuccess,
  }));
