import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function SettingsPage() {
  return (
    <Container>
      <ScreenContent path="app/(settings)/settings" title="Settings" />
    </Container>
  );
}
