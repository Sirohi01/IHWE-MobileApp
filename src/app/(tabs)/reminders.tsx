import React, { useCallback, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';
import { Bell, ChevronLeft, CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { API_URL } from '@/core/config/env';

const RemindersScreen = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchData(true);
    }, [])
  );

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = await SecureStore.getItemAsync('exhibitorToken');
      const storedData = await SecureStore.getItemAsync('exhibitorData');
      
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setUserId(parsed.id);
      }

      const res = await apiClient.get('/reminders/my-reminders', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setReminders(res.data.data);
      }
    } catch (err) {
      console.log('Failed to fetch reminders', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(false);
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = await SecureStore.getItemAsync('exhibitorToken');
      await apiClient.post('/reminders/mark-read', { reminderId: id }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(); // Refresh list to update read status
    } catch (err) {
      console.log('Failed to mark as read', err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
      </View>
    );
  }

  // Grouping by Date
  const groupedReminders = reminders.reduce((acc: any, reminder) => {
    const date = new Date(reminder.added).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(reminder);
    return acc;
  }, {});

  const PriorityIcon = ({ priority }: { priority: string }) => {
    if (priority === 'High') return <AlertTriangle size={18} color="#ef4444" />;
    if (priority === 'Medium') return <AlertCircle size={18} color="#f59e0b" />;
    return <Clock size={18} color="#3b82f6" />;
  };

  const sections = Object.keys(groupedReminders).map(dateStr => ({
    title: dateStr,
    data: groupedReminders[dateStr]
  }));

  const renderItem = ({ item: r }: { item: any }) => {
    const isRead = userId && r.readBy?.includes(userId);
    
    return (
      <TouchableOpacity 
        onPress={() => handleMarkAsRead(r._id)}
        className={`bg-white p-4 rounded-2xl mb-3 border shadow-sm ${
          isRead ? 'border-slate-100 opacity-70' : 'border-[#1a3a7c]/20'
        }`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center gap-2 flex-1">
            {!isRead && <View className="w-2 h-2 rounded-full bg-[#1a3a7c] mt-1" />}
            <Text className={`text-[15px] flex-1 ${isRead ? 'text-slate-700 font-semibold' : 'text-slate-900 font-black'}`}>
              {r.title}
            </Text>
          </View>
          <View className="ml-2 mt-0.5">
            <PriorityIcon priority={r.priority} />
          </View>
        </View>
        
        <Text className="text-[13px] text-slate-500 leading-5 ml-[18px]">
          {r.message}
        </Text>
        
        <View className="flex-row justify-between items-center mt-3 ml-[18px]">
          <Text className="text-[10px] text-slate-400 font-medium">
            {new Date(r.added).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
          {isRead && (
            <View className="flex-row items-center gap-1">
              <CheckCircle2 size={12} color="#10b981" />
              <Text className="text-[10px] text-emerald-500 font-bold">Read</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View className="mb-3 ml-1 mt-2">
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#f4f7f9] pt-12">
      {/* Header */}
      <View className="flex-row items-center px-4 mb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-black/5">
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-[20px] font-black text-slate-900 ml-2">Notifications</Text>
      </View>

      {sections.length === 0 ? (
        <SectionList
          className="flex-1"
          sections={[]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={() => null}
          renderSectionHeader={() => (
            <View className="items-center justify-center py-20 mt-10">
              <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Bell size={32} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 font-semibold text-lg">No Notifications</Text>
              <Text className="text-slate-400 text-sm mt-1 text-center px-6">You're all caught up! New reminders will appear here.</Text>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1a3a7c"]} />}
        />
      ) : (
        <SectionList
          className="flex-1"
          sections={sections}
          keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1a3a7c"]} />
          }
          initialNumToRender={7}
          windowSize={5}
        />
      )}
    </View>
  );
};

export default RemindersScreen;
