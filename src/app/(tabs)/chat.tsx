import '../../global.css';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, Smile, Paperclip, Check, CheckCheck, MoreVertical, Phone, BadgeCheck, Loader2, Info, UserCircle2 } from 'lucide-react-native';
import type { Socket } from 'socket.io-client';
// @ts-ignore
import { io } from 'socket.io-client/build/cjs/index.js';
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
              {rmDetails && <BadgeCheck size={14} color="#3b82f6" className="ml-1" />}
            </View>
            <Text className="text-slate-500 font-medium text-[11px] mt-0.5">{rmDesignation}</Text>
            {adminTyping && <Text className="text-[#108c2d] font-bold text-[10px] mt-0.5 italic">typing...</Text>}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/relationship-manager')}
          className="w-10 h-10 bg-[#eff6ff] rounded-full items-center justify-center ml-2 border border-blue-100"
        >
          {/* @ts-ignore */}
          <UserCircle2 size={22} color="#2563eb" strokeWidth={1.5} />
        </TouchableOpacity>
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
          <Send size={18} color={input.trim() ? '#ffffff' : '#94a3b8'} className="ml-1" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
