module.exports = ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    extra: {
      ...config.expo?.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
    },
  },
});
