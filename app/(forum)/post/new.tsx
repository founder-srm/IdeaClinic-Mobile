import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SetStateAction, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import uuid from 'react-native-uuid';

import { Container } from '~/components/Container';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { useUser } from '~/hooks/useUser';
import { supabase } from '~/utils/supabase';

export default function PostCreationPage() {
  const router = useRouter();
  const { id: userId } = useUser();
  const id = uuid.v4();
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [labelColor, setLabelColor] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const tags = [
    { value: 'Help Required', label: 'Help Required', color: '#FFCC00' },
    { value: 'New Idea', label: 'New Idea', color: '#007BFF' },
    { value: 'Looking for Team', label: 'Looking for Team', color: '#4CAF50' },
    { value: 'Needs Feedback', label: 'Needs Feedback', color: '#FF9800' },
    { value: 'Discussion', label: 'Discussion', color: '#333333' },
    { value: 'Resource Sharing', label: 'Resource Sharing', color: '#4285F4' },
    { value: 'Question', label: 'Question', color: '#C776FF' },
    { value: 'Tutorial', label: 'Tutorial', color: '#9D38BD' },
    { value: 'Success Story', label: 'Success Story', color: '#28A745' },
    { value: 'Open Ended Discussion', label: 'Open Ended Discussion', color: '#FFA500' },
    { value: 'Professor Input Needed', label: 'Professor Input Needed', color: '#9933CC' },
    { value: 'Student Project', label: 'Student Project', color: '#FFD700' },
    { value: 'Other', label: 'Other', color: '#CCCCCC' },
  ];

  const pickImage = async () => {
    // Check if we already have permission
    if (!status?.granted) {
      // Request permission if we don't have it
      const permissionResult = await requestPermission();

      if (!permissionResult.granted) {
        ToastAndroid.show(
          'Permission to access media library is required to upload images',
          ToastAndroid.LONG
        );
        return;
      }
    }

    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Comment: Future Cloudinary integration would go here
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    // Comment: Future Cloudinary delete functionality would go here
  };

  const handleTagChange = (itemValue: SetStateAction<string>) => {
    setSelectedTag(itemValue);
    const selectedTagObj = tags.find((tag) => tag.value === itemValue);
    if (selectedTagObj) {
      setLabelColor(selectedTagObj.color);
    }
  };

  async function testCreateThread({ threadId, title }: { threadId: string; title: string }) {
    try {
      const response = await fetch('https://notifications-microservice.vercel.app/create-thread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          userId,
          title,
        }),
      });

      const data = await response.json();
      console.log(data);
    } catch (error: any) {
      console.error('An error occurred', error);
      ToastAndroid.show('An error occurred', ToastAndroid.LONG);
    }
  }

  async function makePost() {
    if (title === '') {
      ToastAndroid.show('Please add a title', ToastAndroid.SHORT);
      return;
    }

    setUpdating(true);

    try {
      // Comment: In production, you would first upload image to Cloudinary and get URL
      // Then use that URL in the banner_url field below

      const { data, error } = await supabase.from('posts').insert({
        id,
        creator_id: userId,
        content,
        title,
        likes: [],
        label: selectedTag,
        label_color: labelColor,
        banner_url: imageUri, // This would be the Cloudinary URL in production
      });

      if (error) {
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      } else {
        testCreateThread({ threadId: id, title });
        ToastAndroid.show('Post created successfully', ToastAndroid.SHORT);
        console.log(data);
        router.push('/forum');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-6 p-4">
          <View>
            <Text className="mb-6 text-xl font-bold">Create New Post</Text>

            {/* Title Input */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Title</Text>
              <Input placeholder="Add a descriptive title" value={title} onChangeText={setTitle} />
            </View>

            {/* Tag Selector */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Category</Text>
              <View className="overflow-hidden rounded-md border border-gray-300">
                <Picker
                  selectedValue={selectedTag}
                  onValueChange={handleTagChange}
                  style={{ height: 50, width: '100%' }}>
                  <PickerItem label="Select a category" value="" />
                  {tags.map((tag) => (
                    <PickerItem
                      key={tag.value}
                      label={tag.label}
                      value={tag.value}
                      color={tag.color}
                    />
                  ))}
                </Picker>
              </View>
              {selectedTag && (
                <View className="mt-2 flex-row items-center">
                  <Text className="text-sm">Selected: </Text>
                  <View
                    style={{ backgroundColor: labelColor }}
                    className="ml-1 mr-1 h-3 w-3 rounded-full"
                  />
                  <Text className="text-sm font-medium">{selectedTag}</Text>
                </View>
              )}
            </View>

            {/* Content Input */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Content</Text>
              <Textarea
                placeholder="Share your thoughts, ideas, or questions..."
                value={content}
                onChangeText={setContent}
                numberOfLines={8}
                className="min-h-[160px]"
              />
            </View>

            {/* Image Upload */}
            <View className="mb-6">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Banner Image</Text>

              <TouchableOpacity
                onPress={pickImage}
                className="mb-2 flex items-center justify-center rounded-md bg-gray-100 py-2">
                <Text className="text-gray-700">
                  {status?.granted
                    ? 'Pick an image from camera roll'
                    : 'Grant permission and pick image'}
                </Text>
              </TouchableOpacity>

              {imageUri ? (
                <View className="relative">
                  <Image
                    source={{ uri: imageUri }}
                    className="h-48 w-full rounded-md"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={handleRemoveImage}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-2">
                    <Text className="text-xs text-white">Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="h-48 items-center justify-center rounded-md border border-dashed border-gray-300">
                  <Text className="text-gray-500">
                    {status?.granted ? 'No image selected' : 'Media library permission required'}
                  </Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <Button onPress={makePost} disabled={updating || !title} className="mt-4 w-full">
              {updating ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="ml-2 font-medium text-white">Creating post...</Text>
                </View>
              ) : (
                <Text className="font-medium text-white">Create Post</Text>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
