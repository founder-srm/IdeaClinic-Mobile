import { useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function PostPage() {
  const { slug } = useLocalSearchParams();

  return (
    <Container>
      <ScreenContent path={`app/forum/post/${slug}`} title={`Post: ${slug}`} />
    </Container>
  );
}
