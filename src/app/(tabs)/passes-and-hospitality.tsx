import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ImageBackground, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, UserCheck, Car, Wrench, ArrowRight, X, Sparkles, Building2, Ticket, CheckCircle2, ChevronRight, Hash, Activity, Clock } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';

export default function PassesAndHospitalityScreen() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPass, setSelectedPass] = useState<any>(null);
    const router = useRouter();
    
    // Dynamic Form State
    const [quantity, setQuantity] = useState(1);
    const [personnel, setPersonnel] = useState([{ name: '', designation: '', email: '', phone: '', gender: 'male' }]);
    const [vehicles, setVehicles] = useState([{ vehicleType: '4-wheeler', vehicleNumber: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exhibitorId, setExhibitorId] = useState('');
    const [exhibitorProfile, setExhibitorProfile] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [passConfigs, setPassConfigs] = useState<any[]>([]);
    const [passUsages, setPassUsages] = useState<any[]>([]);

    const fetchRequests = async () => {
        try {
            const dash = await apiClient.get('/exhibitor-auth/dashboard');
            const id = dash.data?.data?._id;
            if (!id) return;
            setExhibitorId(id);
            setExhibitorProfile(dash.data?.data);
            const [res, configRes, usageRes] = await Promise.all([
                apiClient.get(`/exhibitor-pass-requests/exhibitor/${id}`),
                apiClient.get('/exhibitor-pass-config/my-active').catch(() => null),
                apiClient.get('/exhibitor-auth/my-pass-usage').catch(() => null)
            ]);
            setRequests(res.data?.data || []);
            setPassConfigs(configRes?.data?.data || []);
            setPassUsages(usageRes?.data?.data || []);
        } catch (error) {
            console.log('Failed to load pass requests', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fallbackPasses = [
        {
            id: "exhibitor",
            title: "Exhibitor Pass",
            subtitle: "For Your Team Members",
            icon: UserCheck,
            complimentary: 2,
            totalQuota: 10,
            used: 0,
            remaining: 2,
            price: 150,
            maxPerRequest: 10,
            theme: { 
                bg: "bg-orange-50", 
                text: "text-orange-600", 
                btn: "bg-orange-100",
                shadow: "shadow-orange-200"
            }
        },
        {
            id: "vehicle",
            title: "Vehicle Pass",
            subtitle: "For Exhibitor Vehicles",
            icon: Car,
            complimentary: 2,
            totalQuota: 10,
            used: 0,
            remaining: 2,
            price: 500,
            maxPerRequest: 10,
            theme: { 
                bg: "bg-emerald-50", 
                text: "text-emerald-600", 
                btn: "bg-emerald-100",
                shadow: "shadow-emerald-200"
            }
        },
        {
            id: "service",
            title: "Service Pass",
            subtitle: "For Staff, Workers",
            icon: Wrench,
            complimentary: 4,
            totalQuota: 10,
            used: 0,
            remaining: 4,
            price: 150,
            maxPerRequest: 10,
            theme: { 
                bg: "bg-purple-50", 
                text: "text-purple-600", 
                btn: "bg-purple-100",
                shadow: "shadow-purple-200"
            }
        },
        {
            id: "visitor",
            title: "Visitor Pass",
            subtitle: "For Invited Visitors",
            icon: Users,
            complimentary: 10,
            totalQuota: 20,
            used: 2,
            remaining: 8,
            price: 200,
            maxPerRequest: 10,
            theme: { 
                bg: "bg-blue-50", 
                text: "text-blue-600", 
                btn: "bg-blue-100",
                shadow: "shadow-blue-200"
            }
        },
        {
            id: "lunch",
            title: "Packed Thali Lunch",
            subtitle: "Additional Lunch Pass",
            icon: Building2,
            complimentary: 0,
            totalQuota: 10,
            used: 0,
            remaining: 0,
            price: 500,
            maxPerRequest: 10,
            theme: { 
                bg: "bg-pink-50", 
                text: "text-pink-600", 
                btn: "bg-pink-100",
                shadow: "shadow-pink-200"
            }
        },
        {
            id: "water",
            title: "Water Bottle",
            subtitle: "Additional Water Bottle",
            icon: Ticket,
            complimentary: 0,
            totalQuota: 10,
            used: 0,
            remaining: 0,
            price: 20,
            maxPerRequest: 50,
            theme: { 
                bg: "bg-cyan-50", 
                text: "text-cyan-600", 
                btn: "bg-cyan-100",
                shadow: "shadow-cyan-200"
            }
        },
        {
            id: "delegate",
            title: "Delegate Pass",
            subtitle: "For Conference Access",
            icon: Sparkles,
            complimentary: 0,
            totalQuota: 10,
            used: 0,
            remaining: 0,
            price: 500,
            maxPerRequest: 10,
            theme: { 
                bg: "bg-indigo-50", 
                text: "text-indigo-600", 
                btn: "bg-indigo-100",
                shadow: "shadow-indigo-200"
            }
        }
    ];

    const themeByType: any = fallbackPasses.reduce((acc: any, pass: any) => {
        acc[pass.id] = { icon: pass.icon, theme: pass.theme };
        return acc;
    }, {});

    const countsByType = requests.reduce<Record<string, { pending: number, approved: number, rejected: number, total: number }>>((acc, request) => {
        const key = request.passType;
        if (!acc[key]) acc[key] = { pending: 0, approved: 0, rejected: 0, total: 0 };
        acc[key][request.status as keyof typeof acc[string]] = (acc[key][request.status as keyof typeof acc[string]] || 0) + Number(request.quantity || 0);
        acc[key].total += Number(request.quantity || 0);
        return acc;
    }, {});

    const passes = passConfigs.length > 0
        ? passConfigs.map((config: any) => {
            const passId = config.passType;
            if (passId === 'vehicle') {
                const priceTwoWheeler = Number(config?.vehicleTypeConfig?.twoWheeler?.price || 0);
                const priceFourWheeler = Number(config?.vehicleTypeConfig?.fourWheeler?.price || 0);
                const complimentaryTwoWheeler = Number(config?.complimentaryQuotaTwoWheeler ?? config?.vehicleTypeConfig?.twoWheeler?.complimentaryQuota ?? 0);
                const complimentaryFourWheeler = Number(config?.complimentaryQuotaFourWheeler ?? config?.vehicleTypeConfig?.fourWheeler?.complimentaryQuota ?? 0);

                let usedTwoWheeler = 0, usedFourWheeler = 0;
                requests
                    .filter(r => r.passType === 'vehicle' && r.status !== 'rejected')
                    .forEach(r => (r.vehicles || []).forEach((v: any) => {
                        if (v.vehicleType === '2-wheeler') usedTwoWheeler += 1; else usedFourWheeler += 1;
                    }));

                const remainingTwoWheeler = Math.max(complimentaryTwoWheeler - usedTwoWheeler, 0);
                const remainingFourWheeler = Math.max(complimentaryFourWheeler - usedFourWheeler, 0);
                const totalQuota = Number(config?.totalQuota ?? 10);
                const totalRequested = countsByType[passId]?.total ?? 0;

                return {
                    id: passId,
                    title: config?.title || 'Vehicle Pass',
                    subtitle: config?.subtitle || 'For Exhibitor Vehicles',
                    icon: themeByType[passId]?.icon || Car,
                    complimentary: complimentaryTwoWheeler + complimentaryFourWheeler,
                    used: countsByType[passId]?.approved ?? 0,
                    remaining: Math.max(totalQuota - totalRequested, 0),
                    complimentaryRemaining: remainingTwoWheeler + remainingFourWheeler,
                    totalQuota,
                    price: null,
                    priceTwoWheeler,
                    priceFourWheeler,
                    complimentaryTwoWheeler,
                    complimentaryFourWheeler,
                    remainingTwoWheeler,
                    remainingFourWheeler,
                    maxPerRequest: Number(config?.maxPerRequest || 10),
                    theme: themeByType[passId]?.theme || fallbackPasses[1].theme
                };
            }

            const complimentary = Number(config.complimentaryQuota || 0);
            const totalQuota = Number(config.totalQuota || 10);
            const used = countsByType[passId]?.approved ?? 0;
            const totalRequested = countsByType[passId]?.total ?? 0;
            const complimentaryRemaining = Math.max(complimentary - totalRequested, 0);

            return {
                id: passId,
                title: config.title,
                subtitle: config.subtitle,
                icon: themeByType[passId]?.icon || Ticket,
                complimentary,
                totalQuota,
                used,
                remaining: Math.max(totalQuota - totalRequested, 0),
                complimentaryRemaining,
                price: Number(config.price || 0),
                maxPerRequest: Number(config.maxPerRequest || 10),
                theme: themeByType[passId]?.theme || fallbackPasses[0].theme
            };
        })
        : fallbackPasses;

    const handleOpenModal = (pass: any) => {
        setSelectedPass(pass);
        setQuantity(1);
        if (pass.id === 'exhibitor' && exhibitorProfile) {
            setPersonnel([{ 
                name: exhibitorProfile.contactPerson || exhibitorProfile.companyName || '', 
                designation: exhibitorProfile.designation || 'Exhibitor', 
                email: exhibitorProfile.emailId || '', 
                phone: exhibitorProfile.mobileNumber || '', 
                gender: 'male' 
            }]);
        } else {
            setPersonnel([{ name: '', designation: '', email: '', phone: '', gender: 'male' }]);
        }
        setVehicles([{ vehicleType: '4-wheeler', vehicleNumber: '' }]);
        setIsModalOpen(true);
    };

    const handleQuantityChange = (newQty: number) => {
        const maxAllowed = selectedPass?.maxPerRequest || selectedPass?.totalQuota || 10;
        if (newQty < 1 || newQty > maxAllowed) return;
        setQuantity(newQty);
        
        if (selectedPass?.id === 'vehicle') {
            const newVehicles = [...vehicles];
            if (newQty > newVehicles.length) {
                for (let i = newVehicles.length; i < newQty; i++) {
                    newVehicles.push({ vehicleType: '4-wheeler', vehicleNumber: '' });
                }
            } else {
                newVehicles.splice(newQty);
            }
            setVehicles(newVehicles);
        } else {
            const newPersonnel = [...personnel];
            if (newQty > newPersonnel.length) {
                for (let i = newPersonnel.length; i < newQty; i++) {
                    newPersonnel.push({ name: '', designation: '', email: '', phone: '', gender: 'male' });
                }
            } else {
                newPersonnel.splice(newQty);
            }
            setPersonnel(newPersonnel);
        }
    };

    const updatePersonnel = (index: number, field: string, value: string) => {
        const updated = [...personnel];
        updated[index] = { ...updated[index], [field]: value };
        setPersonnel(updated);
    };

    const updateVehicle = (index: number, field: string, value: string) => {
        const updated = [...vehicles];
        updated[index] = { ...updated[index], [field]: value };
        setVehicles(updated);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                passType: selectedPass.id,
                quantity,
                vehicles: selectedPass.id === 'vehicle' ? vehicles : undefined,
                personnel: selectedPass.id !== 'vehicle' ? personnel : undefined
            };

            const response = await apiClient.post('/exhibitor-auth/pass-request', payload);
            Alert.alert("Success", response.data.message || "Pass request submitted successfully.");
            setIsModalOpen(false);
            fetchRequests();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to submit pass request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatUsageTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' on ' + date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
                <ActivityIndicator size="large" color="#1a3a7c" />
                <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Passes...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f4f7f9]">
            <View className="w-full bg-white pt-14 pb-4 px-6 border-b border-slate-200 shadow-sm z-10">
                <View className="flex-row items-center mb-1">
                    {/* @ts-ignore */}
                    <Sparkles size={14} color="#3b82f6" className="mr-2" />
                    <Text className="text-blue-600 font-bold text-[11px] tracking-widest uppercase">Exhibitor Zone</Text>
                </View>
                <Text className="text-slate-800 font-black text-[24px] tracking-tight mb-1">Passes & Hospitality</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-lg font-black text-slate-800">Complimentary Quota</Text>
                            <Text className="text-xs font-medium text-slate-500 mt-0.5">Your included free passes</Text>
                        </View>
                        <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                            {/* @ts-ignore */}
                            <Ticket size={20} color="#6366f1" />
                        </View>
                    </View>

                    <View className="flex-row flex-wrap justify-between">
                        {passes.flatMap(pass => {
                            if (pass.id === 'vehicle') {
                                return [
                                    {
                                        ...pass,
                                        id: 'vehicle-2',
                                        title: '2-Wheeler Pass',
                                        complimentary: (pass as any).complimentaryTwoWheeler || 0,
                                    },
                                    {
                                        ...pass,
                                        id: 'vehicle-4',
                                        title: '4-Wheeler Pass',
                                        complimentary: (pass as any).complimentaryFourWheeler || 0,
                                    }
                                ];
                            }
                            return [pass];
                        }).map(pass => (
                            <View key={pass.id} className="w-[48%] bg-[#f8fafc] p-3 rounded-2xl mb-2 border border-slate-100 relative overflow-hidden">
                                <View className="absolute right-[-10px] top-[-10px] opacity-[0.03]">
                                    <pass.icon size={80} color="#000" />
                                </View>
                                <pass.icon size={22} className={pass.theme.text} />
                                <View className="mt-3 flex-row items-baseline gap-1">
                                    <Text className={`text-2xl font-black ${pass.theme.text}`}>{pass.complimentary}</Text>
                                    <Text className="text-slate-400 font-bold text-[10px] uppercase">
                                        {(countsByType[pass.id.split('-')[0]]?.approved || 0) > 0 ? `${countsByType[pass.id.split('-')[0]].approved} Approved` : 'Free'}
                                    </Text>
                                </View>
                                <Text className="text-[11px] font-bold text-slate-600 mt-1">{pass.title}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="flex-row items-center justify-between mb-2 mt-1 px-2">
                    <Text className="text-lg font-black text-slate-800">Request Extra Passes</Text>
                    <View className="bg-orange-100 px-3 py-1 rounded-full">
                        <Text className="text-orange-600 text-[10px] font-bold uppercase tracking-wider">Paid Add-ons</Text>
                    </View>
                </View>

                {passes.map((pass) => (
                    <View key={pass.id} className={`rounded-3xl p-4 mb-3 border border-white/50 shadow-sm ${pass.theme.shadow} ${pass.theme.bg} relative overflow-hidden`}>
                        <View className="absolute right-[-20px] bottom-[-20px] opacity-[0.05]">
                            <pass.icon size={120} color="#000" />
                        </View>
                        
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center flex-1">
                                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                                    <pass.icon size={24} className={pass.theme.text} />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-[17px] font-black text-slate-800 tracking-tight">{pass.title}</Text>
                                    <Text className="text-[11px] font-bold text-slate-500 mt-0.5">{pass.subtitle}</Text>
                                </View>
                            </View>
                            <View className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100">
                                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mb-0.5">Price</Text>
                                <Text className="text-[13px] font-black text-slate-800">{pass.id === 'vehicle' ? 'Varies' : `₹${pass.price}`}</Text>
                            </View>
                        </View>

                        {pass.id === 'vehicle' ? (
                            <View className="mb-3">
                                <View className="flex-row bg-white/60 rounded-t-2xl p-2 border-b border-slate-100/50">
                                    <View className="flex-1 px-2">
                                        <Text className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">2-Wheeler</Text>
                                        <View className="flex-row items-baseline gap-2">
                                            <Text className="text-[10px] font-bold text-slate-500">Free: {(pass as any).complimentaryTwoWheeler || 0}</Text>
                                            <Text className="text-[10px] font-bold text-slate-500">Rem: <Text className="text-emerald-600">{(pass as any).remainingTwoWheeler || 0}</Text></Text>
                                            <Text className="text-[10px] font-bold text-slate-500">Price: ₹{(pass as any).priceTwoWheeler || 0}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View className="flex-row bg-white/60 rounded-b-2xl p-2">
                                    <View className="flex-1 px-2">
                                        <Text className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">4-Wheeler</Text>
                                        <View className="flex-row items-baseline gap-2">
                                            <Text className="text-[10px] font-bold text-slate-500">Free: {(pass as any).complimentaryFourWheeler || 0}</Text>
                                            <Text className="text-[10px] font-bold text-slate-500">Rem: <Text className="text-emerald-600">{(pass as any).remainingFourWheeler || 0}</Text></Text>
                                            <Text className="text-[10px] font-bold text-slate-500">Price: ₹{(pass as any).priceFourWheeler || 0}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View className="flex-row bg-white/60 rounded-2xl p-1 mb-3">
                                <View className="flex-1 items-center py-2">
                                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Used</Text>
                                    <Text className="text-lg font-black text-slate-800">{pass.used}</Text>
                                </View>
                                <View className="w-[1px] bg-slate-200/50 my-2" />
                                <View className="flex-1 items-center py-2">
                                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Remaining</Text>
                                    <Text className="text-lg font-black text-slate-800">{pass.remaining}</Text>
                                </View>
                                <View className="w-[1px] bg-slate-200/50 my-2" />
                                <View className="flex-1 items-center py-2">
                                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</Text>
                                    <Text className="text-lg font-black text-slate-800">{pass.totalQuota || 'Open'}</Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity 
                            onPress={() => handleOpenModal(pass)}
                            className={`w-full py-3 rounded-2xl flex-row items-center justify-center shadow-sm ${pass.theme.btn}`}
                        >
                            <Text className={`font-black text-[13px] uppercase tracking-widest mr-2 ${pass.theme.text}`}>
                                {(countsByType[pass.id]?.pending || 0) > 0 ? `${countsByType[pass.id].pending} Pending` : 'Request Passes'}
                            </Text>
                            {/* @ts-ignore */}
                            <ArrowRight size={16} className={pass.theme.text} />
                        </TouchableOpacity>
                    </View>
                ))}


                
                <View className="h-20" />
            </ScrollView>

            <Modal visible={isModalOpen} animationType="slide" transparent>
                <View className="flex-1 bg-slate-900/60 justify-end">
                    <View className="bg-[#f8fafc] rounded-t-[32px] h-[90%] overflow-hidden shadow-2xl">
                        <View className={`px-6 py-5 flex-row justify-between items-center bg-white border-b border-slate-100`}>
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${selectedPass?.theme?.bg}`}>
                                    {selectedPass && <selectedPass.icon size={20} className={selectedPass?.theme?.text} />}
                                </View>
                                <View>
                                    <Text className="text-[18px] font-black text-slate-800 tracking-tight">{selectedPass?.title}</Text>
                                    <Text className="text-[11px] font-bold text-slate-500 mt-0.5">₹{selectedPass?.price} per pass</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)} className="bg-slate-50 p-2 rounded-full border border-slate-200">
                                {/* @ts-ignore */}
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 40 }}>
                            <View className="bg-white p-5 rounded-3xl mb-6 border border-slate-200 shadow-sm">
                                <Text className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Quantity</Text>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-base font-bold text-slate-700">How many do you need?</Text>
                                    <View className="flex-row items-center gap-5 bg-slate-50 px-2 py-1.5 rounded-2xl border border-slate-200">
                                        <TouchableOpacity 
                                            onPress={() => handleQuantityChange(quantity - 1)}
                                            className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm border border-slate-100"
                                        >
                                            <Text className="text-xl font-black text-slate-400">-</Text>
                                        </TouchableOpacity>
                                        <Text className="text-xl font-black text-slate-800 w-6 text-center">{quantity}</Text>
                                        <TouchableOpacity 
                                            onPress={() => handleQuantityChange(quantity + 1)}
                                            className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm border border-slate-100"
                                        >
                                            <Text className="text-xl font-black text-emerald-600">+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between items-center">
                                    <Text className="text-[13px] font-bold text-slate-500">Estimated Total</Text>
                                    <Text className="text-[18px] font-black text-slate-800">₹{selectedPass?.price * quantity}</Text>
                                </View>
                                <Text className="text-[10px] text-slate-400 font-bold mt-2">
                                    Max {selectedPass?.maxPerRequest || selectedPass?.totalQuota || 10} passes per request
                                </Text>
                            </View>

                            {selectedPass?.id === 'vehicle' ? (
                                vehicles.map((veh, index) => (
                                    <View key={index} className="bg-white border border-slate-200 rounded-3xl p-5 mb-5 shadow-sm relative overflow-hidden">
                                        <View className="absolute right-0 top-0 bg-slate-50 px-4 py-2 rounded-bl-2xl border-b border-l border-slate-100">
                                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{index + 1}</Text>
                                        </View>
                                        
                                        <Text className="text-[14px] font-black text-slate-800 mb-5">Vehicle Details</Text>
                                        
                                        <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Vehicle Type</Text>
                                        <View className="flex-row gap-3 mb-5">
                                            <TouchableOpacity 
                                                onPress={() => updateVehicle(index, 'vehicleType', '2-wheeler')}
                                                className={`flex-1 py-3.5 rounded-2xl border-2 items-center flex-row justify-center ${veh.vehicleType === '2-wheeler' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                                            >
                                                {/* @ts-ignore */}
                                                {veh.vehicleType === '2-wheeler' && <CheckCircle2 size={14} color="#10b981" className="mr-2" />}
                                                <Text className={`font-black text-[13px] ${veh.vehicleType === '2-wheeler' ? 'text-emerald-700' : 'text-slate-500'}`}>2-Wheeler</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                onPress={() => updateVehicle(index, 'vehicleType', '4-wheeler')}
                                                className={`flex-1 py-3.5 rounded-2xl border-2 items-center flex-row justify-center ${veh.vehicleType === '4-wheeler' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                                            >
                                                {/* @ts-ignore */}
                                                {veh.vehicleType === '4-wheeler' && <CheckCircle2 size={14} color="#10b981" className="mr-2" />}
                                                <Text className={`font-black text-[13px] ${veh.vehicleType === '4-wheeler' ? 'text-emerald-700' : 'text-slate-500'}`}>4-Wheeler</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Registration Number</Text>
                                        <View className="relative justify-center">
                                            <View className="absolute left-4 z-10">
                                                {/* @ts-ignore */}
                                                <Hash size={16} color="#94a3b8" />
                                            </View>
                                            <TextInput 
                                                value={veh.vehicleNumber}
                                                onChangeText={(val) => updateVehicle(index, 'vehicleNumber', val)}
                                                placeholder="e.g. MH 01 AB 1234"
                                                placeholderTextColor="#cbd5e1"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-4 font-black text-slate-800 text-[14px]"
                                            />
                                        </View>
                                    </View>
                                ))
                            ) : (
                                personnel.map((person, index) => (
                                    <View key={index} className="bg-white border border-slate-200 rounded-3xl p-5 mb-5 shadow-sm relative overflow-hidden">
                                        <View className={`absolute right-0 top-0 px-4 py-2 rounded-bl-2xl border-b border-l border-white/50 ${selectedPass?.theme?.bg}`}>
                                            <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedPass?.theme?.text}`}>Person #{index + 1}</Text>
                                        </View>
                                        
                                        <Text className="text-[14px] font-black text-slate-800 mb-5">Attendee Details</Text>

                                        <View className="space-y-4">
                                            <View>
                                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name</Text>
                                                <TextInput 
                                                    value={person.name}
                                                    onChangeText={(val) => updatePersonnel(index, 'name', val)}
                                                    placeholder="Enter full name"
                                                    placeholderTextColor="#cbd5e1"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                                />
                                            </View>

                                            <View>
                                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider mt-4">Designation</Text>
                                                <TextInput 
                                                    value={person.designation}
                                                    onChangeText={(val) => updatePersonnel(index, 'designation', val)}
                                                    placeholder="e.g. Manager"
                                                    placeholderTextColor="#cbd5e1"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                                />
                                            </View>

                                            <View className="flex-row gap-4 mt-4">
                                                <View className="flex-1">
                                                    <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Email ID</Text>
                                                    <TextInput 
                                                        value={person.email}
                                                        onChangeText={(val) => updatePersonnel(index, 'email', val)}
                                                        placeholder="Email address"
                                                        placeholderTextColor="#cbd5e1"
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone</Text>
                                                    <TextInput 
                                                        value={person.phone}
                                                        onChangeText={(val) => updatePersonnel(index, 'phone', val)}
                                                        placeholder="Mobile No"
                                                        placeholderTextColor="#cbd5e1"
                                                        keyboardType="phone-pad"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                                    />
                                                </View>
                                            </View>

                                            <View className="mt-5">
                                                <Text className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">Gender Selection</Text>
                                                <View className="flex-row gap-3">
                                                    <TouchableOpacity 
                                                        onPress={() => updatePersonnel(index, 'gender', 'male')}
                                                        className={`flex-1 py-3 rounded-xl border-2 items-center flex-row justify-center ${person.gender === 'male' ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-100'}`}
                                                    >
                                                        {/* @ts-ignore */}
                                                        {person.gender === 'male' && <CheckCircle2 size={12} color="#60a5fa" className="mr-1.5" />}
                                                        <Text className={`font-black text-[11px] ${person.gender === 'male' ? 'text-blue-700' : 'text-slate-500'}`}>Male</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity 
                                                        onPress={() => updatePersonnel(index, 'gender', 'female')}
                                                        className={`flex-1 py-3 rounded-xl border-2 items-center flex-row justify-center ${person.gender === 'female' ? 'bg-pink-50 border-pink-400' : 'bg-slate-50 border-slate-100'}`}
                                                    >
                                                        {/* @ts-ignore */}
                                                        {person.gender === 'female' && <CheckCircle2 size={12} color="#f472b6" className="mr-1.5" />}
                                                        <Text className={`font-black text-[11px] ${person.gender === 'female' ? 'text-pink-700' : 'text-slate-500'}`}>Female</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity 
                                                        onPress={() => updatePersonnel(index, 'gender', 'other')}
                                                        className={`flex-1 py-3 rounded-xl border-2 items-center flex-row justify-center ${person.gender === 'other' ? 'bg-purple-50 border-purple-400' : 'bg-slate-50 border-slate-100'}`}
                                                    >
                                                        {/* @ts-ignore */}
                                                        {person.gender === 'other' && <CheckCircle2 size={12} color="#c084fc" className="mr-1.5" />}
                                                        <Text className={`font-black text-[11px] ${person.gender === 'other' ? 'text-purple-700' : 'text-slate-500'}`}>Other</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}

                            <TouchableOpacity 
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-2xl flex-row items-center justify-center mt-2 mb-10 shadow-lg ${selectedPass?.theme?.btn} ${isSubmitting ? 'opacity-70' : ''}`}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text className="text-white font-black text-[14px] uppercase tracking-widest mr-2">Submit {quantity} Requests</Text>
                                        {/* @ts-ignore */}
                                        <ChevronRight size={18} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
