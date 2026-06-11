import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { Search, Filter, Calendar as CalendarIcon, MapPin, Clock, MessageSquare, MoreVertical, Plus, Briefcase, ChevronRight, Video, CalendarCheck, X } from 'lucide-react-native';

const MOCK_MEETINGS = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    company: 'Global Health Innovations',
    role: 'Procurement Director',
    topic: 'Bulk Order Discussion for Surgical Equipments',
    date: '22 Aug 2026',
    time: '10:30 AM - 11:00 AM',
    location: 'Stall 42 (Your Stall)',
    type: 'In-Person',
    status: 'Confirmed',
    avatar: 'https://i.pravatar.cc/150?img=47'
  },
  {
    id: '2',
    name: 'Dr. Ramesh Kumar',
    company: 'Apollo Hospitals',
    role: 'Chief Medical Officer',
    topic: 'Partnership for New MedTech Solutions',
    date: '22 Aug 2026',
    time: '02:00 PM - 02:45 PM',
    location: 'Networking Lounge, Hall B',
    type: 'In-Person',
    status: 'Confirmed',
    avatar: 'https://i.pravatar.cc/150?img=11'
  },
  {
    id: '3',
    name: 'Priya Sharma',
    company: 'MedTech Solutions',
    role: 'Business Developer',
    topic: 'Product Demo & Distribution Rights',
    date: '23 Aug 2026',
    time: '11:15 AM - 11:45 AM',
    location: 'Virtual Link (Zoom)',
    type: 'Virtual',
    status: 'Pending',
    avatar: 'https://i.pravatar.cc/150?img=32'
  }
];

