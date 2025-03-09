import { useRouter } from 'expo-router';
import { SetStateAction, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, ToastAndroid } from 'react-native';
import uuid from 'react-native-uuid';

import { Container } from '~/components/Container';
import CloudinaryUploader from '~/components/cloudinary/CloudinaryUploader';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { useUser } from '~/hooks/useUser';
import config from '~/utils/config';
import { supabase } from '~/utils/supabase';

// Environment variables would be better, but for the example:
const CLOUDINARY_CLOUD_NAME = config.cloudinary_cloud_name;
const CLOUDINARY_UPLOAD_PRESET = 'ideaclinic-banners';

export default function PostCreationPage() {
  const router = useRouter();
  const { id: userId } = useUser();
  const id = uuid.v4();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [labelColor, setLabelColor] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
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
    { value: 'Open Ended Discussion', label: 'Open Ended Discussion', color: '#FFA500' },
    { value: 'Professor Input Needed', label: 'Professor Input Needed', color: '#9933CC' },
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
        // Store additional Cloudinary metadata if needed
        banner_metadata: cloudinaryResource
          ? JSON.stringify({
              public_id: cloudinaryResource.public_id,
              resource_type: cloudinaryResource.resource_type,
              version: cloudinaryResource.version,
            })
          : null,
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
            <Separator className="my-2" />
            {/* Cloudinary Image Upload */}
            <View className="mb-6">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Banner Image</Text>
              <CloudinaryUploader
                onImageSelected={handleImageSelected}
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
                cloudName={CLOUDINARY_CLOUD_NAME}
                uploadPreset={CLOUDINARY_UPLOAD_PRESET}
              />
              {cloudinaryUrl && (
                <Text className="mt-1 text-xs text-green-600">✓ Uploaded to cloud</Text>
              )}
            </View>
            <Separator className="my-2" />
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
