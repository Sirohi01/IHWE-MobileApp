import '../../global.css';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, QrCode, Calendar, Clock, AlertCircle, CheckSquare2, Square } from 'lucide-react-native';
import { router } from 'expo-router';
import { apiClient } from '@/core/api/axios';

export default function PassUsageActivityScreen() {
    const [loading, setLoading] = useState(true);
    const [usages, setUsages] = useState<any[]>([]);
    const [updatingId, setUpdatingId] = useState('');

    useEffect(() => {
        fetchUsages();
    }, []);

    const fetchUsages = async () => {
        try {
            const res = await apiClient.get('/exhibitor-auth/my-pass-usage');
            setUsages(res.data?.data || []);
        } catch (error) {
            console.log('Failed to fetch pass usages', error);
        } finally {
            setLoading(false);
        }
    };

    const acknowledge = async (usage: any, status: 'confirmed' | 'disputed') => {
        if (!usage?._id || updatingId) return;
        setUpdatingId(String(usage._id));
        try {
            const note = status === 'disputed' ? 'The scan or delivered quantity is incorrect.' : '';
            const res = await apiClient.patch(`/exhibitor-auth/my-pass-usage/${usage.usageId || usage._id}/acknowledge`, {
                status,
                note,
                deliveryId: usage.deliveryId,
            });
            setUsages(current => current.map(item =>
                String(item._id) === String(usage._id)
                    ? { ...item, ...res.data.data }
                    : item
            ));
        } catch (error: any) {
            console.log('Failed to acknowledge pass usage', error);
        } finally {
            setUpdatingId('');
        }
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            {/* Header */}
            <View className="px-6 pt-14 pb-5 bg-white border-b border-slate-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
                    {/* @ts-ignore */}
                    <ChevronLeft size={24} color="#334155" />
                </TouchableOpacity>
                <View className="flex-1 ml-4">
                    <Text className="text-[20px] font-black text-slate-800 tracking-tight">Usage Activity</Text>
                    <Text className="text-[12px] font-bold text-slate-500">Scan history of your passes</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-6 pb-20">
                    {usages.length === 0 ? (
                        <View className="items-center justify-center py-20 opacity-60">
                            {/* @ts-ignore */}
                            <AlertCircle size={48} color="#94a3b8" />
                            <Text className="text-[16px] font-bold text-slate-500 mt-4">No activity yet</Text>
                            <Text className="text-[12px] text-slate-400 mt-1 text-center">Your pass usage history will appear here once your passes are scanned.</Text>
                        </View>
                    ) : (
                        usages.map((usage, index) => (
                            <View key={String(usage._id || index)} className="bg-white p-5 rounded-2xl mb-4 border border-slate-200 shadow-sm flex-row items-start">
                                <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center border border-blue-100 mr-4 mt-1">
                                    {/* @ts-ignore */}
                                    <QrCode size={24} color="#3b82f6" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-[15px] font-black text-slate-800 tracking-tight capitalize">{usage.passType || usage.subjectSubType || 'Event'} Pass</Text>
                                        <View className="bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                            <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                {usage.acknowledgementStatus === 'confirmed' ? 'Confirmed' : usage.acknowledgementStatus === 'disputed' ? 'Issue Reported' : 'Scanned'}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="flex-row items-center mb-3">
                                        {/* @ts-ignore */}
                                        <Calendar size={12} color="#64748b" className="mr-1.5" />
                                        <Text className="text-[11px] font-bold text-slate-500 mr-3">
                                            {usage.markedAt ? new Date(usage.markedAt).toLocaleDateString() : 'N/A'}
                                        </Text>
                                        {/* @ts-ignore */}
                                        <Clock size={12} color="#64748b" className="mr-1.5" />
                                        <Text className="text-[11px] font-bold text-slate-500">
                                            {usage.markedAt ? new Date(usage.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                        </Text>
                                    </View>

                                    <View className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Text className="text-[12px] font-black text-slate-700">{usage.name || 'Unknown'}</Text>
                                        {(usage.designation || usage.company) && (
                                            <Text className="text-[11px] font-bold text-slate-500 mt-0.5">
                                                {[usage.designation, usage.company].filter(Boolean).join(', ')}
                                            </Text>
                                        )}
                                        {usage.gate && (
                                            <Text className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">
                                                Scanned at: {usage.gate}
                                            </Text>
                                        )}
                                    </View>

                                    {usage.passType === 'lunch' && (
                                        <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                                            <Text className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Lunch Delivery</Text>
                                            <Text className="text-[14px] font-black text-slate-800 mt-1">
                                                {Number(usage.deliveredQuantity || 0)} lunch item(s) delivered in this handover
                                            </Text>
                                            <Text className="text-[10px] font-bold text-slate-500 mt-0.5">
                                                Total received: {Number(usage.cumulativeDeliveredQuantity || usage.deliveredQuantity || 0)} of {Number(usage.allocatedQuantity || 0)}
                                                {' | '}
                                                {Math.max(0, Number(usage.allocatedQuantity || 0) - Number(usage.cumulativeDeliveredQuantity || usage.deliveredQuantity || 0))} remaining
                                            </Text>
                                        </View>
                                    )}

                                    {usage.acknowledgementStatus !== 'confirmed' && usage.acknowledgementStatus !== 'disputed' && (
                                        <View className="mt-3">
                                            <TouchableOpacity
                                                onPress={() => acknowledge(usage, 'confirmed')}
                                                disabled={updatingId === String(usage._id)}
                                                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-xl p-3"
                                            >
                                                {/* @ts-ignore */}
                                                <Square size={20} color="#2563eb" />
                                                <Text className="text-[11px] font-black text-blue-700 ml-2 flex-1">
                                                    {usage.passType === 'lunch'
                                                        ? `I confirm this delivery of ${Number(usage.deliveredQuantity || 0)} lunch item(s)`
                                                        : 'I confirm this pass was scanned correctly'}
                                                </Text>
                                            </TouchableOpacity>
                                            {/* Report incorrect entry is temporarily disabled. */}
                                        </View>
                                    )}

                                    {usage.acknowledgementStatus === 'confirmed' && (
                                        <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-3">
                                            {/* @ts-ignore */}
                                            <CheckSquare2 size={20} color="#059669" />
                                            <Text className="text-[11px] font-black text-emerald-700 ml-2">Confirmed by exhibitor</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}
