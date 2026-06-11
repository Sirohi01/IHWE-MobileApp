import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';
import { ChevronLeft, FileText, Download, Receipt, FileCheck2, CreditCard, ExternalLink } from 'lucide-react-native';

export default function InvoicesScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      console.log('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Financials...</Text>
      </View>
    );
  }

  const cur = data?.participation?.currency === 'USD' ? '$' : '₹';
  const total = data?.participation?.total || 0;
  const paid = data?.amountPaid || 0;
  const balance = data?.balanceAmount || 0;

  // As per user requirement, proforma comes from "estimate" schema, tax invoice from "invoice" schema
  const estimate = data?.estimate || data?.participation?.estimate;
  const invoice = data?.invoice || data?.participation?.invoice;
  const receipts = data?.receipts || data?.participation?.receipts || [];

  const handleView = (type: 'estimate' | 'invoice', doc: any) => {
    if (!doc || !doc.id) {
      Alert.alert("Not Available", "This document is not generated yet.");
      return;
    }
    router.push({
      pathname: '/document/[type]/[id]',
      params: { type, id: doc.id }
    });
  };

  const handleExternalDownload = (url: string) => {
    if (!url) {
      Alert.alert("Not Available", "This document is not generated yet.");
      return;
    }
    Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      
      {/* Light Theme Header */}
      <View className="bg-white pt-14 pb-5 px-5 border-b border-slate-200 shadow-sm z-10 relative">
        <View className="absolute right-[-40px] top-[-20px] w-40 h-40 rounded-full border-[15px] border-green-50/50" />
        
        <View className="flex-row items-center mb-6 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center border border-slate-200 mr-3 shadow-sm"
          >
            {/* @ts-ignore */}
            <ChevronLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-[#0f172a] text-lg font-black tracking-wider">Invoices & Receipts</Text>
        </View>

        <View className="z-10 flex-row gap-3">
          <View className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-sm">
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-1">Total</Text>
            <Text className="text-[#0f172a] font-black text-[18px]">{cur}{total.toLocaleString()}</Text>
          </View>
          <View className="flex-1 bg-green-50 border border-green-100 rounded-xl p-3 shadow-sm">
            <Text className="text-green-600/70 font-bold uppercase tracking-widest text-[9px] mb-1">Paid</Text>
            <Text className="text-green-700 font-black text-[18px]">{cur}{paid.toLocaleString()}</Text>
          </View>
          <View className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3 shadow-sm">
            <Text className="text-orange-600/70 font-bold uppercase tracking-widest text-[9px] mb-1">Balance</Text>
            <Text className="text-orange-700 font-black text-[18px]">{cur}{balance.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Estimate / Proforma Invoice */}
        <Text className="text-[#1a3a7c] font-black text-[13px] mb-1.5 ml-1 uppercase tracking-wider">Proforma Invoice</Text>
        <View className="bg-white rounded-[16px] shadow-sm border border-slate-200 mb-5 relative overflow-hidden p-4">
          <View className="absolute right-0 top-0 opacity-[0.03]">
             {/* @ts-ignore */}
             <FileText size={120} color="#0f172a" />
          </View>
          
          <View className="flex-row items-start mb-3">
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3 border border-blue-100">
               {/* @ts-ignore */}
               <FileText size={18} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-0.5">Document</Text>
              <Text className="text-[#0f172a] font-black text-[16px]">{estimate?.estimateNo || 'Proforma Invoice'}</Text>
              <Text className="text-slate-500 text-[11px] mt-0.5">{estimate?.date ? new Date(estimate.date).toLocaleDateString() : 'Pending Generation'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className={`flex-row justify-center items-center py-3 rounded-xl border ${estimate?.id ? 'bg-[#1a3a7c] border-[#1a3a7c]' : 'bg-slate-100 border-slate-200'}`}
            onPress={() => handleView('estimate', estimate)}
            disabled={!estimate?.id}
          >
            {/* @ts-ignore */}
            <FileText size={14} color={estimate?.id ? "#ffffff" : "#94a3b8"} className="mr-2" />
            <Text className={`font-black text-[12px] uppercase tracking-widest ${estimate?.id ? 'text-white' : 'text-slate-400'}`}>
              {estimate?.id ? 'View Document' : 'Not Available'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tax Invoice */}
        <Text className="text-[#1a3a7c] font-black text-[13px] mb-1.5 ml-1 uppercase tracking-wider">Tax Invoice</Text>
        <View className="bg-white rounded-[16px] shadow-sm border border-slate-200 mb-5 relative overflow-hidden p-4">
          <View className="absolute right-0 top-0 opacity-[0.03]">
             {/* @ts-ignore */}
             <FileCheck2 size={120} color="#0f172a" />
          </View>
          
          <View className="flex-row items-start mb-3">
            <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mr-3 border border-indigo-100">
               {/* @ts-ignore */}
               <FileCheck2 size={18} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-0.5">Document</Text>
              <Text className="text-[#0f172a] font-black text-[16px]">{invoice?.invoiceNo || 'Tax Invoice'}</Text>
              <Text className="text-slate-500 text-[11px] mt-0.5">{invoice?.date ? new Date(invoice.date).toLocaleDateString() : 'Generated upon payment'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className={`flex-row justify-center items-center py-3 rounded-xl border ${invoice?.id ? 'bg-[#1a3a7c] border-[#1a3a7c]' : 'bg-slate-100 border-slate-200'}`}
            onPress={() => handleView('invoice', invoice)}
            disabled={!invoice?.id}
          >
            {/* @ts-ignore */}
            <FileCheck2 size={14} color={invoice?.id ? "#ffffff" : "#94a3b8"} className="mr-2" />
            <Text className={`font-black text-[12px] uppercase tracking-widest ${invoice?.id ? 'text-white' : 'text-slate-400'}`}>
              {invoice?.id ? 'View Document' : 'Not Available'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Receipts */}
        <Text className="text-[#1a3a7c] font-black text-[13px] mb-1.5 ml-1 uppercase tracking-wider">Payment Receipts</Text>
        {receipts.length > 0 ? (
          <View className="bg-white rounded-[16px] shadow-sm border border-slate-200 mb-5">
            {receipts.map((rcpt: any, index: number) => (
              <View key={index} className={`flex-row items-center p-3.5 ${index !== receipts.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-3 border border-emerald-100">
                  {/* @ts-ignore */}
                  <Receipt size={16} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#0f172a] font-black text-[14px]">{rcpt.receiptNo || `Receipt #${index + 1}`}</Text>
                  <Text className="text-slate-500 text-[10px] mt-0.5">{rcpt.date ? new Date(rcpt.date).toLocaleDateString() : 'Date unavailable'} • {cur}{rcpt.amount}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push(`/document/receipt/${rcpt._id || rcpt.id}` as any)}
                  className="bg-slate-50 p-2 rounded-full border border-slate-200"
                >
                  {/* @ts-ignore */}
                  <Download size={16} color="#475569" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-slate-50 border border-slate-200 border-dashed rounded-[16px] p-6 items-center mb-5">
            {/* @ts-ignore */}
            <Receipt size={32} color="#94a3b8" className="mb-2" />
            <Text className="text-slate-500 font-bold text-[12px]">No receipts generated yet</Text>
            <Text className="text-slate-400 text-[10px] text-center mt-1">Payment receipts will appear here once your transactions are verified.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
