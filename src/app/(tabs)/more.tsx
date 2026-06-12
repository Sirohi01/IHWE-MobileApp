import '../../global.css';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, Linking } from 'react-native';
import {
  ChevronRight,
  UserCircle2,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  FileText,
  Store,
  Building2,
  Users,
  ShieldCheck,
  Briefcase,
  ShoppingBag,
  Package,
  CreditCard,
  FolderOpen,
  Megaphone,
  MessageSquare,
  Calendar,
  Clock,
  Share2,
  Camera,
  Info,
  X,
  Home,
  QrCode,
  Menu as MenuIcon,
  PlayCircle,
  RefreshCcw
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { useTourStore } from '@/core/store/useTourStore';

const FacebookIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);
const InstagramIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <Line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </Svg>
);
const LinkedinIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <Rect width="4" height="12" x="2" y="9" />
    <Circle cx="4" cy="4" r="2" />
  </Svg>
);
const TwitterIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </Svg>
);
const YoutubeIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2.5 7.1A2.8 2.8 0 0 1 4.5 5.1C6.5 4.6 12 4.6 12 4.6s5.5 0 7.5.5a2.8 2.8 0 0 1 2 2C22 9.1 22 12 22 12s0 2.9-.5 4.9a2.8 2.8 0 0 1-2 2c-2 .5-7.5.5-7.5.5s-5.5 0-7.5-.5a2.8 2.8 0 0 1-2-2C2 14.9 2 12 2 12s0-2.9.5-4.9Z" />
    <Path d="m10 15 5-3-5-3z" />
  </Svg>
);

