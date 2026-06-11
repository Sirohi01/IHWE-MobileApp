import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../core/store/useAuthStore';

export default function Index() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const initializeApp = async () => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      ).start();
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      await checkAuth();
      timer = setTimeout(() => {
        const isLoggedIn = useAuthStore.getState().isAuthenticated;
        if (isLoggedIn) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(auth)/login');
        }
      }, 3000);
    };

    initializeApp();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <View className="flex-1 bg-[#F9FAFB] justify-center items-center relative overflow-hidden">
      <View className="absolute top-[-100] left-[-50] w-96 h-96 bg-[#E8F5E9] rounded-full opacity-30 blur-3xl" />
      <View className="absolute bottom-[-150] right-[-100] w-[500px] h-[500px] bg-[#E8F5E9] rounded-full opacity-30 blur-3xl" />

      <Animated.View
        className="flex-1 w-full justify-center items-center px-8"
        style={{ opacity: fadeAnim }}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%', alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: '90%', height: 220 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Premium Tagline */}
        <View className="mt-12 flex-row items-center justify-center space-x-3">
          <Text className="text-[#374151] font-medium tracking-widest text-xs uppercase">Connecting</Text>
          <View className="w-1 h-1 rounded-full bg-[#E67E22]" />
          <Text className="text-[#374151] font-medium tracking-widest text-xs uppercase">Collaborating</Text>
          <View className="w-1 h-1 rounded-full bg-[#E67E22]" />
          <Text className="text-[#374151] font-medium tracking-widest text-xs uppercase">Growing</Text>
        </View>

        {/* Ultra-sleek minimalist progress indicator */}
        <View className="absolute bottom-16 w-full items-center">
          <View className="w-3/5 h-[3px] bg-gray-200 rounded-full overflow-hidden shadow-sm">
            <Animated.View
              className="h-full bg-[#2E5D36] rounded-full"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
          <Text className="text-[#6B7280] text-[10px] uppercase tracking-[0.2em] mt-4 font-semibold">
            Preparing Experience
          </Text>
        </View>
      </Animated.View>

    </View>
  );
}
