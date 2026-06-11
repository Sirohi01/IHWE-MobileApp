import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTourStore } from '@/core/store/useTourStore';
import { router } from 'expo-router';
import { Home, Users, QrCode, MessageSquare, Menu as MenuIcon } from 'lucide-react-native';

const tourData = [
  {
    title: "Home Dashboard",
    description: "Your main dashboard. View your overall statistics like Total Scanned Leads, Pending Meetings, and Quick Actions to instantly access critical areas like your Passes or Invoices.",
    icon: <Home color="#2563eb" size={40} />,
    bg: "bg-blue-50",
    route: "/(tabs)/"
  },
  {
    title: "B2B Meetings",
    description: "The B2B Matchmaking hub. Schedule appointments with buyers, accept or reschedule incoming meeting requests, and manage your daily exhibition calendar to maximize ROI.",
    icon: <Users color="#16a34a" size={40} />,
    bg: "bg-green-50",
    route: "/(tabs)/meetings"
  },
  {
    title: "Lead Scanner",
    description: "The central yellow button opens your Lead Capture Scanner. Instantly scan visitor QR codes/badges as they walk into your stall, securely saving their contact information directly into your Buyers Management list.",
    icon: <QrCode color="#ca8a04" size={40} />,
    bg: "bg-yellow-50",
    route: "/(tabs)/scanner"
  },
  {
    title: "Real-time Chat",
    description: "Communicate directly with interested buyers, event organizers, or your Relationship Manager in real-time. Discuss requirements before the meeting happens.",
    icon: <MessageSquare color="#9333ea" size={40} />,
    bg: "bg-purple-50",
    route: "/(tabs)/chat"
  },
  {
    title: "Control Center",
    description: "The control center. Access deep settings like stall information, add-on services, payments, MSME documents, e-promotion tools, and security.",
    icon: <MenuIcon color="#475569" size={40} />,
    bg: "bg-slate-100",
    route: "/(tabs)/more"
  }
];

export default function TourOverlay() {
  const { isActive, currentStep, nextStep, endTour } = useTourStore();

  if (!isActive) return null;

  const current = tourData[currentStep];

  return (
    <Modal visible={isActive} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        
        {/* Pointer/Highlighting text to indicate we are looking at the screen behind */}
        <View className="absolute top-24 items-center">
          <Text className="text-white font-black text-2xl tracking-tight mb-2">Live App Tour</Text>
          <Text className="text-white/80 text-center px-10 text-[15px] leading-relaxed">
            You are currently viewing the live <Text className="font-bold text-white">{current.title}</Text> screen behind this guide.
          </Text>
        </View>

        <View className="w-full bg-white rounded-[32px] overflow-hidden shadow-2xl mt-16" style={{ elevation: 20 }}>
          {/* Header Image Area */}
          <View className={`w-full h-36 ${current.bg} items-center justify-center relative`}>
            <Text className="absolute top-4 right-6 text-slate-400 font-bold tracking-widest text-[12px]">
              {currentStep + 1} / {tourData.length}
            </Text>
            
            {/* Floating Icon */}
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-md border border-slate-100">
              {current.icon}
            </View>
          </View>

          {/* Content Area */}
          <View className="p-7 items-center">
            <Text className="text-2xl font-black text-slate-800 mb-3 text-center tracking-tight">{current.title}</Text>
            <Text className="text-slate-500 text-center leading-relaxed text-[14px] mb-8">
              {current.description}
            </Text>

            {/* Actions */}
            <View className="flex-row w-full gap-3">
              <TouchableOpacity 
                onPress={endTour}
                className="flex-1 py-4 items-center justify-center rounded-2xl bg-slate-100"
              >
                <Text className="text-slate-600 font-bold text-[14px]">End Tour</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  if (currentStep < tourData.length - 1) {
                    nextStep();
                    // @ts-ignore
                    router.replace(tourData[currentStep + 1].route);
                  } else {
                    endTour();
                  }
                }}
                className="flex-[1.5] py-4 items-center justify-center rounded-2xl bg-[#1a3a7c] shadow-lg shadow-blue-900/20"
              >
                <Text className="text-white font-bold text-[14px]">
                  {currentStep === tourData.length - 1 ? "Got it!" : "Next Tab"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Down Arrow pointing to the tabs */}
        <View className="absolute bottom-20 items-center w-full">
           <Text className="text-white/60 font-bold tracking-widest text-[11px] uppercase mb-3">Notice the active tab</Text>
           <View className="w-1 h-12 bg-white/20 rounded-full" />
           <View className="w-3 h-3 bg-white/40 rotate-45 border-r-2 border-b-2 border-white translate-y-[-6px]" />
        </View>
      </View>
    </Modal>
  );
}
