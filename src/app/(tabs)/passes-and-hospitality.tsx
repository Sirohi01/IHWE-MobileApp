import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, UserCheck, Car, Wrench, ArrowRight, X, Sparkles, Building2, Ticket, CheckCircle2, ChevronRight, Hash, Check } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';
import { RazorpayWebView } from '@/components/dashboard/RazorpayWebView';

type PersonnelEntry = {
    teamMemberId?: string;
    name: string;
    designation: string;
    email: string;
    phone: string;
    gender: string;
    aadhaarNumber?: string;
    isTeamMember: boolean;
};

type VehicleEntry = {
    teamMemberId?: string;
    vehicleType: string;
    vehicleNumber: string;
    name: string;
    email: string;
    phone: string;
    isTeamMember: boolean;
};

export default function PassesAndHospitalityScreen() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPass, setSelectedPass] = useState<any>(null);
    const router = useRouter();

    const [personnel, setPersonnel] = useState<PersonnelEntry[]>([]);
    const [vehicles, setVehicles] = useState<VehicleEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exhibitorId, setExhibitorId] = useState('');
    const [exhibitorProfile, setExhibitorProfile] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [passConfigs, setPassConfigs] = useState<any[]>([]);

    // Razorpay payment state
    const [showRazorpay, setShowRazorpay] = useState(false);
    const [rzpOrder, setRzpOrder] = useState<any>(null);
    const [rzpKeyId, setRzpKeyId] = useState('');
    const [pendingPayload, setPendingPayload] = useState<any>(null);

    const fetchRequests = async () => {
        try {
            const dash = await apiClient.get('/exhibitor-auth/dashboard');
            const id = dash.data?.data?._id;
            if (!id) return;
            setExhibitorId(id);
            setExhibitorProfile(dash.data?.data);
            const [res, configRes] = await Promise.all([
                apiClient.get(`/exhibitor-pass-requests/exhibitor/${id}`),
                apiClient.get('/exhibitor-pass-config/my-active').catch(() => null),
            ]);
            setRequests(res.data?.data || []);
            setPassConfigs(configRes?.data?.data || []);
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
        { id: "exhibitor", title: "Exhibitor Pass", subtitle: "For Your Team Members", icon: UserCheck, complimentary: 2, totalQuota: 10, used: 0, remaining: 2, price: 150, maxPerRequest: 10, theme: { bg: "bg-orange-50", text: "text-orange-600", btn: "bg-orange-500", shadow: "shadow-orange-200" } },
        { id: "vehicle", title: "Vehicle Pass", subtitle: "For Exhibitor Vehicles", icon: Car, complimentary: 2, totalQuota: 10, used: 0, remaining: 2, price: 500, maxPerRequest: 10, theme: { bg: "bg-emerald-50", text: "text-emerald-600", btn: "bg-emerald-500", shadow: "shadow-emerald-200" } },
        { id: "service", title: "Service Pass", subtitle: "For Staff, Workers", icon: Wrench, complimentary: 4, totalQuota: 10, used: 0, remaining: 4, price: 150, maxPerRequest: 10, theme: { bg: "bg-purple-50", text: "text-purple-600", btn: "bg-purple-500", shadow: "shadow-purple-200" } },
        { id: "visitor", title: "Visitor Pass", subtitle: "For Invited Visitors", icon: Users, complimentary: 10, totalQuota: 20, used: 2, remaining: 8, price: 200, maxPerRequest: 10, theme: { bg: "bg-blue-50", text: "text-blue-600", btn: "bg-blue-500", shadow: "shadow-blue-200" } },
        { id: "lunch", title: "Packed Thali Lunch", subtitle: "Additional Lunch Pass", icon: Building2, complimentary: 0, totalQuota: 10, used: 0, remaining: 0, price: 500, maxPerRequest: 10, simpleFlow: true, theme: { bg: "bg-pink-50", text: "text-pink-600", btn: "bg-pink-500", shadow: "shadow-pink-200" } },
        { id: "water", title: "Water Bottle", subtitle: "Additional Water Bottle", icon: Ticket, complimentary: 0, totalQuota: 10, used: 0, remaining: 0, price: 20, maxPerRequest: 50, simpleFlow: true, theme: { bg: "bg-cyan-50", text: "text-cyan-600", btn: "bg-cyan-500", shadow: "shadow-cyan-200" } },
        { id: "delegate", title: "Delegate Pass", subtitle: "For Conference Access", icon: Sparkles, complimentary: 0, totalQuota: 10, used: 0, remaining: 0, price: 500, maxPerRequest: 10, theme: { bg: "bg-indigo-50", text: "text-indigo-600", btn: "bg-indigo-500", shadow: "shadow-indigo-200" } },
    ];

    const themeByType: any = fallbackPasses.reduce((acc: any, pass: any) => {
        acc[pass.id] = { icon: pass.icon, theme: pass.theme, simpleFlow: pass.simpleFlow };
        return acc;
    }, {});

    const countsByType = requests.reduce<Record<string, { pending: number; approved: number; rejected: number; total: number }>>((acc, request) => {
        const key = request.passType;
        if (!acc[key]) acc[key] = { pending: 0, approved: 0, rejected: 0, total: 0 };
        const status = request.status as string;
        (acc[key] as any)[status] = ((acc[key] as any)[status] || 0) + Number(request.quantity || 0);
        if (status !== 'rejected') acc[key].total += Number(request.quantity || 0);
        return acc;
    }, {});

    const passes = passConfigs.length > 0
        ? passConfigs.map((config: any) => {
            const passId = config.passType;
            const fb = themeByType[passId] || themeByType['exhibitor'];
            if (passId === 'vehicle') {
                const priceTwoWheeler = Number(config?.vehicleTypeConfig?.twoWheeler?.price || 0);
                const priceFourWheeler = Number(config?.vehicleTypeConfig?.fourWheeler?.price || 0);
                const complimentaryTwoWheeler = Number(config?.complimentaryQuotaTwoWheeler ?? config?.vehicleTypeConfig?.twoWheeler?.complimentaryQuota ?? 0);
                const complimentaryFourWheeler = Number(config?.complimentaryQuotaFourWheeler ?? config?.vehicleTypeConfig?.fourWheeler?.complimentaryQuota ?? 0);
                let usedTwoWheeler = 0, usedFourWheeler = 0;
                requests.filter(r => r.passType === 'vehicle' && r.status !== 'rejected')
                    .forEach(r => (r.vehicles || []).forEach((v: any) => {
                        if (v.vehicleType === '2-wheeler') usedTwoWheeler += 1; else usedFourWheeler += 1;
                    }));
                const remainingTwoWheeler = Math.max(complimentaryTwoWheeler - usedTwoWheeler, 0);
                const remainingFourWheeler = Math.max(complimentaryFourWheeler - usedFourWheeler, 0);
                const totalQuota = Number(config?.totalQuota ?? 10);
                const totalRequested = countsByType[passId]?.total ?? 0;
                return {
                    id: passId, title: config?.title || 'Vehicle Pass', subtitle: config?.subtitle || 'For Exhibitor Vehicles',
                    icon: fb.icon || Car, complimentary: complimentaryTwoWheeler + complimentaryFourWheeler,
                    used: totalRequested,
                    approved: countsByType[passId]?.approved ?? 0,
                    pending: countsByType[passId]?.pending ?? 0,
                    remaining: Math.max(totalQuota - totalRequested, 0),
                    complimentaryRemaining: remainingTwoWheeler + remainingFourWheeler, totalQuota,
                    price: null, priceTwoWheeler, priceFourWheeler,
                    complimentaryTwoWheeler, complimentaryFourWheeler, remainingTwoWheeler, remainingFourWheeler,
                    maxPerRequest: Number(config?.maxPerRequest || 10), theme: fb.theme || fallbackPasses[1].theme, simpleFlow: false,
                };
            }
            const complimentary = Number(config.complimentaryQuota || 0);
            const totalQuota = Number(config.totalQuota || 10);
            const totalRequested = countsByType[passId]?.total ?? 0;
            return {
                id: passId, title: config.title, subtitle: config.subtitle,
                icon: fb.icon || Ticket, complimentary, totalQuota, used: totalRequested,
                approved: countsByType[passId]?.approved ?? 0,
                pending: countsByType[passId]?.pending ?? 0,
                remaining: Math.max(totalQuota - totalRequested, 0),
                complimentaryRemaining: Math.max(complimentary - totalRequested, 0),
                price: Number(config.price || 0), maxPerRequest: Number(config.maxPerRequest || 10),
                theme: fb.theme || fallbackPasses[0].theme, simpleFlow: fb.simpleFlow || false,
            };
        })
        : fallbackPasses;

    // ─── Team helpers ────────────────────────────────────────────────────────────

    const isVehiclePass = (pass: any) => pass?.id === 'vehicle';

    const getTeamAllocation = (pass: any) => {
        const teamMembers = Array.isArray(exhibitorProfile?.teamMembers) ? exhibitorProfile.teamMembers : [];
        if (!pass) return { available: [], allocated: [] };
        const prevEntries = requests
            .filter(r => r.passType === pass.id && r.status !== 'rejected')
            .flatMap((r: any) => [...(r.personnel || []), ...(r.vehicles || [])]);
        const allocatedIds = new Set(prevEntries.map((e: any) => String(e.teamMemberId || '')).filter(Boolean));
        const allocatedContacts = new Set(
            prevEntries.flatMap((e: any) => [e.email, e.phone]).filter(Boolean).map((v: any) => String(v).toLowerCase())
        );
        const allocated = (m: any) =>
            Boolean(m?.passes?.[pass.id]) ||
            allocatedIds.has(String(m._id)) ||
            allocatedContacts.has(String(m.email || '').toLowerCase()) ||
            allocatedContacts.has(String(m.mobile || '').toLowerCase());
        return { available: teamMembers.filter((m: any) => !allocated(m)), allocated: teamMembers.filter(allocated) };
    };

    const mkPersonnel = (member?: any): PersonnelEntry => ({
        teamMemberId: member?._id,
        name: member?.name || '',
        designation: member?.designation || member?.roleAtExhibition || '',
        email: member?.email || '',
        phone: member?.mobile || '',
        gender: member?.gender || 'male',
        aadhaarNumber: member?.aadhaarNumber || '',
        isTeamMember: Boolean(member),
    });

    const mkVehicle = (member?: any): VehicleEntry => ({
        teamMemberId: member?._id,
        vehicleType: '4-wheeler',
        vehicleNumber: '',
        name: member?.name || '',
        email: member?.email || '',
        phone: member?.mobile || '',
        isTeamMember: Boolean(member),
    });

    const mkSimple = (): PersonnelEntry => {
        const c = exhibitorProfile?.contact1 || {};
        return {
            teamMemberId: undefined,
            name: [c.firstName, c.lastName].filter(Boolean).join(' ') || exhibitorProfile?.companyName || '',
            designation: c.designation || '',
            email: c.email || '',
            phone: c.whatsapp || c.mobile || '',
            gender: 'male',
            aadhaarNumber: '',
            isTeamMember: false,
        };
    };

    // ─── Modal handlers ───────────────────────────────────────────────────────────

    const handleOpenModal = (pass: any) => {
        const { available } = getTeamAllocation(pass);
        setSelectedPass(pass);
        if (isVehiclePass(pass)) {
            setVehicles(available[0] ? [mkVehicle(available[0])] : [mkVehicle()]);
            setPersonnel([]);
        } else if (pass.simpleFlow) {
            setPersonnel([mkSimple()]);
            setVehicles([]);
        } else {
            setPersonnel(available[0] ? [mkPersonnel(available[0])] : [mkPersonnel()]);
            setVehicles([]);
        }
        setIsModalOpen(true);
    };

    const toggleTeamMember = (member: any) => {
        const isVeh = isVehiclePass(selectedPass);
        const list: any[] = isVeh ? vehicles : personnel;
        const idx = list.findIndex((e: any) => e.teamMemberId === member._id);
        if (idx >= 0) {
            const updated = list.filter((_: any, i: number) => i !== idx);
            isVeh ? setVehicles(updated as VehicleEntry[]) : setPersonnel(updated as PersonnelEntry[]);
            return;
        }
        const max = selectedPass?.maxPerRequest || selectedPass?.totalQuota || 10;
        if (list.length >= max) { Alert.alert('Limit reached', `Max ${max} passes per request.`); return; }
        if (isVeh) {
            setVehicles([...vehicles, mkVehicle(member)]);
        } else {
            setPersonnel([...personnel, mkPersonnel(member)]);
        }
    };

    const addManualEntry = () => {
        const isVeh = isVehiclePass(selectedPass);
        const list: any[] = isVeh ? vehicles : personnel;
        const max = selectedPass?.maxPerRequest || selectedPass?.totalQuota || 10;
        if (list.length >= max) { Alert.alert('Limit reached', `Max ${max} passes per request.`); return; }
        isVeh ? setVehicles([...vehicles, mkVehicle()]) : setPersonnel([...personnel, mkPersonnel()]);
    };

    const removeEntry = (index: number) => {
        const isVeh = isVehiclePass(selectedPass);
        isVeh
            ? setVehicles(vehicles.filter((_, i) => i !== index))
            : setPersonnel(personnel.filter((_, i) => i !== index));
    };

    const handleSimpleQty = (newQty: number) => {
        const max = selectedPass?.maxPerRequest || selectedPass?.totalQuota || 10;
        if (newQty < 1 || newQty > max) return;
        const base = personnel[0] || mkSimple();
        setPersonnel(Array.from({ length: newQty }, () => ({ ...base })));
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

    // ─── Derived quantities ────────────────────────────────────────────────────

    const activeQuantity = isVehiclePass(selectedPass) ? vehicles.length : personnel.length;

    let estimatedTotal = 0;
    if (selectedPass) {
        if (isVehiclePass(selectedPass)) {
            const twoCount = vehicles.filter(v => v.vehicleType === '2-wheeler').length;
            const fourCount = vehicles.filter(v => v.vehicleType === '4-wheeler').length;
            const billableTwo = Math.max(0, twoCount - (selectedPass.remainingTwoWheeler || 0));
            const billableFour = Math.max(0, fourCount - (selectedPass.remainingFourWheeler || 0));
            estimatedTotal = billableTwo * (selectedPass.priceTwoWheeler || 0) + billableFour * (selectedPass.priceFourWheeler || 0);
        } else {
            const free = selectedPass.complimentaryRemaining || 0;
            estimatedTotal = Math.max(0, activeQuantity - free) * (selectedPass.price || 0);
        }
    }

    // ─── Submit (2-step: check order → pay if needed → confirm) ─────────────

    const doFinalSubmit = async (payload: any, paymentDetails?: any) => {
        try {
            const finalPayload = { ...payload, paymentDetails };
            const response = await apiClient.post('/exhibitor-auth/pass-request', finalPayload);
            Alert.alert('✅ Success', response.data.message || 'Pass request submitted successfully.');
            setIsModalOpen(false);
            fetchRequests();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit pass request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (activeQuantity === 0) return;
        if (
            selectedPass?.id === 'service' &&
            personnel.some(person => String(person.aadhaarNumber || '').replace(/\D/g, '').length !== 12)
        ) {
            Alert.alert('Aadhaar required', 'Enter a valid 12-digit Aadhaar number for every service pass holder.');
            return;
        }
        setIsSubmitting(true);

        const payload = {
            passType: selectedPass.id,
            quantity: activeQuantity,
            vehicles: isVehiclePass(selectedPass) ? vehicles : undefined,
            personnel: !isVehiclePass(selectedPass) ? personnel : undefined,
        };

        try {
            // Step 1: Check if payment is needed
            const orderRes = await apiClient.post('/exhibitor-auth/pass-order', payload);

            if (orderRes.data.isFree) {
                // All passes within free quota → submit directly
                await doFinalSubmit(payload);
            } else {
                // Paid passes → open Razorpay, then submit with payment details
                setPendingPayload(payload);
                setRzpOrder(orderRes.data.order);
                setRzpKeyId(orderRes.data.keyId || '');
                setIsSubmitting(false);
                setShowRazorpay(true);
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to initiate pass request.');
            setIsSubmitting(false);
        }
    };

    const onPassPaymentSuccess = async (response: any) => {
        setShowRazorpay(false);
        setIsSubmitting(true);
        await doFinalSubmit(pendingPayload, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
        });
    };

    const onPassPaymentFailed = (error: any) => {
        setShowRazorpay(false);
        setIsSubmitting(false);
        Alert.alert('Payment Failed', error?.description || 'The payment was not completed. Please try again.');
    };

    // ─── Loading ──────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
                <ActivityIndicator size="large" color="#1a3a7c" />
                <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Passes...</Text>
            </View>
        );
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    const teamAllocation = selectedPass ? getTeamAllocation(selectedPass) : { available: [], allocated: [] };

    return (
        <View className="flex-1 bg-[#f4f7f9]">
            {/* Header */}
            <View className="w-full bg-white pt-14 pb-4 px-6 border-b border-slate-200 shadow-sm z-10">
                <View className="flex-row items-center mb-1">
                    {/* @ts-ignore */}
                    <Sparkles size={14} color="#3b82f6" />
                    <Text className="text-blue-600 font-bold text-[11px] tracking-widest uppercase ml-2">Exhibitor Zone</Text>
                </View>
                <Text className="text-slate-800 font-black text-[24px] tracking-tight mb-1">Passes &amp; Hospitality</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Complimentary Summary Grid */}
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
                                    { ...pass, id: 'vehicle-2', title: '2-Wheeler', complimentary: (pass as any).complimentaryTwoWheeler || 0 },
                                    { ...pass, id: 'vehicle-4', title: '4-Wheeler', complimentary: (pass as any).complimentaryFourWheeler || 0 },
                                ];
                            }
                            return [pass];
                        }).map(pass => (
                            <View key={pass.id} className="w-[48%] bg-[#f8fafc] p-3 rounded-2xl mb-2 border border-slate-100 relative overflow-hidden">
                                <View className="absolute right-[-10px] top-[-10px] opacity-[0.03]">
                                    {/* @ts-ignore */}
                                    <pass.icon size={80} color="#000" />
                                </View>
                                {/* @ts-ignore */}
                                <pass.icon size={22} color="#64748b" />
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

                {/* Pass Cards */}
                <View className="flex-row items-center justify-between mb-2 mt-1 px-2">
                    <Text className="text-lg font-black text-slate-800">Request Passes</Text>
                    <View className="bg-orange-100 px-3 py-1 rounded-full">
                        <Text className="text-orange-600 text-[10px] font-bold uppercase tracking-wider">Paid Add-ons</Text>
                    </View>
                </View>

                {passes.map((pass) => (
                    <View key={pass.id} className={`rounded-3xl p-4 mb-3 border border-white/50 shadow-sm ${pass.theme.shadow} ${pass.theme.bg} relative overflow-hidden`}>
                        <View className="absolute right-[-20px] bottom-[-20px] opacity-[0.05]">
                            {/* @ts-ignore */}
                            <pass.icon size={120} color="#000" />
                        </View>

                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center flex-1">
                                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                                    {/* @ts-ignore */}
                                    <pass.icon size={24} color="#64748b" />
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
                                            <Text className="text-[10px] font-bold text-slate-500">₹{(pass as any).priceTwoWheeler || 0}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View className="flex-row bg-white/60 rounded-b-2xl p-2">
                                    <View className="flex-1 px-2">
                                        <Text className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">4-Wheeler</Text>
                                        <View className="flex-row items-baseline gap-2">
                                            <Text className="text-[10px] font-bold text-slate-500">Free: {(pass as any).complimentaryFourWheeler || 0}</Text>
                                            <Text className="text-[10px] font-bold text-slate-500">Rem: <Text className="text-emerald-600">{(pass as any).remainingFourWheeler || 0}</Text></Text>
                                            <Text className="text-[10px] font-bold text-slate-500">₹{(pass as any).priceFourWheeler || 0}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View className="flex-row bg-white/60 rounded-2xl p-1 mb-3">
                                <View className="flex-1 items-center py-2">
                                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claimed</Text>
                                    <Text className="text-lg font-black text-slate-800">{pass.used}</Text>
                                    {(pass as any).pending > 0 ? <Text className="text-[9px] font-bold text-amber-700">{(pass as any).pending} pending</Text> : null}
                                </View>
                                <View className="w-[1px] bg-slate-200/50 my-2" />
                                <View className="flex-1 items-center py-2">
                                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Free Left</Text>
                                    <Text className="text-lg font-black text-emerald-600">{(pass as any).complimentaryRemaining ?? pass.remaining}</Text>
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
                            <Text className="font-black text-[13px] uppercase tracking-widest mr-2 text-white">
                                {(countsByType[pass.id]?.pending || 0) > 0 ? `${countsByType[pass.id].pending} Pending` : 'Request Passes'}
                            </Text>
                            {/* @ts-ignore */}
                            <ArrowRight size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ))}

                <View className="h-20" />
            </ScrollView>

            {/* ── REQUEST MODAL ────────────────────────────────────────────────── */}
            <Modal visible={isModalOpen} animationType="slide" transparent>
                <View className="flex-1 bg-slate-900/60 justify-end">
                    <View className="bg-[#f8fafc] rounded-t-[32px] h-[92%] overflow-hidden shadow-2xl">

                        {/* Modal Header */}
                        <View className="px-6 py-5 flex-row justify-between items-center bg-white border-b border-slate-100">
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${selectedPass?.theme?.bg}`}>
                                    {selectedPass && (
                                        // @ts-ignore
                                        <selectedPass.icon size={20} color="#64748b" />
                                    )}
                                </View>
                                <View>
                                    <Text className="text-[18px] font-black text-slate-800 tracking-tight">{selectedPass?.title}</Text>
                                    <Text className="text-[11px] font-bold text-slate-500 mt-0.5">
                                        {isVehiclePass(selectedPass) ? 'Pricing varies by type' : `₹${selectedPass?.price} per pass`}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)} className="bg-slate-50 p-2 rounded-full border border-slate-200">
                                {/* @ts-ignore */}
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingTop: 20, paddingBottom: 60 }}>

                            {/* ── SIMPLE FLOW (Lunch / Water) ── */}
                            {selectedPass?.simpleFlow ? (
                                <View className="bg-white p-5 rounded-3xl mb-5 border border-slate-200 shadow-sm">
                                    <Text className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Quantity</Text>
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-base font-bold text-slate-700">How many do you need?</Text>
                                        <View className="flex-row items-center gap-5 bg-slate-50 px-2 py-1.5 rounded-2xl border border-slate-200">
                                            <TouchableOpacity
                                                onPress={() => handleSimpleQty(activeQuantity - 1)}
                                                className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm border border-slate-100"
                                            >
                                                <Text className="text-xl font-black text-slate-400">-</Text>
                                            </TouchableOpacity>
                                            <Text className="text-xl font-black text-slate-800 w-6 text-center">{activeQuantity}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleSimpleQty(activeQuantity + 1)}
                                                className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm border border-slate-100"
                                            >
                                                <Text className="text-xl font-black text-emerald-600">+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between items-center">
                                        <Text className="text-[13px] font-bold text-slate-500">Estimated Total</Text>
                                        <Text className="text-[18px] font-black text-slate-800">₹{estimatedTotal}</Text>
                                    </View>
                                    <Text className="text-[10px] text-slate-400 font-bold mt-2">
                                        Max {selectedPass?.maxPerRequest || selectedPass?.totalQuota || 10} per request
                                    </Text>
                                </View>
                            ) : (
                                /* ── TEAM SELECTION + ENTRY FORMS ── */
                                <>
                                    {/* Team Member Selector */}
                                    <View className="bg-white p-5 rounded-3xl mb-5 border border-slate-200 shadow-sm">
                                        <Text className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">Assign Passes</Text>
                                        <Text className="text-[13px] font-bold text-slate-600 mb-4">Tap team members to select them, or add entries manually.</Text>

                                        {teamAllocation.available.length > 0 ? (
                                            <View className="flex-row flex-wrap gap-2 mb-4">
                                                {teamAllocation.available.map((member: any) => {
                                                    const isSelected = isVehiclePass(selectedPass)
                                                        ? vehicles.some(e => e.teamMemberId === member._id)
                                                        : personnel.some(e => e.teamMemberId === member._id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={member._id}
                                                            onPress={() => toggleTeamMember(member)}
                                                            className={`px-3 py-2.5 border-2 rounded-2xl flex-row items-center ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                                                        >
                                                            {isSelected && (
                                                                // @ts-ignore
                                                                <Check size={13} color="#3b82f6" style={{ marginRight: 6 }} />
                                                            )}
                                                            <View>
                                                                <Text className={`text-[12px] font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{member.name}</Text>
                                                                {member.designation ? (
                                                                    <Text className="text-[10px] text-slate-400 font-medium">{member.designation}</Text>
                                                                ) : null}
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        ) : (
                                            <Text className="text-xs text-slate-400 font-medium italic mb-4">No unallocated team members found.</Text>
                                        )}

                                        <TouchableOpacity onPress={addManualEntry} className="self-start flex-row items-center bg-slate-100 px-4 py-2.5 rounded-xl">
                                            <Text className="text-[12px] font-black text-slate-600">+ Add Manual Entry</Text>
                                        </TouchableOpacity>

                                        {/* Estimated total */}
                                        <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between items-center">
                                            <View>
                                                <Text className="text-[13px] font-bold text-slate-500">Estimated Total</Text>
                                                {!isVehiclePass(selectedPass) && (selectedPass?.complimentaryRemaining || 0) > 0 && (
                                                    <Text className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                                        {Math.min(activeQuantity, selectedPass?.complimentaryRemaining || 0)} pass{Math.min(activeQuantity, selectedPass?.complimentaryRemaining || 0) !== 1 ? 'es' : ''} free
                                                    </Text>
                                                )}
                                            </View>
                                            <Text className="text-[20px] font-black text-slate-800">₹{estimatedTotal}</Text>
                                        </View>
                                    </View>

                                    {/* Vehicle entry forms */}
                                    {isVehiclePass(selectedPass) && vehicles.map((veh, index) => (
                                        <View key={index} className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-sm relative overflow-hidden">
                                            <View className="absolute right-0 top-0 bg-slate-50 px-4 py-2 rounded-bl-2xl border-b border-l border-slate-100 flex-row items-center gap-3">
                                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle #{index + 1}</Text>
                                                <TouchableOpacity onPress={() => removeEntry(index)}>
                                                    {/* @ts-ignore */}
                                                    <X size={14} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>

                                            <Text className="text-[14px] font-black text-slate-800 mb-4">Vehicle Details</Text>

                                            {veh.isTeamMember && (
                                                <View className="bg-blue-50 rounded-xl px-3 py-2 mb-4">
                                                    <Text className="text-xs font-bold text-blue-600">{veh.name}</Text>
                                                </View>
                                            )}

                                            <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Vehicle Type</Text>
                                            <View className="flex-row gap-3 mb-4">
                                                <TouchableOpacity
                                                    onPress={() => updateVehicle(index, 'vehicleType', '2-wheeler')}
                                                    className={`flex-1 py-3.5 rounded-2xl border-2 items-center flex-row justify-center ${veh.vehicleType === '2-wheeler' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                                                >
                                                    {veh.vehicleType === '2-wheeler' && (
                                                        // @ts-ignore
                                                        <CheckCircle2 size={14} color="#10b981" style={{ marginRight: 6 }} />
                                                    )}
                                                    <Text className={`font-black text-[13px] ${veh.vehicleType === '2-wheeler' ? 'text-emerald-700' : 'text-slate-500'}`}>2-Wheeler</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => updateVehicle(index, 'vehicleType', '4-wheeler')}
                                                    className={`flex-1 py-3.5 rounded-2xl border-2 items-center flex-row justify-center ${veh.vehicleType === '4-wheeler' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                                                >
                                                    {veh.vehicleType === '4-wheeler' && (
                                                        // @ts-ignore
                                                        <CheckCircle2 size={14} color="#10b981" style={{ marginRight: 6 }} />
                                                    )}
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
                                    ))}

                                    {/* Personnel entry forms */}
                                    {!isVehiclePass(selectedPass) && personnel.map((person, index) => (
                                        <View key={index} className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-sm relative overflow-hidden">
                                            <View className={`absolute right-0 top-0 px-4 py-2 rounded-bl-2xl border-b border-l border-white/50 flex-row items-center gap-3 ${selectedPass?.theme?.bg}`}>
                                                <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedPass?.theme?.text}`}>Person #{index + 1}</Text>
                                                <TouchableOpacity onPress={() => removeEntry(index)}>
                                                    {/* @ts-ignore */}
                                                    <X size={14} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>

                                            <Text className="text-[14px] font-black text-slate-800 mb-4">
                                                {person.isTeamMember ? 'Team Member' : 'Attendee Details'}
                                            </Text>

                                            <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name</Text>
                                            <TextInput
                                                value={person.name}
                                                onChangeText={(val) => updatePersonnel(index, 'name', val)}
                                                placeholder="Enter full name"
                                                placeholderTextColor="#cbd5e1"
                                                editable={!person.isTeamMember}
                                                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-[13px] mb-4 ${person.isTeamMember ? 'text-slate-400' : 'text-slate-800'}`}
                                            />

                                            <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Designation</Text>
                                            <TextInput
                                                value={person.designation}
                                                onChangeText={(val) => updatePersonnel(index, 'designation', val)}
                                                placeholder="e.g. Manager"
                                                placeholderTextColor="#cbd5e1"
                                                editable={!person.isTeamMember}
                                                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-[13px] mb-4 ${person.isTeamMember ? 'text-slate-400' : 'text-slate-800'}`}
                                            />

                                            <View className="flex-row gap-3 mb-4">
                                                <View className="flex-1">
                                                    <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Email</Text>
                                                    <TextInput
                                                        value={person.email}
                                                        onChangeText={(val) => updatePersonnel(index, 'email', val)}
                                                        placeholder="Email address"
                                                        placeholderTextColor="#cbd5e1"
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                        editable={!person.isTeamMember}
                                                        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-[13px] ${person.isTeamMember ? 'text-slate-400' : 'text-slate-800'}`}
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
                                                        editable={!person.isTeamMember}
                                                        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-[13px] ${person.isTeamMember ? 'text-slate-400' : 'text-slate-800'}`}
                                                    />
                                                </View>
                                            </View>

                                            <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Gender</Text>
                                            <View className="flex-row gap-2">
                                                {(['male', 'female', 'other'] as const).map(g => (
                                                    <TouchableOpacity
                                                        key={g}
                                                        onPress={() => updatePersonnel(index, 'gender', g)}
                                                        className={`flex-1 py-3 rounded-xl border-2 items-center ${person.gender === g
                                                            ? g === 'male' ? 'bg-blue-50 border-blue-400' : g === 'female' ? 'bg-pink-50 border-pink-400' : 'bg-purple-50 border-purple-400'
                                                            : 'bg-slate-50 border-slate-100'
                                                        }`}
                                                    >
                                                        <Text className={`font-black text-[11px] capitalize ${person.gender === g
                                                            ? g === 'male' ? 'text-blue-700' : g === 'female' ? 'text-pink-700' : 'text-purple-700'
                                                            : 'text-slate-500'
                                                        }`}>{g}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            {selectedPass?.id === 'service' && (
                                                <>
                                                    <Text className="text-[11px] font-bold text-slate-500 mb-2 mt-4 uppercase tracking-wider">Aadhaar Number</Text>
                                                    <TextInput
                                                        value={person.aadhaarNumber || ''}
                                                        onChangeText={(val) => updatePersonnel(index, 'aadhaarNumber', val.replace(/\D/g, '').slice(0, 12))}
                                                        placeholder="12-digit Aadhaar number"
                                                        placeholderTextColor="#cbd5e1"
                                                        keyboardType="number-pad"
                                                        maxLength={12}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-[13px] text-slate-800"
                                                    />
                                                </>
                                            )}
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting || activeQuantity === 0}
                                className={`w-full py-4 rounded-2xl flex-row items-center justify-center mt-2 shadow-lg ${selectedPass?.theme?.btn} ${(isSubmitting || activeQuantity === 0) ? 'opacity-60' : ''}`}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text className="text-white font-black text-[14px] uppercase tracking-widest mr-2">
                                            Submit {activeQuantity} Request{activeQuantity !== 1 ? 's' : ''}
                                        </Text>
                                        {/* @ts-ignore */}
                                        <ChevronRight size={18} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ── RAZORPAY PAYMENT GATEWAY (for paid passes) ──────────────── */}
            {showRazorpay && rzpOrder && (
                <RazorpayWebView
                    visible={showRazorpay}
                    orderId={rzpOrder.id}
                    amount={rzpOrder.amount / 100}
                    keyId={rzpKeyId}
                    currency={rzpOrder.currency || 'INR'}
                    name={exhibitorProfile?.exhibitorName || ''}
                    email={exhibitorProfile?.contact1?.email || ''}
                    contact={exhibitorProfile?.contact1?.mobile || ''}
                    onClose={() => { setShowRazorpay(false); setIsSubmitting(false); }}
                    onSuccess={onPassPaymentSuccess}
                    onFailed={onPassPaymentFailed}
                />
            )}
        </View>
    );
}
