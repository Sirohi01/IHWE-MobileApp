import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, User, Star, Users, Check, ArrowRight, ArrowLeft, MessageSquare, Briefcase, Lightbulb } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';
import * as SecureStore from 'expo-secure-store';

export default function FeedbackScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Select Modal State
    const [selectModalVisible, setSelectModalVisible] = useState(false);
    const [selectOptions, setSelectOptions] = useState<{label: string, value: string}[]>([]);
    const [selectTitle, setSelectTitle] = useState('');
    const [activeSelectField, setActiveSelectField] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        exhibitorName: '',
        companyName: '',
        stallNumber: '',
        hallNumber: '',
        productCategory: '',
        mobileNumber: '',
        emailId: '',
        overallRating: '',
        participateAgain: '',
        stallLocation: 0,
        stallConstruction: 0,
        venueFacilities: 0,
        housekeeping: 0,
        electricitySupport: 0,
        securityArrangements: 0,
        visitorFootfall: '',
        visitorQuality: '',
        buyerMeetings: '',
        seriousLeads: '',
        preEventComm: 0,
        registrationProcess: 0,
        paymentSupport: 0,
        onsiteCoordination: 0,
        problemResolution: 0,
        rmSupport: 0,
        brandingEffectiveness: '',
        meetExpectations: '',
        estimatedBusiness: '',
        improvements: '',
        specialSuggestions: '',
        isDeclared: false,
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
                
                setFormData(prev => ({
                    ...prev,
                    exhibitorName: `${fetchedData.contact1?.title || ''} ${fetchedData.contact1?.firstName || ''} ${fetchedData.contact1?.lastName || ''}`.trim(),
                    companyName: fetchedData.companyName || fetchedData.exhibitorName || '',
                    stallNumber: fetchedData.participation?.stallFor || '',
                    hallNumber: '',
                    mobileNumber: fetchedData.contact1?.mobile || '',
                    emailId: fetchedData.contact1?.email || '',
                    productCategory: fetchedData.primaryCategory || fetchedData.industrySector || '',
                }));

                const feedbackRes = await apiClient.get('/exhibitor-feedback/my').catch(() => null);
                if (feedbackRes?.data?.data) {
                    setSuccess(true);
                }
            }
        } catch (err) {
            console.log('Error fetching dashboard', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!formData.companyName) {
                Alert.alert("Required", "Company Name is required");
                return;
            }
        } else if (currentStep === 2) {
            if (!formData.overallRating || !formData.participateAgain) {
                Alert.alert("Required", "Please provide Overall Rating and Participation Intent");
                return;
            }
        } else if (currentStep === 3) {
            // Optional
        } else if (currentStep === 4) {
            // Optional
        }
        setCurrentStep(prev => Math.min(prev + 1, 5));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!formData.isDeclared) {
            Alert.alert("Declaration Required", "Please confirm the final declaration before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            await apiClient.post('/exhibitor-feedback/submit', formData);
            setSuccess(true);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to submit feedback");
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

    const InputField = ({ label, value, onChangeText, placeholder, required = false, multiline = false, readOnly = false }: any) => (
        <View className="mb-4">
            <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">{label} {required && <Text className="text-red-500">*</Text>}</Text>
            <TextInput 
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#cbd5e1"
                multiline={multiline}
                editable={!readOnly}
                className={`w-full ${readOnly ? 'bg-slate-100' : 'bg-slate-50'} border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] ${multiline ? 'h-24' : ''}`}
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

    const RatingField = ({ label, fieldKey, value }: any) => {
        return (
            <View className="mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row items-center justify-between">
                <Text className="text-[12px] font-bold text-slate-700 flex-1 pr-2">{label}</Text>
                <View className="flex-row items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity 
                            key={star} 
                            onPress={() => setFormData(prev => ({ ...prev, [fieldKey]: star }))}
                            className="p-1"
                        >
                            <Star 
                                size={22} 
                                fill={star <= value ? "#d26019" : "none"} 
                                color={star <= value ? "#d26019" : "#cbd5e1"} 
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-slate-500 font-bold">Loading feedback form...</Text>
            </View>
        );
    }

    if (success) {
        return (
            <View className="flex-1 bg-[#f4f7f9]">
                <View className="w-full bg-white pt-14 pb-4 px-6 border-b border-slate-200 shadow-sm z-10 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <Text className="text-slate-800 font-black text-[20px] tracking-tight">Feedback</Text>
                </View>
                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-white p-8 rounded-3xl items-center shadow-sm border border-slate-200 w-full">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
                            <CheckCircle2 size={40} color="#16a34a" />
                        </View>
                        <Text className="text-[20px] font-black text-slate-800 text-center uppercase tracking-tight">Feedback Recorded</Text>
                        <Text className="text-[13px] font-medium text-slate-500 text-center mt-2 leading-5">Thank you for your valuable feedback! Your response helps us improve the Expo experience.</Text>
                        
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="mt-8 bg-[#108c2d] w-full py-4 rounded-xl items-center shadow-lg shadow-green-900/20"
                        >
                            <Text className="text-white font-black text-[13px] uppercase tracking-wider">Back to Dashboard</Text>
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
                        <Text className="text-orange-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Post-Event</Text>
                        <Text className="text-slate-800 font-black text-[20px] tracking-tight">Exhibitor Feedback</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="flex-row justify-between items-center px-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <View key={step} className="flex-row items-center">
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${currentStep >= step ? 'bg-[#d26019]' : 'bg-slate-200'}`}>
                                {currentStep > step ? (
                                    <Check size={14} color="white" />
                                ) : (
                                    <Text className={`font-black text-[12px] ${currentStep === step ? 'text-white' : 'text-slate-400'}`}>{step}</Text>
                                )}
                            </View>
                            {step < 5 && (
                                <View className={`h-1 w-6 sm:w-10 mx-1 rounded-full ${currentStep > step ? 'bg-[#d26019]' : 'bg-slate-200'}`} />
                            )}
                        </View>
                    ))}
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                
                <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    
                    {currentStep === 1 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center mr-3 border border-orange-100">
                                    <User size={20} color="#d26019" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Basic Details</Text>
                            </View>

                            <InputField label="Company Name" required value={formData.companyName} readOnly placeholder="Company Name" />
                            <InputField label="Contact Person" value={formData.exhibitorName} readOnly placeholder="Contact Person" />
                            <View className="flex-row gap-4">
                                <View className="flex-1"><InputField label="Stall Number" value={formData.stallNumber} onChangeText={(v: string) => setFormData({...formData, stallNumber: v})} placeholder="e.g. A-12" /></View>
                                <View className="flex-1"><InputField label="Hall Number" value={formData.hallNumber} onChangeText={(v: string) => setFormData({...formData, hallNumber: v})} placeholder="e.g. Hall 5" /></View>
                            </View>
                            <InputField label="Product Category" value={formData.productCategory} onChangeText={(v: string) => setFormData({...formData, productCategory: v})} placeholder="Category" />
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-10 h-10 bg-yellow-50 rounded-xl items-center justify-center mr-3 border border-yellow-100">
                                    <Star size={20} color="#eab308" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Experience Rating</Text>
                            </View>

                            <SelectField fieldKey="overallRating" label="Overall experience at the Expo?" required value={formData.overallRating} options={["Excellent", "Very Good", "Good", "Average", "Poor"]} placeholder="Select rating" />
                            <SelectField fieldKey="participateAgain" label="Participate again next year?" required value={formData.participateAgain} options={["Definitely Yes", "Probably Yes", "Maybe", "Probably No", "Definitely No"]} placeholder="Select intent" />
                            
                            <View className="h-[1px] bg-slate-100 my-4" />
                            <Text className="text-[13px] font-black text-slate-800 mb-4 uppercase">Stall & Venue</Text>

                            <RatingField fieldKey="stallLocation" label="Stall Location" value={formData.stallLocation} />
                            <RatingField fieldKey="stallConstruction" label="Stall Construction" value={formData.stallConstruction} />
                            <RatingField fieldKey="venueFacilities" label="Venue Facilities" value={formData.venueFacilities} />
                            <RatingField fieldKey="housekeeping" label="Housekeeping" value={formData.housekeeping} />
                            <RatingField fieldKey="electricitySupport" label="Electricity & Internet" value={formData.electricitySupport} />
                            <RatingField fieldKey="securityArrangements" label="Security Arrangements" value={formData.securityArrangements} />
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3 border border-blue-100">
                                    <Users size={20} color="#3b82f6" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Visitor Quality & ROI</Text>
                            </View>

                            <SelectField fieldKey="visitorFootfall" label="Visitor Footfall" value={formData.visitorFootfall} options={["Excellent", "Good", "Average", "Low"]} placeholder="Select footfall" />
                            <SelectField fieldKey="visitorQuality" label="Visitor Quality" value={formData.visitorQuality} options={["Excellent", "Good", "Average", "Poor"]} placeholder="Select quality" />
                            <SelectField fieldKey="buyerMeetings" label="Buyer Meetings" value={formData.buyerMeetings} options={["Very Useful", "Useful", "Average", "Not Useful"]} placeholder="Select rating" />
                            <SelectField fieldKey="seriousLeads" label="Serious Business Leads" value={formData.seriousLeads} options={["1–10", "10–25", "25–50", "50+"]} placeholder="Select volume" />
                            
                            <View className="h-[1px] bg-slate-100 my-4" />
                            <Text className="text-[13px] font-black text-slate-800 mb-4 uppercase">ROI Evaluation</Text>

                            <SelectField fieldKey="meetExpectations" label="Business Expectations" value={formData.meetExpectations} options={["Exceeded Expectations", "Met Expectations", "Partially Met", "Did Not Meet"]} placeholder="Select expectation" />
                            <SelectField fieldKey="estimatedBusiness" label="Estimated Business Generated" value={formData.estimatedBusiness} options={["Below ₹1 Lakh", "₹1–5 Lakhs", "₹5–10 Lakhs", "₹10 Lakhs+", "Under Discussion"]} placeholder="Select range" />
                        </View>
                    )}

                    {currentStep === 4 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3 border border-indigo-100">
                                    <Briefcase size={20} color="#6366f1" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Support & Suggestions</Text>
                            </View>

                            <Text className="text-[13px] font-black text-slate-800 mb-4 uppercase">Organizer Support</Text>
                            <RatingField fieldKey="preEventComm" label="Pre-Event Communication" value={formData.preEventComm} />
                            <RatingField fieldKey="onsiteCoordination" label="Onsite Coordination" value={formData.onsiteCoordination} />
                            <RatingField fieldKey="problemResolution" label="Problem Resolution Speed" value={formData.problemResolution} />
                            <RatingField fieldKey="rmSupport" label="RM Support" value={formData.rmSupport} />

                            <View className="h-[1px] bg-slate-100 my-4" />
                            <View className="flex-row items-center mb-4">
                                <Lightbulb size={16} color="#eab308" className="mr-2" />
                                <Text className="text-[13px] font-black text-slate-800 uppercase">Suggestions</Text>
                            </View>

                            <InputField label="Improvements for next edition?" value={formData.improvements} onChangeText={(v: string) => setFormData({...formData, improvements: v})} placeholder="Your suggestions..." multiline />
                            <InputField label="Special Suggestions?" value={formData.specialSuggestions} onChangeText={(v: string) => setFormData({...formData, specialSuggestions: v})} placeholder="Any other remarks..." multiline />
                        </View>
                    )}

                    {currentStep === 5 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-3 border border-emerald-100">
                                    <CheckCircle2 size={20} color="#10b981" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Review & Submit</Text>
                            </View>

                            <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
                                <View className="mb-3"><Text className="text-[10px] text-slate-400 font-bold uppercase">Company Name</Text><Text className="font-black text-slate-800">{formData.companyName}</Text></View>
                                <View className="mb-3"><Text className="text-[10px] text-slate-400 font-bold uppercase">Overall Experience</Text><Text className="font-black text-slate-800">{formData.overallRating || 'Not provided'}</Text></View>
                                <View className="mb-3"><Text className="text-[10px] text-slate-400 font-bold uppercase">Participate Next Year</Text><Text className="font-black text-slate-800">{formData.participateAgain || 'Not provided'}</Text></View>
                            </View>

                            <TouchableOpacity 
                                onPress={() => setFormData(prev => ({...prev, isDeclared: !prev.isDeclared}))}
                                className={`p-4 rounded-2xl border flex-row items-start ${formData.isDeclared ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}
                            >
                                <View className={`w-5 h-5 rounded border mt-0.5 items-center justify-center mr-3 ${formData.isDeclared ? 'bg-[#d26019] border-[#d26019]' : 'border-slate-300'}`}>
                                    {formData.isDeclared && <Check size={14} color="white" />}
                                </View>
                                <Text className="text-[12px] text-slate-700 font-medium flex-1 italic leading-5">
                                    "I confirm that the feedback provided above is true and based on my business experience."
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>

            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 pb-5 flex-row justify-between">
                {currentStep > 1 ? (
                    <TouchableOpacity onPress={handlePrevStep} className="flex-row items-center px-4 py-2 bg-slate-100 rounded-xl">
                        <ArrowLeft size={16} color="#475569" className="mr-2" />
                        <Text className="font-bold text-slate-600 text-[13px] uppercase tracking-wider">Back</Text>
                    </TouchableOpacity>
                ) : <View className="w-24" />}

                {currentStep < 5 ? (
                    <TouchableOpacity onPress={handleNextStep} className="flex-row items-center px-6 py-2 bg-[#d26019] rounded-xl shadow-lg shadow-orange-900/20">
                        <Text className="font-bold text-white text-[13px] uppercase tracking-wider mr-2">Next Step</Text>
                        <ArrowRight size={16} color="white" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleSubmit} disabled={submitting} className={`flex-row items-center px-8 py-2 bg-[#23471d] rounded-xl shadow-lg shadow-green-900/30 ${submitting ? 'opacity-70' : ''}`}>
                        {submitting ? <ActivityIndicator color="white" size="small" className="mr-2" /> : <CheckCircle2 size={16} color="white" className="mr-2" />}
                        <Text className="font-bold text-white text-[13px] uppercase tracking-wider">Submit Feedback</Text>
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
                                        className={`p-4 border-b border-slate-50 flex-row justify-between items-center ${isSelected ? 'bg-orange-50' : ''}`}
                                    >
                                        <Text className={`font-bold text-[14px] ${isSelected ? 'text-[#d26019]' : 'text-slate-700'}`}>{opt.label}</Text>
                                        {isSelected && <Check size={18} color="#d26019" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </View>
    );
}
