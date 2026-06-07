import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import AppNavigator from './src/navigation/AppNavigator';
import {
  requestNotificationPermission,
  getFCMToken,
  setupNotificationListeners,
} from './src/utils/firebaseNotification';

export default function App() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const initNotifications = async () => {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        await getFCMToken();
        unsubscribe = setupNotificationListeners();
      }
    };
    initNotifications();
    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0F1923" />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
