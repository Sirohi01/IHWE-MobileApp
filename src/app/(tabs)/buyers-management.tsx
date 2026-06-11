import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ChevronLeft, Search, Filter, Phone, Mail, MoreHorizontal, User, Eye, MessageSquare, Calendar, Building2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type Status = "New" | "In Discussion" | "Meeting Scheduled" | "Contacted" | "Converted" | "Archived";
type Tab = "All Leads" | "New Leads" | "Contacted" | "In Discussion" | "Meetings Scheduled" | "Converted" | "Archived";

interface Lead {
    id: number;
    initials: string;
    color: string;
    name: string;
    role: string;
    company: string;
    countryFlag: string;
    country: string;
    interestIcon: string;
    interest: string;
    interestColor: string;
    status: Status;
    lastContact: string;
    lastContactTime: string;
}

const leads: Lead[] = [
    {
        id: 1, initials: "RK", color: "bg-orange-500", name: "Rahul Kapoor", role: "Procurement Manager",
        company: "MediCare Solutions Pvt.", countryFlag: "🇮🇳", country: "India",
        interestIcon: "🩺", interest: "Medical Devices", interestColor: "text-green-600 bg-green-50 border-green-200",
        status: "New", lastContact: "15 May 2026", lastContactTime: "11:45 AM",
    },
    {
        id: 2, initials: "AS", color: "bg-purple-500", name: "Anita Sharma", role: "CEO",
        company: "Wellness World Inc.", countryFlag: "🇸🇬", country: "Singapore",
        interestIcon: "🌿", interest: "Wellness Products", interestColor: "text-purple-600 bg-purple-50 border-purple-200",
        status: "In Discussion", lastContact: "14 May 2026", lastContactTime: "04:10 PM",
    },
    {
        id: 3, initials: "DP", color: "bg-blue-500", name: "David Parker", role: "Purchase Head",
        company: "Global Health Corp.", countryFlag: "🇺🇸", country: "USA",
        interestIcon: "💊", interest: "Supplements", interestColor: "text-blue-600 bg-blue-50 border-blue-200",
        status: "Meeting Scheduled", lastContact: "13 May 2026", lastContactTime: "09:30 AM",
    },
    {
        id: 4, initials: "SW", color: "bg-green-500", name: "Sophia Williams", role: "Business Development",
        company: "HealthMax Ltd.", countryFlag: "🇬🇧", country: "UK",
        interestIcon: "🏋️", interest: "Fitness Equipment", interestColor: "text-orange-600 bg-orange-50 border-orange-200",
        status: "Contacted", lastContact: "12 May 2026", lastContactTime: "02:25 PM",
    },
    {
        id: 5, initials: "MR", color: "bg-pink-500", name: "Mohit Reddy", role: "Director",
        company: "LifeCare Distributors", countryFlag: "🇦🇪", country: "UAE",
        interestIcon: "🧴", interest: "Personal Care", interestColor: "text-pink-600 bg-pink-50 border-pink-200",
        status: "New", lastContact: "11 May 2026", lastContactTime: "10:12 AM",
    },
];

const statusStyles: Record<Status, string> = {
    "New": "bg-blue-50 text-blue-600 border border-blue-200",
    "In Discussion": "bg-amber-50 text-amber-600 border border-amber-200",
    "Meeting Scheduled": "bg-purple-50 text-purple-600 border border-purple-200",
    "Contacted": "bg-teal-50 text-teal-600 border border-teal-200",
    "Converted": "bg-green-50 text-green-600 border border-green-200",
    "Archived": "bg-gray-50 text-gray-500 border border-gray-200",
};

const tabs: Tab[] = ["All Leads", "New Leads", "Contacted", "In Discussion", "Meetings Scheduled", "Converted", "Archived"];

