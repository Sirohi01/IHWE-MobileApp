import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Text, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../core/store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  
  // Advanced Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const initializeApp = async () => {
      // 1. Entrance Animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();

      // 2. Continuous Breathing/Pulse Effect for the Logo Glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ])
      ).start();

      // 3. Progress Bar Fill
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 3500, // slightly longer for a cinematic feel
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
      }, 3500);
    };

    initializeApp();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <LinearGradient
        colors={['#ffffff', '#f4fbf7', '#e8f5e9']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Orbs */}
      <Animated.View style={[styles.orb, styles.orbTop, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.orb, styles.orbBottom, { opacity: fadeAnim }]} />

      <Animated.View
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }]
          }
        ]}
      >
        {/* Logo Container with Glowing Pulse */}
        <View style={styles.logoContainer}>
          <Animated.View 
            style={[
              styles.logoGlow, 
              { transform: [{ scale: pulseAnim }] }
            ]} 
          />
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Cinematic Title & Tagline */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to IHWE 2026</Text>
          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>HEALTH</Text>
            <View style={styles.dot} />
            <Text style={styles.taglineText}>WELLNESS</Text>
            <View style={styles.dot} />
            <Text style={styles.taglineText}>FUTURE</Text>
          </View>
        </View>

        {/* Premium Loading Indicator */}
        <View style={styles.loaderContainer}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Initializing Experience...</Text>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: 'rgba(16, 185, 129, 0.03)', // very faint emerald
  },
  orbTop: {
    top: -width * 0.8,
    right: -width * 0.4,
  },
  orbBottom: {
    bottom: -width * 0.8,
    left: -width * 0.4,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(16, 185, 129, 0.08)', // subtle emerald glow
    zIndex: 0,
  },
  logo: {
    width: 350,
    height: 350,
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#064e3b', // emerald-900
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669', // emerald-600
    letterSpacing: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f59e0b', // amber-500
  },
  loaderContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981', // emerald-500
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b', // slate-500
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
