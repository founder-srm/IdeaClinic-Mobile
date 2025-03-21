import { useRouter, useSegments } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';

import { useUser } from '../hooks/useUser';
import { useStore } from '../store/store';
import { supabase } from '../utils/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, user, session } = useUser();

  // Debug logging
  useEffect(() => {
    console.log('[Auth State]', { isAuthenticated, user, session });
  }, [isAuthenticated, user, session]);

  // Session management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Initial Session]', session);
      useStore.setState({ session, user: session?.user ?? null });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth Change]', { event: _event, session });
      useStore.setState({ session, user: session?.user ?? null });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigation protection
  // biome-ignore lint/correctness/useExhaustiveDependencies: lol
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(forum)' || segments[0] === '(settings)';
    const isRootRoute = segments[0] === '+not-found';

    console.log('[Navigation]', {
      segments,
      inAuthGroup,
      inProtectedGroup,
      isRootRoute,
      isAuthenticated,
    });

    if (!session && inProtectedGroup) {
      // If not authenticated and trying to access protected routes
      router.replace('/(auth)/signup');
    } else if (session && inAuthGroup) {
      // If authenticated and trying to access auth routes
      router.replace('/(forum)/forum');
    } else if (session && isRootRoute) {
      // If authenticated and on the root route, redirect to forum
      router.replace('/(forum)/forum');
    }
  }, [session, segments]);

  return <>{children}</>;
}
