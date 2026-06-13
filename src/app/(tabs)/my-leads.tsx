import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Building, Phone, Mail, FileText, Calendar, Check, X, Search, Thermometer, PenSquare } from 'lucide-react-native';
import { router } from 'expo-router';
import { apiClient } from '@/core/api/axios';

export default function MyLeadsScreen() {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  const fetchLeads = async () => {
    try {
      const response = await apiClient.get('/exhibitor-leads/my');
      if (response.data.success) {
        setAllLeads(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      Alert.alert('Error', 'Failed to load your captured leads.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const needle = searchQuery.trim().toLowerCase();
    const nextLeads = allLeads.filter((lead) => {
      const tempMatches = activeTab === 'All' || (lead.temperature || 'Uncategorized') === activeTab;
      const sourceMatches = sourceFilter === 'All' || (lead.sourceType || 'unknown') === sourceFilter.toLowerCase();
      const text = [
        lead.name,
        lead.company,
        lead.designation,
        lead.phone,
        lead.email,
        lead.registrationId,
        lead.interest,
        lead.notes
      ].join(' ').toLowerCase();
      return tempMatches && sourceMatches && (!needle || text.includes(needle));
    });

    setLeads(nextLeads);
  }, [allLeads, activeTab, sourceFilter, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeads();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const openDialer = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Failed to open dialer.');
    });
  };

  const openEmail = (email: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Error', 'Failed to open email app.');
    });
  };

  const updateLead = async (id: string, updates: any) => {
    try {
      const res = await apiClient.put(`/exhibitor-leads/${id}`, updates);
      if (res.data.success) {
        setAllLeads(prev => prev.map(l => l._id === id ? res.data.data : l));
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update lead');
    }
  };

  const getTemperatureConfig = (temp: string) => {
    switch (temp) {
      case 'Hot': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', iconColor: '#dc2626' };
      case 'Warm': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', iconColor: '#ea580c' };
      case 'Cold': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', iconColor: '#2563eb' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', iconColor: '#475569' };
    }
  };

  const openEditModal = (lead: any) => {
    setSelectedLead(lead);
    setTempNotes(lead.notes || '');
    setModalVisible(true);
  };

  const LeadCard = ({ lead }: { lead: any }) => {
    const tempConfig = getTemperatureConfig(lead.temperature || 'Uncategorized');
    
    return (
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
        {/* Header Row */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-4">
            <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>
              {lead.name || 'Unknown Name'}
            </Text>
            <Text className="text-sm text-slate-500 font-medium mt-0.5" numberOfLines={1}>
              {lead.designation || 'Visitor'}
            </Text>
            <Text className="text-[10px] text-indigo-500 font-black mt-1 uppercase tracking-wider">
              {(lead.sourceType || 'unknown')} lead
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => openEditModal(lead)}
            className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${tempConfig.bg} ${tempConfig.border}`}
          >
            <Thermometer size={12} color={tempConfig.iconColor} />
            <Text className={`text-[10px] font-black uppercase tracking-wider ${tempConfig.text}`}>
              {lead.temperature || 'Uncategorized'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Details Row */}
        <View className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          {lead.company ? (
            <View className="flex-row items-center">
              <Building size={14} color="#64748b" className="mr-2.5" />
              <Text className="text-[13px] font-medium text-slate-700 flex-1" numberOfLines={1}>{lead.company}</Text>
            </View>
          ) : null}

          {lead.interest ? (
            <View className="flex-row items-center">
              <FileText size={14} color="#64748b" className="mr-2.5" />
              <Text className="text-[13px] font-medium text-slate-700 flex-1" numberOfLines={1}>{lead.interest}</Text>
            </View>
          ) : null}

          <View className="flex-row items-center">
            <Calendar size={14} color="#64748b" className="mr-2.5" />
            <Text className="text-[12px] font-medium text-slate-500">{formatDate(lead.createdAt)}</Text>
          </View>
        </View>

        {/* Notes Preview (if any) */}
        {lead.notes ? (
          <View className="mb-4">
            <Text className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Notes</Text>
            <Text className="text-sm text-slate-600 italic leading-snug" numberOfLines={2}>"{lead.notes}"</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View className="flex-row gap-3 pt-1">
          <TouchableOpacity 
            className="flex-1 bg-[#f0fdf4] flex-row items-center justify-center py-3 rounded-xl border border-[#bbf7d0]"
            onPress={() => openDialer(lead.phone)}
            disabled={!lead.phone}
            style={{ opacity: lead.phone ? 1 : 0.5 }}
          >
            <Phone size={16} color="#16a34a" className="mr-2" />
            <Text className="text-[#16a34a] font-bold text-sm tracking-wide">Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-[#eff6ff] flex-row items-center justify-center py-3 rounded-xl border border-[#bfdbfe]"
            onPress={() => openEmail(lead.email)}
            disabled={!lead.email}
            style={{ opacity: lead.email ? 1 : 0.5 }}
          >
            <Mail size={16} color="#2563eb" className="mr-2" />
            <Text className="text-[#2563eb] font-bold text-sm tracking-wide">Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-12 bg-slate-100 flex-row items-center justify-center py-3 rounded-xl border border-slate-200"
            onPress={() => openEditModal(lead)}
          >
            <PenSquare size={16} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const tabs = ['All', 'Hot', 'Warm', 'Cold', 'Uncategorized'];
  const sourceTabs = ['All', 'Buyer', 'Visitor', 'Unknown'];

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      {/* Header */}
      <View className="bg-white px-5 py-4 flex-row items-center justify-between shadow-sm border-b border-slate-200 z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">My Leads</Text>
            <Text className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wider">{allLeads.length} total captured</Text>
          </View>
        </View>
        <View className="bg-indigo-50 w-12 h-12 rounded-full items-center justify-center border border-indigo-100 shadow-sm">
          <Users size={22} color="#4f46e5" />
        </View>
      </View>

      {/* Search & Filter Tabs */}
      <View className="bg-white border-b border-slate-200">
        <View className="px-4 pt-3">
          <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex-row items-center">
            <Search size={16} color="#94a3b8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search name, company, phone, email..."
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-2 text-slate-800 font-semibold text-[13px]"
              autoCapitalize="none"
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pt-3 px-4">
          {sourceTabs.map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setSourceFilter(tab)}
              className={`mr-3 px-4 py-2 rounded-full border ${sourceFilter === tab ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-bold text-xs ${sourceFilter === tab ? 'text-white' : 'text-slate-600'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="w-8" />
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3 px-4">
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-3 px-5 py-2 rounded-full border ${activeTab === tab ? 'bg-[#1e293b] border-[#1e293b]' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-bold text-sm ${activeTab === tab ? 'text-white' : 'text-slate-600'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="w-8" />
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-slate-500 mt-4 font-bold tracking-wide">LOADING LEADS...</Text>
        </View>
      ) : leads.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center mb-6 shadow-sm">
            <Search size={40} color="#94a3b8" />
          </View>
          <Text className="text-2xl font-black text-slate-800 text-center mb-3">No Leads Found</Text>
          <Text className="text-center text-slate-500 font-medium leading-relaxed mb-8">
            {activeTab === 'All' 
              ? "You haven't captured any leads yet. Use the scanner to start building your network."
              : "No leads match your current search or filters."}
          </Text>
          {activeTab === 'All' && (
            <TouchableOpacity 
              className="bg-[#4f46e5] px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/30"
              onPress={() => router.push('/(tabs)/scanner')}
            >
              <Text className="text-white font-bold text-[15px] tracking-wide">Open Scanner</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4 pt-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4f46e5"]} />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} />
          ))}
        </ScrollView>
      )}

      {/* Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-end p-4">
          <View className="bg-white rounded-3xl p-6 pb-8 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-800">Update Lead</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Lead Temperature</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {['Hot', 'Warm', 'Cold', 'Uncategorized'].map(temp => {
                const isSelected = selectedLead?.temperature === temp;
                const config = getTemperatureConfig(temp);
                return (
                  <TouchableOpacity
                    key={temp}
                    onPress={() => updateLead(selectedLead._id, { temperature: temp })}
                    className={`px-4 py-2.5 rounded-full border-2 flex-row items-center gap-2 ${isSelected ? config.border + ' ' + config.bg : 'border-slate-200 bg-white'}`}
                  >
                    {isSelected && <Check size={14} color={config.iconColor} />}
                    <Text className={`font-bold ${isSelected ? config.text : 'text-slate-600'}`}>{temp}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Internal Notes</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-medium text-base mb-6"
              placeholder="Add follow-up notes here..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={tempNotes}
              onChangeText={setTempNotes}
            />

            <TouchableOpacity 
              className="bg-[#1e293b] w-full py-4 rounded-xl items-center shadow-lg"
              onPress={() => updateLead(selectedLead._id, { notes: tempNotes })}
            >
              <Text className="text-white font-bold text-[15px] tracking-wide">Save Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
