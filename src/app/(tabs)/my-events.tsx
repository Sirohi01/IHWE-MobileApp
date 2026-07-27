import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CalendarDays, MapPin, CheckCircle2, ArrowRightLeft } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';
import { useAuthStore } from '@/core/store/useAuthStore';

// Multi-event support: an exhibitor's email/mobile can match more than one
// ExhibitorRegistration (one per event they've signed up for). The backend's
// /exhibitor-auth/dashboard endpoint always returns every match as
// `allRegistrations`, defaulting `data` to the most recently created one
// unless a specific `?id=` is requested. This screen lets the exhibitor see
// every registration and switch which one the rest of the app treats as
// "current" — the choice is persisted via useAuthStore/SecureStore and read
// by every other screen's dashboard fetch.
export default function MyEventsScreen() {
    const router = useRouter();
    const setSelectedRegId = useAuthStore((state) => state.setSelectedRegId);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [switchingId, setSwitchingId] = useState<string | null>(null);
    const [current, setCurrent] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [activeRegId, setActiveRegId] = useState<string | null>(null);

    const fetchRegistrations = useCallback(async () => {
        try {
            const res = await apiClient.get('/exhibitor-auth/dashboard');
            if (res.data?.success) {
                const data = res.data.data;
                const all = Array.isArray(res.data.allRegistrations) ? res.data.allRegistrations : [data].filter(Boolean);
                setCurrent(data);
                setRegistrations(all);

                const storedRegId = await SecureStore.getItemAsync('exhibitorSelectedRegId');
                setActiveRegId(storedRegId || data?._id || null);
            }
        } catch (err) {
            console.log('Error fetching registrations for My Events', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const handleSwitch = async (reg: any) => {
        if (reg._id === activeRegId || switchingId) return;
        setSwitchingId(reg._id);
        try {
            await setSelectedRegId(reg._id);
            router.replace('/(tabs)/home');
        } finally {
            setSwitchingId(null);
        }
    };

    const formatDateRange = (start?: string, end?: string) => {
        if (!start) return 'Dates to be announced';
        const startLabel = new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        if (!end) return startLabel;
        const endLabel = new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${startLabel} - ${endLabel}`;
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
                <ActivityIndicator size="large" color="#1a3a7c" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f4f7f9]">
            {/* Custom Header */}
            <View className="w-full bg-white pt-14 pb-4 px-6 border-b border-slate-200 shadow-sm z-10 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Multi-Event</Text>
                        <Text className="text-slate-800 font-black text-[20px] tracking-tight">My Events</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRegistrations(); }} />}
            >
                <Text className="text-slate-500 font-medium text-[12px] mb-4 px-1">
                    Registered for more than one expo? Switch here to see that event's stall, passes, and documents.
                </Text>

                {registrations.map((reg) => {
                    const isActive = reg._id === activeRegId;
                    const isSwitching = switchingId === reg._id;
                    return (
                        <TouchableOpacity
                            key={reg._id}
                            activeOpacity={0.8}
                            onPress={() => handleSwitch(reg)}
                            disabled={isSwitching}
                            className={`bg-white rounded-2xl border mb-3 overflow-hidden ${isActive ? 'border-emerald-300' : 'border-slate-200'}`}
                            style={{ opacity: isSwitching ? 0.6 : 1 }}
                        >
                            <View className={`px-4 py-2 flex-row items-center justify-between ${isActive ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                                <Text className={`font-black text-[11px] uppercase tracking-widest ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} numberOfLines={1}>
                                    {reg.eventId?.name || 'Event'}
                                </Text>
                                {isActive ? (
                                    <View className="flex-row items-center">
                                        <CheckCircle2 size={14} color="#059669" />
                                        <Text className="text-emerald-700 font-bold text-[10px] ml-1">Active</Text>
                                    </View>
                                ) : (
                                    <View className="flex-row items-center">
                                        <ArrowRightLeft size={12} color="#64748b" />
                                        <Text className="text-slate-500 font-bold text-[10px] ml-1">{isSwitching ? 'Switching...' : 'Switch'}</Text>
                                    </View>
                                )}
                            </View>

                            <View className="px-4 py-3">
                                <Text className="text-slate-900 font-black text-[15px] mb-1" numberOfLines={1}>
                                    {reg.exhibitorName || reg.companyName || 'Exhibitor'}
                                </Text>
                                <Text className="text-slate-400 font-bold text-[11px] mb-2">
                                    Registration ID: {reg.registrationId || reg._id?.slice(-8)}
                                </Text>

                                <View className="flex-row items-center mb-1">
                                    <CalendarDays size={13} color="#94a3b8" />
                                    <Text className="text-slate-500 font-semibold text-[12px] ml-1.5">
                                        {formatDateRange(reg.eventId?.startDate, reg.eventId?.endDate)}
                                    </Text>
                                </View>
                                {!!reg.eventId?.location && (
                                    <View className="flex-row items-center">
                                        <MapPin size={13} color="#94a3b8" />
                                        <Text className="text-slate-500 font-semibold text-[12px] ml-1.5">{reg.eventId.location}</Text>
                                    </View>
                                )}

                                <View className="mt-2 self-start bg-slate-100 px-2.5 py-1 rounded-full">
                                    <Text className="text-slate-600 font-bold text-[10px] uppercase">{reg.status || 'Pending'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {registrations.length === 0 && (
                    <View className="items-center justify-center py-16">
                        <Text className="text-slate-400 font-semibold text-[13px]">No registrations found.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
