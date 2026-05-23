import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
        unsubscribe = setupNotificationListeners(); //  bahar variable mein store karo
      }
    };

    initNotifications();

    return () => {
      unsubscribe?.(); // sync cleanup - sahi tarika
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F1923" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}