const currentEnvironment = 'development'; // 'production' or 'development'

const config: {
  [key in 'development']: {
    cloudinary_cloud_name: string;
    cloudinary_api_key: string;
    cloudinary_api_secret: string;
  };
} = {
  development: {
    cloudinary_cloud_name: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    cloudinary_api_key: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '',
    cloudinary_api_secret: process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || '',
  },
};

export default config[currentEnvironment];
