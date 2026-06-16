import '../global.css';
import { Stack, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AppState, Alert, View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
import { apiClient } from '@/core/api/axios';
import { imageUrl } from '@/core/config/env';

import { usePushNotifications } from '@/core/hooks/usePushNotifications';

export default function RootLayout() {
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastAlertedId = useRef<string | null>(null);

  const player = useVideoPlayer(require('../../assets/video/ihweVideo2.mp4'), p => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const playToEndSub = player.addListener('playToEnd', () => {
      setIsVideoFinished(true);
    });
    const playingChangeSub = player.addListener('playingChange', (isPlaying) => {
      if (isPlaying) {
        SplashScreen.hideAsync().catch(() => { });
      }
    });

    return () => {
      playToEndSub.remove();
      playingChangeSub.remove();
    };
  }, [player]);

  // Register for push notifications
  const { notification } = usePushNotifications();

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
    SecureStore.getItemAsync('lastAlertedReminderId').then((id) => {
      lastAlertedId.current = id;
      checkNewReminders();
    });
    const interval = setInterval(() => {
      if (appState.current === 'active') {
        checkNewReminders();
      }
    }, 10000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      checkNewReminders();
    }
  }, [notification]);

  const checkNewReminders = async () => {
    try {
      const token = await SecureStore.getItemAsync('exhibitorToken');
      const storedData = await SecureStore.getItemAsync('exhibitorData');
      if (!token || !storedData) return;

      const userId = storedData ? JSON.parse(storedData).id : getUserIdFromToken(token);
      if (!userId) return;

      const res = await apiClient.get('/reminders/my-reminders', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        const reminders = res.data.data;
        // Find latest unread
        const unread = reminders.filter((r: any) => !hasUserReadReminder(r, userId));
        if (unread.length > 0) {
          const latest = unread[0]; // First one is the newest (sorted by backend)
          if (latest._id !== lastAlertedId.current) {
            lastAlertedId.current = latest._id;
            await SecureStore.setItemAsync('lastAlertedReminderId', latest._id);
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

        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'mixWithOthers',
        });

        const player = createAudioPlayer({ uri: fullUrl });
        player.play();
        setTimeout(() => player.remove(), 30000);
      } catch (error) {
        console.log('Error playing custom notification sound:', error);
      }
    }

    Alert.alert(
      reminder.title || 'New Reminder',
      reminder.message,
      [
        {
          text: 'View',
          onPress: async () => {
            await markReminderAsRead(reminder._id);
            router.push('/(tabs)/reminders');
          }
        },
        { text: 'Dismiss', style: 'cancel' }
      ]
    );
  };

  if (!isVideoFinished) {
    return (
      <View style={styles.videoContainer}>
        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const hasUserReadReminder = (reminder: any, userId: string) => {
  return reminder.readBy?.some((id: any) => String(id) === String(userId));
};

const markReminderAsRead = async (reminderId: string) => {
  try {
    const token = await SecureStore.getItemAsync('exhibitorToken');
    if (!token || !reminderId) return;

    await apiClient.post(
      '/reminders/mark-read',
      { reminderId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.log('Failed to mark foreground reminder as read', err);
  }
};

const getUserIdFromToken = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    return decoded.id;
  } catch {
    return null;
  }
};

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

