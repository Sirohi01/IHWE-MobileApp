import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function SectionHeader({ title, rightText, onPressRight }: any) {
  return (
    <View className="flex-row justify-between items-center mb-1 mt-2">
      <View className="flex-row items-center">
        <Text className="font-black text-[12px] text-[#1a3a7c] uppercase tracking-widest">{title}</Text>
        <View className="h-px w-8 bg-blue-200 ml-2" />
      </View>
      {rightText && (
        <TouchableOpacity onPress={onPressRight}>
          <Text className="text-blue-600 font-bold text-[11px]">{rightText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
