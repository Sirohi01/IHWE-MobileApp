import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Users, QrCode, MessageSquare, Menu } from 'lucide-react-native';
import TourOverlay from '@/components/dashboard/TourOverlay';

export default function TabLayout() {
  return (
    <>
      <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#23471d', // ihwe-green
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingBottom: 8,
        paddingTop: 8,
        minHeight: 65,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      }
    }}>
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            // @ts-ignore
            <Home color={color} size={size} />
          )
        }} 
      />
      <Tabs.Screen 
        name="meetings" 
        options={{
          title: 'Meetings',
          tabBarIcon: ({ color, size }) => (
            // @ts-ignore
            <Users color={color} size={size} />
          )
        }} 
      />
      <Tabs.Screen 
        name="scanner" 
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <View className="bg-ihwe-green p-3 rounded-full -mt-6 shadow-lg border-4 border-white">
              {/* @ts-ignore */}
              <QrCode color="#ffdd00" size={28} />
            </View>
          ),
          tabBarLabel: () => null,
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            // @ts-ignore
            <MessageSquare color={color} size={size} />
          )
        }} 
      />
      <Tabs.Screen 
        name="more" 
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            // @ts-ignore
            <Menu color={color} size={size} />
          )
        }} 
      />
      <Tabs.Screen 
        name="myevent" 
        options={{
          href: null,
          title: 'My Event'
        }} 
      />
      <Tabs.Screen 
        name="relationship-manager" 
        options={{
          href: null,
          title: 'Relationship Manager'
        }} 
      />
      <Tabs.Screen 
        name="stall-information" 
        options={{
          href: null,
          title: 'Stall Information'
        }} 
      />
      <Tabs.Screen 
        name="invoices" 
        options={{
          href: null,
          title: 'Invoices & Receipts'
        }} 
      />
      <Tabs.Screen 
        name="add-on-services" 
        options={{
          href: null,
          title: 'Add On Services'
        }} 
      />
      <Tabs.Screen 
        name="passes-and-hospitality" 
        options={{
          href: null,
          title: 'Passes & Hospitality'
        }} 
      />
      <Tabs.Screen 
        name="profile-details" 
        options={{
          href: null,
          title: 'Profile Details'
        }} 
      />
      <Tabs.Screen 
        name="my-products" 
        options={{
          href: null,
          title: 'My Products'
        }} 
      />
      <Tabs.Screen 
        name="e-promotion" 
        options={{
          href: null,
          title: 'E-Promotion'
        }} 
      />
      <Tabs.Screen 
        name="policy/[id]" 
        options={{
          href: null,
          title: 'Policy'
        }} 
      />
    </Tabs>
      <TourOverlay />
    </>
  );
}
