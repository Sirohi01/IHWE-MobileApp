import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, Animated } from 'react-native';
import { Mail, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../core/api/axios';
import { useAuthStore } from '../../core/store/useAuthStore';
export default function LoginScreen() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const [authMethod, setAuthMethod] = useState<'email' | 'whatsapp'>('whatsapp');
  const [identifier, setIdentifier] = useState('');
  const [exhibitorId, setExhibitorId] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Smooth entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSendOtp = async () => {
    if (!identifier) {
      Alert.alert('Required', `Please enter your ${authMethod === 'email' ? 'email' : 'WhatsApp number'}`);
      return;
    }

    setLoading(true);
    try {
      const payload = authMethod === 'email' ? { email: identifier } : { mobile: identifier };
      const endpoint = authMethod === 'email' ? '/exhibitor-auth/send-email-otp' : '/exhibitor-auth/send-mobile-otp';
      const res = await apiClient.post(endpoint, payload);

      if (res.data.success) {
        setExhibitorId(res.data.exhibitorId);
        setShowOtp(true);
      } else {
        Alert.alert('Notice', res.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Connection Error', error.response?.data?.message || 'Network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Required', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const payload = { exhibitorId, otp };

      const res = await apiClient.post('/exhibitor-auth/verify-otp', payload);

      if (res.data.success && res.data.token) {
        await setToken(res.data.token);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Invalid Code', res.data.message || 'The verification code is incorrect');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F9FAFB] relative overflow-hidden">
      {/* Absolute top-tier minimal background shapes */}
      <View className="absolute top-[-100] right-[-50] w-96 h-96 bg-[#E8F5E9] rounded-full opacity-40 blur-3xl" />
      <View className="absolute bottom-[-100] left-[-50] w-[400px] h-[400px] bg-[#E8F5E9] rounded-full opacity-40 blur-3xl" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center p-6 z-10"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            width: '100%',
            alignItems: 'center'
          }}
        >
          {/* Logo & Header */}
          <View className="items-center mb-4 w-full px-2">
            <Image
              source={require('../../../assets/images/logo.png')}
              style={{ width: 350, height: 120, aspectRatio: 2.2, marginBottom: 8 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-[#1F2937] tracking-tight">Exhibitor Portal</Text>
            <Text className="text-[#6B7280] mt-2 text-center text-sm font-medium px-4">
              Access your smart dashboard and manage your booth seamlessly.
            </Text>
          </View>

          {/* Premium White Card */}
          <View className="bg-white/90 rounded-[32px] w-full p-8 shadow-sm border border-white">
            {!showOtp ? (
              <>
                {/* Tabs */}
                <View className="flex-row bg-[#F3F4F6] p-1.5 rounded-2xl mb-8">
                  <TouchableOpacity
                    className="flex-1 flex-row justify-center items-center py-3 rounded-xl"
                    style={authMethod === 'whatsapp' ? { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 } : {}}
                    onPress={() => setAuthMethod('whatsapp')}
                  >
                    <MessageCircle size={16} color={authMethod === 'whatsapp' ? '#25D366' : '#9CA3AF'} style={{ marginRight: 8 }} />
                    <Text className="font-semibold text-sm" style={{ color: authMethod === 'whatsapp' ? '#1F2937' : '#9CA3AF' }}>WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row justify-center items-center py-3 rounded-xl"
                    style={authMethod === 'email' ? { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 } : {}}
                    onPress={() => setAuthMethod('email')}
                  >
                    <Mail size={16} color={authMethod === 'email' ? '#2E5D36' : '#9CA3AF'} style={{ marginRight: 8 }} />
                    <Text className="font-semibold text-sm" style={{ color: authMethod === 'email' ? '#1F2937' : '#9CA3AF' }}>Email</Text>
                  </TouchableOpacity>
                </View>

                <Text className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3 ml-2">
                  {authMethod === 'email' ? 'Email Address' : 'WhatsApp Number'}
                </Text>

                <View className="bg-[#F9FAFB] rounded-2xl px-5 py-4 mb-8 flex-row items-center">
                  <TextInput
                    className="flex-1 text-[#1F2937] font-semibold text-base"
                    placeholder={authMethod === 'email' ? "hello@example.com" : "+91 98765 43210"}
                    placeholderTextColor="#D1D5DB"
                    keyboardType={authMethod === 'email' ? "email-address" : "phone-pad"}
                    autoCapitalize="none"
                    value={identifier}
                    onChangeText={setIdentifier}
                  />
                </View>

                <TouchableOpacity
                  className="bg-[#2E5D36] py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-[#2E5D36]/30"
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-sm uppercase tracking-wider mr-2">Continue</Text>
                      <ArrowRight color="white" size={16} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="items-center mb-8">
                  <View className="w-20 h-20 bg-[#E8F5E9] rounded-full items-center justify-center mb-5">
                    <ShieldCheck size={36} color="#2E5D36" />
                  </View>
                  <Text className="text-xl font-bold text-[#1F2937]">Verify Account</Text>
                  <Text className="text-[#6B7280] text-sm text-center mt-2 px-4 leading-relaxed">
                    We've sent a secure 6-digit code to{"\n"}
                    <Text className="font-bold text-[#1F2937]">{identifier}</Text>
                  </Text>
                </View>

                <Text className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3 ml-2 text-center">
                  Verification Code
                </Text>
                <View className="bg-[#F9FAFB] rounded-2xl px-4 py-4 mb-8">
                  <TextInput
                    className="text-[#1F2937] font-bold text-3xl tracking-[12px] text-center"
                    placeholder="------"
                    placeholderTextColor="#E5E7EB"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>

                <TouchableOpacity
                  className="bg-[#2E5D36] py-4 rounded-2xl items-center shadow-lg shadow-[#2E5D36]/30"
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-sm uppercase tracking-wider">Verify & Login</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-6 py-2 items-center"
                  onPress={() => setShowOtp(false)}
                >
                  <Text className="text-[#6B7280] font-semibold text-sm">Use a different {authMethod}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer */}
          <View className="mt-10 items-center pb-4">
            <Text className="text-[#9CA3AF] text-[10px] uppercase tracking-widest font-semibold mb-1">
              Secure Portal • IHWE 2026
            </Text>
            <Text className="text-[#9CA3AF] text-[9px] font-medium text-center uppercase tracking-wider">
              Organized by Namogange Wellness Pvt. Ltd.
            </Text>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
