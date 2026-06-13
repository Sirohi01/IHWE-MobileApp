import '../../global.css';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground, ActivityIndicator, Dimensions, Linking } from 'react-native';
import { Calendar, MapPin, Ticket, Navigation, ChevronLeft, Sparkles, Store, CheckCircle2, User, QrCode, Plus, Download } from 'lucide-react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';

const { width } = Dimensions.get('window');

export default function MyEventTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

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
      console.log('Error fetching data for MyEvent', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
      </View>
    );
  }

  const exhibitorName = data?.exhibitorName || 'Exhibitor Company';
  const contactPerson = data?.contactPerson || 'Delegate Name';
  const sector = data?.industrySector || 'Healthcare Professional';
  const stallNumber = data?.participation?.stallFor || 'TBA';
  const stallSize = data?.participation?.stallSize || '0';
  const status = data?.status || 'Pending';
  const passId = `IHWE-2026-${contactPerson.replace(/\s/g, '').substring(0, 4).toUpperCase()}8X`;

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* 1. Sleek Hero Banner */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop' }}
          className="w-full h-[320px] justify-start pt-12 relative"
        >
          <View className="absolute inset-0 bg-black/60" />

          <View className="flex-row items-center px-4 z-20 w-full justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30"
            >
              {/* @ts-ignore */}
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>

            <View className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/30 flex-row items-center">
              {/* @ts-ignore */}
              <Sparkles size={14} color="#a3e635" />
              <Text className="text-white font-bold text-[12px] ml-1.5 uppercase tracking-widest">Medical Expo</Text>
            </View>
          </View>

          <View className="px-6 mt-12 z-10 items-center">
            <Text className="text-white text-[32px] font-black leading-tight tracking-tight text-center" style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 }}>9th IHWE India</Text>
            <Text className="text-[#a3e635] text-[18px] font-bold text-center mt-1" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3 }}>2026 Edition</Text>
          </View>
        </ImageBackground>

        <View className="px-5 -mt-10 z-20">

          {/* 2. Event Countdown Timer */}
          <EventTimer targetDate="2026-08-21T09:00:00" />

          {/* Tab Switcher */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-1 mt-1">
            {['Overview', 'My Pass', 'Tasks', 'Services', 'Docs'].map(tab => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`mr-1.5 px-4 py-1.5 rounded-full border ${activeTab === tab ? 'bg-[#1a3a7c] border-[#1a3a7c]' : 'bg-white border-slate-200'}`}
              >
                <Text className={`font-bold text-[12px] ${activeTab === tab ? 'text-white' : 'text-slate-600'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeTab === 'My Pass' && (
            <View className="items-center mb-2 mt-1">
              <View className="w-full bg-white rounded-[24px] shadow-lg border border-slate-200 overflow-hidden relative">
                <View className="bg-[#1a3a7c] p-5 flex-row justify-between items-center relative overflow-hidden">
                  <View className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full border-[8px] border-white/5" />
                  <View>
                    <Text className="text-white font-black text-[18px] tracking-tight">EXHIBITOR PASS</Text>
                    <Text className="text-[#a3e635] font-bold text-[9px] uppercase tracking-widest mt-0.5">VIP All Access</Text>
                  </View>
                  <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center backdrop-blur-md border border-white/20">
                    <Store size={18} color="#ffffff" />
                  </View>
                </View>

                <View className="px-5 py-4 items-center">
                  <Text className="text-[#0f172a] font-black text-[20px] text-center mb-2 leading-tight" numberOfLines={2} adjustsFontSizeToFit>
                    {exhibitorName}
                  </Text>
                  <View className="bg-blue-50 px-4 py-1 rounded-full mb-2 border border-blue-100">
                    <Text className="text-blue-700 font-bold text-[10px] uppercase tracking-widest">{sector}</Text>
                  </View>

                  <View className="flex-row items-center w-full bg-slate-50 p-3 rounded-[16px] border border-slate-100 mb-2">
                    <View className="flex-1 flex-row items-center">
                      <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-2 shadow-sm border border-slate-200">
                        <User size={14} color="#1a3a7c" />
                      </View>
                      <View className="flex-1 pr-1">
                        <Text className="text-slate-400 font-bold uppercase text-[8px] tracking-widest mb-0.5">Delegate</Text>
                        <Text className="text-slate-800 font-bold text-[12px]" numberOfLines={1}>{contactPerson}</Text>
                      </View>
                    </View>
                    <View className="w-[1px] h-full bg-slate-200 mx-2" />
                    <View className="flex-1 pl-1">
                      <Text className="text-slate-400 font-bold uppercase text-[8px] tracking-widest mb-0.5">Stall</Text>
                      <Text className="text-[#1a3a7c] font-black text-[16px]" numberOfLines={1} adjustsFontSizeToFit>{stallNumber}</Text>
                    </View>
                  </View>

                  <View className="items-center">
                    <View className="p-2 bg-white border-[2px] border-slate-100 rounded-[20px] shadow-sm mb-2">
                      <QrCode size={100} color="#0f172a" strokeWidth={1.5} />
                    </View>
                    <Text className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-0.5">Pass ID</Text>
                    <Text className="text-slate-800 font-mono text-[11px] font-bold">{passId}</Text>
                  </View>
                </View>

                <TouchableOpacity className="bg-blue-600 py-3 flex-row justify-center items-center">
                  <Download size={16} color="#ffffff" />
                  <Text className="text-white font-black text-[13px] ml-2 tracking-wide">Download E-Badge</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'Overview' && (
            <View>
              {/* Quick Info Grid */}
              <View className="px-1 mb-1 mt-2">
                <View className="flex-row justify-between mb-2">
                  <InfoCard title="Stall Number" value={stallNumber} subtitle="Hall 04" icon={<Store size={18} color="#1d4ed8" />} />
                  <InfoCard title="Team Members" value={String(data?.teamMembers?.length || 0)} subtitle="Registered" icon={<User size={18} color="#1d4ed8" />} />
                </View>
                
                {/* Unified Dates Card */}
                <View className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 mb-2 flex-row justify-between items-center">
                  <View className="items-center flex-1 border-r border-slate-100">
                      <Text className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-1">Setup</Text>
                      <Text className="text-[#0f172a] font-black text-[15px]">19–20</Text>
                      <Text className="text-slate-500 font-bold text-[10px]">Aug</Text>
                  </View>
                  <View className="items-center flex-1 border-r border-slate-100">
                      <Text className="text-blue-600 font-bold uppercase text-[9px] tracking-widest mb-1">Event</Text>
                      <Text className="text-blue-700 font-black text-[17px]">21–23</Text>
                      <Text className="text-blue-500 font-bold text-[10px]">Aug</Text>
                  </View>
                  <View className="items-center flex-1">
                      <Text className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-1">Dismantle</Text>
                      <Text className="text-[#0f172a] font-black text-[15px]">23</Text>
                      <Text className="text-slate-500 font-bold text-[10px]">Aug</Text>
                  </View>
                </View>
              </View>

              {/* Important Announcements */}
              <SectionHeader title="Important Announcements" actionText="" />
              <View className="bg-[#fffbeb] rounded-[20px] shadow-sm border border-[#fef3c7] p-3 mb-2 mx-1">
                <Text className="text-[#b45309] font-black text-[15px] mb-2">Venue Entry Pass Mandatory</Text>
                <Text className="text-[#92400e] text-[13px] leading-relaxed">All exhibitors & team members must carry the venue entry pass during move-in, event days & move-out.</Text>
              </View>

              {/* Venue Map Redirect */}
              <SectionHeader title="Venue Location" actionText="" />
              <TouchableOpacity
                onPress={() => Linking.openURL('https://maps.google.com/?q=IICC+Dwarka,+New+Delhi')}
                className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden relative mb-2 mx-1"
              >
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop' }}
                  className="w-full h-40 opacity-90"
                />
                <View className="absolute inset-0 bg-[#0f234b]/60 items-center justify-center">
                  <View className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full flex-row items-center shadow-xl">
                    {/* @ts-ignore */}
                    <Navigation size={18} color="#1d4ed8" />
                    <Text className="text-[#1d4ed8] font-black text-[14px] ml-2 tracking-wide">Open in Google Maps</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'Tasks' && (
            <View>
              <SectionHeader title="My Event Checklist" actionText="" />
              <View className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-2 mb-2 mx-1">
                <ChecklistItem
                  icon="🏪"
                  title="Complete Stall Information"
                  desc="Provide your stall details and specifications"
                  status="Completed"
                />
                <ChecklistItem
                  icon="📄"
                  title="Upload Required Documents"
                  desc="Submit all mandatory documents"
                  status={data?.documentStatus === 'verified' ? 'Completed' : 'Pending'}
                />
                <ChecklistItem
                  icon="💳"
                  title="Make Payment"
                  desc="Complete your payment to confirm participation"
                  status={data?.status?.includes('paid') ? 'Completed' : 'Pending'}
                />
                <ChecklistItem
                  icon="🛍️"
                  title="Book Add On Services"
                  desc="Enhance your presence with additional services"
                  status="In Progress"
                />
                <ChecklistItem
                  icon="👥"
                  title="Invite Team Members"
                  desc="Add your team to manage the event together"
                  status={data?.teamMembers?.length > 0 ? 'Completed' : 'Pending'}
                  isLast
                />
              </View>
            </View>
          )}

          {activeTab === 'Services' && (
            <View>
              <SectionHeader title="My Bookings & Services" actionText="" />
              <View className="flex-row flex-wrap justify-between pl-1">
                <ServiceCard icon="🏪" title="Stall Booking" status="Confirmed" />
                <ServiceCard icon="⚡" title="Electricity" status="Confirmed" />
                <ServiceCard icon="🪑" title="Furniture" status="In Progress" />
                <ServiceCard icon="🎨" title="Branding" status="Confirmed" />
                <ServiceCard icon="🧑‍💼" title="Hostesses" status="Not Booked" />
                <ServiceCard icon="🅿️" title="Parking" status="Not Booked" />
              </View>
            </View>
          )}

          {activeTab === 'Docs' && (
            <View>
              <SectionHeader title="Event Documents" actionText="" />
              <View className="mb-2 mx-1">
                <DocumentCard title="Exhibitor Manual" size="PDF (2.4 MB)" />
                <DocumentCard title="Venue Map" size="PDF (1.8 MB)" />
                <DocumentCard title="Move-in / Move-out Guidelines" size="PDF (1.2 MB)" isLast />
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

// Subcomponents

function EventTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="bg-white rounded-[20px] py-2 px-4 shadow-sm border border-slate-200 mb-2 mx-1 relative overflow-hidden">
      <View className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full border-[8px] border-blue-50/50" />
      <Text className="text-slate-400 font-bold text-[8px] uppercase tracking-widest text-center mb-1.5">Event Starts In</Text>
      <View className="flex-row justify-around px-2 relative z-10">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </View>
    </View>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <View className="items-center">
      <View className="bg-blue-50 w-9 h-9 rounded-xl items-center justify-center border border-blue-100 mb-1 shadow-sm">
        <Text className="text-blue-700 font-black text-[16px]">{value < 10 ? `0${value}` : value}</Text>
      </View>
      <Text className="text-slate-500 font-bold text-[8px] uppercase tracking-wider">{label}</Text>
    </View>
  );
}

function InfoCard({ title, value, subtitle, icon }: { title: string, value: string, subtitle: string, icon: any }) {
  return (
    <View className="bg-white w-[48%] rounded-[16px] p-2.5 shadow-sm border border-slate-100 mb-2 flex-row items-center">
      <View className="w-8 h-8 bg-[#eff6ff] rounded-full items-center justify-center mr-2">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-slate-400 font-bold uppercase text-[8px] tracking-widest mb-0.5">{title}</Text>
        <Text className="text-[#0f172a] font-black text-[15px] leading-tight">{value}</Text>
        <Text className="text-slate-500 font-medium text-[9px]">{subtitle}</Text>
      </View>
    </View>
  );
}

function SectionHeader({ title, actionText }: { title: string, actionText: string }) {
  return (
    <View className="flex-row justify-between items-end mb-2 ml-1 mr-1">
      <Text className="text-[#1a3a7c] font-black text-[17px] tracking-tight">{title}</Text>
      {actionText ? (
        <TouchableOpacity>
          <Text className="text-[#2563eb] font-bold text-[12px]">{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ChecklistItem({ icon, title, desc, status, isLast = false }: { icon: string, title: string, desc: string, status: string, isLast?: boolean }) {
  const getStatusColor = () => {
    if (status === 'Completed') return 'text-green-600 bg-green-50';
    if (status === 'In Progress') return 'text-orange-600 bg-orange-50';
    return 'text-slate-500 bg-slate-100';
  };

  const getStatusIcon = () => {
    if (status === 'Completed') return <CheckCircle2 size={12} color="#16a34a" />;
    return null;
  };

  return (
    <TouchableOpacity className={`flex-row p-3 items-center ${!isLast ? 'border-b border-slate-100' : ''}`}>
      <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-4">
        <Text className="text-[20px]">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-[#0f172a] font-black text-[14px] mb-0.5">{title}</Text>
        <Text className="text-slate-500 font-medium text-[11px]">{desc}</Text>
      </View>
      <View className="items-end justify-center ml-2">
        <View className={`px-2 py-1 rounded-md flex-row items-center ${getStatusColor()}`}>
          {getStatusIcon()}
          <Text className={`font-bold text-[10px] uppercase tracking-wider ${status === 'Completed' ? 'ml-1' : ''}`}>{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ServiceCard({ icon, title, status }: { icon: string, title: string, status: string }) {
  const isConfirmed = status === 'Confirmed';
  const isInProgress = status === 'In Progress';

  return (
    <View className="bg-white rounded-[20px] p-3 shadow-sm border border-slate-100 mb-1.5 w-[48%]">
      <Text className="text-[24px] mb-1.5">{icon}</Text>
      <Text className="text-[#0f172a] font-black text-[14px] mb-2">{title}</Text>
      <Text className={`font-bold text-[10px] uppercase tracking-wider ${isConfirmed ? 'text-green-600' : isInProgress ? 'text-orange-600' : 'text-slate-400'}`}>
        {status}
      </Text>
    </View>
  );
}

function DocumentCard({ title, size, isLast = false }: { title: string, size: string, isLast?: boolean }) {
  return (
    <TouchableOpacity className={`bg-white p-3 flex-row items-center shadow-sm border border-slate-200 ${isLast ? 'rounded-[20px]' : 'rounded-[20px] mb-1.5'}`}>
      <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center mr-3">
        <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest">PDF</Text>
      </View>
      <View className="flex-1">
        <Text className="text-[#0f172a] font-black text-[14px]">{title}</Text>
        <Text className="text-slate-500 font-medium text-[11px] mt-0.5">{size}</Text>
      </View>
      <View className="w-8 h-8 bg-[#f8fafc] rounded-full items-center justify-center border border-slate-200">
        <Download size={14} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
}

