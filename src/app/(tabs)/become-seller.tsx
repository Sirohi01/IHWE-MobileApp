import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, Building2, User, Landmark, FileText, Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';
import * as SecureStore from 'expo-secure-store';

export default function BecomeSellerScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<any>(null);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [packagesModalVisible, setPackagesModalVisible] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);

    const fallbackPackagesList = [
        { name: 'Starter', meetings: '5', price: '9,999', features: ['15 Pre-scheduled Meetings', 'Verified Buyer Access', 'Meeting Scheduler Access'] },
        { name: 'Growth', meetings: '15', price: '24,999', popular: true, features: ['15 Pre-scheduled Meetings', 'Verified Buyer Access', 'Priority Meeting Scheduler', 'Meeting Analytics Report'] },
        { name: 'Pro', meetings: '30', price: '44,999', features: ['30 Pre-scheduled Meetings', 'Verified Buyer Access', 'Priority Meeting Scheduler', 'Meeting Analytics Report', 'Featured in Buyer List'] }
    ];

    const packagesList = subscriptionPlans.length > 0
        ? subscriptionPlans.map((plan: any) => ({
            name: plan.name,
            meetings: String(plan.maxLeads || plan.maxServiceRequests || ''),
            price: Number(plan.price || 0).toLocaleString('en-IN'),
            popular: plan.name?.toLowerCase().includes('growth') || plan.displayOrder === 2,
            features: (plan.features || []).map((feature: any) => feature.label || feature.key || feature).filter(Boolean),
        }))
        : fallbackPackagesList;

    // Select Modal State
    const [selectModalVisible, setSelectModalVisible] = useState(false);
    const [selectOptions, setSelectOptions] = useState<{ label: string, value: string }[]>([]);
    const [selectTitle, setSelectTitle] = useState('');
    const [activeSelectField, setActiveSelectField] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        brandName: '',
        businessType: '',
        country: '',
        stateProvince: '',
        city: '',
        website: '',
        businessCategory: '',
        companyDescription: '',
        gstNumber: '',
        panNumber: '',
        contactFirstName: '',
        contactLastName: '',
        contactDesignation: '',
        contactEmail: '',
        contactMobile: '',
        contactAlternateNo: '',
        stallCategory: '',
        stallScheme: '',
        stallSize: '',
        preferredStallNo: '',
        bankName: '',
        accountHolder: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
        accountType: 'Current',
        panCardFrontUrl: '',
        gstCertificateUrl: '',
        aadhaarCardFrontUrl: '',
        cancelledChequeUrl: '',
        representativePhotoUrl: '',
        selectedPlan: 'Growth',
    });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = await SecureStore.getItemAsync('exhibitorToken');
            if (!token) { router.replace('/(auth)/login'); return; }

            const res = await apiClient.get('/exhibitor-auth/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const fetchedData = res.data.data;
                setData(fetchedData);

                if (fetchedData.isSeller) {
                    setSuccess(true);
                }

                setFormData({
                    brandName: fetchedData.brandName || fetchedData.fasciaName || fetchedData.exhibitorName || '',
                    businessType: fetchedData.typeOfBusiness || fetchedData.msme?.msmeCategory || 'Manufacturer',
                    country: fetchedData.country || 'India',
                    stateProvince: fetchedData.state || '',
                    city: fetchedData.city || '',
                    website: fetchedData.website || '',
                    businessCategory: fetchedData.primaryCategory || fetchedData.natureOfBusiness || 'Healthcare & Diagnostics',
                    companyDescription: fetchedData.companyDescription || '',
                    gstNumber: fetchedData.gstNo || fetchedData.billing?.gst || fetchedData.msme?.gstNumber || '',
                    panNumber: fetchedData.panNo || fetchedData.billing?.pan || fetchedData.msme?.panNumber || '',
                    contactFirstName: fetchedData.contact1?.firstName || '',
                    contactLastName: fetchedData.contact1?.lastName || '',
                    contactDesignation: fetchedData.contact1?.designation || '',
                    contactEmail: fetchedData.contact1?.email || '',
                    contactMobile: fetchedData.contact1?.mobile || '',
                    contactAlternateNo: fetchedData.contact1?.alternateNo || '',
                    stallCategory: fetchedData.participation?.stallCategory || 'Shell Scheme',
                    stallScheme: fetchedData.participation?.stallScheme || 'Normal',
                    stallSize: fetchedData.participation?.stallSize?.toString() || '9',
                    preferredStallNo: fetchedData.participation?.stallNo || '',
                    bankName: fetchedData.bankDetails?.bankName || '',
                    accountHolder: fetchedData.bankDetails?.accountHolder || fetchedData.exhibitorName || '',
                    accountNumber: fetchedData.bankDetails?.accountNumber || '',
                    ifscCode: fetchedData.bankDetails?.ifscCode || '',
                    branch: fetchedData.bankDetails?.branch || '',
                    accountType: fetchedData.bankDetails?.accountType || 'Current',
                    panCardFrontUrl: fetchedData.panCardFrontUrl || '',
                    gstCertificateUrl: fetchedData.gstCertificateUrl || '',
                    aadhaarCardFrontUrl: fetchedData.aadhaarCardFrontUrl || '',
                    cancelledChequeUrl: fetchedData.cancelledChequeUrl || '',
                    representativePhotoUrl: fetchedData.representativePhotoUrl || '',
                    selectedPlan: 'Growth',
                });
            }

            const plansRes = await apiClient.get('/seller-subscription-plans/active').catch(() => null);
            if (plansRes?.data?.success) {
                setSubscriptionPlans(plansRes.data.data || []);
            }
        } catch (err) {
            console.log('Error fetching dashboard', err);
            Alert.alert("Error", "Failed to load details.");
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!formData.brandName || !formData.businessType || !formData.country || !formData.city || !formData.businessCategory || !formData.companyDescription) {
                Alert.alert("Required Fields", "Please fill all required fields in Business Details.");
                return;
            }
        } else if (currentStep === 2) {
            if (!formData.contactFirstName || !formData.contactLastName || !formData.contactDesignation || !formData.contactEmail || !formData.contactMobile) {
                Alert.alert("Required Fields", "Please fill all required fields in Contact Details.");
                return;
            }
        } else if (currentStep === 3) {
            if (!formData.bankName || !formData.accountHolder || !formData.accountNumber || !formData.ifscCode) {
                Alert.alert("Required Fields", "Please fill all Payout & Bank Details.");
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 5));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('exhibitorToken');
            const res = await apiClient.post(`/exhibitor-auth/register-seller?id=${data._id}`, {
                sellerDetails: {
                    brandName: formData.brandName,
                    productCategories: [formData.businessCategory],
                    businessRegistrationNo: formData.gstNumber || formData.panNumber || '',
                    gstNumber: formData.gstNumber,
                    panNumber: formData.panNumber,
                    website: formData.website,
                    bankName: formData.bankName,
                    accountHolder: formData.accountHolder,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode,
                    branch: formData.branch,
                    accountType: formData.accountType,
                    selectedPlan: formData.selectedPlan
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                Alert.alert("Success", "Seller registration submitted successfully!");
                setSuccess(true);
            } else {
                Alert.alert("Error", res.data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Seller registration error:", error);
            Alert.alert("Error", "An error occurred during registration");
        } finally {
            setSubmitting(false);
        }
    };

    const openSelect = (field: string, title: string, options: string[]) => {
        setActiveSelectField(field);
        setSelectTitle(title);
        setSelectOptions(options.map(opt => ({ label: opt, value: opt })));
        setSelectModalVisible(true);
    };

    const handleSelectOption = (val: string) => {
        if (activeSelectField) {
            setFormData(prev => ({ ...prev, [activeSelectField]: val }));
        }
        setSelectModalVisible(false);
    };

    const InputField = ({ label, value, onChangeText, placeholder, required = false, multiline = false }: any) => (
        <View className="mb-4">
            <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">{label} {required && <Text className="text-red-500">*</Text>}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#cbd5e1"
                multiline={multiline}
                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] ${multiline ? 'h-24' : ''}`}
                style={multiline ? { textAlignVertical: 'top' } : {}}
            />
        </View>
    );

    const SelectField = ({ label, fieldKey, value, options, placeholder, required = false }: any) => (
        <View className="mb-4">
            <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">{label} {required && <Text className="text-red-500">*</Text>}</Text>
            <TouchableOpacity
                onPress={() => openSelect(fieldKey, label, options)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
            >
                <Text className={`font-bold text-[13px] ${value ? 'text-slate-800' : 'text-slate-300'}`}>{value || placeholder}</Text>
                <ChevronLeft size={16} color="#94a3b8" style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-slate-500 font-bold">Loading...</Text>
            </View>
        );
    }

    if (success || data?.isSeller) {
        return (
            <View className="flex-1 bg-[#f4f7f9]">
                <View className="w-full bg-white pt-14 pb-4 px-6 border-b border-slate-200 shadow-sm z-10 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <Text className="text-slate-800 font-black text-[20px] tracking-tight">Become a Seller</Text>
                </View>
                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-white p-8 rounded-3xl items-center shadow-sm border border-slate-200 w-full">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
                            <CheckCircle2 size={40} color="#16a34a" />
                        </View>
                        <Text className="text-[20px] font-black text-slate-800 text-center uppercase tracking-tight">Application Submitted</Text>
                        <Text className="text-[13px] font-medium text-slate-500 text-center mt-2 leading-5">Your request to register as an exhibitor seller has been received and is currently being processed by our team.</Text>

                        <View className="mt-8 bg-slate-50 border border-slate-100 w-full rounded-2xl p-4 flex-row items-center justify-between">
                            <Text className="text-[12px] font-bold text-slate-500 uppercase">Status</Text>
                            <Text className="text-[12px] font-black text-[#108c2d] uppercase">Under Review</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mt-6 bg-[#108c2d] w-full py-4 rounded-xl items-center shadow-lg shadow-green-900/20"
                        >
                            <Text className="text-white font-black text-[13px] uppercase tracking-wider">Back to Menu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f4f7f9]">
            {/* Header */}
            <View className="w-full bg-white pt-14 pb-2 px-6 border-b border-slate-200 shadow-sm z-10">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Registration</Text>
                        <Text className="text-slate-800 font-black text-[20px] tracking-tight">Become a Seller</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="flex-row justify-between items-center px-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <View key={step} className="flex-row items-center">
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${currentStep >= step ? 'bg-[#108c2d]' : 'bg-slate-200'}`}>
                                {currentStep > step ? (
                                    <Check size={14} color="white" />
                                ) : (
                                    <Text className={`font-black text-[12px] ${currentStep === step ? 'text-white' : 'text-slate-400'}`}>{step}</Text>
                                )}
                            </View>
                            {step < 5 && (
                                <View className={`h-1 w-6 sm:w-10 mx-1 rounded-full ${currentStep > step ? 'bg-[#108c2d]' : 'bg-slate-200'}`} />
                            )}
                        </View>
                    ))}
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* View Packages Banner */}
                {currentStep < 5 && (
                    <TouchableOpacity 
                        onPress={() => setPackagesModalVisible(true)} 
                        className="bg-[#f0faf2] border border-[#e4f6e8] p-3 rounded-2xl mb-4 flex-row items-center justify-between shadow-sm"
                    >
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-[#108c2d] rounded-full items-center justify-center mr-3">
                                <Sparkles size={14} color="white" />
                            </View>
                            <View>
                                <Text className="text-[12px] font-black text-slate-800 uppercase tracking-tight">Meeting Packages</Text>
                                <Text className="text-[10px] text-slate-500 font-bold">Tap to view available plans</Text>
                            </View>
                        </View>
                        <View className="bg-white px-3 py-1.5 rounded-full border border-slate-200">
                            <Text className="text-[10px] font-black text-[#108c2d] uppercase">View Plans</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">

                    {currentStep === 1 && (
                        <View>
                            <View className="flex-row items-center mb-2">
                                <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mr-3 border border-green-100">
                                    <Building2 size={20} color="#16a34a" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Business Details</Text>
                            </View>

                            <InputField label="Company / Brand Name" required value={formData.brandName} onChangeText={(val: string) => setFormData({ ...formData, brandName: val })} placeholder="Enter brand name" />
                            <SelectField fieldKey="businessType" label="Business Type" required value={formData.businessType} options={['Manufacturer', 'Service Provider', 'Trader', 'Exporter', 'Others']} placeholder="Select type" />
                            <SelectField fieldKey="country" label="Country" required value={formData.country} options={['India', 'United States', 'United Kingdom', 'Germany', 'UAE', 'Singapore']} placeholder="Select country" />
                            <InputField label="State" required value={formData.stateProvince} onChangeText={(val: string) => setFormData({ ...formData, stateProvince: val })} placeholder="Enter state" />
                            <InputField label="City" required value={formData.city} onChangeText={(val: string) => setFormData({ ...formData, city: val })} placeholder="Enter city" />
                            <SelectField fieldKey="businessCategory" label="Business Category" required value={formData.businessCategory} options={['Healthcare & Diagnostics', 'AYUSH & Herbal Remedies', 'Organic & Natural Products', 'Wellness Devices & Fitness', 'Corporate Gifting', 'Pharma & Biotech']} placeholder="Select category" />
                            <InputField label="Brief Description" required value={formData.companyDescription} onChangeText={(val: string) => setFormData({ ...formData, companyDescription: val })} placeholder="Brief about your business" multiline />
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View>
                            <View className="flex-row items-center mb-2">
                                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3 border border-blue-100">
                                    <User size={20} color="#3b82f6" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Contact Details</Text>
                            </View>

                            <InputField label="First Name" required value={formData.contactFirstName} onChangeText={(val: string) => setFormData({ ...formData, contactFirstName: val })} placeholder="Enter first name" />
                            <InputField label="Last Name" required value={formData.contactLastName} onChangeText={(val: string) => setFormData({ ...formData, contactLastName: val })} placeholder="Enter last name" />
                            <InputField label="Designation" required value={formData.contactDesignation} onChangeText={(val: string) => setFormData({ ...formData, contactDesignation: val })} placeholder="e.g. Managing Director" />
                            <InputField label="Email Address" required value={formData.contactEmail} onChangeText={(val: string) => setFormData({ ...formData, contactEmail: val })} placeholder="Enter email" />
                            <InputField label="Mobile Number" required value={formData.contactMobile} onChangeText={(val: string) => setFormData({ ...formData, contactMobile: val })} placeholder="Enter mobile" />
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View>
                            <View className="flex-row items-center mb-2">
                                <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-3 border border-purple-100">
                                    <Landmark size={20} color="#a855f7" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Stall & Payout Details</Text>
                            </View>

                            <SelectField fieldKey="stallCategory" label="Stall Category" value={formData.stallCategory} options={['Shell Scheme', 'Raw Space', 'Premium Pavilion']} placeholder="Choose category" />
                            <SelectField fieldKey="stallScheme" label="Stall Scheme" value={formData.stallScheme} options={['Normal', 'Corner (1 Side Open)', '2 Side Open', '3 Side Open']} placeholder="Choose scheme" />
                            <InputField label="Stall Size (Sqm)" value={formData.stallSize} onChangeText={(val: string) => setFormData({ ...formData, stallSize: val })} placeholder="e.g. 9, 12, 18" />

                            <View className="h-[1px] bg-slate-100 my-4" />
                            <Text className="text-[13px] font-black text-slate-800 mb-4 uppercase">Banking Details</Text>

                            <InputField label="Bank Name" required value={formData.bankName} onChangeText={(val: string) => setFormData({ ...formData, bankName: val })} placeholder="e.g. State Bank of India" />
                            <InputField label="Account Holder" required value={formData.accountHolder} onChangeText={(val: string) => setFormData({ ...formData, accountHolder: val })} placeholder="Account holder name" />
                            <InputField label="Account Number" required value={formData.accountNumber} onChangeText={(val: string) => setFormData({ ...formData, accountNumber: val })} placeholder="Account number" />
                            <InputField label="IFSC Code" required value={formData.ifscCode} onChangeText={(val: string) => setFormData({ ...formData, ifscCode: val })} placeholder="e.g. SBIN0000123" />
                        </View>
                    )}

                    {currentStep === 4 && (
                        <View>
                            <View className="flex-row items-center mb-2">
                                <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center mr-3 border border-orange-100">
                                    <FileText size={20} color="#f97316" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Documents (Optional)</Text>
                            </View>
                            <Text className="text-[12px] font-medium text-slate-500 mb-6">Please provide URLs for your compliance documents if available.</Text>

                            <InputField label="GST Certificate URL" value={formData.gstCertificateUrl} onChangeText={(val: string) => setFormData({ ...formData, gstCertificateUrl: val })} placeholder="https://..." />
                            <InputField label="PAN Card URL" value={formData.panCardFrontUrl} onChangeText={(val: string) => setFormData({ ...formData, panCardFrontUrl: val })} placeholder="https://..." />
                            <InputField label="Cancelled Cheque URL" value={formData.cancelledChequeUrl} onChangeText={(val: string) => setFormData({ ...formData, cancelledChequeUrl: val })} placeholder="https://..." />
                        </View>
                    )}

                    {currentStep === 5 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3 border border-indigo-100">
                                    <CheckCircle2 size={20} color="#4f46e5" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Review & Submit</Text>
                            </View>

                            <View className="mb-6">
                                <View className="bg-[#f0faf2] p-3 rounded-xl border border-[#e4f6e8] mb-4 flex-row items-center">
                                    <View className="w-10 h-10 bg-[#108c2d] rounded-full items-center justify-center mr-3">
                                        <Sparkles size={18} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[12px] font-black text-slate-800 leading-tight">Get Verified Meetings with Verified Buyers</Text>
                                        <Text className="text-[10px] text-slate-500 font-semibold mt-0.5">Connect with quality, pre-verified buyers.</Text>
                                    </View>
                                </View>

                                <Text className="text-[13px] font-black text-slate-800 uppercase mb-3 tracking-wider">Choose Your Meeting Package</Text>

                                {packagesList.map((plan) => {
                                    const isSelected = formData.selectedPlan === plan.name;
                                    return (
                                        <TouchableOpacity
                                            key={plan.name}
                                            onPress={() => setFormData({ ...formData, selectedPlan: plan.name })}
                                            className={`mb-3 p-4 rounded-xl border-2 ${isSelected ? 'border-[#108c2d] bg-[#f0faf2]' : 'border-slate-200 bg-white'}`}
                                        >
                                            {plan.popular && (
                                                <View className="absolute -top-2.5 self-center bg-[#fff3cd] px-2 py-0.5 rounded-full border border-[#ffeeba]">
                                                    <Text className="text-[#856404] text-[8px] font-black uppercase tracking-wide">★ Most Popular</Text>
                                                </View>
                                            )}
                                            
                                            <View className="flex-row justify-between items-center mb-3">
                                                <View>
                                                    <Text className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{plan.name}</Text>
                                                    <View className="flex-row items-baseline mt-1">
                                                        <Text className="text-[22px] font-black text-[#108c2d]">{plan.meetings}</Text>
                                                        <Text className="text-[10px] text-slate-600 font-bold uppercase ml-1">Meetings</Text>
                                                    </View>
                                                </View>
                                                <View className="items-end">
                                                    <Text className="text-[15px] font-black text-slate-800">₹ {plan.price}</Text>
                                                    <Text className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">+ GST</Text>
                                                </View>
                                            </View>

                                            <View className="border-t border-slate-200/50 pt-3 space-y-1.5">
                                                {plan.features.map((feat: string, fidx: number) => (
                                                    <View key={fidx} className="flex-row items-center">
                                                        <Check size={12} color="#108c2d" className="mr-2" strokeWidth={3} />
                                                        <Text className="text-[10.5px] text-slate-600 font-semibold">{feat}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-2">
                                <View className="mb-3"><Text className="text-[10px] text-slate-400 font-bold uppercase">Brand Name</Text><Text className="font-black text-slate-800">{formData.brandName}</Text></View>
                                <View className="mb-3"><Text className="text-[10px] text-slate-400 font-bold uppercase">Category</Text><Text className="font-black text-slate-800">{formData.businessCategory}</Text></View>
                                <View className="mb-3"><Text className="text-[10px] text-slate-400 font-bold uppercase">Meeting Package</Text><Text className="font-black text-[#108c2d]">{formData.selectedPlan} Package</Text></View>
                            </View>

                            <Text className="text-[11px] text-slate-500 text-center font-medium leading-5">By submitting, you agree to IHWE 2026's Terms and Conditions for sellers.</Text>
                        </View>
                    )}

                </View>

            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-1 pb-1 flex-row justify-between">
                {currentStep > 1 ? (
                    <TouchableOpacity onPress={handlePrevStep} className="flex-row items-center px-4 py-2 bg-slate-100 rounded-xl">
                        <ArrowLeft size={16} color="#475569" className="mr-2" />
                        <Text className="font-bold text-slate-600 text-[13px] uppercase tracking-wider">Back</Text>
                    </TouchableOpacity>
                ) : <View className="w-24" />}

                {currentStep < 5 ? (
                    <TouchableOpacity onPress={handleNextStep} className="flex-row items-center px-6 py-2 bg-[#108c2d] rounded-xl shadow-lg shadow-green-900/20">
                        <Text className="font-bold text-white text-[13px] uppercase tracking-wider mr-2">Next Step</Text>
                        <ArrowRight size={16} color="white" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleSubmit} disabled={submitting} className={`flex-row items-center px-8 py-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/30 ${submitting ? 'opacity-70' : ''}`}>
                        {submitting ? <ActivityIndicator color="white" size="small" className="mr-2" /> : <CheckCircle2 size={16} color="white" className="mr-2" />}
                        <Text className="font-bold text-white text-[13px] uppercase tracking-wider">Submit</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Custom Select Modal */}
            <Modal visible={selectModalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-slate-900/50 justify-end">
                    <View className="bg-white rounded-t-3xl min-h-[40%] max-h-[80%] pb-8">
                        <View className="p-5 border-b border-slate-100 flex-row justify-between items-center bg-slate-50 rounded-t-3xl">
                            <Text className="font-black text-[16px] text-slate-800">{selectTitle}</Text>
                            <TouchableOpacity onPress={() => setSelectModalVisible(false)} className="bg-slate-200 p-1.5 rounded-full">
                                <Text className="font-bold text-slate-500 text-[12px] px-2">Close</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="p-2" showsVerticalScrollIndicator={false}>
                            {selectOptions.map((opt, idx) => {
                                const isSelected = activeSelectField && formData[activeSelectField as keyof typeof formData] === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => handleSelectOption(opt.value)}
                                        className={`p-4 border-b border-slate-50 flex-row justify-between items-center ${isSelected ? 'bg-green-50/50' : ''}`}
                                    >
                                        <Text className={`font-bold text-[14px] ${isSelected ? 'text-[#108c2d]' : 'text-slate-700'}`}>{opt.label}</Text>
                                        {isSelected && <Check size={18} color="#108c2d" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Packages View Modal */}
            <Modal visible={packagesModalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-slate-900/60 justify-end">
                    <View className="bg-[#f4f7f9] rounded-t-3xl min-h-[60%] max-h-[85%] pb-6">
                        <View className="p-5 border-b border-slate-200 flex-row justify-between items-center bg-white rounded-t-3xl shadow-sm">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-[#108c2d] rounded-full items-center justify-center mr-2">
                                    <Sparkles size={14} color="white" />
                                </View>
                                <Text className="font-black text-[16px] text-slate-800 uppercase tracking-tight">Meeting Packages</Text>
                            </View>
                            <TouchableOpacity onPress={() => setPackagesModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                                <Text className="font-black text-slate-500 text-[10px] uppercase px-1">Close</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                            <Text className="text-[11px] font-bold text-slate-500 text-center mb-4 px-4 leading-5">These packages will be available for selection in the final step (Review & Submit).</Text>
                            
                            {packagesList.map((plan) => (
                                <View
                                    key={plan.name}
                                    className="mb-4 p-5 rounded-2xl border-2 border-slate-200 bg-white shadow-sm"
                                >
                                    {plan.popular && (
                                        <View className="absolute -top-3 self-center bg-[#fff3cd] px-3 py-1 rounded-full border border-[#ffeeba]">
                                            <Text className="text-[#856404] text-[9px] font-black uppercase tracking-wide">★ Most Popular</Text>
                                        </View>
                                    )}
                                    
                                    <View className="flex-row justify-between items-center mb-4 mt-1">
                                        <View>
                                            <Text className="text-[12px] font-black text-slate-500 uppercase tracking-widest">{plan.name}</Text>
                                            <View className="flex-row items-baseline mt-1">
                                                <Text className="text-[26px] font-black text-[#108c2d] leading-none">{plan.meetings}</Text>
                                                <Text className="text-[11px] text-slate-600 font-bold uppercase ml-1">Meetings</Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[18px] font-black text-slate-800">₹ {plan.price}</Text>
                                            <Text className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">+ GST</Text>
                                        </View>
                                    </View>

                                    <View className="border-t border-slate-100 pt-4 space-y-2">
                                        {plan.features.map((feat: string, fidx: number) => (
                                            <View key={fidx} className="flex-row items-center">
                                                <Check size={14} color="#108c2d" className="mr-2" strokeWidth={3} />
                                                <Text className="text-[11px] text-slate-600 font-bold">{feat}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </View>
    );
}
