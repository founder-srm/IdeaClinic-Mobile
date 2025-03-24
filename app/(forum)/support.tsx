import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '~/components/Container';
import { COLORS } from '~/theme/colors';

export default function SupportPage() {
  const supportCategories = [
    {
      title: 'Contact Support',
      icon: 'mail' as const,
      description: 'Get in touch with our support team via email.',
      onPress: () => Linking.openURL('mailto:ideas.dei.ktr@srmist.edu.in'),
    },
    {
      title: 'Report a Bug',
      icon: 'bug' as const,
      description: 'Found something not working correctly? Let us know.',
      onPress: () => Linking.openURL('mailto:ideas.dei.ktr@srmist.edu.in'),
    },
    {
      title: 'Request a Feature',
      icon: 'bulb' as const,
      description: 'Suggest new features or improvements for the app.',
      onPress: () => Linking.openURL('mailto:ideas.dei.ktr@srmist.edu.in'),
    },
  ];

  return (
    <Container>
      <ScrollView className="mt-[6rem] flex-1" style={{ backgroundColor: COLORS.dark.background }}>
        {/* Support Banner */}
        <View
          className="mx-4 my-4 items-center rounded-lg p-6 shadow-sm"
          style={{ backgroundColor: COLORS.dark.root }}>
          <Ionicons name="help-buoy" size={60} color={COLORS.dark.primary} />
          <Text className="mt-3 text-lg font-bold" style={{ color: COLORS.dark.neutral }}>
            How can we help you?
          </Text>
          <Text className="mt-2 text-center" style={{ color: COLORS.dark.grey }}>
            Select a category below or browse through our frequently asked questions.
          </Text>
        </View>

        {/* Support Categories */}
        <View className="mx-4 mb-8">
          {supportCategories.map((category, index) => (
            <TouchableOpacity
              key={category.title}
              className="mb-4 flex-row rounded-lg p-4 shadow-sm"
              style={{ backgroundColor: COLORS.dark.root }}
              onPress={category.onPress}>
              <View
                className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.dark.card }}>
                <Ionicons name={category.icon} size={24} color={COLORS.dark.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-bold" style={{ color: COLORS.dark.neutral }}>
                  {category.title}
                </Text>
                <Text className="mt-1 text-sm" style={{ color: COLORS.dark.grey }}>
                  {category.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.dark.primary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}
