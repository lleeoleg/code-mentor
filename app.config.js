let buildPropsPlugin = null;
try {
  // Делаем плагин опциональным: проект должен стартовать даже без него.
  // Для применения настроек (HTTP/cleartext) установите пакет:
  //   npx expo install expo-build-properties
  require.resolve('expo-build-properties');
  buildPropsPlugin = [
    'expo-build-properties',
    {
      android: { usesCleartextTraffic: true },
      ios: {
        infoPlist: {
          NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
        },
      },
    },
  ];
} catch {
  buildPropsPlugin = null;
}

module.exports = ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    scheme: 'codementor',
    plugins: [
      ...(config.expo?.plugins || []),
      ...(buildPropsPlugin ? [buildPropsPlugin] : []),
    ],
    extra: {
      ...config.expo?.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
    },
  },
});
