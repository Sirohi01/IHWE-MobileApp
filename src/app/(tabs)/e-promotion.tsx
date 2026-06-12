import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, Megaphone, Target, MonitorPlay, Presentation, LineChart, Link as LinkIcon, Mail, Share2, MessageCircle, ArrowRight } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';

const testimonials = [
    {
        text: "IHWE digital promotion helped us reach the right audience before the event. We generated quality leads even before the exhibition started.",
        name: "Exhibitor, IHWE 2025",
    },
    {
        text: "The email campaigns and social media promotions gave our brand excellent visibility across the industry.",
        name: "Marketing Partner",
    },
    {
        text: "We received strong visitor engagement and genuine business inquiries through the online promotion package.",
        name: "International Exhibitor",
    },
];

export default function EPromotionScreen() {
    const router = useRouter();
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/e-promotion-packages/packages');
            if (res.data && res.data.data) {
                setPackages(res.data.data);
            } else if (res.data && Array.isArray(res.data)) {
                setPackages(res.data);
            }
        } catch (error) {
            console.error("Error fetching packages", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Marketing</Text>
                        <Text className="text-slate-800 font-black text-[20px] tracking-tight">E-Promotion</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
                {/* Banner Strip */}
                <View className="w-full bg-[#0d4b27] py-6 px-5 flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                        <Text className="text-white font-black text-[18px] mb-1">Boost Your Visibility</Text>
                        <Text className="text-[#d7e8da] text-[12px]">Reach 20,000+ Trade Visitors before the event begins.</Text>
                    </View>
                    <View className="bg-white/10 p-3 rounded-full">
                        <Megaphone color="#fff" size={32} />
                    </View>
                </View>

                {/* Why E-Promotion */}
                <View className="px-4 mt-2">
                    <Text className="text-center font-bold text-lg text-slate-800 mb-3 tracking-tight">WHY E-PROMOTION?</Text>
                    <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                        {[
                            { text: "Reach 20,000+ Trade Visitors Before Event", icon: Target, color: "#ef4444" },
                            { text: "Targeted B2B & B2C Audience", icon: Presentation, color: "#3b82f6" },
                            { text: "Build Brand Recall Before the Exhibition", icon: MonitorPlay, color: "#8b5cf6" },
                            { text: "Generate Pre-qualified Leads", icon: LineChart, color: "#10b981" },
                        ].map((item, i) => (
                            <React.Fragment key={i}>
                                <View className={`flex-row items-center py-3 ${i !== 3 ? 'border-b border-slate-50' : ''}`}>
                                    <View className="w-10 h-10 rounded-full items-center justify-center bg-slate-50 mr-3" style={{ backgroundColor: item.color + '15' }}>
                                        <item.icon size={20} color={item.color} />
                                    </View>
                                    <Text className="flex-1 text-slate-700 text-[14px] font-semibold">{item.text}</Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Packages */}
                <View className="px-4 mt-5">
                    <Text className="text-center font-bold text-lg text-slate-800 mb-3 tracking-tight">CHOOSE YOUR PACKAGE</Text>

                    {loading ? (
                        <View className="py-10 items-center justify-center">
                            <ActivityIndicator size="large" color="#0d4b27" />
                            <Text className="mt-3 text-slate-500 font-medium">Loading packages...</Text>
                        </View>
                    ) : packages.length === 0 ? (
                        <View className="bg-white rounded-2xl p-6 items-center shadow-sm border border-slate-100">
                            <Text className="text-slate-500 font-medium text-center">No packages available at the moment.</Text>
                        </View>
                    ) : (
                        packages.map((pkg, index) => {
                            const isPremium = pkg.title?.toLowerCase().includes('premium');
                            const isGrowth = pkg.title?.toLowerCase().includes('growth');

                            const btnColor = isGrowth ? "bg-orange-500" : (isPremium ? "bg-green-800" : "bg-blue-600");
                            const borderColor = pkg.borderColor || (isGrowth ? "#f97316" : (isPremium ? "#166534" : "#e2e8f0"));

                            return (
                                <React.Fragment key={pkg._id || index}>
                                    <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden" style={{ borderWidth: 2, borderColor }}>
                                        {pkg.badgeText && (
                                            <View className="bg-amber-500 self-center px-4 py-1 rounded-b-lg absolute top-0 z-10">
                                                <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{pkg.badgeText}</Text>
                                            </View>
                                        )}

                                        <View className="p-5 pt-8 bg-slate-50 border-b border-slate-100 items-center">
                                            <Text className={`text-[18px] font-black text-center mb-1 ${pkg.textColor || 'text-slate-800'}`}>
                                                {pkg.title?.replace(/<br\s*\/?>/gi, ' ')}
                                            </Text>
                                            <Text className="text-sm text-slate-500 font-semibold mb-3 text-center">{pkg.subtitle}</Text>
                                            <View className="flex-row items-baseline">
                                                <Text className={`text-2xl font-black ${pkg.priceColor || 'text-slate-800'}`}>₹ {pkg.price?.toLocaleString()}</Text>
                                                <Text className="text-[10px] text-slate-400 font-bold ml-1">{pkg.gstText}</Text>
                                            </View>
                                        </View>

                                        <View className="p-5">
                                            {(pkg.features || []).map((feature: string, i: number) => (
                                                <React.Fragment key={i}>
                                                    <View className="flex-row items-start mb-3">
                                                        <CheckCircle2 size={16} color="#16a34a" className="mt-0.5 mr-2" />
                                                        <Text className="text-slate-600 flex-1 text-[13px] leading-relaxed font-medium">{feature}</Text>
                                                    </View>
                                                </React.Fragment>
                                            ))}

                                            <TouchableOpacity className={`${btnColor} rounded-xl py-3.5 items-center justify-center mt-3 shadow-sm`}>
                                                <Text className="text-white font-bold text-[14px]">{pkg.buttonText || 'Book Now'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </React.Fragment>
                            );
                        })
                    )}
                </View>

                {/* Digital Channels */}
                <View className="px-4 mt-5">
                    <Text className="text-center font-bold text-lg text-slate-800 mb-3 tracking-tight">PROMOTION CHANNELS</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {[
                            { label: "Website\nListings", icon: LinkIcon, color: "#3b82f6" },
                            { label: "Email\nCampaigns", icon: Mail, color: "#ef4444" },
                            { label: "Social\nPromotions", icon: Share2, color: "#8b5cf6" },
                            { label: "WhatsApp\nCampaigns", icon: MessageCircle, color: "#10b981" },
                        ].map((item, i) => (
                            <React.Fragment key={i}>
                                <View className="bg-white rounded-2xl w-[48%] p-4 items-center shadow-sm border border-slate-100 mb-3">
                                    <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-slate-50" style={{ backgroundColor: item.color + '15' }}>
                                        <item.icon size={24} color={item.color} />
                                    </View>
                                    <Text className="text-center text-[12px] font-bold text-slate-700 leading-tight">{item.label}</Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Add ons */}
                <View className="px-4 mt-5">
                    <Text className="text-center font-bold text-lg text-slate-800 mb-3 tracking-tight">ADD-ON OPTIONS</Text>
                    <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1">
                        {[
                            ["Homepage Banner (7 Days)", "₹ 15,000"],
                            ["Category Sponsorship", "₹ 25,000"],
                            ["Featured Brand of the Day", "₹ 10,000"],
                            ["Push Notification Alert", "₹ 8,000"],
                            ["Influencer Collab", "₹ 20,000"],
                        ].map((item, i) => (
                            <React.Fragment key={i}>
                                <View className={`flex-row justify-between items-center p-3 ${i !== 4 ? 'border-b border-slate-50' : ''}`}>
                                    <Text className="text-slate-600 text-[13px] font-medium flex-1">{item[0]}</Text>
                                    <Text className="text-slate-800 font-bold">{item[1]}</Text>
                                </View>
                            </React.Fragment>
                        ))}
                        <View className="p-3 bg-slate-50 rounded-b-xl">
                            <Text className="text-[10px] text-slate-400 text-center font-medium">*GST Extra on all add-ons</Text>
                        </View>
                    </View>
                </View>

                {/* Testimonials */}
                <View className="px-4 mt-5 mb-4">
                    <View className="bg-[#0d4b27] rounded-2xl p-6 relative overflow-hidden shadow-md">
                        <View className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-white/5 rounded-full" />
                        <View className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full" />

                        <Text className="text-white/20 text-6xl absolute top-2 left-4 font-serif">"</Text>

                        <View className="z-10 mt-4">
                            <Text className="text-white/90 text-[14px] leading-relaxed font-medium italic text-center min-h-[60px]">
                                {testimonials[activeTestimonial].text}
                            </Text>
                            <Text className="text-[#d6ff63] text-center font-bold mt-4 text-[13px]">
                                – {testimonials[activeTestimonial].name}
                            </Text>
                        </View>

                        <View className="flex-row justify-center mt-6">
                            {testimonials.map((_, i) => (
                                <React.Fragment key={i}>
                                    <View className={`h-1.5 rounded-full mx-1 ${activeTestimonial === i ? 'w-5 bg-[#d6ff63]' : 'w-2 bg-white/30'}`} />
                                </React.Fragment>
                            ))}
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
