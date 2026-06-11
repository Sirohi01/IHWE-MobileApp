import '../../global.css';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { ChevronLeft, Mail, Phone, ExternalLink, Briefcase, UserCircle2, Building2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { apiClient } from '@/core/api/axios';

export default function RelationshipManagerScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/exhibitor-auth/dashboard');
      if (res.data.success) {
        const dashboardData = res.data.data;
        const rmUsername = dashboardData.filledBy && dashboardData.filledBy !== 'User' ? dashboardData.filledBy : null;
        
        if (rmUsername) {
          const rmRes = await apiClient.get(`/admin/by-username/${encodeURIComponent(rmUsername)}`);
          if (rmRes.data.success && rmRes.data.data) {
            setData(rmRes.data.data);
          }
        }
      }
    } catch (err) {
      console.log('Error fetching RM data', err);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    const number = clean.startsWith('91') ? clean : '91' + clean;
    Linking.openURL(`https://wa.me/${number}`);
  };

  const openCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Profile...</Text>
      </View>
    );
  }

  // Fallback defaults if data is missing or user has no specific RM assigned
  const rmName = data?.fullName || 'Support Team';
  const rmDesignation = data?.designation || 'Exhibitor Support Executive';
  const rmEmail = data?.email || 'support@ihwe.in';
  const rmMobile = data?.mobile || '+91 96549 00525';
  const rmImage = data?.profileImage || data?.hodImage || 'https://ui-avatars.com/api/?name=Support&background=0D8ABC&color=fff';

  const hodName = data?.hodName;
  const hodDesignation = data?.hodDesignation;
  const hodEmail = data?.hodEmail;
  const hodMobile = data?.hodMobile;
  const hodImage = data?.hodImage || 'https://ui-avatars.com/api/?name=HOD&background=1a3a7c&color=fff';

  const repName = data?.reportingToName;
  const repDesignation = data?.reportingToDesignation;
  const repEmail = data?.reportingToEmail;
  const repMobile = data?.reportingToMobile;
  const repImage = data?.reportingToImage || 'https://ui-avatars.com/api/?name=RM&background=0e7f22&color=fff';

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-5 flex-row items-center justify-between border-b border-slate-200 z-10 shadow-sm">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200"
        >
          {/* @ts-ignore */}
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-[#0f172a] font-black text-[18px] tracking-tight">Dedicated Support</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Main RM Card */}
        <View className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden mb-3 relative">
          <View className="absolute top-0 w-full h-24 bg-[#1a3a7c] overflow-hidden">
             <View className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full border-[8px] border-white/10" />
             <View className="absolute left-[-20px] bottom-[-30px] w-32 h-32 rounded-full border-[8px] border-white/5" />
          </View>
          
          <View className="items-center pt-10 pb-5 px-5 relative z-10">
            <View className="w-20 h-20 bg-white rounded-full p-1 shadow-md border border-slate-100 mb-3">
              <Image source={{ uri: rmImage }} className="w-full h-full rounded-full bg-slate-100" />
              <View className="absolute bottom-1 right-1 w-5 h-5 bg-[#108c2d] border-[3px] border-white rounded-full shadow-sm" />
            </View>

            <View className="bg-blue-50 px-3 py-1 rounded-full mb-2 border border-blue-100">
              <Text className="text-blue-600 font-bold uppercase text-[8px] tracking-widest">Your Relationship Manager</Text>
            </View>

            <Text className="text-[#0f172a] font-black text-[20px] mb-0.5">{rmName}</Text>
            <Text className="text-slate-500 font-bold text-[12px]">{rmDesignation}</Text>

            {/* Quick Actions */}
            <View className="flex-row items-center gap-2 w-full mt-4">
              <TouchableOpacity 
                onPress={() => openCall(rmMobile)}
                className="flex-1 h-10 bg-[#108c2d] rounded-full flex-row items-center justify-center shadow-sm shadow-[#108c2d]/20"
              >
                {/* @ts-ignore */}
                <Phone size={14} color="#ffffff" className="mr-1.5" />
                <Text className="text-white font-bold text-[12px]">Call Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => openWhatsApp(data?.altMobile || rmMobile)}
                className="flex-1 h-10 bg-[#25d366] rounded-full flex-row items-center justify-center shadow-sm shadow-[#25d366]/20"
              >
                <Text className="text-white font-bold text-[12px]">WhatsApp</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Details Grid */}
            <View className="w-full mt-4 bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <TouchableOpacity onPress={() => openEmail(rmEmail)} className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100 mr-3">
                  {/* @ts-ignore */}
                  <Mail size={14} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-0.5">Official Email</Text>
                  <Text className="text-[#0f172a] font-bold text-[12px]">{rmEmail}</Text>
                </View>
                {/* @ts-ignore */}
                <ExternalLink size={12} color="#cbd5e1" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => openCall(rmMobile)} className="flex-row items-center">
                <View className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100 mr-3">
                  {/* @ts-ignore */}
                  <Phone size={14} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-0.5">Mobile Number</Text>
                  <Text className="text-[#0f172a] font-bold text-[12px]">{rmMobile}</Text>
                </View>
                {/* @ts-ignore */}
                <ExternalLink size={12} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Escalation Matrix Title */}
        <Text className="text-[#1a3a7c] font-black text-[15px] tracking-tight mb-2 ml-1">Escalation Matrix</Text>

        {/* Reporting Manager */}
        {repName && (
          <View className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-3 mb-2 flex-row items-center">
            <Image source={{ uri: repImage }} className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mr-3" />
            <View className="flex-1">
              <View className="flex-row items-center mb-0.5">
                {/* @ts-ignore */}
                <UserCircle2 size={10} color="#f59e0b" className="mr-1" />
                <Text className="text-[#f59e0b] font-bold uppercase text-[8px] tracking-widest">Reporting Manager</Text>
              </View>
              <Text className="text-[#0f172a] font-black text-[14px] mb-0.5">{repName}</Text>
              <Text className="text-slate-500 font-bold text-[10px] mb-2">{repDesignation}</Text>
              <View className="flex-row gap-2">
                {repMobile && (
                  <TouchableOpacity onPress={() => openCall(repMobile)} className="bg-slate-100 px-2 py-1 rounded-full flex-row items-center">
                    {/* @ts-ignore */}
                    <Phone size={8} color="#0f172a" className="mr-1" />
                    <Text className="text-[#0f172a] font-bold text-[9px]">Call</Text>
                  </TouchableOpacity>
                )}
                {repEmail && (
                  <TouchableOpacity onPress={() => openEmail(repEmail)} className="bg-slate-100 px-2 py-1 rounded-full flex-row items-center">
                    {/* @ts-ignore */}
                    <Mail size={8} color="#0f172a" className="mr-1" />
                    <Text className="text-[#0f172a] font-bold text-[9px]">Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Head of Department */}
        {hodName && (
          <View className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-3 mb-2 flex-row items-center">
            <Image source={{ uri: hodImage }} className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mr-3" />
            <View className="flex-1">
              <View className="flex-row items-center mb-0.5">
                {/* @ts-ignore */}
                <Building2 size={10} color="#ef4444" className="mr-1" />
                <Text className="text-[#ef4444] font-bold uppercase text-[8px] tracking-widest">Head of Department</Text>
              </View>
              <Text className="text-[#0f172a] font-black text-[14px] mb-0.5">{hodName}</Text>
              <Text className="text-slate-500 font-bold text-[10px] mb-2">{hodDesignation}</Text>
              <View className="flex-row gap-2">
                {hodMobile && (
                  <TouchableOpacity onPress={() => openCall(hodMobile)} className="bg-red-50 px-2 py-1 rounded-full flex-row items-center">
                    {/* @ts-ignore */}
                    <Phone size={8} color="#dc2626" className="mr-1" />
                    <Text className="text-[#dc2626] font-bold text-[9px]">Call</Text>
                  </TouchableOpacity>
                )}
                {hodEmail && (
                  <TouchableOpacity onPress={() => openEmail(hodEmail)} className="bg-red-50 px-2 py-1 rounded-full flex-row items-center">
                    {/* @ts-ignore */}
                    <Mail size={8} color="#dc2626" className="mr-1" />
                    <Text className="text-[#dc2626] font-bold text-[9px]">Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
