import '../global.css';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight, History, PlusCircle, QrCode, Ticket, X } from 'lucide-react-native';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { apiClient } from '@/core/api/axios';

export default function QrWalletScreen() {
  const [passes, setPasses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const load = useCallback(async () => {
    try {
      const [walletRes, dashboardRes] = await Promise.all([
        apiClient.get('/exhibitor-pass-requests/wallet/my'),
        apiClient.get('/exhibitor-auth/dashboard'),
      ]);
      setPasses(walletRes.data?.data || []);
      setSummary(walletRes.data?.summary || []);
      setProfile(dashboardRes.data?.data || null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') load();
    });
    return () => subscription.remove();
  }, [load]);

  const exhibitorName = profile?.exhibitorName || profile?.companyName || 'IHWE Exhibitor';
  const filters = ['All', 'Team', 'Service', 'Vehicle', 'Food'];
  const filteredPasses = passes.filter(pass => {
    if (filter === 'All') return true;
    if (filter === 'Team') return ['exhibitor', 'visitor', 'delegate'].includes(pass.passType);
    if (filter === 'Food') return ['lunch', 'water'].includes(pass.passType);
    return pass.passType === filter.toLowerCase();
  });
  const filteredSummary = summary.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Team') return ['exhibitor', 'visitor', 'delegate'].includes(item.passType);
    if (filter === 'Food') return ['lunch', 'water'].includes(item.passType);
    return item.passType === filter.toLowerCase();
  });
  const usageText = (pass: any) => {
    if (['lunch', 'water'].includes(pass.passType)) {
      return `${pass.deliveredQuantity || 0} of ${pass.quantity} delivered`;
    }
    if ((pass.dayUsage || []).length > 1) return `${pass.dayUsage.length} days used`;
    return pass.used ? 'Used' : 'Available';
  };

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      <View className="bg-white pt-14 pb-4 px-5 border-b border-slate-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
          <ChevronLeft size={22} color="#334155" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[22px] font-black text-slate-800">QR Wallet</Text>
          <Text className="text-[11px] font-semibold text-slate-500">Approved passes ready for venue scanning</Text>
        </View>
        <View className="bg-emerald-50 px-3 py-1.5 rounded-full">
          <Text className="text-[10px] font-black text-emerald-700">{passes.length} ACTIVE</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1a3a7c" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          <View className="bg-[#0f2f5f] p-5 rounded-2xl mb-4">
            <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest">Exhibitor</Text>
            <Text className="text-white text-[19px] font-black mt-1">{exhibitorName}</Text>
            <Text className="text-white/70 text-[11px] font-semibold mt-2">Select a pass and show its QR to the attendance team.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {filters.map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                className={`px-4 py-2 mr-2 rounded-lg border ${filter === item ? 'bg-blue-700 border-blue-700' : 'bg-white border-slate-200'}`}
              >
                <Text className={`text-[11px] font-black ${filter === item ? 'text-white' : 'text-slate-600'}`}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[14px] font-black text-slate-800">Complimentary Pass Balance</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/passes-and-hospitality')} className="flex-row items-center">
              <PlusCircle size={14} color="#1d4ed8" />
              <Text className="text-[11px] font-black text-blue-700 ml-1">Claim passes</Text>
            </TouchableOpacity>
          </View>
          {filteredSummary.map(item => (
            <View key={item.passType} className="bg-white border border-slate-200 p-3 rounded-lg mb-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-[12px] font-black text-slate-800 capitalize">{item.title || `${item.passType} Pass`}</Text>
                <Text className="text-[10px] font-black text-emerald-700">{item.complimentaryRemaining} FREE LEFT</Text>
              </View>
              <View className="flex-row mt-2">
                <Text className="text-[10px] font-semibold text-slate-500 mr-4">Free: {item.complimentaryTotal}</Text>
                <Text className="text-[10px] font-semibold text-slate-500 mr-4">Claimed: {item.complimentaryClaimed}</Text>
                <Text className="text-[10px] font-semibold text-slate-500">Approved: {item.approved}</Text>
              </View>
              {item.pending > 0 ? <Text className="text-[10px] font-bold text-amber-700 mt-1">{item.pending} awaiting approval</Text> : null}
              {item.vehicle ? (
                <Text className="text-[10px] font-semibold text-slate-500 mt-1">
                  2-Wheeler {item.vehicle.twoWheeler.claimed}/{item.vehicle.twoWheeler.total} | 4-Wheeler {item.vehicle.fourWheeler.claimed}/{item.vehicle.fourWheeler.total}
                </Text>
              ) : null}
            </View>
          ))}

          <Text className="text-[14px] font-black text-slate-800 mt-4 mb-2">Issued QR Passes</Text>

          {filteredPasses.length === 0 ? (
            <View className="items-center py-20">
              <QrCode size={48} color="#94a3b8" />
              <Text className="text-[16px] font-black text-slate-600 mt-4">No approved passes</Text>
              <Text className="text-[12px] text-slate-400 mt-1 text-center">Approved pass requests will automatically appear here.</Text>
            </View>
          ) : filteredPasses.map(pass => (
            <TouchableOpacity
              key={pass.id}
              onPress={() => setSelected(pass)}
              className="bg-white border border-slate-200 p-4 rounded-2xl mb-3 flex-row items-center"
            >
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center">
                <Ticket size={23} color="#1a3a7c" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-[15px] font-black text-slate-800 capitalize">{pass.passType} Pass</Text>
                <Text className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {pass.name || exhibitorName}{pass.quantity > 1 ? ` | Quantity ${pass.quantity}` : ''}
                </Text>
                {pass.vehicleNumber ? <Text className="text-[11px] font-bold text-blue-700 mt-1">{pass.vehicleNumber}</Text> : null}
                <Text className={`text-[11px] font-black mt-1 ${pass.remainingQuantity === 0 ? 'text-slate-500' : 'text-emerald-700'}`}>
                  {usageText(pass)}
                </Text>
                {pass.validityDays > 0 ? <Text className="text-[10px] font-semibold text-blue-700 mt-1">Valid for {pass.validityDays} event day(s)</Text> : null}
              </View>
              <ChevronRight size={19} color="#94a3b8" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/pass-usage-activity')}
            className="bg-blue-50 border border-blue-200 py-4 rounded-xl flex-row items-center justify-center mt-2"
          >
            <History size={17} color="#1d4ed8" />
            <Text className="text-blue-700 font-black text-[12px] ml-2">Scan & Confirmation Activity</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={Boolean(selected)} transparent animationType="fade">
        <View className="flex-1 bg-black/75 items-center justify-center p-5">
          <View className="bg-white rounded-3xl p-6 w-full items-center">
            <TouchableOpacity onPress={() => setSelected(null)} className="absolute right-4 top-4 p-2 bg-slate-100 rounded-full">
              <X size={18} color="#475569" />
            </TouchableOpacity>
            <Text className="text-[21px] font-black text-slate-800 capitalize mt-4">{selected?.passType} Pass</Text>
            <Text className="text-[13px] font-semibold text-slate-500 mt-1 mb-5 text-center">{selected?.name || exhibitorName}</Text>
            {selected?.qrValue ? (
              <View className="p-4 border border-slate-200 rounded-2xl">
                <QRCode value={selected.qrValue} size={230} />
              </View>
            ) : null}
            {selected?.quantity > 1 ? <Text className="text-[15px] font-black text-amber-700 mt-4">{usageText(selected)}</Text> : null}
            {selected?.quantity === 1 ? <Text className="text-[14px] font-black text-emerald-700 mt-4">{usageText(selected)}</Text> : null}
            {(selected?.dayUsage || []).map((usage: any) => (
              <Text key={`${usage.day}-${usage.usedAt}`} className="text-[11px] font-semibold text-slate-500 mt-1">
                {usage.day}{usage.deliveredQuantity ? `: ${usage.deliveredQuantity} delivered` : ': Used'}
              </Text>
            ))}
            {selected?.vehicleNumber ? <Text className="text-[14px] font-bold text-slate-700 mt-3">{selected.vehicleNumber}</Text> : null}
            <Text className="text-[11px] text-slate-400 mt-5 text-center">Keep the screen brightness high while scanning.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
