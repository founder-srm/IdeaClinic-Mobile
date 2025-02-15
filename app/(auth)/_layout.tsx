import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function AuthTabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'rgb(100, 83, 49)' }}>
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="sign-in" color={color} />,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user-plus" color={color} />,
        }}
      />
    </Tabs>
  );
}
