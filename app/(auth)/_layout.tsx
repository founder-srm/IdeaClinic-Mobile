import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';

export default function AuthTabLayout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    return () => {
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          display: 'none',
        },
        tabBarActiveTintColor: 'rgb(100, 83, 49)',
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          headerShown: false,
          animation: 'shift',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="sign-in" color={color} />,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          headerShown: false,
          animation: 'shift',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user-plus" color={color} />,
        }}
      />
    </Tabs>
  );
}
