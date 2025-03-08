import { useEffect, useState } from 'react';

import { Text } from '~/components/nativewindui/Text';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { useStore } from '~/store/store';

export function AuthAlert() {
  const [open, setOpen] = useState(false);
  const { authError, clearAuthStatus } = useStore();

  useEffect(() => {
    if (authError) {
      setOpen(true);
    }
  }, [authError]);

  const handleClose = () => {
    setOpen(false);
    clearAuthStatus();
  };

  if (!authError) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Authentication Error</AlertDialogTitle>
          <AlertDialogDescription>
            {authError?.message || 'An error occurred during authentication'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onPress={handleClose}>
            <Text>Close</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
