import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '~/components/Container';
import { COLORS } from '~/theme/colors';

export default function AboutPage() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const teamMembers = [
    {
      name: 'Suvan Gs',
      role: 'Lead Developer',
      image: 'https://via.placeholder.com/60',
    },
    {
      name: 'Vijay Makkad',
      role: 'Developer',
      image: 'https://via.placeholder.com/60',
    },
    {
      name: 'Suman S',
      role: 'Frontend Developer',
      image: 'https://via.placeholder.com/60',
    },
    {
      name: 'Mohammad Ariffin',
      role: 'Backend Developer',
      image: 'https://via.placeholder.com/60',
    },
    {
      name: 'Vinayak Chandra',
      role: 'Frontend Developer',
      image: 'https://via.placeholder.com/60',
    },
    {
      name: 'Suman S',
      role: 'Frontend Developer',
      image: 'https://via.placeholder.com/60',
    },
  ];

  return (
    <Container>
      <ScrollView className="mt-12 flex-1" style={{ backgroundColor: COLORS.dark.background }}>
        {/* App Info */}
        <View
          className="mx-4 my-4 items-center rounded-lg px-6 py-8 shadow-sm"
          style={{ backgroundColor: COLORS.dark.root }}>
          <Image source={require('../../assets/logo.png')} className="h-20 w-20 rounded-lg" />

          <Text className="mt-4 text-2xl font-bold" style={{ color: COLORS.dark.neutral }}>
            IdeaClinic
          </Text>

          <Text className="mt-2 text-center" style={{ color: COLORS.dark.grey }}>
            Version 1.0.0
          </Text>

          <View className="my-6 h-1 w-16" style={{ backgroundColor: COLORS.dark.card }} />

          <Text className="mb-6 text-center" style={{ color: COLORS.dark.neutral }}>
            The bridge between great products and the people who build them.
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => handleOpenLink('https://ideaclinic-forum.vercel.app/')}>
            <Text style={{ color: COLORS.dark.primary }}>Visit our website</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.dark.primary} className="ml-1" />
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View
          className="mx-4 mb-4 rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: COLORS.dark.root }}>
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.dark.neutral }}>
            Key Features
          </Text>

          <View className="mb-4 flex-row items-center">
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={COLORS.dark.primary}
              className="mr-3"
            />
            <Text style={{ color: COLORS.dark.neutral }}>Personalized user profiles</Text>
          </View>

          <View className="mb-4 flex-row items-center">
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={COLORS.dark.primary}
              className="mr-3"
            />
            <Text style={{ color: COLORS.dark.neutral }}>Cross-platform sync</Text>
          </View>

          <View className="mb-4 flex-row items-center">
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={COLORS.dark.primary}
              className="mr-3"
            />
            <Text style={{ color: COLORS.dark.neutral }}>Cloud storage integration</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={COLORS.dark.primary}
              className="mr-3"
            />
            <Text style={{ color: COLORS.dark.neutral }}>Data privacy and security</Text>
          </View>
        </View>

        {/* Team */}
        <View
          className="mx-4 mb-4 rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: COLORS.dark.root }}>
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.dark.neutral }}>
            Meet the Team
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {teamMembers.map((member, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <View key={index} className="items-center">
                <Image
                  source={{ uri: member.image }}
                  className="h-12 w-12 rounded-full"
                  style={{ borderWidth: 2, borderColor: COLORS.dark.primary }}
                />
                <Text className="mt-2 text-sm font-bold" style={{ color: COLORS.dark.neutral }}>
                  {member.name}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.dark.grey }}>
                  {member.role}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
