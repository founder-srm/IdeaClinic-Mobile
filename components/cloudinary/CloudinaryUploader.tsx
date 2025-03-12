/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native';

interface CloudinaryUploaderProps {
  onImageSelected: (imageUri: string | null) => void;
  onImageUploaded: (response: any) => void;
  onImageRemoved: () => void;
  cloudName: string;
  uploadPreset: string;
}

export default function CloudinaryUploader({
  onImageSelected,
  onImageUploaded,
  onImageRemoved,
  cloudName,
  uploadPreset,
}: CloudinaryUploaderProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const uploadFile = async (
    localAsset: ImagePicker.ImagePickerAsset
  ): Promise<{
    secure_url: string;
    public_id: string;
  }> => {
    const fileName = `post_image_${Date.now()}`;
    const journeyId = 'Banners'; // Folder name in Cloudinary
    const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', apiUrl);

      xhr.onload = () => {
        const res = JSON.parse(xhr.response);
        if (res.error) return reject(res.error);
        resolve({
          secure_url: res.secure_url,
          public_id: res.public_id,
        });
      };

      xhr.onerror = (error) => {
        reject(error);
      };

      xhr.ontimeout = (error) => {
        reject(new Error(`timeout: ${error}`));
      };

      const formData = new FormData();

      formData.append('file', {
        uri: localAsset.uri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      formData.append('upload_preset', uploadPreset);
      formData.append('folder', journeyId);
      formData.append('public_id', fileName);

      xhr.send(formData);
    });
  };

  // const deleteFromCloudinary = async (publicIdToDelete: string): Promise<boolean> => {
  //   // Using the Cloudinary API to delete images
  //   const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  //   return new Promise((resolve, reject) => {
  //     const xhr = new XMLHttpRequest();
  //     xhr.open('POST', apiUrl);
  //     xhr.setRequestHeader('Content-Type', 'application/json');

  //     xhr.onload = () => {
  //       const res = JSON.parse(xhr.response);
  //       if (res.error) return reject(res.error);
  //       resolve(res.result === 'ok');
  //     };

  //     xhr.onerror = (error) => {
  //       reject(error);
  //     };

  //     xhr.ontimeout = (error) => {
  //       reject(new Error(`timeout: ${error}`));
  //     };

  //     // Note: In production, you should use signed requests with API secret
  //     // For this example, we'll assume you have a backend endpoint that handles the deletion
  //     xhr.send(
  //       JSON.stringify({
  //         public_id: publicIdToDelete,
  //         upload_preset: uploadPreset, // Some Cloudinary configurations might require this
  //       })
  //     );
  //   });
  // };

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

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
      allowsMultipleSelection: false,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled) {
      // Save local URI for preview
      const asset = result.assets[0];
      setImageUri(asset.uri);
      onImageSelected(asset.uri);

      // Upload to Cloudinary
      try {
        setUploading(true);
        const cloudinaryResponse = await uploadFile(asset);
        setPublicId(cloudinaryResponse.public_id);

        onImageUploaded({
          secure_url: cloudinaryResponse.secure_url,
          public_id: cloudinaryResponse.public_id,
          resource_type: 'image',
          version: Date.now(),
        });
      } catch (error) {
        console.error('Upload error:', error);
        ToastAndroid.show('Failed to upload image to cloud', ToastAndroid.LONG);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    // if (publicId) {
    //   setDeleting(true);
    //   try {
    //     // Attempt to delete the image from Cloudinary
    //     const deleteResult = await deleteFromCloudinary(publicId);

    //     if (deleteResult) {
    //       ToastAndroid.show('Image removed from cloud', ToastAndroid.SHORT);
    //     } else {
    //       console.warn('Failed to delete image from Cloudinary');
    //     }

    //     // Regardless of cloud deletion result, update local state
    //     setImageUri(null);
    //     setPublicId(null);
    //     onImageSelected(null);
    //     onImageRemoved();
    //   } catch (error) {
    //     console.error('Error deleting image:', error);
    //     ToastAndroid.show('Error removing image from cloud', ToastAndroid.LONG);
    //   } finally {
    //     setDeleting(false);
    //   }
    // } else {
    //   // No public ID, just clear the local image
    //   setImageUri(null);
    //   onImageSelected(null);
    //   onImageRemoved();
    // }
    ToastAndroid.show('Removing image from cloud is not yet possible', ToastAndroid.LONG);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={pickImage}
        disabled={uploading || deleting}
        className="mb-2 flex items-center justify-center rounded-md bg-gray-100 py-2">
        <Text className="text-gray-700">
          {status?.granted ? 'Select and upload image' : 'Grant permission and select image'}
        </Text>
      </TouchableOpacity>

      {(uploading || deleting) && (
        <View className="h-48 items-center justify-center rounded-md border border-dashed border-gray-300">
          <ActivityIndicator color="#0000ff" size="large" />
          <Text className="mt-2 text-gray-500">
            {uploading ? 'Uploading to Cloudinary...' : 'Removing from Cloudinary...'}
          </Text>
        </View>
      )}

      {!uploading && !deleting && imageUri && (
        <View className="relative">
          <Image source={{ uri: imageUri }} className="h-48 w-full rounded-md" resizeMode="cover" />
          <TouchableOpacity
            onPress={handleRemoveImage}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-2">
            <Text className="text-xs text-white">Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {!uploading && !deleting && !imageUri && (
        <View className="h-48 items-center justify-center rounded-md border border-dashed border-gray-300">
          <Text className="text-gray-500">
            {status?.granted ? 'No image selected' : 'Media library permission required'}
          </Text>
        </View>
      )}
    </View>
  );
}
