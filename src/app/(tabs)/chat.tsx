import '../../global.css';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Send, Smile, Paperclip, Check, CheckCheck, MoreVertical, Phone, BadgeCheck, Loader2, Info, UserCircle2, History, Mail, PhoneIncoming, PhoneOutgoing, X, Filter, MessageSquare } from 'lucide-react-native';
import type { Socket } from 'socket.io-client';
// @ts-ignore
import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { apiClient, API_URL } from '@/core/api/axios';
import { router } from 'expo-router';

// const SERVER_URL = 'https://api.ihwe.in';
const SERVER_URL = 'https://nenita-untoured-nonhesitantly.ngrok-free.dev';


export default function ChatScreen() {
  const [data, setData] = useState<any>(null);
  const [rmDetails, setRmDetails] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimer = useRef<any>(null);

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/exhibitor-auth/dashboard');
      if (res.data.success) {
        const dashboardData = res.data.data;
        setData(dashboardData);

        const rmUsername = dashboardData.filledBy && dashboardData.filledBy !== 'User' ? dashboardData.filledBy : null;
        if (rmUsername) {
          const rmRes = await apiClient.get(`/admin/by-username/${encodeURIComponent(rmUsername)}`);
          if (rmRes.data.success && rmRes.data.data) {
            setRmDetails(rmRes.data.data);
          }
        }

        fetchMessages(dashboardData._id);
        setupSocket(dashboardData);
      }
    } catch (err) {
      console.log('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const res = await apiClient.get(`/chat/messages/${roomId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching messages', err);
    }
  };

  const setupSocket = (dashboardData: any) => {
    const roomId = dashboardData._id;
    const s = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      extraHeaders: { 'ngrok-skip-browser-warning': 'true' }
    });

    s.on('connect', () => {
      s.emit('join_room', {
        roomId,
        userId: dashboardData._id,
        userType: 'exhibitor',
        userName: dashboardData.exhibitorName
      });
      s.emit('mark_read', { roomId, readerType: 'exhibitor' });
    });

    s.on('receive_message', (msg: any) => {
      setMessages((prev) => prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]);
      if (msg.senderType === 'admin') s.emit('mark_read', { roomId, readerType: 'exhibitor' });
    });

    s.on('messages_seen', ({ seenBy }: any) => {
      if (seenBy === 'admin') {
        setMessages((prev) => prev.map((m) => m.senderType === 'exhibitor' ? { ...m, readByAdmin: true } : m));
      }
    });

    s.on('typing', ({ senderType }: any) => {
      if (senderType === 'admin') setAdminTyping(true);
    });

    s.on('stop_typing', () => setAdminTyping(false));

    s.on('user_status', ({ userType, online }: any) => {
      if (userType === 'admin') setAdminOnline(online);
    });

    setSocket(s);
  };

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages, adminTyping]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !data) return;

    const exhibitorId = data._id;
    const exhibitorName = data.exhibitorName;

    socket.emit('send_message', {
      roomId: exhibitorId,
      exhibitorRegistrationId: exhibitorId,
      exhibitorName,
      senderType: 'exhibitor',
      senderId: exhibitorId,
      senderName: exhibitorName,
      message: input.trim(),
    });

    setInput('');
    socket.emit('stop_typing', { roomId: exhibitorId });
  };

  const handleTyping = (text: string) => {
    setInput(text);
    if (!socket || !data) return;
    socket.emit('typing', { roomId: data._id, senderType: 'exhibitor', senderName: data.exhibitorName });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('stop_typing', { roomId: data._id }), 1500);
  };

  const timeStr = (d: string) => {
    return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const rmDisplayName = rmDetails?.fullName || data?.filledBy || 'Support Team';
  const rmDesignation = rmDetails?.designation || 'Support Executive';
  const rmImage = rmDetails?.profileImage || rmDetails?.hodImage || 'https://ui-avatars.com/api/?name=Support&background=0D8ABC&color=fff';

  if (loading) {
    return (
      <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Connecting to Chat...</Text>
      </View>
    );
  }

  // Display mock messages if empty for presentation purposes
  const displayMessages = messages.length > 0 ? messages : [
    {
      _id: 'm-fallback-1',
      senderType: 'admin',
      message: 'Hello! 👋 Welcome to IHWE Support. How can I help you today?',
      createdAt: new Date().toISOString(),
      readByAdmin: true,
    }
  ];

  const friendlyDate = (d: string | Date) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dd = pad(date.getDate());
    const mmm = date.toLocaleString("en-IN", { month: "short" });
    const yyyy = date.getFullYear();
    if (date.toDateString() === today.toDateString()) return `Today, ${dd} ${mmm} ${yyyy}`;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${dd} ${mmm} ${yyyy}`;
    return `${dd} ${mmm} ${yyyy}`;
  };

  const chatHistory = displayMessages.map((msg) => ({
    id: msg._id,
    type: "Chat",
    time: timeStr(msg.createdAt),
    title: "Chat",
    desc: msg.senderType === "exhibitor" ? `You: ${msg.message}` : `${rmDisplayName}: ${msg.message}`,
    date: friendlyDate(msg.createdAt),
  }));

  const hardcodedHistory = [
    { id: "h-email-1", type: "Email", time: "04:21 PM", title: "Email", desc: "Support Team: Re: Stall setup guidelines (Attachment)", date: "19 May 2026" },
    { id: "h-email-2", type: "Email", time: "04:18 PM", title: "Email", desc: "You: Requested information about stall setup guidelines.", date: "19 May 2026" },
    { id: "h-call-1", type: "Call", time: "03:15 PM", title: "Call", desc: "Outgoing Call • Duration: 04:32 min", date: "18 May 2026", callType: "outgoing" },
    { id: "h-call-2", type: "Call", time: "03:10 PM", title: "Call", desc: "Incoming Call • Duration: 06:15 min", date: "18 May 2026", callType: "incoming" },
  ];

  const combinedHistory = [...chatHistory, ...hardcodedHistory];
  const filteredHistory = historyFilter === "All" ? combinedHistory : combinedHistory.filter((h) => h.type === historyFilter);

  const historyGroups: { date: string; items: any[] }[] = [];
  filteredHistory.forEach((item) => {
    const last = historyGroups[historyGroups.length - 1];
    if (!last || last.date !== item.date) historyGroups.push({ date: item.date, items: [item] });
    else last.items.push(item);
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f4f7f9]"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 flex-row items-center justify-between border-b border-slate-200 shadow-sm z-10">
        <View className="flex-row items-center flex-1">
          <View className="relative">
            <Image source={{ uri: rmImage }} className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 shadow-sm" />
            <View className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${adminOnline ? 'bg-[#108c2d]' : 'bg-slate-300'}`} />
          </View>
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-[#0f172a] font-black text-[16px] tracking-tight">{rmDisplayName}</Text>
              {rmDetails && <BadgeCheck size={14} color="#3b82f6" style={{ marginLeft: 4 }} />}
            </View>
            <Text className="text-slate-500 font-medium text-[11px] mt-0.5">{rmDesignation}</Text>
            {adminTyping && <Text className="text-[#108c2d] font-bold text-[10px] mt-0.5 italic">typing...</Text>}
          </View>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setHistoryModalVisible(true)}
            className="w-10 h-10 bg-[#f8fafc] rounded-full items-center justify-center ml-2 border border-slate-200"
          >
            {/* @ts-ignore */}
            <History size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/relationship-manager')}
            className="w-10 h-10 bg-[#eff6ff] rounded-full items-center justify-center ml-2 border border-blue-100"
          >
            {/* @ts-ignore */}
            <UserCircle2 size={22} color="#2563eb" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <View className="bg-slate-200/60 px-3 py-1 rounded-full">
            <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Today</Text>
          </View>
        </View>

        {displayMessages.map((msg, i) => {
          const isMe = msg.senderType === 'exhibitor';
          return (
            <View key={msg._id || i} className={`flex-row mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <Image source={{ uri: rmImage }} className="w-8 h-8 rounded-full mr-2 mt-1 bg-slate-100" />
              )}
              <View className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                <View
                  className={`px-4 py-2.5 shadow-sm ${isMe
                    ? 'bg-[#e2f5e9] border border-[#d2edd9] rounded-2xl rounded-tr-sm'
                    : 'bg-white border border-slate-200 rounded-2xl rounded-tl-sm'
                    }`}
                >
                  <Text className="text-[#0f172a] font-semibold text-[14px] leading-relaxed">
                    {msg.message}
                  </Text>

                  <View className={`flex-row items-center mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <Text className="text-slate-400 font-medium text-[10px]">{timeStr(msg.createdAt)}</Text>
                    {isMe && (
                      <View className="ml-1">
                        {msg.readByAdmin ? <CheckCheck size={12} color="#108c2d" /> : <Check size={12} color="#94a3b8" />}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {adminTyping && (
          <View className="flex-row mb-4 justify-start items-end">
            <Image source={{ uri: rmImage }} className="w-8 h-8 rounded-full mr-2 bg-slate-100" />
            <View className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex-row items-center">
              <View className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-1" />
              <View className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-1 opacity-70" />
              <View className="w-1.5 h-1.5 bg-slate-400 rounded-full opacity-40" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="bg-white border-t border-slate-200 px-4 py-2 pb-2 flex-row items-center">
        <View className="flex-1 bg-[#f8fafc] border border-slate-200 rounded-full flex-row items-center px-4 py-1.5 h-12 shadow-inner">
          <TouchableOpacity className="mr-3">
            {/* @ts-ignore */}
            <Smile size={20} color="#64748b" />
          </TouchableOpacity>
          <TextInput
            value={input}
            onChangeText={handleTyping}
            placeholder="message..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-[#0f172a] font-medium text-[10px]"
            style={{ paddingVertical: 0 }}
          />
          <TouchableOpacity className="ml-2">
            {/* @ts-ignore */}
            <Paperclip size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim()}
          className={`w-12 h-12 rounded-full items-center justify-center ml-3 shadow-md ${input.trim() ? 'bg-[#0e7f22] shadow-[#0e7f22]/30' : 'bg-slate-200'
            }`}
        >
          {/* @ts-ignore */}
          <Send size={18} color={input.trim() ? '#ffffff' : '#94a3b8'} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* History Modal */}
      <Modal visible={historyModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-slate-900/50 justify-end">
          <View className="bg-white h-[85%] rounded-t-3xl flex-col">
            {/* Modal Header */}
            <View className="px-5 py-4 border-b border-slate-100 flex-row items-center justify-between">
              <Text className="text-[16px] font-black text-slate-800 tracking-tight">Communication History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                {/* @ts-ignore */}
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Filter */}
            <View className="px-4 py-3 border-b border-slate-100">
              <View className="bg-slate-50 border border-slate-200 rounded-xl p-1 flex-row">
                {['All', 'Chat', 'Email', 'Call'].map((tab) => {
                  const isActive = historyFilter === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setHistoryFilter(tab)}
                      style={[
                        { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
                        isActive ? { backgroundColor: '#108c2d' } : { backgroundColor: 'transparent' }
                      ]}
                    >
                      <Text style={[
                        { fontSize: 12, fontWeight: 'bold' },
                        isActive ? { color: 'white' } : { color: '#64748b' }
                      ]}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* List */}
            <ScrollView className="flex-1 bg-[#f4f7f9]" contentContainerStyle={{ paddingBottom: 20 }}>
              {historyGroups.length === 0 ? (
                <View className="items-center justify-center pt-20">
                  {/* @ts-ignore */}
                  <History size={40} color="#cbd5e1" style={{ marginBottom: 16 }} />
                  <Text className="text-slate-400 font-bold">No history found</Text>
                </View>
              ) : (
                historyGroups.map((group) => (
                  <View key={group.date} className="mb-2">
                    <View className="px-4 py-2">
                      <View className="bg-[#e2f5e9] px-3 py-1 rounded-full self-start">
                        <Text className="text-[10px] text-[#108c2d] font-bold tracking-wider uppercase">{group.date}</Text>
                      </View>
                    </View>
                    {group.items.map((item, idx) => (
                      <View key={item.id || idx} className="bg-white px-4 py-3 border-b border-slate-100 flex-row items-start">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-1"
                          style={{ backgroundColor: item.type === 'Chat' ? '#dcfce7' : item.type === 'Email' ? '#ede9fe' : '#ffedd5' }}
                        >
                          {item.type === 'Chat' ? <MessageSquare size={16} color="#108c2d" /> :
                            item.type === 'Email' ? <Mail size={16} color="#7c3aed" /> :
                              item.callType === 'incoming' ? <PhoneIncoming size={16} color="#ea580c" /> :
                                <PhoneOutgoing size={16} color="#ea580c" />}
                        </View>
                        <View className="flex-1">
                          <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-[14px] font-bold text-slate-800">{item.title}</Text>
                            <Text className="text-[10px] font-bold text-slate-400">{item.time}</Text>
                          </View>
                          <Text className="text-[12px] text-slate-500 leading-tight" numberOfLines={2}>{item.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
