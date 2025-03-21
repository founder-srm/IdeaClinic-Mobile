import { useRouter } from 'expo-router';
import { type SetStateAction, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';

import { Container } from '~/components/Container';
import CloudinaryUploader from '~/components/cloudinary/CloudinaryUploader';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { useUser } from '~/hooks/useUser';
import { useKeyboard } from '~/lib/useKeyboard';
import config from '~/utils/config';
import { supabase } from '~/utils/supabase';

// Environment variables would be better, but for the example:
const CLOUDINARY_CLOUD_NAME = config.cloudinary_cloud_name;
const CLOUDINARY_UPLOAD_PRESET = 'ideaclinic-banners';

export default function PostCreationPage() {
  const router = useRouter();
  const { id: userId } = useUser();
  const id = uuid.v4();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [labelColor, setLabelColor] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cloudinaryResource, setCloudinaryResource] = useState<any>(null);
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
    {
      value: 'Open Ended Discussion',
      label: 'Open Ended Discussion',
      color: '#FFA500',
    },
    {
      value: 'Professor Input Needed',
      label: 'Professor Input Needed',
      color: '#9933CC',
    },
    { value: 'Student Project', label: 'Student Project', color: '#FFD700' },
    { value: 'Other', label: 'Other', color: '#CCCCCC' },
  ];

  const handleTagChange = (itemValue: SetStateAction<string>) => {
    setSelectedTag(itemValue);
    const selectedTagObj = tags.find((tag) => tag.value === itemValue);
    if (selectedTagObj) {
      setLabelColor(selectedTagObj.color);
    }
  };

  const handleImageSelected = (uri: string | null) => {
    setLocalImageUri(uri);
  };

  const handleImageUploaded = (response: any) => {
    if (response && response.secure_url) {
      setCloudinaryUrl(response.secure_url);
      console.log(response.secure_url);
      setCloudinaryResource(response);
      ToastAndroid.show('Image uploaded successfully!', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show('Failed to upload image', ToastAndroid.LONG);
    }
  };

  const handleImageRemoved = () => {
    // Clear the Cloudinary related state when image is removed
    setCloudinaryUrl(null);
    setCloudinaryResource(null);
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
      // Use the Cloudinary URL if available, otherwise use local URI
      const bannerUrl = cloudinaryUrl || localImageUri;

      const { data, error } = await supabase.from('posts').insert({
        id,
        creator_id: userId,
        content,
        title,
        likes: [],
        label: selectedTag,
        label_color: labelColor,
        banner_url: bannerUrl,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: isKeyboardVisible ? keyboardHeight / 2 : 0,
          }}
          keyboardShouldPersistTaps="handled">
          <View className="mt-12 space-y-6 p-4">
            {/* Header */}
            <View className="m-6">
              <Text className="mt-1 text-sm text-gray-500">
                Share your thoughts with the community
              </Text>
            </View>

            <View className="overflow-hidden rounded-xl bg-card p-6 shadow-sm">
              {/* Title Input */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-semibold text-gray-700">Title</Text>
                <Input
                  placeholder="Add a descriptive title"
                  value={title}
                  onChangeText={setTitle}
                  className="border-gray-200 bg-white/50 px-4 py-3 text-base"
                />
              </View>

              {/* Tag Selector */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-semibold text-gray-700">Category</Text>
                <View className="overflow-hidden rounded-lg border border-gray-200 bg-white/50">
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
                  <View className="mt-3 flex-row items-center rounded-full bg-gray-100 px-3 py-1.5">
                    <View
                      style={{ backgroundColor: labelColor }}
                      className="mr-2 h-4 w-4 rounded-full"
                    />
                    <Text className="text-sm font-medium text-gray-700">{selectedTag}</Text>
                  </View>
                )}
              </View>

              {/* Content Input */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-semibold text-gray-700">Content</Text>
                <Textarea
                  placeholder="Share your thoughts, ideas, or questions..."
                  value={content}
                  onChangeText={setContent}
                  numberOfLines={10}
                  className="min-h-[180px] border-gray-200 bg-white/50 px-4 py-3 text-base"
                />
              </View>

              {/* Cloudinary Image Upload */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-semibold text-gray-700">Banner Image</Text>
                <View className="rounded-lg border border-dashed border-gray-300 bg-white/50 p-4">
                  <CloudinaryUploader
                    onImageSelected={handleImageSelected}
                    onImageUploaded={handleImageUploaded}
                    onImageRemoved={handleImageRemoved}
                    cloudName={CLOUDINARY_CLOUD_NAME}
                    uploadPreset={CLOUDINARY_UPLOAD_PRESET}
                  />
                  {cloudinaryUrl && (
                    <View className="mt-2 flex-row items-center">
                      <View className="mr-2 h-5 w-5 items-center justify-center rounded-full bg-green-100">
                        <Text className="text-green-600">✓</Text>
                      </View>
                      <Text className="text-xs text-green-600">Successfully uploaded to cloud</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <Button
                onPress={makePost}
                disabled={updating || !title}
                className={`mt-4 w-full rounded-lg py-3.5 shadow-sm ${updating ? 'opacity-70' : ''}`}>
                {updating ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="ml-2 text-base font-medium text-white">Creating post...</Text>
                  </View>
                ) : (
                  <Text className="text-base font-medium text-white">Publish Post</Text>
                )}
              </Button>

              {/* Cancel Button */}
              <Pressable
                onPress={() => router.push('/forum')}
                className="mt-3 items-center justify-center py-2">
                <Text className="text-sm font-medium text-gray-500">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
