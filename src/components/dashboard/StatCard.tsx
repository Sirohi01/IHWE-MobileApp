import React from 'react';
import { View, Text } from 'react-native';

export function StatCard({ icon: Icon, label, value, sub, valueColor, iconBg, iconColor }: any) {
  return (
    <View 
      className="bg-white rounded-xl p-3 mr-3 shadow-sm border border-slate-200 flex-row items-center min-w-[170px]"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: iconBg }}>
        {/* @ts-ignore */}
        <Icon size={18} color={iconColor} />
      </View>
      <View>
        <Text className="text-[10px] font-bold text-[#1a3a7c] uppercase tracking-wider mb-0.5">{label}</Text>
        <Text className="text-[13px] font-black uppercase mb-0.5" style={{ color: valueColor }}>{value}</Text>
        <Text className="text-[9px] text-slate-500 font-medium">{sub}</Text>
      </View>
    </View>
  );
}
