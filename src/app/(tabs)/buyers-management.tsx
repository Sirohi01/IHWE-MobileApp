import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Search, Building2, MapPin, Briefcase, CalendarPlus, ChevronLeft, CheckCircle2, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { apiClient } from '@/core/api/axios';

const PAGE_SIZE = 7;

type Buyer = {
  _id: string;
  companyName?: string;
  companyFirmName?: string;
  fullName?: string;
  designation?: string;
  businessType?: string;
  primaryProductInterest?: string;
  secondaryProductCategories?: string[];
  country?: string;
  stateProvince?: string;
  city?: string;
  registrationId?: string;
};

type BuyerMeetingState = {
  status?: string;
  date?: string;
  timeSlot?: string;
};

const capitalizeText = (value?: string | null, fallback = '') => {
  if (!value) return fallback;
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function BuyersManagementScreen() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [exhibitorId, setExhibitorId] = useState('');
  const [requestedMeetings, setRequestedMeetings] = useState<Record<string, BuyerMeetingState>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fetchData = async () => {
    try {
      const dash = await apiClient.get('/exhibitor-auth/dashboard');
      const id = dash.data?.data?._id;
      if (!id) return router.replace('/(auth)/login');
      setExhibitorId(id);

      const [buyerRes, catRes, meetingsRes] = await Promise.all([
        apiClient.get('/bsm/buyers', { params: { search: searchQuery, primaryCategory: activeCategory, limit: 100 } }),
        apiClient.get('/bsm/buyers/categories').catch(() => null),
        apiClient.get(`/bsm/exhibitor/${id}`).catch(() => null),
      ]);
      setBuyers(buyerRes.data?.data || []);
      setCategories(catRes?.data?.primaryCategories || []);
      const meetingMap: Record<string, BuyerMeetingState> = {};
      (meetingsRes?.data?.data || []).forEach((meeting: any) => {
        const buyerId = String(meeting.buyerId?._id || meeting.buyerId || '');
        if (!buyerId || ['Rejected', 'Cancelled'].includes(meeting.status)) return;
        meetingMap[buyerId] = {
          status: meeting.status,
          date: meeting.date,
          timeSlot: meeting.timeSlot,
        };
      });
      setRequestedMeetings(meetingMap);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not load buyers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 350);
    setVisibleCount(PAGE_SIZE);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  const visibleBuyers = buyers.slice(0, visibleCount);
  const hasMoreBuyers = visibleCount < buyers.length;

  const requestMeeting = async (buyer: Buyer) => {
    if (!exhibitorId) return;
    try {
      await apiClient.post('/bsm/exhibitor/request', {
        exhibitorId,
        buyerId: buyer._id,
        remarks: `Meeting interest from mobile app for ${buyer.companyName || buyer.companyFirmName || buyer.fullName || 'buyer'}`,
      });
      Alert.alert('Request Sent', 'Your meeting interest has been sent. Admin will assign a slot.');
      setRequestedMeetings((prev) => ({
        ...prev,
        [buyer._id]: { status: 'Pending' },
      }));
    } catch (error: any) {
      Alert.alert('Could not request meeting', error.response?.data?.message || 'Please try again.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Buyers...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      <View className="bg-white pt-14 pb-4 px-5 border-b border-slate-200">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-slate-50 rounded-full items-center justify-center border border-slate-200 mr-3">
            <ChevronLeft size={20} color="#334155" />
          </TouchableOpacity>
          <View>
            <Text className="text-[#1a3a7c] font-black text-xl">Buyers Management</Text>
            <Text className="text-slate-500 text-xs">Find buyers and request BSM meetings</Text>
          </View>
        </View>
        <View className="bg-slate-50 rounded-2xl px-4 h-12 flex-row items-center border border-slate-200">
          <Search size={17} color="#64748b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search company, buyer, category..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2 text-slate-800 font-semibold text-sm"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3" contentContainerStyle={{ paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={() => setActiveCategory('')} className={`px-4 py-2 rounded-full mr-2 ${!activeCategory ? 'bg-[#1a3a7c]' : 'bg-white border border-slate-200'}`}>
            <Text className={`text-xs font-black ${!activeCategory ? 'text-white' : 'text-slate-500'}`}>All</Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity key={category} onPress={() => setActiveCategory(category)} className={`px-4 py-2 rounded-full mr-2 ${activeCategory === category ? 'bg-[#1a3a7c]' : 'bg-white border border-slate-200'}`}>
              <Text className={`text-xs font-black ${activeCategory === category ? 'text-white' : 'text-slate-500'}`}>{capitalizeText(category)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="px-4">
          {buyers.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center border border-slate-200">
              <Building2 size={34} color="#94a3b8" />
              <Text className="text-slate-700 font-black mt-3">No buyers found</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">Try changing the search or category filter.</Text>
            </View>
          ) : visibleBuyers.map(buyer => {
            const buyerName = capitalizeText(buyer.companyName || buyer.companyFirmName || buyer.fullName, 'Buyer');
            const buyerInfo = capitalizeText(buyer.designation || buyer.businessType, 'Buyer');
            const productInterest = capitalizeText(buyer.primaryProductInterest, 'Product Interest Not Specified');
            const location = [buyer.city, buyer.stateProvince, buyer.country]
              .filter(Boolean)
              .map((item) => capitalizeText(item))
              .join(', ') || 'Location Not Specified';
            const secondaryCategories = buyer.secondaryProductCategories
              ?.map((item) => capitalizeText(item))
              .filter(Boolean)
              .join(', ');
            const meetingState = requestedMeetings[buyer._id];
            const hasRequested = !!meetingState;
            const isScheduled = meetingState?.status === 'Approved';
            const buttonLabel = isScheduled ? 'Meeting Scheduled' : hasRequested ? 'Already Requested' : 'Request Meeting';

            return (
            <View key={buyer._id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-slate-900 font-black text-base">{buyerName}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{buyerInfo}</Text>
                </View>
                <View className="bg-blue-50 px-2 py-1 rounded border border-blue-100">
                  <Text className="text-blue-700 text-[10px] font-black">{buyer.registrationId || 'Buyer'}</Text>
                </View>
              </View>
              <View className="mt-3 bg-slate-50 rounded-xl p-3">
                <View className="flex-row items-center mb-2">
                  <Briefcase size={14} color="#64748b" />
                  <Text className="text-slate-600 text-xs font-bold ml-2">{productInterest}</Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={14} color="#64748b" />
                  <Text className="text-slate-600 text-xs font-bold ml-2">{location}</Text>
                </View>
              </View>
              {!!secondaryCategories && (
                <Text className="text-slate-400 text-[10px] mt-2" numberOfLines={2}>{secondaryCategories}</Text>
              )}
              {hasRequested && (
                <View className={`mt-3 rounded-xl p-3 border ${isScheduled ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                  <View className="flex-row items-center">
                    {isScheduled ? <CheckCircle2 size={14} color="#16a34a" /> : <Clock size={14} color="#d97706" />}
                    <Text className={`text-xs font-black ml-2 ${isScheduled ? 'text-green-700' : 'text-amber-700'}`}>
                      {isScheduled ? 'Scheduled by admin' : 'Request already sent'}
                    </Text>
                  </View>
                  {isScheduled && (
                    <Text className="text-[10px] text-green-700 mt-1 font-semibold">
                      {meetingState?.date ? new Date(meetingState.date).toLocaleDateString('en-IN') : 'Date pending'} - {meetingState?.timeSlot || 'Time pending'}
                    </Text>
                  )}
                </View>
              )}
              <TouchableOpacity
                onPress={() => requestMeeting(buyer)}
                disabled={hasRequested}
                className={`mt-4 rounded-xl py-3 flex-row items-center justify-center ${hasRequested ? 'bg-slate-200' : 'bg-[#1a3a7c]'}`}
              >
                {hasRequested ? <CheckCircle2 size={16} color="#64748b" /> : <CalendarPlus size={16} color="white" />}
                <Text className={`font-black text-xs ml-2 uppercase tracking-wider ${hasRequested ? 'text-slate-500' : 'text-white'}`}>
                  {buttonLabel}
                </Text>
              </TouchableOpacity>
            </View>
            );
          })}

          {hasMoreBuyers && (
            <TouchableOpacity
              onPress={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, buyers.length))}
              className="bg-white rounded-2xl py-3 items-center border border-slate-200 mb-3"
            >
              <Text className="text-[#1a3a7c] font-black text-xs uppercase tracking-wider">
                Load More ({buyers.length - visibleCount} left)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
