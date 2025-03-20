import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View,
  Linking,
  Platform
} from 'react-native';

import { Container } from '~/components/Container';

// Colors based on the provided color scheme
const COLORS = Platform.OS === 'ios' 
  ? {
      background: 'rgb(255, 247, 230)',
      foreground: 'rgb(2, 8, 23)',
      root: 'rgb(255, 255, 255)',
      card: 'rgb(248, 236, 205)',
      destructive: 'rgb(239, 68, 68)',
      primary: 'rgb(100, 83, 49)',
      neutral: 'rgb(86, 82, 76)',
      grey: 'rgb(142, 142, 147)'
    }
  : {
      background: 'rgb(255, 247, 230)',
      foreground: 'rgb(236, 227, 202)',
      root: 'rgb(228, 216, 180)',
      card: 'rgb(248, 236, 205)',
      destructive: 'rgb(255, 98, 102)',
      primary: 'rgb(255, 159, 160)',
      neutral: 'rgb(86, 82, 76)',
      grey: 'rgb(86, 82, 76)'
    };

export default function SupportPage() {
  const router = useRouter();

  const supportCategories = [
    
    {
      title: 'Contact Support',
      icon: 'mail',
      description: 'Get in touch with our support team via email.',
      onPress: () => Linking.openURL('mailto:support@example.com')
    },
    {
      title: 'Report a Bug',
      icon: 'bug',
      description: 'Found something not working correctly? Let us know.',
      onPress: () => {}
    },
    {
      title: 'Request a Feature',
      icon: 'bulb',
      description: 'Suggest new features or improvements for the app.',
      onPress: () => {}
    }
  ];

  const handleBack = () => {
    router.back();
  };

  return (
    <Container>
      <ScrollView 
        className="flex-1" 
        style={{ backgroundColor: COLORS.background }}
      >
        {/* Support Banner */}
        <View 
          className="mx-4 my-4 p-6 rounded-lg shadow-sm items-center" 
          style={{ backgroundColor: COLORS.root }}
        >
          <Ionicons name="help-buoy" size={60} color={COLORS.primary} />
          <Text className="text-lg font-bold mt-3" style={{ color: COLORS.neutral }}>
            How can we help you?
          </Text>
          <Text className="text-center mt-2" style={{ color: COLORS.grey }}>
            Select a category below or browse through our frequently asked questions.
          </Text>
        </View>

        {/* Support Categories */}
        <View className="mx-4 mb-8">
          {supportCategories.map((category, index) => (
            <TouchableOpacity 
              key={index}
              className="flex-row p-4 mb-4 rounded-lg shadow-sm" 
              style={{ backgroundColor: COLORS.root }}
              onPress={category.onPress}
            >
              <View 
                className="items-center justify-center w-12 h-12 rounded-full mr-4"
                style={{ backgroundColor: COLORS.card }}
              >
                <Ionicons name={category.icon} size={24} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-bold" style={{ color: COLORS.neutral }}>
                  {category.title}
                </Text>
                <Text className="text-sm mt-1" style={{ color: COLORS.grey }}>
                  {category.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}