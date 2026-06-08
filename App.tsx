import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/Lib/queryClient';
import AppNavigator from './src/navigation/AppNavigator';

// import {
//   requestNotificationPermission,
//   getFCMToken,
//   setupNotificationListeners,
// } from './src/utils/firebaseNotification';

export default function App() {
  // useEffect hata diya temporarily

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0F1923" />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
