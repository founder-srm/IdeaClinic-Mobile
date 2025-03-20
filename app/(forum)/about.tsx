import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image, Linking, Platform } from 'react-native';

import { Container } from '~/components/Container';

// Colors based on the provided color scheme
const COLORS =
  Platform.OS === 'ios'
    ? {
        background: 'rgb(255, 247, 230)',
        foreground: 'rgb(2, 8, 23)',
        root: 'rgb(255, 255, 255)',
        card: 'rgb(248, 236, 205)',
        destructive: 'rgb(239, 68, 68)',
        primary: 'rgb(100, 83, 49)',
        neutral: 'rgb(86, 82, 76)',
        grey: 'rgb(142, 142, 147)',
      }
    : {
        background: 'rgb(255, 247, 230)',
        foreground: 'rgb(236, 227, 202)',
        root: 'rgb(228, 216, 180)',
        card: 'rgb(248, 236, 205)',
        destructive: 'rgb(255, 98, 102)',
        primary: 'rgb(255, 159, 160)',
        neutral: 'rgb(86, 82, 76)',
        grey: 'rgb(86, 82, 76)',
      };

export default function AboutPage() {
  const router = useRouter();

  const handleOpenLink = (url: any) => {
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
      <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
        {/* App Info */}
        <View
          className="mx-4 my-4 items-center rounded-lg px-6 py-8 shadow-sm"
          style={{ backgroundColor: COLORS.root }}>
          <Image source={require('../../assets/logo.png')} className="h-20 w-20 rounded-lg" />

          <Text className="mt-4 text-2xl font-bold" style={{ color: COLORS.neutral }}>
            IdeaClinic
          </Text>

          <Text className="mt-2 text-center" style={{ color: COLORS.grey }}>
            Version 1.0.0
          </Text>

          <View className="my-6 h-1 w-16" style={{ backgroundColor: COLORS.card }} />

          <Text className="mb-6 text-center" style={{ color: COLORS.neutral }}>
            The bridge between great products and the people who build them.
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => handleOpenLink('https://ideaclinic-forum.vercel.app/')}>
            <Text style={{ color: COLORS.primary }}>Visit our website</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.primary} className="ml-1" />
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View
          className="mx-4 mb-4 rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: COLORS.root }}>
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.neutral }}>
            Key Features
          </Text>

          <View className="mb-4 flex-row items-center">
            <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} className="mr-3" />
            <Text style={{ color: COLORS.neutral }}>Personalized user profiles</Text>
          </View>

          <View className="mb-4 flex-row items-center">
            <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} className="mr-3" />
            <Text style={{ color: COLORS.neutral }}>Cross-platform sync</Text>
          </View>

          <View className="mb-4 flex-row items-center">
            <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} className="mr-3" />
            <Text style={{ color: COLORS.neutral }}>Cloud storage integration</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} className="mr-3" />
            <Text style={{ color: COLORS.neutral }}>Data privacy and security</Text>
          </View>
        </View>

        {/* Team */}
        <View
          className="mx-4 mb-4 rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: COLORS.root }}>
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.neutral }}>
            Meet the Team
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {teamMembers.map((member, index) => (
              <View key={index} className="items-center">
                <Image
                  source={{ uri: member.image }}
                  className="h-12 w-12 rounded-full"
                  style={{ borderWidth: 2, borderColor: COLORS.primary }}
                />
                <Text className="mt-2 text-sm font-bold" style={{ color: COLORS.neutral }}>
                  {member.name}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.grey }}>
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