export default function MoreMenuScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { startTour } = useTourStore();

  useEffect(() => {
    fetchData();

    // Countdown Timer logic for August 21, 2026
    const targetDate = new Date('2026-08-21T09:00:00').getTime();

    const updateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/exhibitor-auth/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('exhibitorToken');
          router.replace('/');
        }
      }
    ]);
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, destructive = false, iconBg = '#f8fafc', iconColor = '#64748b', disabled = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center bg-white px-5 py-4 border-b border-slate-100 ${disabled ? 'opacity-50' : ''}`}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${destructive ? 'bg-red-50' : ''}`} style={!destructive ? { backgroundColor: iconBg } : {}}>
        <Icon size={20} color={destructive ? '#ef4444' : iconColor} />
      </View>
      <View className="flex-1">
        <Text className={`font-bold text-[15px] ${destructive ? 'text-red-500' : 'text-[#0f172a]'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-slate-500 font-medium text-[12px] mt-0.5">{subtitle}</Text>
        )}
      </View>
      {!destructive && <ChevronRight size={18} color="#cbd5e1" />}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="px-5 py-3 text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-2 bg-[#f4f7f9]">
      {title}
    </Text>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
      </View>
    );
  }

  const exhibitorName = data?.exhibitorName || 'Loading...';
  const companyName = data?.companyName || 'Company Profile';
  const initials = exhibitorName.substring(0, 2).toUpperCase();

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      {/* Light Theme Header Profile Section */}
      <View className="bg-white pt-14 pb-5 px-5 border-b border-slate-200 shadow-sm z-10 relative">
        {/* Background design elements */}
        <View className="absolute right-[-40px] top-[-20px] w-40 h-40 rounded-full border-[15px] border-blue-50/50" />

        <Text className="text-[#0f172a] text-[22px] font-black tracking-wider mb-5">Menu</Text>

        <View className="flex-row items-center relative z-10">
          <View className="w-14 h-14 bg-indigo-50 rounded-full items-center justify-center border border-indigo-100 mr-4">
            <Text className="text-indigo-600 font-black text-[20px] tracking-wider">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[#0f172a] font-black text-[18px] tracking-tight mb-1" numberOfLines={1}>{exhibitorName}</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-100 self-start px-2.5 py-1 rounded-full">
              {/* @ts-ignore */}
              <Building2 size={12} color="#64748b" className="mr-1.5" />
              <Text className="text-slate-600 font-bold text-[10px]" numberOfLines={1}>{companyName}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}>

        {/* Event Info & Countdown Strip */}
        <View className="mx-5 mb-2 mt-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Row: Date & Location */}
          <View className="bg-blue-50/80 border-b border-blue-100/50 px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              {/* @ts-ignore */}
              <Calendar size={14} color="#1e3a8a" className="mr-2" />
              <Text className="text-[#1e3a8a] font-bold text-[11px] tracking-widest uppercase">21-23 Aug 2026</Text>
            </View>
            <View className="bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
              <Text className="text-slate-600 font-bold text-[9px] uppercase tracking-widest">New Delhi</Text>
            </View>
          </View>

          {/* Bottom Row: Countdown */}
          <View className="px-4 py-3 flex-row items-center justify-between bg-white">
            <View className="flex-row items-center">
              {/* @ts-ignore */}
              <Clock size={14} color="#f59e0b" className="mr-2" />
              <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Time Remaining</Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <View className="items-center bg-orange-50 px-2 py-1 rounded border border-orange-100 min-w-[32px]">
                <Text className="text-orange-600 font-black text-[12px]">{timeLeft.days}</Text>
                <Text className="text-orange-600/70 font-bold text-[7px] uppercase">Days</Text>
              </View>
              <Text className="text-slate-300 font-bold">:</Text>
              <View className="items-center bg-orange-50 px-2 py-1 rounded border border-orange-100 min-w-[32px]">
                <Text className="text-orange-600 font-black text-[12px]">{timeLeft.hours.toString().padStart(2, '0')}</Text>
                <Text className="text-orange-600/70 font-bold text-[7px] uppercase">Hrs</Text>
              </View>
              <Text className="text-slate-300 font-bold">:</Text>
              <View className="items-center bg-orange-50 px-2 py-1 rounded border border-orange-100 min-w-[32px]">
                <Text className="text-orange-600 font-black text-[12px]">{timeLeft.minutes.toString().padStart(2, '0')}</Text>
                <Text className="text-orange-600/70 font-bold text-[7px] uppercase">Min</Text>
              </View>
              <Text className="text-slate-300 font-bold">:</Text>
              <View className="items-center bg-orange-50 px-2 py-1 rounded border border-orange-100 min-w-[32px]">
                <Text className="text-orange-600 font-black text-[12px]">{timeLeft.seconds.toString().padStart(2, '0')}</Text>
                <Text className="text-orange-600/70 font-bold text-[7px] uppercase">Sec</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Exhibitor Hub */}
        <SectionTitle title="Exhibitor Hub" />
        <View className="bg-white border-y border-slate-200">
          <MenuItem
            icon={Store}
            title="My Event Dashboard"
            subtitle="Manage your overall event participation"
            iconBg="#eff6ff" iconColor="#3b82f6"
            onPress={() => router.push('/(tabs)/myevent')}
          />
          <MenuItem
            icon={Store}
            title="Stall Information"
            subtitle="View assigned stall details & amenities"
            iconBg="#ecfdf5" iconColor="#10b981"
            onPress={() => router.push('/(tabs)/stall-information')}
          />

          <MenuItem
            icon={ShoppingBag}
            title="Add On Services"
            iconBg="#fef2f2" iconColor="#ef4444"
            onPress={() => router.push('/(tabs)/add-on-services')}
          />

          <MenuItem
            icon={Package}
            title="My Product/Services"
            iconBg="#f5f3ff" iconColor="#8b5cf6"
            onPress={() => router.push('/(tabs)/my-products')}
            disabled={false}
          />
          <MenuItem
            icon={Briefcase}
            title="Passes & Hospitality"
            subtitle="Manage your exhibitor passes & badges"
            iconBg="#f0fdf4" iconColor="#22c55e"
            onPress={() => router.push('/(tabs)/passes-and-hospitality')}
            disabled={false}
          />
        </View>

        {/* Finance & Documents */}
        <SectionTitle title="Finance & Documents" />
        <View className="bg-white border-y border-slate-200">
          <MenuItem
            icon={CreditCard}
            title="Make Payment"
            iconBg="#fff7ed" iconColor="#f97316"
            onPress={() => router.push('/(tabs)/make-payment')}
            disabled={false}
          />
          <MenuItem
            icon={FileText}
            title="Invoice & Receipts"
            subtitle="View & download financial documents"
            iconBg="#f0fdf4" iconColor="#22c55e"
            onPress={() => router.push('/(tabs)/invoices')}
          />
          <MenuItem
            icon={FolderOpen}
            title="MSME Documentation"
            subtitle="View & update your Udyam details"
            iconBg="#e0e7ff" iconColor="#4f46e5"
            onPress={() => router.push('/(tabs)/msme-documentation')}
          />
        </View>

        {/* Marketing & Leads */}
        <SectionTitle title="Marketing & Leads" />
        <View className="bg-white border-y border-slate-200">
          <MenuItem
            icon={Users}
            title="Buyers Management"
            subtitle="View scanned visitor leads and contacts"
            iconBg="#f0fdfa" iconColor="#14b8a6"
            onPress={() => router.push('/(tabs)/buyers-management')}
            disabled={false}
          />
          <MenuItem
            icon={Megaphone}
            title="E-Promotion"
            subtitle="Promote your presence at the event"
            iconBg="#dbeafe" iconColor="#2563eb"
            onPress={() => router.push('/(tabs)/e-promotion')}
            disabled={false}
          />
        </View>

        {/* Account & Settings */}
        <SectionTitle title="Account" />
        <View className="bg-white border-y border-slate-200">
          <MenuItem
            icon={UserCircle2}
            title="Profile details"
            iconBg="#f8fafc" iconColor="#475569"
            onPress={() => router.push('/(tabs)/profile-details')}
            disabled={false}
          />

          <MenuItem
            icon={Store}
            title="Become a Seller"
            subtitle="Access the Seller Portal"
            iconBg="#ecfdf5" iconColor="#059669"
            onPress={() => router.push('/(tabs)/become-seller')}
            disabled={false}
          />
        </View>

        {/* Support */}
        <SectionTitle title="Support" />
        <View className="bg-white border-y border-slate-200">
          <MenuItem
            icon={HelpCircle}
            title="Relationship Manager"
            subtitle="Contact your dedicated support executive"
            iconBg="#eff6ff" iconColor="#2563eb"
            onPress={() => router.push('/(tabs)/relationship-manager')}
          />
          <MenuItem
            icon={MessageSquare}
            title="Feedback"
            iconBg="#fef2f2" iconColor="#dc2626"
            onPress={() => { }}
            disabled={true}
          />
          <MenuItem
            icon={FileText}
            title="Terms of Service"
            iconBg="#f8fafc" iconColor="#64748b"
            onPress={() => router.push('/(tabs)/policy/terms-of-service' as any)}
          />
          <MenuItem
            icon={ShieldCheck}
            title="Privacy Policy"
            iconBg="#f8fafc" iconColor="#64748b"
            onPress={() => router.push('/(tabs)/policy/privacy-policy' as any)}
          />
          <MenuItem
            icon={RefreshCcw}
            title="Refund Policy"
            iconBg="#f8fafc" iconColor="#64748b"
            onPress={() => router.push('/(tabs)/policy/refund-policy' as any)}
          />
        </View>

        {/* Logout */}
        <View className="mt-6 border-y border-slate-200">
          <MenuItem
            icon={LogOut}
            title="Sign Out"
            destructive={true}
            onPress={handleLogout}
          />
        </View>

        <View className="items-center mt-8 mb-4 opacity-50">
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">IHWE Exhibitor App</Text>
          <Text className="text-slate-400 font-medium text-[10px]">Version 1.0.0</Text>
        </View>

      </ScrollView>

      {/* Floating Help Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#1a3a7c] rounded-full items-center justify-center shadow-lg shadow-blue-900/40 z-50"
        onPress={() => setShowHelpModal(true)}
      >
        {/* @ts-ignore */}
        <Info color="white" size={26} />
      </TouchableOpacity>

      {/* Help & Social Modal */}
      <Modal visible={showHelpModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-800">Support & Connect</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)} className="bg-slate-100 p-2 rounded-full">
                {/* @ts-ignore */}
                <X color="#64748b" size={20} />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-slate-500 mb-4 font-medium">Follow us on our social handles for the latest updates and highlights!</Text>

            {/* Social Icons */}
            <View className="flex-row justify-between items-center mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <TouchableOpacity className="items-center" onPress={() => Linking.openURL('https://www.facebook.com/namogangewellness.event')}>
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-1">
                  <FacebookIcon color="#1877F2" size={20} />
                </View>
                <Text className="text-[9px] font-bold text-slate-500 uppercase">Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={() => Linking.openURL('https://www.instagram.com/namogangewellness.event')}>
                <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center mb-1">
                  <InstagramIcon color="#E4405F" size={20} />
                </View>
                <Text className="text-[9px] font-bold text-slate-500 uppercase">Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={() => Linking.openURL('https://www.linkedin.com/company/namo-gange-wellness-event')}>
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-1">
                  <LinkedinIcon color="#0A66C2" size={20} />
                </View>
                <Text className="text-[9px] font-bold text-slate-500 uppercase">LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={() => Linking.openURL('https://x.com/namogange_event')}>
                <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center mb-1">
                  <TwitterIcon color="#0f1419" size={20} />
                </View>
                <Text className="text-[9px] font-bold text-slate-500 uppercase">X</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={() => Linking.openURL('https://www.youtube.com/@Namogangewellness')}>
                <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mb-1">
                  <YoutubeIcon color="#FF0000" size={20} />
                </View>
                <Text className="text-[9px] font-bold text-slate-500 uppercase">YouTube</Text>
              </TouchableOpacity>
            </View>

            <View className="h-[1px] bg-slate-200 mb-6" />

            {/* App Tour Button (Temporarily Disabled)
            <TouchableOpacity
              className="bg-[#1a3a7c] w-full py-3.5 px-4 rounded-xl items-center shadow-lg shadow-blue-900/30 flex-row justify-center border border-[#2d509e]"
              onPress={() => {
                setShowHelpModal(false);
                setTimeout(() => {
                  startTour();
                  router.replace('/');
                }, 300);
              }}
            >
              <PlayCircle color="#93c5fd" size={20} className="mr-2.5" />
              <Text className="text-white font-bold text-[14px] tracking-wide uppercase">Watch App Tour</Text>
            </TouchableOpacity>
            */}
          </View>
        </View>
      </Modal>



    </View>
  );
}
