import { useStore } from '../store/store';

export function useUser() {
  const { user, session } = useStore();

  return {
    user,
    session,
    isAuthenticated: !!session,
    email: user?.email,
    id: user?.id,
    metadata: user?.user_metadata,
    lastSignIn: session?.user?.last_sign_in_at,
    role: user?.role,
  };
}
