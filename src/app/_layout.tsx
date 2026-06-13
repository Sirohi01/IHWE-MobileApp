import '../global.css';
import { Stack, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Audio } from 'expo-av';
import { AppState, Alert } from 'react-native';
import { apiClient } from '@/core/api/axios';
import { imageUrl } from '@/core/config/env';

import { usePushNotifications } from '@/core/hooks/usePushNotifications';

export default function RootLayout() {
  const appState = useRef(AppState.currentState);
  const lastAlertedId = useRef<string | null>(null);
  
  // Register for push notifications
  usePushNotifications();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkNewReminders();
      }
      appState.current = nextAppState;
    });

    // Also check on initial mount
    checkNewReminders();

    return () => {
      subscription.remove();
    };
  }, []);

  const checkNewReminders = async () => {
    try {
      const token = await SecureStore.getItemAsync('exhibitorToken');
      const storedData = await SecureStore.getItemAsync('exhibitorData');
      if (!token || !storedData) return;

      const userId = JSON.parse(storedData).id;

      const res = await apiClient.get('/reminders/my-reminders', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        const reminders = res.data.data;
        // Find latest unread
        const unread = reminders.filter((r: any) => !r.readBy?.includes(userId));
        if (unread.length > 0) {
          const latest = unread[0]; // First one is the newest (sorted by backend)
          if (latest._id !== lastAlertedId.current) {
            lastAlertedId.current = latest._id;
            playAudioAndAlert(latest);
          }
        }
      }
    } catch (e) {
      console.log('Failed to check reminders in foreground', e);
    }
  };

  const playAudioAndAlert = async (reminder: any) => {
    if (reminder.audioUrl) {
      try {
        const fullUrl = imageUrl(reminder.audioUrl);
        
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: fullUrl },
          { shouldPlay: true }
        );
        
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (error) {
        console.log('Error playing custom notification sound:', error);
      }
    }

    Alert.alert(
      reminder.title || 'New Reminder',
      reminder.message,
      [
        { text: 'View', onPress: () => router.push('/(tabs)/reminders') },
        { text: 'Dismiss', style: 'cancel' }
      ]
    );
  };

  return <Stack screenOptions={{ headerShown: false }} />;
}
