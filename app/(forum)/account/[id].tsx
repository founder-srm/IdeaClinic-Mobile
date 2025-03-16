import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '~/components/Container';

export default function AccountPage() {
  const { id } = useLocalSearchParams();

  const user = {
    name: id,
    avatar:
      'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg', // Placeholder image
  };

  return (
    <Container>
      <ScrollView>
        <View style={styles.profileContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
        </View>

        <View style={styles.menuContainer}>
          {['Edit profile', 'Payment', 'Support', 'About the app'].map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Text style={styles.menuText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity disabled style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuText: {
    fontSize: 16,
    color: '#000000',
  },
  logoutButton: {
    padding: 15,
    alignItems: 'center',
    opacity: 0.5, // Disabled effect
  },
  logoutText: {
    fontSize: 16,
    color: '#888',
  },
});
