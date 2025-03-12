import { useStore } from '~/store/store';

export function UseSignOut() {
  const { signOut } = useStore();
  return signOut;
}
