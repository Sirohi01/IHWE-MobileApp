import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, FileText, CheckCircle2, AlertCircle, Save, Pencil, X, ExternalLink, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';

const MSME_CATEGORIES = ['Micro', 'Small', 'Medium'];
const UDYAM_TYPES = ['udyam Registration Certificate', 'udyam Aadhaar Memorandum', 'EM-II Certificate'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function MSMEDocumentationScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState<{ success: boolean; message: string } | null>(null);

    const [form, setForm] = useState({
        udyamRegNo: '',
        udyamType: 'udyam Registration Certificate',
        udyamIssueDate: '',
        udyamExpiryDate: '',
        enterpriseName: '',
        panNumber: '',
        gstNumber: '',
        contactPerson: '',
        gender: '',
        designation: '',
        mobileNo: '',
        emailId: '',
        alternateNo: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        msmeCategory: 'Micro',
        investmentInPlant: '',
        turnover: '',
        dfoLocation: '',
        dfoEmail: '',
        dfoMobileNo: '',
        msmeRemark: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = await SecureStore.getItemAsync('exhibitorToken');
            if (!token) return router.replace('/(auth)/login');

            const res = await apiClient.get('/exhibitor-auth/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setData(res.data.data);
                const msme = res.data.data.msme || {};
                
                setForm({
                    udyamRegNo: msme.udyamRegNo || '',
                    udyamType: msme.udyamType || 'udyam Registration Certificate',
                    udyamIssueDate: msme.udyamIssueDate ? msme.udyamIssueDate.split('T')[0] : '',
                    udyamExpiryDate: msme.udyamExpiryDate ? msme.udyamExpiryDate.split('T')[0] : '',
                    enterpriseName: msme.enterpriseName || res.data.data.exhibitorName || '',
                    panNumber: msme.panNumber || res.data.data.panNo || '',
                    gstNumber: msme.gstNumber || res.data.data.gstNo || '',
                    contactPerson: msme.contactPerson || res.data.data.contact1?.firstName + ' ' + res.data.data.contact1?.lastName || '',
                    gender: msme.gender || '',
                    designation: msme.designation || res.data.data.contact1?.designation || '',
                    mobileNo: msme.mobileNo || res.data.data.contact1?.mobile || '',
                    emailId: msme.emailId || res.data.data.contact1?.email || '',
                    alternateNo: msme.alternateNo || res.data.data.contact1?.alternateNo || '',
                    address: msme.address || res.data.data.address || '',
                    city: msme.city || res.data.data.city || '',
                    state: msme.state || res.data.data.state || '',
                    pincode: msme.pincode || res.data.data.pincode || '',
                    msmeCategory: msme.msmeCategory || 'Micro',
                    investmentInPlant: msme.investmentInPlant || '',
                    turnover: msme.turnover || '',
                    dfoLocation: msme.dfoLocation || '',
                    dfoEmail: msme.dfoEmail || '',
                    dfoMobileNo: msme.dfoMobileNo || '',
                    msmeRemark: msme.msmeRemark || '',
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const inp = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const handleVerifyUdyam = async () => {
        if (!form.udyamRegNo) {
            Alert.alert('Error', 'Please enter Udyam Registration Number');
            return;
        }

        setVerifying(true);
        setVerifyStatus(null);

        try {
            const token = await SecureStore.getItemAsync('exhibitorToken');
            const res = await apiClient.post('/exhibitor-registration/verify-udyam', 
                { udyamRegNo: form.udyamRegNo },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setVerifyStatus({ success: true, message: 'Udyam Registration verified successfully!' });
                if (res.data.data) {
                    setForm(prev => ({
                        ...prev,
                        enterpriseName: res.data.data.enterpriseName || prev.enterpriseName,
                        msmeCategory: res.data.data.category || prev.msmeCategory,
                        investmentInPlant: res.data.data.investment || prev.investmentInPlant,
                        turnover: res.data.data.turnover || prev.turnover,
                    }));
                }
            } else {
                setVerifyStatus({ success: false, message: res.data.message || 'Invalid Udyam Registration Number' });
            }
        } catch (error: any) {
            setVerifyStatus({ success: false, message: error?.response?.data?.message || 'Failed to verify. Please try again.' });
        } finally {
            setVerifying(false);
        }
    };

    const handleSave = async () => {
        if (!form.udyamRegNo) return Alert.alert('Error', 'Udyam Registration Number is required');

        setSaving(true);
        try {
            const token = await SecureStore.getItemAsync('exhibitorToken');
            
            // Sending as JSON since we aren't uploading files yet
            const res = await apiClient.put(`/exhibitor-registration/${data._id}/msme`, form, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success) {
                Alert.alert('Success', 'MSME details saved successfully!');
                setEditing(false);
                fetchData();
            } else {
                Alert.alert('Error', res.data.message || 'Failed to save');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while saving MSME details');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#1a3a7c" />
            </View>
        );
    }

    const msme = data?.msme || {};
    const isVerified = msme.udyamRegNo ? true : false;

    const InputField = ({ label, value, onChangeText, placeholder = "", keyboardType = "default" }: any) => (
        <View className="mb-4">
            <Text className="text-slate-600 text-xs font-semibold mb-1.5">{label}</Text>
            <View className="bg-white border border-slate-200 rounded-lg h-11 px-3 justify-center">
                <TextInput
                    className="flex-1 text-slate-800 text-[13px]"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    const InfoRow = ({ label, value }: { label: string, value: string }) => (
        <View className="flex-row border-b border-slate-100 py-3">
            <Text className="w-[120px] text-xs font-semibold text-slate-500">{label}</Text>
            <Text className="flex-1 text-xs text-slate-800 font-medium">{value || '—'}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-[#1a3a7c] pt-12 pb-4 px-4 shadow-sm z-10">
                <View className="flex-row items-center justify-between mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 bg-white/10 rounded-full">
                        <ChevronLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text className="text-white font-black text-lg">MSME Profile</Text>
                    <View className="w-10" />
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Status Card */}
                <View className="bg-white p-5 border-b border-slate-200 shadow-sm mb-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3 border border-blue-100">
                                <FileText size={24} color="#1e3a8a" />
                            </View>
                            <View>
                                <Text className="text-slate-900 font-black text-base uppercase tracking-tight">Udyam Details</Text>
                                <View className="flex-row items-center mt-1">
                                    <View className={`w-2 h-2 rounded-full mr-1.5 ${isVerified ? 'bg-green-500' : 'bg-amber-500'}`} />
                                    <Text className={`text-xs font-bold ${isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                        {isVerified ? 'Verified' : 'Action Required'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    
                    {!editing && (
                        <View className="flex-row space-x-3 mt-2">
                            <TouchableOpacity 
                                onPress={() => setEditing(true)}
                                className="flex-1 bg-slate-900 flex-row items-center justify-center h-10 rounded-lg shadow-sm"
                            >
                                <Pencil size={14} color="#fff" className="mr-2" />
                                <Text className="text-white font-bold text-xs uppercase tracking-wider">Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {editing ? (
                    <View className="px-4">
                        {/* Udyam Verification Section */}
                        <View className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
                            <View className="flex-row items-center mb-3 pb-2 border-b border-slate-100">
                                <View className="w-1.5 h-4 bg-blue-600 rounded-full mr-2" />
                                <Text className="text-slate-800 font-black text-xs uppercase tracking-wider">Udyam Verification</Text>
                            </View>
                            
                            <Text className="text-slate-600 text-xs font-semibold mb-1.5">Udyam Registration No.</Text>
                            <View className="flex-row space-x-2">
                                <View className="flex-1 bg-white border border-slate-200 rounded-lg h-11 px-3 justify-center">
                                    <TextInput
                                        className="flex-1 text-slate-800 text-[13px]"
                                        value={form.udyamRegNo}
                                        onChangeText={v => inp('udyamRegNo', v)}
                                        placeholder="e.g. UDYAM-XX-00-0000000"
                                    />
                                </View>
                                <TouchableOpacity 
                                    onPress={handleVerifyUdyam}
                                    disabled={verifying}
                                    className="bg-blue-600 px-4 h-11 rounded-lg items-center justify-center shadow-sm"
                                >
                                    {verifying ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text className="text-white font-bold text-xs">Verify</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            
                            {verifyStatus && (
                                <View className={`mt-3 p-2.5 rounded-lg flex-row items-center ${verifyStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                    {verifyStatus.success ? <CheckCircle2 size={16} color="#16a34a" /> : <AlertCircle size={16} color="#dc2626" />}
                                    <Text className={`ml-2 text-xs font-medium flex-1 ${verifyStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                                        {verifyStatus.message}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Enterprise Details Form */}
                        <View className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
                            <View className="flex-row items-center mb-3 pb-2 border-b border-slate-100">
                                <View className="w-1.5 h-4 bg-blue-600 rounded-full mr-2" />
                                <Text className="text-slate-800 font-black text-xs uppercase tracking-wider">Enterprise Details</Text>
                            </View>
                            <InputField label="Enterprise Name" value={form.enterpriseName} onChangeText={(v:string) => inp('enterpriseName', v)} />
                            <InputField label="PAN Number" value={form.panNumber} onChangeText={(v:string) => inp('panNumber', v)} />
                            <InputField label="GST Number" value={form.gstNumber} onChangeText={(v:string) => inp('gstNumber', v)} />
                            
                            <View className="mb-4">
                                <Text className="text-slate-600 text-xs font-semibold mb-1.5">MSME Category</Text>
                                <View className="flex-row flex-wrap">
                                    {MSME_CATEGORIES.map(cat => (
                                        <TouchableOpacity 
                                            key={cat}
                                            onPress={() => inp('msmeCategory', cat)}
                                            className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${form.msmeCategory === cat ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-200'}`}
                                        >
                                            <Text className={`text-xs font-medium ${form.msmeCategory === cat ? 'text-blue-700' : 'text-slate-600'}`}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            
                            <InputField label="Investment in Plant (₹)" value={form.investmentInPlant} onChangeText={(v:string) => inp('investmentInPlant', v)} keyboardType="numeric" />
                            <InputField label="Turnover (₹)" value={form.turnover} onChangeText={(v:string) => inp('turnover', v)} keyboardType="numeric" />
                        </View>

                        {/* Contact & Address */}
                        <View className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
                            <View className="flex-row items-center mb-3 pb-2 border-b border-slate-100">
                                <View className="w-1.5 h-4 bg-blue-600 rounded-full mr-2" />
                                <Text className="text-slate-800 font-black text-xs uppercase tracking-wider">Contact & Address</Text>
                            </View>
                            <InputField label="Contact Person" value={form.contactPerson} onChangeText={(v:string) => inp('contactPerson', v)} />
                            <InputField label="Mobile Number" value={form.mobileNo} onChangeText={(v:string) => inp('mobileNo', v)} keyboardType="phone-pad" />
                            <InputField label="Email Address" value={form.emailId} onChangeText={(v:string) => inp('emailId', v)} keyboardType="email-address" />
                            <InputField label="Address" value={form.address} onChangeText={(v:string) => inp('address', v)} />
                            <View className="flex-row space-x-3">
                                <View className="flex-1"><InputField label="City" value={form.city} onChangeText={(v:string) => inp('city', v)} /></View>
                                <View className="flex-1"><InputField label="State" value={form.state} onChangeText={(v:string) => inp('state', v)} /></View>
                            </View>
                            <InputField label="Pincode" value={form.pincode} onChangeText={(v:string) => inp('pincode', v)} keyboardType="number-pad" />
                        </View>
                    </View>
                ) : (
                    <View className="px-4">
                        {/* View Mode */}
                        <View className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
                            <View className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex-row items-center">
                                <View className="w-1.5 h-4 bg-blue-600 rounded-full mr-2" />
                                <Text className="text-slate-800 font-black text-xs uppercase tracking-wider">Udyam Registration</Text>
                            </View>
                            <View className="px-4 py-1">
                                <InfoRow label="Udyam Reg No" value={msme.udyamRegNo} />
                                <InfoRow label="Type" value={msme.udyamType} />
                                <InfoRow label="Issue Date" value={msme.udyamIssueDate ? new Date(msme.udyamIssueDate).toLocaleDateString() : ''} />
                                <InfoRow label="Expiry Date" value={msme.udyamExpiryDate ? new Date(msme.udyamExpiryDate).toLocaleDateString() : ''} />
                            </View>
                        </View>

                        <View className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
                            <View className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex-row items-center">
                                <View className="w-1.5 h-4 bg-blue-600 rounded-full mr-2" />
                                <Text className="text-slate-800 font-black text-xs uppercase tracking-wider">Enterprise & MSME</Text>
                            </View>
                            <View className="px-4 py-1">
                                <InfoRow label="Enterprise Name" value={msme.enterpriseName} />
                                <InfoRow label="Category" value={msme.msmeCategory} />
                                <InfoRow label="PAN Number" value={msme.panNumber} />
                                <InfoRow label="GST Number" value={msme.gstNumber} />
                                <InfoRow label="Investment" value={msme.investmentInPlant ? `₹${Number(msme.investmentInPlant).toLocaleString()}` : ''} />
                                <InfoRow label="Turnover" value={msme.turnover ? `₹${Number(msme.turnover).toLocaleString()}` : ''} />
                            </View>
                        </View>

                        <View className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
                            <View className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex-row items-center">
                                <View className="w-1.5 h-4 bg-blue-600 rounded-full mr-2" />
                                <Text className="text-slate-800 font-black text-xs uppercase tracking-wider">Contact Details</Text>
                            </View>
                            <View className="px-4 py-1">
                                <InfoRow label="Contact Person" value={msme.contactPerson} />
                                <InfoRow label="Mobile" value={msme.mobileNo} />
                                <InfoRow label="Email" value={msme.emailId} />
                                <InfoRow label="Address" value={`${msme.address || ''}, ${msme.city || ''}, ${msme.state || ''} - ${msme.pincode || ''}`.replace(/^, | - $/g, '')} />
                            </View>
                        </View>
                        
                        {!msme.udyamRegNo && (
                            <View className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex-row items-start mb-6">
                                <Info size={20} color="#2563eb" className="mr-3 mt-0.5" />
                                <View className="flex-1">
                                    <Text className="text-blue-900 font-bold text-sm mb-1">MSME Profile Incomplete</Text>
                                    <Text className="text-blue-700 text-xs leading-relaxed">
                                        Please update your Udyam Registration details to avail MSME benefits and verify your enterprise status.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Actions (Edit Mode) */}
            {editing && (
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg flex-row space-x-3 pb-8">
                    <TouchableOpacity 
                        className="flex-1 h-12 rounded-xl items-center justify-center border border-slate-300"
                        onPress={() => setEditing(false)}
                    >
                        <Text className="text-slate-600 font-bold text-xs uppercase tracking-wider">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="flex-[2] h-12 bg-blue-600 rounded-xl items-center justify-center flex-row shadow-sm"
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Save size={16} color="#fff" className="mr-2" />
                                <Text className="text-white font-bold text-xs uppercase tracking-wider">Save Details</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
