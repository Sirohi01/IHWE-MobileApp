import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { Bell, LogOut, Store, CheckCircle, FileText, Megaphone, CalendarDays, Building2, Layers, ChevronRight, CheckSquare, Settings, Users, Sparkles, Box, Calendar, PlusCircle, Ticket, FolderOpen, MapPin, Clock } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAccessCard } from '@/components/dashboard/QuickAccessCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';

export default function HomeTab() {
  const [data, setData] = useState<any>(null);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (heroSlides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroSlides.length]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('exhibitorToken');
      if (!token) { router.replace('/(auth)/login'); return; }

      const [res, heroRes] = await Promise.all([
        apiClient.get('/exhibitor-auth/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get('/hero/all').catch(() => null)
      ]);

      if (res.data.success) {
        setData(res.data.data);
        
        // Fetch dynamic Important Updates
        apiClient.get(`/exhibitor-auth/updates?id=${res.data.data._id}&page=1&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(updatesRes => {
          if (updatesRes.data.success) {
            setUpdates(updatesRes.data.data || []);
          }
        }).catch(err => console.log("Failed to fetch updates:", err));
        
      } else if (res.data.message === 'Token expired or invalid') {
        handleLogout();
      }

      if (heroRes?.data?.success && heroRes.data.data?.length > 0) {
        const activeSlides = heroRes.data.data.filter((s: any) => s.isActive);
        setHeroSlides(activeSlides);
      }
    } catch (err) {
      console.log('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('exhibitorToken');
    await SecureStore.deleteItemAsync('exhibitorData');
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
      </View>
    );
  }

  if (!data) return null;

  const cur = data.participation?.currency === 'USD' ? '$' : '₹';
  const total = data.participation?.total || 0;
  const paid = data.amountPaid || 0;
  const balance = data.balanceAmount || 0;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  const getImageUrl = (image: string) => {
    if (!image) return "";
    if (image.startsWith("http") || image.startsWith("data:")) return image;
    const cleanPath = image.startsWith("/") ? image : "/" + image;
    // return `https://api.ihwe.in${cleanPath}`;
    return `https://nenita-untoured-nonhesitantly.ngrok-free.dev${cleanPath}`;
  };

  return (
    <View className="flex-1 bg-[#f4f7f9] pt-12">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header Bar */}
        <View className="flex-row justify-between items-start mb-4 w-full">
          <View className="flex-1 pr-2">
            <Text className="text-slate-500 text-[11px] mb-0.5">Welcome back,</Text>
            <View className="flex-row items-center gap-1.5 mb-1">
              <Text className="text-slate-900 text-[18px] font-black" numberOfLines={1} adjustsFontSizeToFit>{data.exhibitorName}</Text>
              {/* @ts-ignore */}
              <CheckCircle size={14} color="#16a34a" fill="#dcfce7" />
            </View>
            <Text className="text-slate-500 text-[10px] font-medium" numberOfLines={1}>
              {data.contactPerson} ({data.industrySector || 'Exhibitor'})
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm flex-row items-center gap-2">
              {/* @ts-ignore */}
              <Calendar size={14} color="#1e3a8a" />
              <View>
                <Text className="text-[#1e3a8a] text-[8px] font-black mb-0.5">21 - 23 AUGUST 2026</Text>
                <Text className="text-slate-500 text-[7px] uppercase tracking-wider">PRAGATI MAIDAN, NEW DELHI</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              {/* @ts-ignore */}
              <LogOut color="#ef4444" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Stat Cards */}
        <View className="mb-2 -mx-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <StatCard
              icon={Store} label="STALL NUMBER" value={data.participation?.stallFor || "TBA"} sub={`Raw Space - ${data.participation?.stallSize || 0} SQM`}
              iconBg="#e0e7ff" iconColor="#4f46e5" valueColor="#1e293b"
            />
            <StatCard
              icon={CheckCircle} label="PAYMENT STATUS" value={data.status || "Pending"} sub={`Total Paid: ${cur}${paid.toLocaleString()}`}
              iconBg="#dcfce7" iconColor="#16a34a" valueColor="#16a34a"
            />
            <StatCard
              icon={FileText} label="DOCUMENTS" value="Pending" sub="Upload Required"
              iconBg="#ffedd5" iconColor="#ea580c" valueColor="#1e293b"
            />
            <StatCard
              icon={Megaphone} label="E-PROMOTION" value="Active" sub="Your profile is live"
              iconBg="#dbeafe" iconColor="#2563eb" valueColor="#2563eb"
            />
          </ScrollView>
        </View>

        {/* Dynamic Hero Banner */}
        {heroSlides.length > 0 && heroSlides[currentSlide] ? (
          <View className="w-full rounded-xl overflow-hidden mb-1 shadow-sm border border-slate-200 aspect-[16/6] bg-slate-200">
            <Image
              source={{ uri: getImageUrl(heroSlides[currentSlide].image) }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {heroSlides.length > 1 && (
              <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-1.5">
                {heroSlides.map((_, idx) => (
                  <View
                    key={idx}
                    className={idx === currentSlide ? "w-1.5 h-1.5 rounded-full bg-white" : "w-1.5 h-1.5 rounded-full bg-white/50"}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View className="w-full rounded-xl overflow-hidden mb-1 shadow-sm border border-slate-200 relative bg-gradient-to-r from-[#1a3a7c] to-[#0f234b]">
            <View className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30">
              {/* Decorative abstract circles simulating the leaves/network bg */}
              <View className="w-40 h-40 rounded-full border-4 border-white/20 absolute -right-10 -top-10" />
              <View className="w-32 h-32 rounded-full border-2 border-[#4ade80]/40 absolute right-10 top-10" />
            </View>
            <View className="p-5 relative z-10">
              <View className="flex-row items-center mb-1">
                {/* @ts-ignore */}
                <Sparkles size={12} color="#a3e635" className="mr-1" />
                <Text className="text-[#a3e635] font-black text-[10px] tracking-widest uppercase">arogya sangosthi</Text>
              </View>
              <Text className="text-white font-black text-[22px] leading-tight tracking-tight mb-1">
                A PREMIER
              </Text>
              <Text className="text-[#a3e635] font-black text-[20px] leading-tight tracking-tight mb-4">
                HEALTH SEMINAR
              </Text>

              <View className="flex-row gap-4 mb-5">
                <View className="flex-row items-center gap-1.5 bg-black/20 px-2 py-1 rounded">
                  {/* @ts-ignore */}
                  <Store size={10} color="#fff" />
                  <Text className="text-white text-[8px] uppercase tracking-wider">Knowledge</Text>
                </View>
                <View className="flex-row items-center gap-1.5 bg-black/20 px-2 py-1 rounded">
                  {/* @ts-ignore */}
                  <Box size={10} color="#fff" />
                  <Text className="text-white text-[8px] uppercase tracking-wider">Innovation</Text>
                </View>
              </View>

              <TouchableOpacity className="bg-gradient-to-r from-orange-400 to-orange-500 self-start px-5 py-2.5 rounded-full flex-row items-center shadow-lg">
                <Text className="text-white font-black uppercase text-[12px] tracking-wider mr-2">REGISTER NOW</Text>
                <View className="bg-white rounded-full p-0.5">
                  {/* @ts-ignore */}
                  <ChevronRight size={12} color="#f97316" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Access */}
        <SectionHeader title="QUICK ACCESS" />
        <View className="flex-row flex-wrap justify-between mb-1 w-full">
          <QuickAccessCard onPress={() => router.push('/(tabs)/myevent')} icon={CalendarDays} title="My Event" sub="View event details" iconBg="#eff6ff" iconColor="#3b82f6" />
          <QuickAccessCard onPress={() => router.push('/(tabs)/stall-information')} icon={Store} title="Stall Information" sub="View stall details" iconBg="#eff6ff" iconColor="#3b82f6" />
          <QuickAccessCard
            icon={FileText}
            title="Invoice & Receipts"
            sub="View & download"
            iconBg="#f0fdf4"
            iconColor="#22c55e"
            onPress={() => router.push('/(tabs)/invoices')}
          />
          <QuickAccessCard onPress={() => {}} disabled={true} icon={PlusCircle} title="Add On Services" sub="View & purchase" iconBg="#fef2f2" iconColor="#ef4444" />
          <QuickAccessCard onPress={() => {}} disabled={true} icon={Ticket} title="Passes & Hospitality" sub="View & download pass" iconBg="#f0fdf4" iconColor="#22c55e" />
          <QuickAccessCard onPress={() => {}} disabled={true} icon={Box} title="My Product/Services" sub="Add your products" iconBg="#f5f3ff" iconColor="#8b5cf6" />
          <QuickAccessCard onPress={() => {}} disabled={true} icon={FolderOpen} title="MSME Documentation" sub="Upload & manage" iconBg="#f5f3ff" iconColor="#8b5cf6" />
          <QuickAccessCard onPress={() => {}} disabled={true} icon={Users} title="Buyers Management" sub="View buyer contacts" iconBg="#f0fdfa" iconColor="#14b8a6" />
        </View>

        {/* Payment Overview & Important Updates Grid */}
        <View className="mb-2 w-full">

          <SectionHeader title="PAYMENT OVERVIEW" rightText="View Details" />
          <View className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-2">
            <View className="w-full flex-row justify-between items-start mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <View>
                <Text className="text-[#1a3a7c] font-bold text-[10px] mb-1">Total Paid</Text>
                <Text className="text-[#16a34a] font-black text-[18px]">{cur} {paid.toLocaleString()}</Text>
              </View>
              <View className="items-end">
                <Text className="text-[#1a3a7c] font-bold text-[10px] mb-1">Last Payment</Text>
                <Text className="text-slate-800 font-bold text-[11px] mb-0.5">
                  {data.paymentHistory?.[0] ? new Date(data.paymentHistory[0].paidAt).toLocaleDateString('en-GB') : 'No payments'}
                </Text>
                <Text className="text-slate-400 font-mono text-[8px]">{data.paymentHistory?.[0]?.transactionId || '-'}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              {/* Fake Pie Chart */}
              <View className="w-24 h-24 rounded-full border-[10px] border-[#16a34a] items-center justify-center mr-6 relative">
                <View className="absolute top-[-10px] right-[-10px] w-[60%] h-[60%] border-[10px] border-[#facc15] rounded-tr-full border-b-0 border-l-0 opacity-80" />
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between mb-2 pb-2 border-b border-slate-100">
                  <Text className="text-[#1a3a7c] text-[10px] font-bold">Payments Received:</Text>
                  <Text className="text-slate-800 text-[10px] font-black">{data.paymentHistory?.length || 0} Nos</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[#1a3a7c] text-[10px] font-bold">Total Billed :</Text>
                  <Text className="text-slate-800 text-[10px] font-black">{cur} {total.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between mb-2 items-center">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-[#16a34a]" />
                    <Text className="text-slate-600 text-[10px] font-medium">Amount Paid</Text>
                  </View>
                  <Text className="text-slate-800 text-[10px] font-bold">{cur} {paid.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between mb-2 items-center">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-[#facc15]" />
                    <Text className="text-slate-600 text-[10px] font-medium">Balance Due</Text>
                  </View>
                  <Text className="text-slate-800 text-[10px] font-bold">{cur} {balance.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between mb-3 items-center">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <Text className="text-slate-600 text-[10px] font-medium">Overdue</Text>
                  </View>
                  <Text className="text-slate-800 text-[10px] font-bold">{cur} 0</Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-slate-100">
                  <Text className="text-[#1a3a7c] text-[10px] font-black">Total Amount</Text>
                  <Text className="text-[#1a3a7c] text-[11px] font-black">{cur} {total.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>
          <SectionHeader title="IMPORTANT UPDATES" />
          <View className="w-full bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            {updates.length > 0 ? (
              updates.map((u, i) => {
                const isAlert = u.badge === 'Alert';
                const isNew = u.badge === 'New';
                return (
                  <View key={i} className={`flex-row items-start py-2 ${i < updates.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <View className={`border px-2 py-0.5 rounded mr-3 mt-0.5 ${isAlert ? 'bg-red-50 border-red-100' : isNew ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                      <Text className={`text-[9px] font-bold uppercase tracking-wider ${isAlert ? 'text-red-500' : isNew ? 'text-blue-500' : 'text-amber-500'}`}>
                        {u.badge || 'Info'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-[#1a3a7c] font-bold text-[11px]">{u.title}</Text>
                        <Text className="text-slate-400 text-[8px] font-medium">{u.date}</Text>
                      </View>
                      <Text className="text-slate-500 text-[10px] leading-relaxed">
                        {u.desc}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="py-4 items-center justify-center">
                <Text className="text-slate-400 text-[11px] font-medium">No important updates right now.</Text>
              </View>
            )}
          </View>

          <SectionHeader title="DOCUMENT STATUS" />
          <View className="w-full bg-white rounded-xl p-3 border border-slate-200 shadow-sm mb-3">
            <View className="flex-row items-center justify-between py-2 border-b border-slate-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <FileText size={14} color="#3b82f6" />
                </View>
                <View>
                  <Text className="text-slate-800 font-bold text-[11px]">Proforma Invoice</Text>
                  <Text className="text-slate-500 text-[9px]">Generated on Registration</Text>
                </View>
              </View>
              <View className="bg-green-50 px-2 py-1 rounded border border-green-100 flex-row items-center">
                <CheckCircle size={10} color="#16a34a" className="mr-1" />
                <Text className="text-green-600 font-bold text-[9px] uppercase tracking-wider">Ready</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between py-2 border-b border-slate-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-3">
                  <FolderOpen size={14} color="#f59e0b" />
                </View>
                <View>
                  <Text className="text-slate-800 font-bold text-[11px]">Exhibitor Contract</Text>
                  <Text className="text-slate-500 text-[9px]">Pending Signature</Text>
                </View>
              </View>
              <View className="bg-amber-50 px-2 py-1 rounded border border-amber-100 flex-row items-center">
                <Clock size={10} color="#f59e0b" className="mr-1" />
                <Text className="text-amber-600 font-bold text-[9px] uppercase tracking-wider">Pending</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mr-3">
                  <Ticket size={14} color="#a855f7" />
                </View>
                <View>
                  <Text className="text-slate-800 font-bold text-[11px]">VIP Access Pass</Text>
                  <Text className="text-slate-500 text-[9px]">View in My Event</Text>
                </View>
              </View>
              <View className="bg-green-50 px-2 py-1 rounded border border-green-100 flex-row items-center">
                <CheckCircle size={10} color="#16a34a" className="mr-1" />
                <Text className="text-green-600 font-bold text-[9px] uppercase tracking-wider">Active</Text>
              </View>
            </View>
          </View>

          <SectionHeader title="UPCOMING EVENT" />
          <View className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop' }}
              className="w-full h-36 justify-end p-4 relative"
            >
              <View className="absolute inset-0 bg-black/50" />
              <View className="relative z-10">
                <View className="bg-[#a3e635] self-start px-2 py-0.5 rounded-sm mb-2">
                  <Text className="text-[#0f172a] font-black text-[9px] uppercase tracking-widest">21 - 23 Aug 2026</Text>
                </View>
                <Text className="text-white font-black text-[18px] leading-tight mb-1 tracking-tight">9th IHWE India Health Seminar</Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <MapPin size={12} color="#cbd5e1" />
                  <Text className="text-slate-300 text-[11px] font-medium">India Expo Centre, Greater Noida</Text>
                </View>
              </View>
            </ImageBackground>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
