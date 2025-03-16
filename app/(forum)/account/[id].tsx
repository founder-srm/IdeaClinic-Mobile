import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '~/components/Container';
import { UseSignOut } from '~/hooks/useSignOut';

export default function AccountPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const signOut = UseSignOut();

  const user = {
    name: id,
    avatar:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/7b84f9f8974ab57c2b5a48b349fe3a0d?_a=AQAEuj9', // Placeholder image
  };

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

  const menuItems = ['Edit profile', 'Payment', 'Support', 'About the app'];

  return (
    <Container>
      <ScrollView>
        <View style={styles.profileContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Text style={styles.menuText}>{item}</Text>
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
    color: '#D8BFD8',
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
