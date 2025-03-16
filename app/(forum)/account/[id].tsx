import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fetchUserProfile, ProfileData } from '~/actions/settings/account';
import { Container } from '~/components/Container';
import { UseSignOut } from '~/hooks/useSignOut';
import { useStore } from "~/store/store";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { user } = useStore();

  const signOut = UseSignOut();

  // Load user profile data
  React.useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const userData = await fetchUserProfile();
        setProfile(userData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const menuItems = [
    { title: 'Edit profile', icon: 'person-circle-outline' },
    { title: 'Support', icon: 'help-circle-outline' },
    { title: 'About the app', icon: 'information-circle-outline' },
  ];

  return (
    <Container>
      <ScrollView>
        <View style={styles.profileContainer}>
          <Image source={{ uri: profile?.avatar_url }} style={styles.avatar} />
          <Text style={styles.name}>{profile?.full_name}</Text>
          <Text style={styles.name}>{profile?.bio}</Text>
          <Text style={styles.name}>{user?.email}</Text>
          <Text style={styles.name}>{profile?.title}</Text>
          <Text style={styles.name}>{profile?.dept}</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color="#000" style={styles.menuIcon} />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#35362d',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a383cc',
    marginTop: 10,
  },
  menuContainer: {
    marginTop: 30,
  },
  menuItem: {
    flexDirection: 'row', // Align text & icon in row
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 18,
    color: '#000000',
  },
  logoutButton: {
    padding: 15,
    alignItems: 'center',
    opacity: 0.8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
});