export default function MeetingsTab() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('All');
  
  // Modal states
  const [isScheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [modalLocation, setModalLocation] = useState('My Stall');
  const [modalDate, setModalDate] = useState('');
  const [modalTime, setModalTime] = useState('');
  
  const filteredMeetings = MOCK_MEETINGS.filter(m => {
    // 1. Tab Filter
    let tabMatch = false;
    if (activeTab === 'Upcoming') tabMatch = m.status === 'Confirmed';
    else if (activeTab === 'Pending') tabMatch = m.status === 'Pending';
    else tabMatch = false; // Past is empty
    
    if (!tabMatch) return false;

    // 2. Type Filter
    if (filterType !== 'All' && m.type !== filterType) {
      return false;
    }

    return true;
  });

  return (
    <View className="flex-1 bg-[#f0f4f8] pt-12">

      {/* Premium Header */}
      <View className="px-4 mb-5">
        <View className="flex-row justify-between items-center w-full mb-4 h-12">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View className="w-1.5 h-4 bg-orange-500 rounded-full mr-2" />
              <Text className="text-[24px] font-black text-[#1a3a7c] tracking-tight">Meetings</Text>
            </View>
            <Text className="text-slate-500 text-[12px] ml-3.5">Grow your B2B network</Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={() => setShowFilters(!showFilters)}
              className="bg-[#1a3a7c] p-2.5 rounded-xl shadow-sm"
            >
              {/* @ts-ignore */}
              <Filter size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expandable Filter Row */}
        {showFilters && (
          <View className="flex-row items-center mb-4 bg-blue-50 p-2 rounded-xl border border-blue-100">
            <Text className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mr-3">Type:</Text>
            
            <TouchableOpacity 
              onPress={() => setFilterType('All')}
              className="px-3 py-1.5 rounded-lg mr-2"
              style={{ backgroundColor: filterType === 'All' ? '#1a3a7c' : '#ffffff', borderWidth: 1, borderColor: filterType === 'All' ? '#1a3a7c' : '#cbd5e1' }}
            >
              <Text style={{ color: filterType === 'All' ? '#ffffff' : '#64748b', fontSize: 10, fontWeight: 'bold' }}>All</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setFilterType('In-Person')}
              className="px-3 py-1.5 rounded-lg mr-2"
              style={{ backgroundColor: filterType === 'In-Person' ? '#1a3a7c' : '#ffffff', borderWidth: 1, borderColor: filterType === 'In-Person' ? '#1a3a7c' : '#cbd5e1' }}
            >
              <Text style={{ color: filterType === 'In-Person' ? '#ffffff' : '#64748b', fontSize: 10, fontWeight: 'bold' }}>In-Person</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setFilterType('Virtual')}
              className="px-3 py-1.5 rounded-lg mr-2"
              style={{ backgroundColor: filterType === 'Virtual' ? '#1a3a7c' : '#ffffff', borderWidth: 1, borderColor: filterType === 'Virtual' ? '#1a3a7c' : '#cbd5e1' }}
            >
              <Text style={{ color: filterType === 'Virtual' ? '#ffffff' : '#64748b', fontSize: 10, fontWeight: 'bold' }}>Virtual</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Summary Bar */}
        <View className="flex-row justify-between bg-white rounded-2xl p-3 shadow-sm border border-slate-200">
          <View className="items-center flex-1 border-r border-slate-100">
            <Text className="text-[#16a34a] font-black text-[18px]">2</Text>
            <Text className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Confirmed</Text>
          </View>
          <View className="items-center flex-1 border-r border-slate-100">
            <Text className="text-[#f97316] font-black text-[18px]">1</Text>
            <Text className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Pending</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-[#1a3a7c] font-black text-[18px]">0</Text>
            <Text className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Requests</Text>
          </View>
        </View>
      </View>

      {/* Interactive Tabs */}
      <View className="px-4 mb-4">
        <View className="flex-row bg-slate-200/60 rounded-xl p-1 border border-slate-200/50">
          <TouchableOpacity 
            onPress={() => setActiveTab('Upcoming')}
            className="flex-1 py-2.5 rounded-lg items-center"
            style={{ backgroundColor: activeTab === 'Upcoming' ? '#ffffff' : 'transparent' }}
          >
            <Text className="text-[12px]" style={{ fontWeight: activeTab === 'Upcoming' ? '900' : 'bold', color: activeTab === 'Upcoming' ? '#1a3a7c' : '#64748b' }}>
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('Pending')}
            className="flex-1 py-2.5 rounded-lg items-center"
            style={{ backgroundColor: activeTab === 'Pending' ? '#ffffff' : 'transparent' }}
          >
            <Text className="text-[12px]" style={{ fontWeight: activeTab === 'Pending' ? '900' : 'bold', color: activeTab === 'Pending' ? '#1a3a7c' : '#64748b' }}>
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('Past')}
            className="flex-1 py-2.5 rounded-lg items-center"
            style={{ backgroundColor: activeTab === 'Past' ? '#ffffff' : 'transparent' }}
          >
            <Text className="text-[12px]" style={{ fontWeight: activeTab === 'Past' ? '900' : 'bold', color: activeTab === 'Past' ? '#1a3a7c' : '#64748b' }}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Meeting List */}
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {filteredMeetings.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-slate-200 rounded-full items-center justify-center mb-4">
              {/* @ts-ignore */}
              <CalendarIcon size={32} color="#94a3b8" />
            </View>
            <Text className="text-[#1a3a7c] font-black text-[16px] mb-1">No {activeTab} Meetings</Text>
            <Text className="text-slate-500 text-[12px] text-center px-10">You don't have any {activeTab.toLowerCase()} meetings scheduled at the moment.</Text>
          </View>
        ) : (
          filteredMeetings.map((meeting) => (
            <View key={meeting.id} className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm w-full overflow-hidden">

              {/* Decorative Accent Line */}
              <View 
                className="absolute left-0 top-0 bottom-0 w-1" 
                style={{ backgroundColor: meeting.status === 'Confirmed' ? '#22c55e' : '#fb923c' }} 
              />

              {/* Card Header (Status & Type) */}
              <View className="flex-row justify-between items-center mb-3 pl-2">
                <View className="flex-row gap-2">
                  <View 
                    className="px-2 py-1 rounded border"
                    style={{ 
                      backgroundColor: meeting.status === 'Confirmed' ? '#f0fdf4' : '#fff7ed',
                      borderColor: meeting.status === 'Confirmed' ? '#bbf7d0' : '#fed7aa'
                    }}
                  >
                    <Text 
                      className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color: meeting.status === 'Confirmed' ? '#16a34a' : '#f97316' }}
                    >
                      {meeting.status}
                    </Text>
                  </View>
                  <View className="px-2 py-1 rounded bg-slate-100 border border-slate-200 flex-row items-center gap-1">
                    {meeting.type === 'Virtual' ? (
                      // @ts-ignore
                      <Video size={10} color="#475569" />
                    ) : (
                      // @ts-ignore
                      <MapPin size={10} color="#475569" />
                    )}
                    <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      {meeting.type}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  {/* @ts-ignore */}
                  <MoreVertical size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Person Info */}
              <View className="flex-row items-center mb-4 pl-2">
                <Image
                  source={{ uri: meeting.avatar }}
                  className="w-14 h-14 rounded-full mr-3 border-2 border-white shadow-sm"
                />
                <View className="flex-1">
                  <Text className="text-[#1a3a7c] font-black text-[16px] mb-0.5">{meeting.name}</Text>
                  <View className="flex-row items-center mb-0.5 gap-1">
                    {/* @ts-ignore */}
                    <Briefcase size={12} color="#64748b" />
                    <Text className="text-slate-600 font-bold text-[12px]">{meeting.role}</Text>
                  </View>
                  <Text className="text-slate-400 text-[11px] font-medium">{meeting.company}</Text>
                </View>
              </View>

              {/* Topic Box */}
              <View className="bg-blue-50/50 rounded-lg p-3 mb-4 border border-blue-100/50 ml-2">
                <Text className="text-[#1e3a8a] text-[10px] font-bold uppercase tracking-wider mb-1">Agenda / Topic</Text>
                <Text className="text-[#1e3a8a] text-[12px] font-medium leading-snug">{meeting.topic}</Text>
              </View>

              {/* Time & Location */}
              <View className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100 ml-2">
                <View className="flex-row items-center mb-2.5">
                  {/* @ts-ignore */}
                  <CalendarIcon size={14} color="#64748b" />
                  <Text className="text-slate-600 text-[11.5px] font-black ml-2">{meeting.date}</Text>
                  <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
                  {/* @ts-ignore */}
                  <Clock size={14} color="#64748b" />
                  <Text className="text-slate-600 text-[11.5px] font-black ml-2">{meeting.time}</Text>
                </View>
                <View className="flex-row items-center">
                  {/* @ts-ignore */}
                  <MapPin size={14} color="#3b82f6" />
                  <Text className="text-[#3b82f6] text-[11.5px] font-bold ml-2">{meeting.location}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 ml-2">
                {meeting.status === 'Confirmed' && (
                  <TouchableOpacity className="flex-1 bg-white border border-slate-300 py-3 rounded-xl items-center justify-center flex-row shadow-sm gap-2">
                    {/* @ts-ignore */}
                    <CalendarCheck size={14} color="#475569" />
                    <Text className="text-slate-600 font-black text-[12px]">Add to Cal</Text>
                  </TouchableOpacity>
                )}

                {meeting.status === 'Pending' && (
                  <TouchableOpacity className="flex-1 bg-white border border-slate-300 py-3 rounded-xl items-center justify-center flex-row shadow-sm">
                    <Text className="text-slate-600 font-black text-[12px]">Reschedule</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  className="flex-[1.5] py-3 rounded-xl items-center justify-center flex-row shadow-sm"
                  style={{ backgroundColor: meeting.status === 'Confirmed' ? '#1a3a7c' : '#f97316' }}
                >
                  {meeting.status === 'Confirmed' ? (
                    <>
                      {/* @ts-ignore */}
                      <MessageSquare size={14} color="#fff" />
                      <Text className="text-white font-black text-[12px] ml-2">Message</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-white font-black text-[12px] mr-1">Accept Request</Text>
                      {/* @ts-ignore */}
                      <ChevronRight size={16} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => setScheduleModalVisible(true)}
        className="absolute bottom-6 right-6 w-16 h-16 bg-[#16a34a] rounded-full items-center justify-center shadow-lg border-4 border-[#dcfce7]"
      >
        {/* @ts-ignore */}
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Schedule Meeting Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isScheduleModalVisible}
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[70%]">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-[20px] font-black text-[#1a3a7c]">Schedule Meeting</Text>
                <Text className="text-slate-500 text-[12px] mt-1">Send a B2B request to an attendee</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setScheduleModalVisible(false)}
                className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
              >
                {/* @ts-ignore */}
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Search Attendee */}
              <Text className="text-[#1a3a7c] font-bold text-[12px] uppercase tracking-wider mb-2">Search Attendee</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 mb-5">
                {/* @ts-ignore */}
                <Search size={16} color="#94a3b8" />
                <TextInput 
                  style={{ flex: 1, marginLeft: 8, fontSize: 14, color: '#1a3a7c', padding: 0 }}
                  placeholder="Enter name or company..."
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Date & Time */}
              <View className="flex-row gap-4 mb-5">
                <View className="flex-1">
                  <Text className="text-[#1a3a7c] font-bold text-[12px] uppercase tracking-wider mb-2">Date</Text>
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
                    {/* @ts-ignore */}
                    <CalendarIcon size={16} color="#64748b" />
                    <TextInput 
                      style={{ flex: 1, marginLeft: 8, fontSize: 13, fontWeight: 'bold', color: '#1a3a7c', padding: 0 }}
                      placeholder="e.g. 24 Aug"
                      placeholderTextColor="#94a3b8"
                      value={modalDate}
                      onChangeText={setModalDate}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-[#1a3a7c] font-bold text-[12px] uppercase tracking-wider mb-2">Time</Text>
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
                    {/* @ts-ignore */}
                    <Clock size={16} color="#64748b" />
                    <TextInput 
                      style={{ flex: 1, marginLeft: 8, fontSize: 13, fontWeight: 'bold', color: '#1a3a7c', padding: 0 }}
                      placeholder="e.g. 10:00 AM"
                      placeholderTextColor="#94a3b8"
                      value={modalTime}
                      onChangeText={setModalTime}
                    />
                  </View>
                </View>
              </View>

              {/* Agenda */}
              <Text className="text-[#1a3a7c] font-bold text-[12px] uppercase tracking-wider mb-2">Meeting Topic / Agenda</Text>
              <TextInput 
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, padding: 12, height: 80, color: '#1a3a7c', textAlignVertical: 'top' }}
                placeholder="What would you like to discuss?"
                placeholderTextColor="#94a3b8"
                multiline
              />

              {/* Location */}
              <Text className="text-[#1a3a7c] font-bold text-[12px] uppercase tracking-wider mb-2 mt-5">Location Preference</Text>
              <View className="flex-row gap-3 mb-8">
                <TouchableOpacity 
                  onPress={() => setModalLocation('My Stall')}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: modalLocation === 'My Stall' ? '#eff6ff' : '#ffffff', borderWidth: 1, borderColor: modalLocation === 'My Stall' ? '#bfdbfe' : '#e2e8f0' }}
                >
                  <Text style={{ color: modalLocation === 'My Stall' ? '#1d4ed8' : '#475569', fontWeight: 'bold', fontSize: 12 }}>My Stall</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setModalLocation('Lounge')}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: modalLocation === 'Lounge' ? '#eff6ff' : '#ffffff', borderWidth: 1, borderColor: modalLocation === 'Lounge' ? '#bfdbfe' : '#e2e8f0' }}
                >
                  <Text style={{ color: modalLocation === 'Lounge' ? '#1d4ed8' : '#475569', fontWeight: 'bold', fontSize: 12 }}>Lounge</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setModalLocation('Virtual')}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: modalLocation === 'Virtual' ? '#eff6ff' : '#ffffff', borderWidth: 1, borderColor: modalLocation === 'Virtual' ? '#bfdbfe' : '#e2e8f0' }}
                >
                  <Text style={{ color: modalLocation === 'Virtual' ? '#1d4ed8' : '#475569', fontWeight: 'bold', fontSize: 12 }}>Virtual</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                onPress={() => setScheduleModalVisible(false)}
                className="w-full bg-[#16a34a] py-4 rounded-xl items-center shadow-sm mb-10"
              >
                <Text className="text-white font-black text-[15px] tracking-wide">Send Meeting Request</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}
