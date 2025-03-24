import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import * as React from 'react';
import { FlatList, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '~/components/Container';
import { COLORS } from '~/theme/colors';

export default function AboutPage() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const teamMembers = [
    {
      name: 'Suvan Gs',
      role: 'Project Lead',
      image:
        'https://cdn.sanity.io/images/xzfuyp1r/production/0762f061fb9e4b2f017314a2f1f34b5c882e9f05-187x187.png',
    },
    {
      name: 'Vijay Makkad',
      role: 'React Native Developer',
      image:
        'https://cdn.sanity.io/images/xzfuyp1r/production/0c588c3f639d1e84c79deeab3c114bc5f5b3e692-1600x1200.png?rect=353,310,923,880',
    },
    {
      name: 'Suman S',
      role: 'React Native Developer',
      image: 'https://avatars.githubusercontent.com/u/113275985?v=4',
    },
    {
      name: 'Mohammad Ariffin',
      role: 'Notifications & Backend Developer',
      image:
        'https://cdn.sanity.io/images/xzfuyp1r/production/3620de2e5943a2faffb526ea9a7f588ca357e095-1204x1600.jpg?rect=435,262,375,372',
    },
    {
      name: 'Vinayak Chandra',
      role: 'Frontend Developer',
      image: 'https://avatars.githubusercontent.com/u/78032279?v=4',
    },
  ];

  const renderTeamMember = ({ item }: { item: { name: string; role: string; image: string } }) => (
    <View className="mb-4 items-center" style={{ width: '30%' }}>
      <Image
        source={{ uri: item.image }}
        className="h-12 w-12 rounded-full"
        style={{ borderWidth: 2, borderColor: COLORS.dark.primary }}
      />
      <Text className="mt-2 text-sm font-bold" style={{ color: COLORS.dark.neutral }}>
        {item.name}
      </Text>
      <Text className="text-xs" style={{ color: COLORS.dark.grey }}>
        {item.role}
      </Text>
    </View>
  );

  return (
    <Container>
      <ScrollView className="mt-[6rem] flex-1" style={{ backgroundColor: COLORS.dark.background }}>
        {/* App Info */}
        <View
          className="mx-4 my-4 items-center rounded-lg px-6 py-8 shadow-sm"
          style={{ backgroundColor: COLORS.dark.root }}>
          <Image source={require('../../assets/logo.png')} className="h-20 w-20 rounded-lg" />

          <Text className="mt-4 text-2xl font-bold" style={{ color: COLORS.dark.neutral }}>
            IdeaClinic
          </Text>

          <Text className="mt-2 text-center" style={{ color: COLORS.dark.grey }}>
            Version {Application.nativeApplicationVersion}{' '}
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
            <Text style={{ color: COLORS.dark.neutral }}>Cloud storage Buckets</Text>
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

          <FlatList
            data={teamMembers}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={renderTeamMember}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </Container>
  );
}
