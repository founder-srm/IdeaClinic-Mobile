import * as ImagePicker from 'expo-image-picker';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  View,
  ToastAndroid,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';

import {
  fetchUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  ProfileData,
} from '~/actions/settings/account';
import { changePassword } from '~/actions/settings/password';
import { Container } from '~/components/Container';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { ThemeToggle } from '~/components/nativewindui/ThemeToggle';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';
import { Textarea } from '~/components/ui/textarea';
import { useStore } from '~/store/store';

export default function SettingsPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = React.useState('account');
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [autoUpdate, setAutoUpdate] = React.useState(true);

  // Keyboard handling
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);
  const inputPositionAnim = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Editable fields state
  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [tempFieldValue, setTempFieldValue] = React.useState('');
  const [activeInputY, setActiveInputY] = React.useState(0);

  // Keyboard event listeners
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardVisible(true);

      // Only adjust scroll if we're actively editing a field
      if (editingField && activeInputY > 0) {
        // Calculate how much we need to scroll to make the input visible
        const scrollToPosition = Math.max(0, activeInputY - 120);

        // Scroll to the input position
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: scrollToPosition,
            animated: true,
          });
        }, 100);
      }
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      Animated.timing(inputPositionAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [editingField, activeInputY]);

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

  const handleEditField = (field: string, value: string, yPosition: number) => {
    setEditingField(field);
    setTempFieldValue(value || '');
    setActiveInputY(yPosition);
  };

  const handleSaveField = async (field: string) => {
    if (!profile) return;

    try {
      const updatedProfile = { ...profile, [field]: tempFieldValue };
      await updateUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setEditingField(null);
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempFieldValue('');
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to change your avatar.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      try {
        setUploadingAvatar(true);
        const fileExt = result.assets[0].uri.split('.').pop()?.toLowerCase() || 'png';
        const avatarUrl = await uploadUserAvatar(result.assets[0].base64, fileExt);

        if (avatarUrl && profile) {
          setProfile({ ...profile, avatar_url: avatarUrl });
        }
      } catch (error) {
        console.error('Avatar upload failed:', error);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword) {
      ToastAndroid.show('Please fill in all password fields', ToastAndroid.SHORT);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleGeneralSave = () => {
    ToastAndroid.show('General settings saved!', ToastAndroid.SHORT);
  };

  // Render editable field component
  const renderEditableField = (
    label: string,
    field: keyof ProfileData,
    value: string | null,
    isMultiline = false
  ) => {
    const isEditing = editingField === field;

    return (
      <View
        className="mb-4"
        onLayout={(event) => {
          const { y } = event.nativeEvent.layout;
          // Store the position of this field for later keyboard adjustments
          if (field === editingField) {
            setActiveInputY(y);
          }
        }}>
        <Label className="mb-1.5">{label}</Label>
        {isEditing ? (
          <View className={isMultiline ? 'flex-col' : 'flex-row'}>
            {isMultiline ? (
              <Textarea
                value={tempFieldValue}
                onChangeText={setTempFieldValue}
                autoFocus
                className="mb-2"
                placeholder={`Enter your ${label.toLowerCase()}...`}
              />
            ) : (
              <Input
                value={tempFieldValue}
                onChangeText={setTempFieldValue}
                autoFocus
                className="flex-1"
                onFocus={() => {
                  // When an input gets focus, capture its current position
                  if (isEditing) {
                    // We'll use this position later to adjust the scroll
                  }
                }}
              />
            )}
            <View className={isMultiline ? 'flex-row' : 'ml-2 flex-row'}>
              <Button variant="outline" onPress={() => handleSaveField(field)} className="mr-2">
                <Text>Save</Text>
              </Button>
              <Button variant="destructive" onPress={handleCancelEdit}>
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={(event) => {
              // Get the position from the event to find where to scroll when keyboard appears
              const { pageY } = event.nativeEvent;
              handleEditField(field, value || '', pageY);
            }}
            className={`rounded border border-border bg-card p-2.5 ${isMultiline ? 'min-h-[80px]' : ''}`}>
            <Text>{value || 'Not set'}</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 mt-6"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: keyboardVisible ? 300 : 100 }}>
        <Container>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setEditingField(null); // Clear editing state when changing tabs
              Keyboard.dismiss();
            }}
            className="mx-auto mt-12 w-full flex-col gap-1.5">
            <TabsList className="mb-4 w-full flex-row">
              <TabsTrigger value="general" className="flex-1">
                <Text>General</Text>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-1">
                <Text>Account</Text>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex-1">
                <Text>Password</Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure general app settings.</CardDescription>
                </CardHeader>
                <CardContent className="native:gap-2 gap-4">
                  <View className="flex-row items-center justify-between">
                    <Label nativeID="dark-mode">Dark Mode</Label>
                    <ThemeToggle />
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Label nativeID="auto-update">Auto Update</Label>
                    <Switch id="auto-update" checked={autoUpdate} onCheckedChange={setAutoUpdate} />
                  </View>
                </CardContent>
                <CardFooter>
                  <Button onPress={handleGeneralSave}>
                    <Text>Save general settings</Text>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Tap on any field to edit your profile details.</CardDescription>
                </CardHeader>
                <CardContent className="native:gap-2 gap-4">
                  {loading ? (
                    <View className="items-center py-8">
                      <ActivityIndicator size="large" />
                      <Text className="mt-2">Loading profile...</Text>
                    </View>
                  ) : profile ? (
                    <>
                      <View className="mb-6 items-center">
                        <Pressable onPress={handlePickAvatar} disabled={uploadingAvatar}>
                          {uploadingAvatar ? (
                            <View className="h-24 w-24 items-center justify-center rounded-full bg-muted">
                              <ActivityIndicator />
                            </View>
                          ) : (
                            <Avatar alt="User Profile Picture" className="h-24 w-24">
                              <AvatarImage source={{ uri: profile.avatar_url }} />
                              <AvatarFallback>
                                <Text className="text-lg text-foreground">
                                  {profile.full_name?.charAt(0) ||
                                    profile.username?.charAt(0) ||
                                    '?'}
                                </Text>
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </Pressable>
                        <Text className="mt-2 text-muted-foreground">Tap to change avatar</Text>
                      </View>

                      <View className="mb-4">
                        <Label className="mb-1.5">Email</Label>
                        <View className="rounded border border-border bg-muted p-2.5">
                          <Text>{user?.email || 'Not available'}</Text>
                        </View>
                        <Text className="mt-1 text-xs text-muted-foreground">
                          Email cannot be changed
                        </Text>
                      </View>

                      {renderEditableField('Full Name', 'full_name', profile.full_name)}
                      {renderEditableField('Username', 'username', profile.username)}
                      {renderEditableField('Title', 'title', profile.title)}
                      {renderEditableField('Department', 'dept', profile.dept)}
                      {renderEditableField('Bio', 'bio', profile.bio, true)}
                    </>
                  ) : (
                    <View className="items-center py-8">
                      <Text>Failed to load profile. Please try again later.</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password here. After saving, you'll be logged out.
                  </CardDescription>
                </CardHeader>
                <CardContent className="native:gap-2 gap-4">
                  <View className="gap-1">
                    <Label nativeID="current">Current password</Label>
                    <Input
                      placeholder="********"
                      aria-labelledby="current"
                      secureTextEntry
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                    />
                  </View>
                  <View className="gap-1">
                    <Label nativeID="new">New password</Label>
                    <Input
                      placeholder="********"
                      aria-labelledby="new"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                  </View>
                </CardContent>
                <CardFooter>
                  <Button onPress={handlePasswordSave}>
                    <Text>Save password</Text>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
