import '../global.css';
import { Stack, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AppState, Alert, DeviceEventEmitter, View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as SplashScreen from 'expo-splash-screen';
import { io } from 'socket.io-client';

SplashScreen.preventAutoHideAsync();
import { apiClient } from '@/core/api/axios';
import { imageUrl, SERVER_URL } from '@/core/config/env';

import { usePushNotifications } from '@/core/hooks/usePushNotifications';

export default function RootLayout() {
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastAlertedId = useRef<string | null>(null);
  const lastPassUsageAlertedId = useRef<string | null>(null);

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
        void checkNewReminders();
        void checkPendingPassUsage();
      }
      appState.current = nextAppState;
    });

    // Also check on initial mount
    SecureStore.getItemAsync('lastAlertedReminderId').then((id) => {
      lastAlertedId.current = id;
      void checkNewReminders();
    });
    const interval = setInterval(() => {
      if (appState.current === 'active') {
        void checkNewReminders();
        void checkPendingPassUsage();
      }
    }, 30000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      void checkNewReminders();
      void checkPendingPassUsage();
    }
  }, [notification]);

  useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;
    let cancelled = false;
    const connectPassActivity = async () => {
      const token = await SecureStore.getItemAsync('exhibitorToken');
      if (!token || cancelled) return;
      const storedData = await SecureStore.getItemAsync('exhibitorData');
      const parsed = storedData ? JSON.parse(storedData) : null;
      const exhibitorId = parsed?._id || parsed?.id || getUserIdFromToken(token);
      if (!exhibitorId || cancelled) return;
      socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        extraHeaders: { 'ngrok-skip-browser-warning': 'true' },
        reconnection: true,
        reconnectionDelay: 2000,
      });
      socket.on('connect', () => {
        socket?.emit('join_exhibitor', { exhibitorId, token });
      });
      socket.on('pass-usage:pending', () => {
        void checkPendingPassUsage();
      });
    };
    void connectPassActivity();
    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, []);

  const checkPendingPassUsage = async () => {
    try {
      const token = await SecureStore.getItemAsync('exhibitorToken');
      if (!token) return;
      const res = await apiClient.get('/exhibitor-auth/my-pass-usage');
      const pending = (res.data?.data || []).find((item: any) =>
        item.acknowledgementStatus === 'pending');
      if (!pending || String(pending._id) === lastPassUsageAlertedId.current) return;
      lastPassUsageAlertedId.current = String(pending._id);
      const quantity = pending.passType === 'lunch'
        ? `${Number(pending.deliveredQuantity || 0)} lunch item(s)`
        : `${pending.passType || 'exhibitor'} pass`;
      Alert.alert(
        'Confirm pass activity',
        `${quantity} was recorded by ${pending.markedByName || 'IHWE staff'}. Please confirm this activity.`,
        [
          { text: 'View Details', onPress: () => router.push('/pass-usage-activity') },
          {
            text: 'Accept',
            onPress: async () => {
              try {
                await apiClient.patch(
                  `/exhibitor-auth/my-pass-usage/${pending.usageId || pending._id}/acknowledge`,
                  { status: 'confirmed', deliveryId: pending.deliveryId }
                );
                DeviceEventEmitter.emit('pass-usage:changed');
              } catch {
                Alert.alert('Could not confirm', 'The server is unavailable. Please retry from Usage Activity.');
              }
            }
          }
        ]
      );
    } catch (_) {
      // Authentication and transient network errors are retried on the next poll.
    }
  };

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
    } catch (e: any) {
      console.log('Reminder check deferred:', e?.response?.status || e?.message || 'network unavailable');
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
