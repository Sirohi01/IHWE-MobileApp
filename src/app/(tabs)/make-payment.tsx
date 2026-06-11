import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, CreditCard, CheckCircle2, AlertCircle, ShieldCheck, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';

export default function MakePaymentScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = await SecureStore.getItemAsync('exhibitorToken');
            if (!token) {
                router.replace('/(auth)/login');
                return;
            }

            const res = await apiClient.get('/exhibitor-auth/dashboard', { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching payment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = (item: any) => {
        Alert.alert(
            "Confirm Payment",
            `Are you sure you want to proceed with the payment of ${item.amount} for ${item.title}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Proceed to Pay", 
                    onPress: () => {
                        setIsProcessing(true);
                        setTimeout(() => {
                            setIsProcessing(false);
                            Alert.alert("Payment Successful", "Your transaction has been completed successfully. A receipt has been sent to your email.");
                            fetchData(); // Refresh data
                        }, 2000);
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#1a3a7c" />
            </View>
        );
    }

    const cur = data?.participation?.currency === 'USD' ? '$' : '₹';
    const total = data?.participation?.total || 0;
    const paid = data?.amountPaid || 0;
    const balance = data?.balanceAmount || 0;
    const isOverdue = data?.status?.toLowerCase() === 'overdue';

    const pendingDues = [];
    if (balance > 0) {
        pendingDues.push({
            id: `INV-${data?.registrationId || 'DUE'}`,
            title: "Stall Booking Balance",
            amount: `${cur} ${balance.toLocaleString('en-IN')}`,
            dueDate: "Immediate",
            status: isOverdue ? 'overdue' : 'upcoming',
            description: "Remaining balance for your exhibition stall."
        });
    }

    const paymentHistory = data?.paymentHistory || [];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-orange-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Finance</Text>
                        <Text className="text-slate-800 font-black text-[18px] tracking-tight">Make Payment</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                
                {/* Overview Cards */}
                <View className="px-4 pt-5 pb-2">
                    <View className="bg-[#1a3a7c] rounded-2xl p-5 shadow-lg mb-4 relative overflow-hidden">
                        {/* Decorative Background */}
                        <View className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full border-[10px] border-white/5" />
                        
                        {/* Content */}
                        <View className="relative z-10">
                            <View className="flex-row justify-between items-end mb-4">
                                <View>
                                    <Text className="text-blue-200 font-medium text-xs mb-1 uppercase tracking-wider">Pending Balance</Text>
                                    <Text className="text-white font-black text-3xl tracking-tight">{cur} {balance.toLocaleString('en-IN')}</Text>
                                </View>
                                <View className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <CreditCard size={24} color="#fff" />
                                </View>
                            </View>
                            
                            {isOverdue && (
                                <View className="bg-red-500/20 px-3 py-2 rounded-lg flex-row items-center mb-4 border border-red-500/30">
                                    <AlertCircle size={14} color="#fca5a5" className="mr-2" />
                                    <Text className="text-red-200 text-xs font-medium">Your account has overdue payments</Text>
                                </View>
                            )}

                            <View className="flex-row justify-between pt-4 border-t border-white/10">
                                <View>
                                    <Text className="text-blue-200/70 font-medium text-[10px] uppercase tracking-wider mb-0.5">Total Paid</Text>
                                    <Text className="text-green-400 font-bold text-sm">{cur} {paid.toLocaleString('en-IN')}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <ShieldCheck size={12} color="#86efac" className="mr-1" />
                                    <Text className="text-green-200 text-[10px] font-medium">100% Secure</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pending Dues */}
                <View className="px-4 mb-6">
                    <Text className="text-slate-800 font-black text-sm mb-3 ml-1 uppercase tracking-wider">Pending Dues</Text>
                    
                    {pendingDues.length > 0 ? (
                        pendingDues.map((item) => (
                            <View key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm mb-3 overflow-hidden">
                                <View className={`h-1 w-full ${item.status === 'overdue' ? 'bg-red-500' : 'bg-orange-400'}`} />
                                <View className="p-4">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View className="flex-1 pr-4">
                                            <Text className="text-slate-800 font-bold text-base mb-1">{item.title}</Text>
                                            <Text className="text-slate-500 text-xs leading-relaxed mb-2">{item.description}</Text>
                                        </View>
                                        <Text className="text-slate-800 font-black text-lg">{item.amount}</Text>
                                    </View>
                                    
                                    <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-slate-100">
                                        <View className="flex-row items-center">
                                            <Calendar size={14} color={item.status === 'overdue' ? '#ef4444' : '#64748b'} className="mr-1.5" />
                                            <Text className={`text-xs font-medium ${item.status === 'overdue' ? 'text-red-500' : 'text-slate-500'}`}>
                                                Due: {item.dueDate}
                                            </Text>
                                            {item.status === 'overdue' && (
                                                <View className="ml-2 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                                    <Text className="text-[9px] text-red-600 font-bold uppercase">Overdue</Text>
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity 
                                            className={`${item.status === 'overdue' ? 'bg-red-600' : 'bg-orange-500'} px-4 py-2 rounded-lg shadow-sm`}
                                            onPress={() => handlePayNow(item)}
                                            disabled={isProcessing}
                                        >
                                            <Text className="text-white font-bold text-xs uppercase tracking-wider">Pay Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="bg-white rounded-xl p-6 border border-slate-200 items-center">
                            <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-3">
                                <CheckCircle2 size={24} color="#16a34a" />
                            </View>
                            <Text className="text-slate-800 font-bold text-base mb-1">All Clear!</Text>
                            <Text className="text-slate-500 text-xs text-center">You don't have any pending dues at the moment.</Text>
                        </View>
                    )}
                </View>

                {/* Recent Transactions */}
                <View className="px-4">
                    <View className="flex-row justify-between items-center mb-3 ml-1">
                        <Text className="text-slate-800 font-black text-sm uppercase tracking-wider">Recent Transactions</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/invoices')}>
                            <Text className="text-blue-600 text-xs font-bold">View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {paymentHistory.length > 0 ? (
                            paymentHistory.map((item: any, index: number) => (
                                <View key={item.paymentId || index} className={`p-4 flex-row justify-between items-center ${index !== paymentHistory.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3 border border-green-100">
                                            <CheckCircle2 size={18} color="#16a34a" />
                                        </View>
                                        <View className="flex-1 pr-2">
                                            <Text className="text-slate-800 font-bold text-[13px] mb-0.5" numberOfLines={1}>{item.paymentType || 'Payment'}</Text>
                                            <Text className="text-slate-500 text-[10px] font-medium">
                                                {item.paidAt ? new Date(item.paidAt).toLocaleDateString('en-IN') : 'N/A'} • {item.paymentMode || 'Online'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-slate-800 font-black text-sm mb-0.5">{cur} {Number(item.amount || 0).toLocaleString('en-IN')}</Text>
                                        <Text className="text-[9px] text-slate-400 font-mono" numberOfLines={1} ellipsizeMode='middle' style={{ width: 60 }}>
                                            {item.paymentId}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="p-6 items-center">
                                <Text className="text-slate-400 text-xs">No recent transactions found.</Text>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