export default function BuyersManagementScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("All Leads");
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = leads.filter(l =>
        (activeTab === "All Leads" || (activeTab === "New Leads" && l.status === "New") || l.status === activeTab || (activeTab === "Meetings Scheduled" && l.status === "Meeting Scheduled")) &&
        (l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Contacts</Text>
                        <Text className="text-slate-800 font-black text-[18px] tracking-tight">Buyers Management</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Stats Header */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 2 }}>
                    <View className="bg-white p-3 rounded-2xl w-32 border border-slate-100 shadow-sm">
                        <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mb-1.5">
                            <User size={16} color="#16a34a" />
                        </View>
                        <Text className="text-xl font-bold text-slate-800">128</Text>
                        <Text className="text-[10px] text-slate-500 font-medium">Total Leads</Text>
                        <Text className="text-[9px] text-green-600 font-bold mt-0.5">↑ 15% this week</Text>
                    </View>
                    <View className="bg-white p-3 rounded-2xl w-32 border border-slate-100 shadow-sm">
                        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mb-1.5">
                            <MessageSquare size={16} color="#2563eb" />
                        </View>
                        <Text className="text-xl font-bold text-slate-800">62</Text>
                        <Text className="text-[10px] text-slate-500 font-medium">New Leads</Text>
                        <Text className="text-[9px] text-green-600 font-bold mt-0.5">↑ 8% this week</Text>
                    </View>
                    <View className="bg-white p-3 rounded-2xl w-32 border border-slate-100 shadow-sm">
                        <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mb-1.5">
                            <Eye size={16} color="#d97706" />
                        </View>
                        <Text className="text-xl font-bold text-slate-800">34</Text>
                        <Text className="text-[10px] text-slate-500 font-medium">Viewed Profile</Text>
                        <Text className="text-[9px] text-green-600 font-bold mt-0.5">↑ 12% this week</Text>
                    </View>
                    <View className="bg-white p-3 rounded-2xl w-32 border border-slate-100 shadow-sm">
                        <View className="w-8 h-8 rounded-full bg-teal-50 items-center justify-center mb-1.5">
                            <Calendar size={16} color="#0d9488" />
                        </View>
                        <Text className="text-xl font-bold text-slate-800">9</Text>
                        <Text className="text-[10px] text-slate-500 font-medium">Meetings Booked</Text>
                        <Text className="text-[9px] text-green-600 font-bold mt-0.5">↑ 6% this week</Text>
                    </View>
                </ScrollView>

                {/* Filters and Search */}
                <View className="px-4 mb-4">
                    <View className="flex-row gap-2 h-10">
                        <View className="flex-1 flex-row items-center bg-white px-3 rounded-xl border border-slate-200">
                            <Search size={16} color="#94a3b8" />
                            <TextInput
                                placeholder="Search leads, companies..."
                                placeholderTextColor="#94a3b8"
                                className="flex-1 ml-2 text-[13px] text-slate-800"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity className="w-10 items-center justify-center bg-white rounded-xl border border-slate-200">
                            <Filter size={16} color="#334155" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View className="mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full border ${activeTab === tab ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`text-sm font-semibold ${activeTab === tab ? 'text-white' : 'text-slate-600'}`}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Leads List */}
                <View className="px-4 gap-1">
                    {filtered.map(lead => (
                        <View key={lead.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-12 h-12 rounded-full ${lead.color} items-center justify-center mr-3`}>
                                        <Text className="text-white font-bold text-lg">{lead.initials}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-800 font-bold text-base" numberOfLines={1}>{lead.name}</Text>
                                        <Text className="text-slate-500 text-xs font-medium">{lead.role}</Text>
                                    </View>
                                </View>
                                <View className={`px-2.5 py-1 rounded-full ${statusStyles[lead.status]}`}>
                                    <Text className="text-[10px] font-bold uppercase tracking-wider">{lead.status}</Text>
                                </View>
                            </View>

                            <View className="flex-row flex-wrap gap-y-2 mb-4">
                                <View className="w-1/2 flex-row items-center">
                                    <Building2 size={14} color="#94a3b8" className="mr-1.5" />
                                    <Text className="text-slate-600 text-xs flex-1" numberOfLines={1}>{lead.company}</Text>
                                </View>
                                <View className="w-1/2 flex-row items-center">
                                    <Text className="text-xs mr-1">{lead.countryFlag}</Text>
                                    <Text className="text-slate-600 text-xs flex-1" numberOfLines={1}>{lead.country}</Text>
                                </View>
                                <View className="w-1/2 flex-row items-center mt-1">
                                    <View className={`flex-row items-center px-2 py-0.5 rounded-md border ${lead.interestColor}`}>
                                        <Text className="text-[10px] mr-1">{lead.interestIcon}</Text>
                                        <Text className="text-[10px] font-semibold">{lead.interest}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
                                <View>
                                    <Text className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Last Contact</Text>
                                    <Text className="text-slate-700 text-xs font-medium">{lead.lastContact} • {lead.lastContactTime}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                                        <Mail size={14} color="#2563eb" />
                                    </TouchableOpacity>
                                    <TouchableOpacity className="w-8 h-8 rounded-full bg-green-50 items-center justify-center">
                                        <Phone size={14} color="#16a34a" />
                                    </TouchableOpacity>
                                    <TouchableOpacity className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
                                        <MoreHorizontal size={14} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                    {filtered.length === 0 && (
                        <View className="items-center justify-center py-10">
                            <Text className="text-slate-400 text-sm">No leads found matching your criteria.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
