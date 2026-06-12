import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { UserCircle2, Mail, Phone, MapPin, Building2, FileText, ChevronLeft, Edit3, X, CheckCircle2 } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';

export default function ProfileDetailsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        brandName: '',
        companyDescription: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gstNo: '',
        panNo: '',
        landlineNo: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/exhibitor-auth/dashboard');
            if (response.data && response.data.data) {
                const data = response.data.data;
                setProfile(data);
                setFormData({
                    brandName: data.brandName || data.exhibitorName || '',
                    companyDescription: data.companyDescription || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    gstNo: data.gstNo || '',
                    panNo: data.panNo || '',
                    landlineNo: data.landlineNo || ''
                });
            }
        } catch (error) {
            console.error("Error fetching profile", error);
            Alert.alert("Error", "Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                brandName: formData.brandName,
                companyDescription: formData.companyDescription,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                gstNo: formData.gstNo,
                panNo: formData.panNo,
                landlineNo: formData.landlineNo
            };

            const response = await apiClient.put(`/exhibitor-auth/update-profile?id=${profile._id}`, payload);
            Alert.alert("Success", "Profile updated successfully.");
            setProfile(response.data.data);
            setIsEditModalOpen(false);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-slate-500 font-bold">Loading Profile...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
                <Text className="text-slate-500 font-bold">Profile not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-blue-100 px-6 py-2 rounded-full">
                    <Text className="text-blue-600 font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f4f7f9]">
            {/* Custom Header */}
            <View className="w-full bg-white pt-14 pb-4 px-6 border-b border-slate-200 shadow-sm z-10 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Account Info</Text>
                        <Text className="text-slate-800 font-black text-[20px] tracking-tight">Company Profile</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={() => setIsEditModalOpen(true)}
                    className="bg-blue-50 px-4 py-2 rounded-xl flex-row items-center border border-blue-100"
                >
                    <Edit3 size={14} color="#2563eb" className="mr-1.5" />
                    <Text className="text-blue-600 font-black text-[12px] uppercase tracking-wider">Edit</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                
                {/* Main Profile Card */}
                <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4 items-center">
                    <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-3 border-4 border-white shadow-sm">
                        <Building2 size={32} color="#3b82f6" />
                    </View>
                    <Text className="text-[20px] font-black text-slate-800 text-center">{profile.brandName || profile.exhibitorName}</Text>
                    {profile.companyDescription ? (
                        <Text className="text-[12px] font-medium text-slate-500 text-center mt-2 px-4 leading-5">{profile.companyDescription}</Text>
                    ) : (
                        <Text className="text-[12px] font-medium text-slate-400 text-center mt-2 px-4 italic">No company description provided. Tap Edit to add one.</Text>
                    )}
                </View>

                {/* Contact Info Card */}
                <Text className="text-[14px] font-black text-slate-800 mb-3 mt-2 ml-1">Contact Information</Text>
                <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-4 border border-slate-100">
                            <UserCircle2 size={20} color="#64748b" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Contact</Text>
                            <Text className="text-[14px] font-black text-slate-800">
                                {profile.contact1 ? `${profile.contact1.firstName || ''} ${profile.contact1.lastName || ''}`.trim() : 'N/A'}
                            </Text>
                        </View>
                    </View>
                    <View className="w-full h-[1px] bg-slate-100 mb-4" />
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-4 border border-blue-100">
                            <Mail size={18} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</Text>
                            <Text className="text-[14px] font-black text-slate-800">{profile.contact1?.email || profile.email || 'N/A'}</Text>
                        </View>
                    </View>
                    <View className="w-full h-[1px] bg-slate-100 mb-4" />
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-4 border border-emerald-100">
                            <Phone size={18} color="#10b981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</Text>
                            <Text className="text-[14px] font-black text-slate-800">+91 {profile.contact1?.mobile || profile.mobile || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Business Details Card */}
                <Text className="text-[14px] font-black text-slate-800 mb-3 mt-2 ml-1">Business Details</Text>
                <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
                    <View className="flex-row mb-4">
                        <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-4 border border-purple-100">
                            <FileText size={18} color="#a855f7" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GST Number</Text>
                            <Text className="text-[14px] font-black text-slate-800">{profile.gstNo || 'Not Provided'}</Text>
                        </View>
                    </View>
                    <View className="flex-row mb-4">
                        <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center mr-4 border border-orange-100">
                            <FileText size={18} color="#f97316" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PAN Number</Text>
                            <Text className="text-[14px] font-black text-slate-800">{profile.panNo || 'Not Provided'}</Text>
                        </View>
                    </View>
                    <View className="flex-row">
                        <View className="w-10 h-10 bg-rose-50 rounded-xl items-center justify-center mr-4 border border-rose-100">
                            <MapPin size={18} color="#f43f5e" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Address</Text>
                            <Text className="text-[14px] font-black text-slate-800 mt-1">
                                {profile.address ? `${profile.address}, ${profile.city || ''}, ${profile.state || ''} - ${profile.pincode || ''}` : 'No address provided'}
                            </Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalOpen} animationType="slide" transparent>
                <View className="flex-1 bg-slate-900/60 justify-end">
                    <View className="bg-[#f8fafc] rounded-t-[32px] h-[90%] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <View className="px-6 py-5 flex-row justify-between items-center bg-white border-b border-slate-100">
                            <View>
                                <Text className="text-[18px] font-black text-slate-800 tracking-tight">Edit Profile</Text>
                                <Text className="text-[11px] font-bold text-slate-500 mt-0.5">Update your company details</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsEditModalOpen(false)} className="bg-slate-50 p-2 rounded-full border border-slate-200">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 60 }}>
                            <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-5 shadow-sm">
                                <Text className="text-[14px] font-black text-slate-800 mb-5">Basic Information</Text>

                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Company / Brand Name</Text>
                                <TextInput 
                                    value={formData.brandName}
                                    onChangeText={(val) => setFormData({...formData, brandName: val})}
                                    placeholder="Enter brand name"
                                    placeholderTextColor="#cbd5e1"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] mb-4"
                                />

                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Company Description</Text>
                                <TextInput 
                                    value={formData.companyDescription}
                                    onChangeText={(val) => setFormData({...formData, companyDescription: val})}
                                    placeholder="Brief description about your company"
                                    placeholderTextColor="#cbd5e1"
                                    multiline
                                    numberOfLines={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] mb-4 text-left"
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </View>

                            <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-5 shadow-sm">
                                <Text className="text-[14px] font-black text-slate-800 mb-5">Business & Tax Details</Text>

                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">GST Number</Text>
                                <TextInput 
                                    value={formData.gstNo}
                                    onChangeText={(val) => setFormData({...formData, gstNo: val})}
                                    placeholder="Enter GST Number"
                                    placeholderTextColor="#cbd5e1"
                                    autoCapitalize="characters"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] mb-4"
                                />

                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">PAN Number</Text>
                                <TextInput 
                                    value={formData.panNo}
                                    onChangeText={(val) => setFormData({...formData, panNo: val})}
                                    placeholder="Enter PAN Number"
                                    placeholderTextColor="#cbd5e1"
                                    autoCapitalize="characters"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] mb-4"
                                />
                            </View>

                            <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-5 shadow-sm">
                                <Text className="text-[14px] font-black text-slate-800 mb-5">Location Details</Text>

                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Address</Text>
                                <TextInput 
                                    value={formData.address}
                                    onChangeText={(val) => setFormData({...formData, address: val})}
                                    placeholder="Enter full address"
                                    placeholderTextColor="#cbd5e1"
                                    multiline
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] mb-4"
                                />

                                <View className="flex-row gap-4 mb-4">
                                    <View className="flex-1">
                                        <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">City</Text>
                                        <TextInput 
                                            value={formData.city}
                                            onChangeText={(val) => setFormData({...formData, city: val})}
                                            placeholder="City"
                                            placeholderTextColor="#cbd5e1"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">State</Text>
                                        <TextInput 
                                            value={formData.state}
                                            onChangeText={(val) => setFormData({...formData, state: val})}
                                            placeholder="State"
                                            placeholderTextColor="#cbd5e1"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                        />
                                    </View>
                                </View>

                                <View className="flex-row gap-4 mb-2">
                                    <View className="flex-1">
                                        <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Pincode</Text>
                                        <TextInput 
                                            value={formData.pincode}
                                            onChangeText={(val) => setFormData({...formData, pincode: val})}
                                            placeholder="Pincode"
                                            placeholderTextColor="#cbd5e1"
                                            keyboardType="number-pad"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Landline</Text>
                                        <TextInput 
                                            value={formData.landlineNo}
                                            onChangeText={(val) => setFormData({...formData, landlineNo: val})}
                                            placeholder="Landline"
                                            placeholderTextColor="#cbd5e1"
                                            keyboardType="phone-pad"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                        />
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity 
                                onPress={handleUpdate}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-2xl flex-row items-center justify-center mt-2 mb-10 shadow-lg bg-blue-600 ${isSubmitting ? 'opacity-70' : ''}`}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} color="#fff" className="mr-2" />
                                        <Text className="text-white font-black text-[14px] uppercase tracking-widest">Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
