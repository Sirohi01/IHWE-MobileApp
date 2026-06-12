import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { Printer, ChevronLeft } from 'lucide-react-native';
import { apiClient } from '../../../core/api/axios';
import { generateInvoiceHtml } from '../../../utils/htmlTemplates';
import { headerBase64 } from '../../../utils/headerBase64';

export default function DocumentViewerScreen() {
  const { type, id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [headerImgBase64, setHeaderImgBase64] = useState<string>(`data:image/png;base64,${headerBase64}`);
  const [sigBase64, setSigBase64] = useState<string>('');
  const [stampBase64, setStampBase64] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  useEffect(() => {
    fetchDocument();
    fetchExtras();
  }, [id, type]);

  const fetchExtras = async () => {
    try {
      const [settingsRes, banksRes] = await Promise.all([
        apiClient.get('/settings'),
        apiClient.get('/banks')
      ]);
      const setts = settingsRes.data?.data || settingsRes.data;
      setSettings(setts);
      const banks = banksRes.data?.data || banksRes.data;
      if (banks && banks.length > 0) {
        setBankDetails(banks.find((b: any) => b.status === 'active') || banks[0]);
      }
      if (setts?.authorizedSignature) {
        const sigUrl = setts.authorizedSignature.startsWith('http') ? setts.authorizedSignature : `https://nenita-untoured-nonhesitantly.ngrok-free.dev${setts.authorizedSignature}`;
        // const sigUrl = setts.authorizedSignature.startsWith('http') ? setts.authorizedSignature : `https://api.ihwe.in${setts.authorizedSignature}`;

        const { uri } = await FileSystem.downloadAsync(sigUrl, FileSystem.documentDirectory + 'sig.png', { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        setSigBase64(`data:image/png;base64,${b64}`);
      }
      if (setts?.companyStamp) {
        const stampUrl = setts.companyStamp.startsWith('http') ? setts.companyStamp : `https://nenita-untoured-nonhesitantly.ngrok-free.dev${setts.companyStamp}`;
        // const stampUrl = setts.companyStamp.startsWith('http') ? setts.companyStamp : `https://api.ihwe.in${setts.companyStamp}`;
        const { uri } = await FileSystem.downloadAsync(stampUrl, FileSystem.documentDirectory + 'stamp.png', { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        setStampBase64(`data:image/png;base64,${b64}`);
      }
    } catch (e) {
      console.log('Error fetching extras:', e);
    }
  };

  const fetchDocument = async () => {
    try {
      const endpoint = type === 'receipt' ? `/payments/${id}` : `/${type}s/${id}`;
      const res = await apiClient.get(endpoint);
      setData(res.data?.data || res.data);
    } catch (err) {
      console.log(`Error fetching ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f4f7f9]">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="mt-4 text-[#1a3a7c] font-bold">Loading Document...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f4f7f9]">
        <Text className="text-red-500 font-bold">Document not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 p-3 bg-[#1a3a7c] rounded-lg">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const htmlStr = generateInvoiceHtml(data, type as string, headerImgBase64, settings, bankDetails, sigBase64, stampBase64);

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      await Print.printAsync({ html: htmlStr });
    } catch (error: any) {
      console.log('Error printing:', error);
      Alert.alert('Print Error', error?.message || 'Something went wrong while printing.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white border-b border-slate-200 px-4 pt-14 pb-3 flex-row items-center justify-between z-10 shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full border border-slate-200"
        >
          {/* @ts-ignore */}
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-[16px] font-black text-[#0f172a] uppercase tracking-wider ml-3 flex-1">
          {type === 'estimate' ? 'Proforma Invoice' : type === 'receipt' ? 'Payment Receipt' : 'Tax Invoice'}
        </Text>
      </View>

      <WebView
        originWhitelist={['*']}
        source={{ html: htmlStr }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        showsVerticalScrollIndicator={false}
      />

      {/* Print Document Button (Hidden for now as requested)
      <View className="px-4 py-2 bg-white border-t border-slate-200">
        <TouchableOpacity 
          onPress={handlePrint}
          disabled={isPrinting}
          className={\`flex-row items-center justify-center py-2.5 rounded-lg shadow-sm \${isPrinting ? 'bg-slate-400' : 'bg-[#1a3a7c]'}\`}
        >
          {isPrinting ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-[15px]">Preparing Print...</Text>
            </>
          ) : (
            <>
              <Printer size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-[15px]">Print Document</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      */}
    </View>
  );
}
