import { useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function AccountPage() {
  const { id } = useLocalSearchParams();

  return (
    <Container>
      <ScreenContent path={`app/forum/account/${id}`} title={`Account: ${id}`} />
    </Container>
  );
}
