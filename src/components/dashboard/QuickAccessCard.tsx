import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function QuickAccessCard({ icon: Icon, title, sub, iconBg, iconColor, onPress, disabled }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled}
      className={`bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-2 flex-row items-center ${disabled ? 'opacity-50' : ''}`}
      style={{ width: '49%' }}
    >
      <View className="w-9 h-9 rounded-full items-center justify-center mr-2" style={{ backgroundColor: iconBg }}>
        {/* @ts-ignore */}
        <Icon size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-[#1a3a7c] font-bold text-[11px] mb-0.5">{title}</Text>
        <Text className="text-slate-400 text-[8px] leading-tight">{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}
