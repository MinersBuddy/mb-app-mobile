import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

// 1. Permission maango
export async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    // Android 13+ ke liye
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // iOS ke liye
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

// 2. FCM Token lao (backend ko bhejo)
export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
    // Yahan apne backend API ko token bhejo
  } catch (error) {
    console.error('Token error:', error);
  }
}

// 3. Notifications handle karo
export function setupNotificationListeners() {
  // App FOREGROUND mein ho tab
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    Alert.alert(
      remoteMessage.notification?.title ?? 'Notification',
      remoteMessage.notification?.body ?? ''
    );
  });

  // App BACKGROUND se open ho tab
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Background notification:', remoteMessage);
    // Navigation handle karo yahan
  });

  // App CLOSED thi aur notification se open hua
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('Killed state notification:', remoteMessage);
    }
  });

  return unsubscribeForeground; // cleanup ke liye
}