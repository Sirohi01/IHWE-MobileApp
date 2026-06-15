import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';
import { ChevronLeft, Maximize2, Tag, Package, Box, Zap, Trash2, Sofa, PlusCircle, PenTool, LayoutGrid, CheckCircle2, AlertCircle, Users, CreditCard, User, Building, Map } from 'lucide-react-native';
import { FloorPlanViewer } from '@/components/dashboard/FloorPlanViewer';

export default function StallInformationScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  useEffect(() => {
    fetchExhibitorData();
  }, []);

  const fetchExhibitorData = async () => {
    try {
      const token = await SecureStore.getItemAsync('exhibitorToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }
      const res = await apiClient.get('/exhibitor-auth/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching stall data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Stall Info...</Text>
      </View>
    );
  }

  const stallNumber = data?.participation?.stallFor || 'TBA';
  const stallSize = data?.participation?.stallSize || '0';
  const stallType = data?.participation?.type || 'Shell Scheme';
  const exhibitorName = data?.exhibitorName || 'Company Name';
  const industrySector = data?.industrySector || 'Healthcare';

  const primaryContactName = [
    data?.contact1?.title,
    data?.contact1?.firstName,
    data?.contact1?.lastName,
  ].filter(Boolean).join(' ').trim();
  const contactPerson = data?.contactPerson || primaryContactName || data?.contact1?.name || 'Delegate Name';
  const teamMembersCount = data?.teamMembers?.length || 0;

  const isDocVerified = data?.documentStatus === 'verified';
  const isPaid = data?.status?.toLowerCase().includes('paid');
  const paymentStatusText = data?.status || 'Pending';

  const cur = data?.participation?.currency === 'USD' ? '$' : '₹';
  const amountPaid = data?.amountPaid || 0;

  return (
    <View className="flex-1 bg-[#f4f7f9]">

      {/* Light Theme Header */}
      <View className="bg-white pt-14 pb-4 px-5 border-b border-slate-200 shadow-sm z-10 relative">
        <View className="absolute right-[-40px] top-[-20px] w-40 h-40 rounded-full border-[15px] border-blue-50/50" />

        <View className="flex-row items-center mb-5 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center border border-slate-200 mr-3 shadow-sm"
          >
            {/* @ts-ignore */}
            <ChevronLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-[#0f172a] text-lg font-black tracking-wider">Stall Details</Text>
        </View>

        <View className="z-10 flex-row justify-between items-end">
          <View>
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-0.5">Assigned Stall</Text>
            <Text className="text-[#1a3a7c] font-black text-4xl tracking-tighter leading-none">{stallNumber}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => setShowFloorPlan(true)} className="bg-slate-800 px-3 py-1.5 rounded-full flex-row items-center">
              {/* @ts-ignore */}
              <Map size={12} color="white" />
              <Text className="text-white font-bold text-[10px] ml-1.5 uppercase tracking-wider">Floor Plan</Text>
            </TouchableOpacity>
            <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex-row items-center max-w-[120px]">
              {/* @ts-ignore */}
              <Tag size={10} color="#2563eb" />
              <Text className="text-blue-700 font-bold text-[10px] ml-1.5 uppercase tracking-widest" numberOfLines={1}>{industrySector}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Display Name Section */}
        <View className="bg-white rounded-[16px] p-4 shadow-sm border border-slate-200 mb-3 relative overflow-hidden">
          <View className="absolute -right-4 -top-4 opacity-[0.03]">
            {/* @ts-ignore */}
            <PenTool size={100} color="#0f172a" />
          </View>
          <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Display Fascia Name</Text>
          <Text className="text-[#0f172a] font-black text-xl mb-3">{exhibitorName}</Text>
          <View className="bg-slate-50 border border-slate-100 rounded-lg p-3 w-full">
            <Text className="text-slate-500 text-[10px] leading-relaxed">This exact name will be printed on the front board of your stall structure.</Text>
          </View>
        </View>

        {/* Profile & Contacts */}
        <Text className="text-[#1a3a7c] font-black text-[13px] mb-1.5 ml-1 uppercase tracking-wider mt-1">Authorized Contacts</Text>
        <View className="bg-white rounded-[16px] shadow-sm border border-slate-200 mb-3">
          <View className="flex-row items-center p-3.5 border-b border-slate-50">
            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mr-4 border border-indigo-100">
              {/* @ts-ignore */}
              <User size={18} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-0.5">Primary Delegate</Text>
              <Text className="text-[#0f172a] font-black text-[14px]">{contactPerson}</Text>
            </View>
          </View>
          <View className="flex-row items-center p-3.5">
            <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-4 border border-purple-100">
              {/* @ts-ignore */}
              <Users size={18} color="#9333ea" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-0.5">Team Members</Text>
              <Text className="text-[#0f172a] font-black text-[14px]">{teamMembersCount} Registered</Text>
            </View>
          </View>
        </View>

        {/* Status Indicators */}
        <Text className="text-[#1a3a7c] font-black text-[13px] mb-1.5 ml-1 uppercase tracking-wider mt-1">Compliance Status</Text>
        <View className="flex-row gap-3 mb-3">
          <View className="bg-white rounded-[16px] p-2.5 flex-1 shadow-sm border border-slate-200 flex-row items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${isDocVerified ? 'bg-green-50' : 'bg-orange-50'}`}>
              {/* @ts-ignore */}
              {isDocVerified ? <CheckCircle2 size={16} color="#16a34a" /> : <AlertCircle size={16} color="#ea580c" />}
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-0.5" numberOfLines={1}>Documents</Text>
              <Text className={`font-black text-[12px] ${isDocVerified ? 'text-green-700' : 'text-orange-600'}`} numberOfLines={1}>{isDocVerified ? 'Verified' : 'Pending'}</Text>
            </View>
          </View>

          <View className="bg-white rounded-[16px] p-2.5 flex-1 shadow-sm border border-slate-200 flex-row items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${isPaid ? 'bg-green-50' : 'bg-orange-50'}`}>
              {/* @ts-ignore */}
              <CreditCard size={16} color={isPaid ? "#16a34a" : "#ea580c"} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-0.5" numberOfLines={1}>Payment</Text>
              <Text className={`font-black capitalize text-[12px] ${isPaid ? 'text-green-700' : 'text-orange-600'}`} numberOfLines={1}>{paymentStatusText}</Text>
            </View>
          </View>
        </View>

        {/* Specifications Grid */}
        <Text className="text-[#1a3a7c] font-black text-[13px] mb-1.5 ml-1 uppercase tracking-wider mt-1">Specifications</Text>
        <View className="flex-row gap-2 mb-3">
          <View className="bg-white rounded-xl py-2 px-1 flex-1 shadow-sm border border-slate-200 items-center">
            <View className="w-6 h-6 bg-blue-50 rounded-full items-center justify-center mb-1">
              {/* @ts-ignore */}
              <LayoutGrid size={12} color="#2563eb" />
            </View>
            <Text className="text-slate-400 font-bold text-[8px] uppercase tracking-widest mb-0.5">Area</Text>
            <Text className="text-[#0f172a] font-black text-[11px]">{stallSize} SQM</Text>
          </View>

          <View className="bg-white rounded-xl py-2 px-1 flex-1 shadow-sm border border-slate-200 items-center">
            <View className="w-6 h-6 bg-teal-50 rounded-full items-center justify-center mb-1">
              {/* @ts-ignore */}
              <Box size={12} color="#0d9488" />
            </View>
            <Text className="text-slate-400 font-bold text-[8px] uppercase tracking-widest mb-0.5" numberOfLines={1}>Type</Text>
            <Text className="text-[#0f172a] font-black text-[11px]" numberOfLines={1}>{stallType}</Text>
          </View>

          <View className="bg-white rounded-xl py-2 px-1 flex-1 shadow-sm border border-slate-200 items-center">
            <View className="w-6 h-6 bg-sky-50 rounded-full items-center justify-center mb-1">
              {/* @ts-ignore */}
              <Building size={12} color="#0ea5e9" />
            </View>
            <Text className="text-slate-400 font-bold text-[8px] uppercase tracking-widest mb-0.5">Hall</Text>
            <Text className="text-[#0f172a] font-black text-[11px]">Hall 04</Text>
          </View>
        </View>

        {/* Included Amenities */}
        <Text className="text-[#1a3a7c] font-black text-[13px] mb-1.5 ml-1 uppercase tracking-wider mt-1">Included Amenities</Text>
        <View className="bg-white rounded-[16px] shadow-sm border border-slate-200 p-1 mb-3">
          <AmenityItem icon={<Package size={16} color="#64748b" />} name="Shell Structure" desc="Octanorm wall panels" />
          <AmenityItem icon={<Sofa size={16} color="#64748b" />} name="Basic Furniture" desc="1 Counter & 2 Chairs" />
          <AmenityItem icon={<Zap size={16} color="#64748b" />} name="Electrical Supply" desc="3 Spotlights & 1 Power Socket" />
          <AmenityItem icon={<Box size={16} color="#64748b" />} name="Flooring" desc="Wall-to-wall synthetic carpet" />
          <AmenityItem icon={<Trash2 size={16} color="#64748b" />} name="Waste Bin" desc="1 Standard dustbin" isLast />
        </View>

        {/* Upgrade Banner */}
        <TouchableOpacity className="bg-[#1a3a7c] rounded-[16px] overflow-hidden mb-8 shadow-sm relative">
          <View className="absolute right-[-20px] bottom-[-20px] opacity-10">
            {/* @ts-ignore */}
            <PlusCircle size={100} color="#ffffff" />
          </View>
          <View className="p-5 flex-row items-center z-10">
            <View className="flex-1 pr-4">
              <Text className="text-white font-black text-[15px] mb-0.5">Need more setup?</Text>
              <Text className="text-blue-200 text-[11px] leading-relaxed">Book extra furniture, power, or hostesses easily.</Text>
            </View>
            <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20">
              {/* @ts-ignore */}
              <PlusCircle size={20} color="#60a5fa" />
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* Floor Plan Modal Viewer */}
      <FloorPlanViewer visible={showFloorPlan} onClose={() => setShowFloorPlan(false)} />
    </View>
  );
}

// Subcomponents
function AmenityItem({ icon, name, desc, isLast = false }: { icon: any, name: string, desc: string, isLast?: boolean }) {
  return (
    <View className={`flex-row items-center p-3 ${!isLast ? 'border-b border-slate-50' : ''}`}>
      <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center mr-3 border border-slate-100">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-slate-800 font-bold text-[13px]">{name}</Text>
        <Text className="text-slate-500 text-[10px] mt-0.5">{desc}</Text>
      </View>
    </View>
  );
}
