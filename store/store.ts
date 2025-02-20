import { AuthError, Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../utils/supabase';

export interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

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

export const useStore = create<AuthState & BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
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
      if (error) throw error;
      set({ session: data.session, user: data.user, authSuccess: true, authError: null });
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
      if (error) throw error;
      set({ session: data.session, user: data.user, authSuccess: true, authError: null });
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
