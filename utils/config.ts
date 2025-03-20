const currentEnvironment = 'development'; // 'production' or 'development'

const config: {
  [key in 'development']: {
    cloudinary_cloud_name: string;
    cloudinary_api_key: string;
    cloudinary_api_secret: string;
    novu_application_identifier: string;
  };
} = {
  development: {
    cloudinary_cloud_name: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    cloudinary_api_key: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '',
    cloudinary_api_secret: process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || '',
    novu_application_identifier: process.env.EXPO_PUBLIC_NOVU_CLIENT_APP_ID || '',
  },
};

export default config[currentEnvironment];
