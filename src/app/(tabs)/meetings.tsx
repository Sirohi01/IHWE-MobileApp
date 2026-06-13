import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Calendar, Clock, MapPin, Users, CheckCircle2, XCircle, Inbox } from 'lucide-react-native';
import { router } from 'expo-router';
import { apiClient } from '@/core/api/axios';

type Meeting = {
  _id: string;
  buyerId?: any;
  date?: string;
  timeSlot?: string;
  location?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';
  requestedBy: 'Admin' | 'Exhibitor' | 'Buyer';
  exhibitorApproval?: 'Pending' | 'Approved' | 'Rejected';
  buyerApproval?: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  adminNotes?: string;
};

const statusStyle: Record<string, string> = {
  Approved: 'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
  Rejected: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-slate-100 text-slate-600',
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

export default function MeetingsTab() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Pending' | 'Past'>('Upcoming');
  const [exhibitorId, setExhibitorId] = useState('');

  const fetchMeetings = async () => {
    try {
      const dashboard = await apiClient.get('/exhibitor-auth/dashboard');
      const id = dashboard.data?.data?._id;
      if (!id) {
        router.replace('/(auth)/login');
        return;
      }
      setExhibitorId(id);
      const res = await apiClient.get(`/bsm/exhibitor/${id}`);
      setMeetings(res.data?.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not load meetings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const filteredMeetings = useMemo(() => {
    const now = new Date();
    return meetings.filter((meeting) => {
      const meetingDate = meeting.date ? new Date(meeting.date) : null;
      if (activeTab === 'Pending') return meeting.status === 'Pending';
      if (activeTab === 'Past') {
        return (
          meeting.status === 'Completed' ||
          meeting.status === 'Rejected' ||
          meeting.status === 'Cancelled' ||
          (meeting.status === 'Approved' && meetingDate ? meetingDate < now : false)
        );
      }
      return meeting.status === 'Approved' && (!meetingDate || meetingDate >= now);
    });
  }, [meetings, activeTab]);

  const respond = async (meetingId: string, approval: 'Approved' | 'Rejected') => {
    try {
      await apiClient.put(`/bsm/exhibitor/respond/${meetingId}`, { approval });
      Alert.alert('Updated', `Meeting ${approval.toLowerCase()}`);
      fetchMeetings();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not update meeting');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Meetings...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f4f7f9] pt-12">
      <View className="px-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-[24px] font-black text-[#1a3a7c] tracking-tight">Meetings</Text>
            <Text className="text-slate-500 text-[12px]">Buyer, admin assigned, and requested BSM meetings</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/buyers-management')} className="bg-[#1a3a7c] px-3 py-2 rounded-xl">
            <Text className="text-white text-xs font-black">Find Buyers</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row bg-white rounded-2xl p-1 border border-slate-200">
          {(['Upcoming', 'Pending', 'Past'] as const).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-xl ${activeTab === tab ? 'bg-[#1a3a7c]' : ''}`}>
              <Text className={`text-center text-xs font-black ${activeTab === tab ? 'text-white' : 'text-slate-500'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeetings(); }} />}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {filteredMeetings.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center border border-slate-200 mt-4">
            <Inbox size={34} color="#94a3b8" />
            <Text className="text-slate-700 font-black mt-3">No {activeTab.toLowerCase()} meetings</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">Requests from buyers and admin assigned meetings will appear here.</Text>
          </View>
        ) : filteredMeetings.map(meeting => {
          const buyerName = capitalizeText(meeting.buyerId?.companyName || meeting.buyerId?.fullName, 'Buyer');
          const buyerInfo = capitalizeText(
            meeting.buyerId?.designation || meeting.buyerId?.primaryProductInterest,
            'Buyer Seller Meet'
          );
          const requestedBy = capitalizeText(meeting.requestedBy);
          const buyerApproval = capitalizeText(meeting.buyerApproval, 'Pending');
          const exhibitorApproval = capitalizeText(meeting.exhibitorApproval, 'Pending');
          const needsResponse = meeting.requestedBy === 'Buyer' && meeting.exhibitorApproval === 'Pending' && meeting.status !== 'Rejected';
          return (
            <View key={meeting._id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-3">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center mb-1">
                    <Users size={14} color="#1a3a7c" />
                    <Text className="text-[#1a3a7c] font-black ml-1.5">{buyerName}</Text>
                  </View>
                  <Text className="text-slate-500 text-xs">{buyerInfo}</Text>
                </View>
                <View className={`px-2 py-1 rounded ${statusStyle[meeting.status] || statusStyle.Pending}`}>
                  <Text className={`text-[10px] font-black uppercase ${statusStyle[meeting.status]?.split(' ')[1] || 'text-amber-700'}`}>{meeting.status}</Text>
                </View>
              </View>

              <View className="bg-slate-50 rounded-xl p-3 mb-3">
                <View className="flex-row items-center mb-2">
                  <Calendar size={13} color="#64748b" />
                  <Text className="text-slate-600 text-xs font-bold ml-2">{meeting.date ? new Date(meeting.date).toLocaleDateString('en-IN') : 'Awaiting admin schedule'}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Clock size={13} color="#64748b" />
                  <Text className="text-slate-600 text-xs font-bold ml-2">{meeting.timeSlot || 'Time slot pending'}</Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={13} color="#64748b" />
                  <Text className="text-slate-600 text-xs font-bold ml-2">{meeting.location || 'Venue pending'}</Text>
                </View>
              </View>

              <Text className="text-[10px] text-slate-400 font-bold uppercase">Requested By: {requestedBy}</Text>
              <Text className="text-[10px] text-slate-500 mt-1">
                Buyer: {buyerApproval} | Exhibitor: {exhibitorApproval}
              </Text>

              {needsResponse && (
                <View className="flex-row gap-2 mt-4">
                  <TouchableOpacity onPress={() => respond(meeting._id, 'Rejected')} className="flex-1 flex-row items-center justify-center py-3 rounded-xl bg-red-50 border border-red-100">
                    <XCircle size={16} color="#dc2626" />
                    <Text className="text-red-600 font-black text-xs ml-1">Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => respond(meeting._id, 'Approved')} className="flex-1 flex-row items-center justify-center py-3 rounded-xl bg-green-600">
                    <CheckCircle2 size={16} color="white" />
                    <Text className="text-white font-black text-xs ml-1">Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
