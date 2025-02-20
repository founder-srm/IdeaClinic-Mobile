import { Icon } from '@roninoss/icons';
import { Link } from 'expo-router';
import { Platform, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';

const ROOT_STYLE: ViewStyle = { flex: 1 };

export default function WelcomeConsentScreen() {
  const { colors } = useColorScheme();
  return (
    <SafeAreaView style={ROOT_STYLE}>
      <View className="mx-auto max-w-sm flex-1 justify-between gap-4 px-8 py-4">
        <View className="ios:pt-8 pt-12">
          <Text variant="largeTitle" className="ios:text-left ios:font-black text-center font-bold">
            Welcome to
          </Text>
          <Text
            variant="largeTitle"
            className="ios:text-left ios:font-black text-primary text-center font-bold">
            Idea Clinic
          </Text>
        </View>
        <View className="gap-8">
          {FEATURES.map((feature) => (
            <View key={feature.title} className="flex-row gap-4">
              <View className="pt-px">
                <Icon
                  name={feature.icon}
                  size={38}
                  color={colors.primary}
                  ios={{ renderingMode: 'hierarchical' }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold">{feature.title}</Text>
                <Text variant="footnote">{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="gap-4">
          <View className="items-center">
            <Icon
              name="account-multiple"
              size={24}
              color={colors.primary}
              ios={{ renderingMode: 'hierarchical' }}
            />
            <Text variant="caption2" className="pt-1 text-center">
              By pressing continue, you agree to our{' '}
              <Link href="/terms-and-conditions">
                <Text variant="caption2" className="text-primary">
                  Terms of Service
                </Text>
              </Link>
            </Text>
          </View>
          <Link href="/(auth)/signup" replace asChild>
            <Button size={Platform.select({ ios: 'lg', default: 'md' })}>
              <Text color="primary">Continue</Text>
            </Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const FEATURES = [
  {
    title: 'Q&A with Faculty',
    description: 'Ask questions and get guidance from experienced professors in real-time.',
    icon: 'message-question-outline',
  },
  {
    title: 'Peer Mentorship',
    description: 'Connect with senior students and alumni for advice and project insights.',
    icon: 'account-multiple-outline',
  },
  {
    title: 'Team Events & Workshops',
    description: 'Keep track of on-campus events, workshops, and hackathons for project growth.',
    icon: 'calendar-check',
  },
] as const;
