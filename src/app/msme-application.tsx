import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Upload, CheckCircle2, ChevronRight, FileText, Banknote, User, ShieldCheck } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { apiClient } from '@/core/api/axios';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = [
    { id: 1, title: 'Applicant', icon: User },
    { id: 2, title: 'Bank', icon: Banknote },
    { id: 3, title: 'Documents', icon: Upload },
    { id: 4, title: 'Review', icon: ShieldCheck }
];

const REQUIRED_DOCUMENTS = [
    { id: 'udyam', name: 'Udyam Certificate', key: 'udyam_cert' },
    { id: 'gst', name: 'GST Certificate', key: 'gst_certificate' },
    { id: 'pan', name: 'PAN Card', key: 'pan_card' },
    { id: 'aadhaar', name: 'Aadhaar Card', key: 'aadhar_card' },
    { id: 'hotelInvoice', name: 'Hotel Invoice(s)', key: 'hotelInvoice' },
    { id: 'hotelPayment', name: 'Hotel Payment Proof', key: 'hotelPayment' },
    { id: 'travelExpense', name: 'Travel Expense Proof', key: 'travelExpense' },
    { id: 'travelInvoice', name: 'Travel Invoice', key: 'travelInvoice' },
    { id: 'courier', name: 'Courier / Logistics Invoice', key: 'courier' },
    { id: 'marketing', name: 'Marketing / Printing Invoice', key: 'marketing' },
];

const BANK_DOCUMENTS = [
    { id: 'cheque', name: 'Cancelled Cheque', key: 'cancelled_cheque', required: true },
    { id: 'statement', name: 'Bank Statement (Last 6 Months)', key: 'bank_statement', required: true },
    { id: 'passbook', name: 'Bank Passbook First Page (Optional)', key: 'bank_passbook', required: false },
];

export default function MSMEApplicationScreen() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>(null);

    // Form States
    const [companyDetails, setCompanyDetails] = useState({
        company_name: '', udyam_number: '', gst_number: '', pan_number: '', type_of_organization: 'Private Limited Company', year_of_establishment: '', msme_category: 'Micro'
    });
    const [authPersonDetails, setAuthPersonDetails] = useState({
        contact_person_name: '', designation: '', mobile_number: '', alternative_contact: ''
    });
    const [registeredAddress, setRegisteredAddress] = useState({
        address_line_1: '', address_line_2: '', country: 'India', state: '', city: '', pincode: ''
    });
    const [eventDetails, setEventDetails] = useState({
        event_name: '9th Edition of International Health & Wellness Expo',
        stall_number: '',
        hall_number: '',
        stall_size: '',
        participation_type: 'Shell Space',
        booking_status: 'Pending',
        payment_status: 'Pending',
        invoice_value: 0,
        amount_paid: 0,
        payment_date: null as string | null
    });
    const [expenseCategories, setExpenseCategories] = useState({
        stall_charges: true, hotel_stay: false, travel: false, courier: false, marketing_material: false, logistics: false
    });

    const [bankDetails, setBankDetails] = useState({
        account_holder_name: '',
        bank_name: '',
        branch_name: '',
        account_no: '',
        confirm_account_no: '',
        ifsc_code: '',
        micr_code: '',
        account_type: 'Current Account'
    });

    useEffect(() => {
        fetchApplication();
    }, []);

    const fetchApplication = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('exhibitorToken');
            const dash = await apiClient.get('/exhibitor-auth/dashboard', { headers: { Authorization: `Bearer ${token}` } });
            const dashData = dash.data?.data;
            const exhibitorId = dashData?._id;
            const primaryTeam = dashData.teamMembers?.find((m: any) => m.isPrimary) || dashData.teamMembers?.[0] || null;

            if (dashData) {
                setCompanyDetails(prev => ({
                    ...prev,
                    company_name: dashData.exhibitorName || '',
                    gst_number: dashData.gstNo || dashData.gstin || '',
                    pan_number: dashData.panNo || dashData.pan || '',
                }));
                setAuthPersonDetails(prev => ({
                    ...prev,
                    contact_person_name: primaryTeam?.name || (dashData.contact1 ? `${dashData.contact1.firstName || ''} ${dashData.contact1.lastName || ''}`.trim() : ''),
                    designation: primaryTeam?.designation || dashData.contact1?.designation || '',
                    mobile_number: primaryTeam?.mobile || dashData.contact1?.mobile || dashData.mobile || '',
                    alternative_contact: dashData.contact1?.alternateNo || '',
                }));
                setRegisteredAddress(prev => ({
                    ...prev,
                    address_line_1: dashData.address || '',
                    city: dashData.city || '',
                    state: dashData.state || '',
                    pincode: dashData.pincode || dashData.pinCode || '',
                    country: dashData.country || 'India',
                }));
                setEventDetails(prev => ({
                    ...prev,
                    stall_number: dashData.participation?.stallFor || dashData.participation?.stallNo || dashData.stallDetails?.stallNumber || '',
                    stall_size: dashData.participation?.stallSize ? dashData.participation.stallSize.toString() : dashData.stallDetails?.area?.toString() || '',
                    hall_number: dashData.participation?.hallName || dashData.participation?.hallNumber || dashData.stallDetails?.hallNumber || dashData.hallName || 'Hall 12',
                    event_name: dashData.participation?.eventName || dashData.eventId?.title || dashData.eventId?.name || dashData.eventName || '9th Edition of International Health & Wellness Expo',
                    participation_type: dashData.participation?.stallType || dashData.participation?.stallCategory || 'Shell Space',
                    booking_status: dashData.participation?.stallFor || dashData.participation?.stallNo ? 'Confirmed' : (dashData.status ? dashData.status.charAt(0).toUpperCase() + dashData.status.slice(1) : 'Confirmed'),
                    payment_status: dashData.status === 'active' ? 'Fully Paid' : (dashData.status ? dashData.status.charAt(0).toUpperCase() + dashData.status.slice(1) : 'Fully Paid'),
                    invoice_value: Number(dashData.financeBreakdown?.netPayable || dashData.totalPayable || dashData.participation?.total || 0),
                    amount_paid: Number(dashData.amountPaid || 0),
                    payment_date: dashData.paymentHistory?.length > 0 ? [...dashData.paymentHistory].sort((a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime())[0]?.paidAt : null,
                }));
            }

            if (exhibitorId) {
                const res = await apiClient.get(`/msme-pms-scheme/application/me?exhibitorId=${exhibitorId}`);
                if (res.data?.success && res.data?.data) {
                    const appData = res.data.data;
                    setData(appData);
                    if (appData.applicantDetails) {
                        setCompanyDetails(prev => ({
                            ...prev,
                            company_name: appData.applicantDetails.companyName || prev.company_name,
                            udyam_number: appData.applicantDetails.udyamRegNo || prev.udyam_number,
                            gst_number: appData.applicantDetails.gstNumber || prev.gst_number,
                            pan_number: appData.applicantDetails.panNumber || prev.pan_number,
                            type_of_organization: appData.applicantDetails.organizationType || prev.type_of_organization,
                            year_of_establishment: String(appData.applicantDetails.yearOfEstablishment || prev.year_of_establishment || ''),
                            msme_category: appData.applicantDetails.msmeCategory || prev.msme_category,
                        }));
                        setAuthPersonDetails(prev => ({
                            ...prev,
                            contact_person_name: appData.applicantDetails.contactName || prev.contact_person_name,
                            designation: appData.applicantDetails.designation || prev.designation,
                            mobile_number: appData.applicantDetails.mobileNumber || prev.mobile_number,
                            alternative_contact: appData.applicantDetails.alternateNumber || prev.alternative_contact,
                        }));
                        setRegisteredAddress(prev => ({
                            ...prev,
                            address_line_1: appData.applicantDetails.addressLine1 || prev.address_line_1,
                            address_line_2: appData.applicantDetails.addressLine2 || prev.address_line_2,
                            country: appData.applicantDetails.country || prev.country,
                            state: appData.applicantDetails.state || prev.state,
                            city: appData.applicantDetails.city || prev.city,
                            pincode: appData.applicantDetails.pincode || prev.pincode,
                        }));
                        setEventDetails(prev => ({
                            ...prev,
                            stall_number: appData.applicantDetails.stallNo || prev.stall_number,
                            stall_size: appData.applicantDetails.stallSize || prev.stall_size,
                            hall_number: appData.applicantDetails.hallNo || prev.hall_number,
                            event_name: appData.applicantDetails.eventName || prev.event_name,
                            participation_type: appData.applicantDetails.participationType || prev.participation_type,
                            booking_status: appData.applicantDetails.bookingStatus ? appData.applicantDetails.bookingStatus.charAt(0).toUpperCase() + appData.applicantDetails.bookingStatus.slice(1) : prev.booking_status,
                            payment_status: appData.applicantDetails.paymentStatus ? appData.applicantDetails.paymentStatus.charAt(0).toUpperCase() + appData.applicantDetails.paymentStatus.slice(1) : prev.payment_status,
                        }));
                    }
                    if (appData.selectedExpenses) {
                        setExpenseCategories({
                            stall_charges: true,
                            hotel_stay: appData.selectedExpenses.includes('Hotel Stay'),
                            travel: appData.selectedExpenses.includes('Travel'),
                            courier: appData.selectedExpenses.includes('Courier'),
                            marketing_material: appData.selectedExpenses.includes('Marketing Material'),
                            logistics: appData.selectedExpenses.includes('Logistics / Others')
                        });
                    }
                    if (appData.payment) {
                        setEventDetails(prev => ({
                            ...prev,
                            invoice_value: appData.payment.invoiceValue || prev.invoice_value,
                            amount_paid: appData.payment.amountPaid || prev.amount_paid,
                            payment_date: appData.payment.paymentDate ? new Date(appData.payment.paymentDate).toLocaleDateString() : prev.payment_date
                        }));
                    }
                    if (appData.bankDetails) {
                        setBankDetails({
                            account_holder_name: appData.bankDetails.accountHolderName || '',
                            bank_name: appData.bankDetails.bankName || '',
                            branch_name: appData.bankDetails.branchName || '',
                            account_no: appData.bankDetails.accountNumber || '',
                            confirm_account_no: appData.bankDetails.confirmAccountNumber || appData.bankDetails.accountNumber || '',
                            ifsc_code: appData.bankDetails.ifscCode || '',
                            micr_code: appData.bankDetails.micrCode || '',
                            account_type: appData.bankDetails.accountType || 'Current Account'
                        });
                    }
                }
            }
        } catch (error) {
            console.log('Error fetching MSME app', error);
        } finally {
            setLoading(false);
        }
    };

    const saveStep = async (stepNo: number, stepData: any) => {
        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('exhibitorToken');
            const dash = await apiClient.get('/exhibitor-auth/dashboard', { headers: { Authorization: `Bearer ${token}` } });
            const exhibitorId = dash.data?.data?._id;
            await apiClient.put(`/msme-pms-scheme/application/step/${stepNo}?exhibitorId=${exhibitorId}`, stepData);
            return true;
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save details');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            const applicantDetails = {
                companyName: companyDetails.company_name,
                udyamRegNo: companyDetails.udyam_number,
                gstNumber: companyDetails.gst_number,
                panNumber: companyDetails.pan_number,
                organizationType: companyDetails.type_of_organization,
                yearOfEstablishment: companyDetails.year_of_establishment,
                msmeCategory: companyDetails.msme_category,
                contactName: authPersonDetails.contact_person_name,
                designation: authPersonDetails.designation,
                mobileNumber: authPersonDetails.mobile_number,
                alternateNumber: authPersonDetails.alternative_contact,
                addressLine1: registeredAddress.address_line_1,
                addressLine2: registeredAddress.address_line_2,
                country: registeredAddress.country,
                state: registeredAddress.state,
                city: registeredAddress.city,
                pincode: registeredAddress.pincode,
                eventName: eventDetails.event_name,
                stallNo: eventDetails.stall_number,
                hallNo: eventDetails.hall_number,
                stallSize: eventDetails.stall_size,
                participationType: eventDetails.participation_type,
                bookingStatus: eventDetails.booking_status,
                paymentStatus: eventDetails.payment_status
            };
            const selectedExpenses = [];
            if (expenseCategories.stall_charges) selectedExpenses.push('Stall Charges');
            if (expenseCategories.hotel_stay) selectedExpenses.push('Hotel Stay');
            if (expenseCategories.travel) selectedExpenses.push('Travel');
            if (expenseCategories.courier) selectedExpenses.push('Courier');
            if (expenseCategories.marketing_material) selectedExpenses.push('Marketing Material');
            if (expenseCategories.logistics) selectedExpenses.push('Logistics / Others');
            const success = await saveStep(1, { applicantDetails, selectedExpenses });
            if (success) setCurrentStep(2);
        } else if (currentStep === 2) {
            const mappedBankDetails = {
                accountHolderName: bankDetails.account_holder_name,
                bankName: bankDetails.bank_name,
                branchName: bankDetails.branch_name,
                accountNumber: bankDetails.account_no,
                confirmAccountNumber: bankDetails.confirm_account_no,
                ifscCode: bankDetails.ifsc_code,
                micrCode: bankDetails.micr_code,
                accountType: bankDetails.account_type || 'Current Account'
            };
            const success = await saveStep(2, { bankDetails: mappedBankDetails });
            if (success) setCurrentStep(3);
        } else if (currentStep === 3) {
            const success = await saveStep(3, {});
            if (success) setCurrentStep(4);
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            const success = await saveStep(4, { declarationAgreed: true });
            if (!success) {
                setSaving(false);
                return;
            }

            const token = await SecureStore.getItemAsync('exhibitorToken');
            const dash = await apiClient.get('/exhibitor-auth/dashboard', { headers: { Authorization: `Bearer ${token}` } });
            const exhibitorId = dash.data?.data?._id;
            await apiClient.post(`/msme-pms-scheme/application/submit?exhibitorId=${exhibitorId}`);
            Alert.alert('Success', 'Application submitted successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Submission failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDocumentUpload = async (documentType: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;
            const file = result.assets[0];

            let mimeType = file.mimeType;
            if (!mimeType || mimeType === 'application/octet-stream' || mimeType === '*/*') {
                const ext = file.name.split('.').pop()?.toLowerCase();
                if (ext === 'pdf') mimeType = 'application/pdf';
                else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
                else if (ext === 'png') mimeType = 'image/png';
                else mimeType = 'application/pdf';
            }
            if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

            setSaving(true);
            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
                name: file.name,
                type: mimeType
            } as any);

            const token = await SecureStore.getItemAsync('exhibitorToken');
            const dash = await apiClient.get('/exhibitor-auth/dashboard', { headers: { Authorization: `Bearer ${token}` } });
            const exhibitorId = dash.data?.data?._id;

            await apiClient.post(`/msme-pms-scheme/application/documents/${documentType}?exhibitorId=${exhibitorId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            Alert.alert('Success', 'Document uploaded successfully');
            fetchApplication(); // Refresh to get updated document statuses
        } catch (error: any) {
            Alert.alert('Upload Failed', error.response?.data?.message || 'Could not upload document');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#f4f7f9]">
                <ActivityIndicator size="large" color="#1a3a7c" />
                <Text className="mt-4 text-[#1a3a7c] font-bold">Loading Application...</Text>
            </View>
        );
    }

    const isApproved = data?.status === 'Approved';

    return (
        <SafeAreaView className="flex-1 bg-[#f4f7f9]">
            {/* Header */}
            <View className="bg-white px-5 py-4 border-b border-slate-200 flex-row items-center shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    {/* @ts-ignore */}
                    <ArrowLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[18px] font-black text-slate-800">MSME PMS Scheme</Text>
                    <Text className="text-[12px] font-bold text-slate-500">Claim Subsidy Application</Text>
                </View>
            </View>

            {/* Stepper */}
            <View className="bg-white px-4 py-4 border-b border-slate-200">
                <View className="flex-row justify-between">
                    {STEPS.map((step, idx) => (
                        <View key={step.id} className="items-center flex-1">
                            <View className={`w-10 h-10 rounded-full items-center justify-center mb-1 ${currentStep >= step.id ? 'bg-[#1a3a7c]' : 'bg-slate-100'}`}>
                                <step.icon size={16} color={currentStep >= step.id ? '#fff' : '#94a3b8'} />
                            </View>
                            <Text className={`text-[10px] font-bold ${currentStep >= step.id ? 'text-[#1a3a7c]' : 'text-slate-400'}`}>{step.title}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 100 }}>
                {isApproved && (
                    <View className="bg-green-50 p-4 rounded-2xl border border-green-200 mb-5 flex-row items-center">
                        <CheckCircle2 size={24} color="#16a34a" />
                        <View className="ml-3 flex-1">
                            <Text className="text-green-800 font-black text-[14px]">Application Approved</Text>
                            <Text className="text-green-600 text-[12px]">Your MSME PMS Scheme subsidy claim has been approved.</Text>
                        </View>
                    </View>
                )}

                {/* Step 1: Applicant Details */}
                {currentStep === 1 && (
                    <View>
                        {/* A. Company Details */}
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#1a3a7c] mb-4">A. Company / Organization Details</Text>
                            <InputField label="Company Name *" value={companyDetails.company_name} onChange={(v: string) => setCompanyDetails({...companyDetails, company_name: v})} disabled={isApproved} />
                            <InputField label="Udyam Registration Number *" value={companyDetails.udyam_number} onChange={(v: string) => setCompanyDetails({...companyDetails, udyam_number: v})} disabled={isApproved} />
                            <InputField label="GST Number *" value={companyDetails.gst_number} onChange={(v: string) => setCompanyDetails({...companyDetails, gst_number: v})} disabled={isApproved} />
                            <InputField label="PAN Number *" value={companyDetails.pan_number} onChange={(v: string) => setCompanyDetails({...companyDetails, pan_number: v})} disabled={isApproved} />
                            <InputField label="Type of Organization *" value={companyDetails.type_of_organization} onChange={(v: string) => setCompanyDetails({...companyDetails, type_of_organization: v})} disabled={isApproved} />
                            <InputField label="Year of Establishment *" value={companyDetails.year_of_establishment} onChange={(v: string) => setCompanyDetails({...companyDetails, year_of_establishment: v})} keyboardType="number-pad" disabled={isApproved} />
                            
                            <Text className="text-[12px] font-bold text-slate-700 mt-2 mb-2">MSME Category *</Text>
                            <View className="flex-row items-center justify-start gap-4 mb-2">
                                {['Micro', 'Small', 'Medium'].map(cat => (
                                    <TouchableOpacity 
                                        key={cat} 
                                        onPress={() => !isApproved && setCompanyDetails({...companyDetails, msme_category: cat})}
                                        className="flex-row items-center"
                                    >
                                        <View className={`w-4 h-4 rounded-full border ${companyDetails.msme_category === cat ? 'border-[#1a3a7c] bg-[#1a3a7c]' : 'border-slate-300'} mr-2 items-center justify-center`}>
                                            {companyDetails.msme_category === cat && <View className="w-2 h-2 rounded-full bg-white" />}
                                        </View>
                                        <Text className="text-slate-700 text-[12px] font-medium">{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* B. Authorized Person Details */}
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#16a34a] mb-4">B. Authorized Person Details</Text>
                            <InputField label="Contact Person Name *" value={authPersonDetails.contact_person_name} onChange={(v: string) => setAuthPersonDetails({...authPersonDetails, contact_person_name: v})} disabled={isApproved} />
                            <InputField label="Designation *" value={authPersonDetails.designation} onChange={(v: string) => setAuthPersonDetails({...authPersonDetails, designation: v})} disabled={isApproved} />
                            <InputField label="Mobile Number *" value={authPersonDetails.mobile_number} onChange={(v: string) => setAuthPersonDetails({...authPersonDetails, mobile_number: v})} keyboardType="phone-pad" disabled={isApproved} />
                            <InputField label="Alternative Contact Number" value={authPersonDetails.alternative_contact} onChange={(v: string) => setAuthPersonDetails({...authPersonDetails, alternative_contact: v})} keyboardType="phone-pad" disabled={isApproved} />
                        </View>

                        {/* C. Registered Address */}
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#d97706] mb-4">C. Registered Address</Text>
                            <InputField label="Address Line 1 *" value={registeredAddress.address_line_1} onChange={(v: string) => setRegisteredAddress({...registeredAddress, address_line_1: v})} disabled={isApproved} />
                            <InputField label="Address Line 2" value={registeredAddress.address_line_2} onChange={(v: string) => setRegisteredAddress({...registeredAddress, address_line_2: v})} disabled={isApproved} />
                            <InputField label="Country *" value={registeredAddress.country} onChange={(v: string) => setRegisteredAddress({...registeredAddress, country: v})} disabled={isApproved} />
                            <InputField label="State *" value={registeredAddress.state} onChange={(v: string) => setRegisteredAddress({...registeredAddress, state: v})} disabled={isApproved} />
                            <InputField label="City *" value={registeredAddress.city} onChange={(v: string) => setRegisteredAddress({...registeredAddress, city: v})} disabled={isApproved} />
                            <InputField label="Pincode *" value={registeredAddress.pincode} onChange={(v: string) => setRegisteredAddress({...registeredAddress, pincode: v})} keyboardType="number-pad" disabled={isApproved} />
                        </View>

                        {/* D. Event Participation Details */}
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#6366f1] mb-1">D. Event Participation Details</Text>
                            <Text className="text-[10px] text-slate-400 mb-4">(Auto-fetched from IHWE)</Text>
                            <InputField label="Event Name" value={eventDetails.event_name} onChange={() => {}} disabled={true} />
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <InputField label="Stall Number" value={eventDetails.stall_number} onChange={() => {}} disabled={true} />
                                </View>
                                <View className="flex-1">
                                    <InputField label="Hall Number" value={eventDetails.hall_number} onChange={() => {}} disabled={true} />
                                </View>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <InputField label="Stall Size" value={eventDetails.stall_size} onChange={() => {}} disabled={true} />
                                </View>
                                <View className="flex-1">
                                    <InputField label="Participation Type" value={eventDetails.participation_type} onChange={() => {}} disabled={true} />
                                </View>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <InputField label="Booking Status" value={eventDetails.booking_status} onChange={() => {}} disabled={true} />
                                </View>
                                <View className="flex-1">
                                    <InputField label="Payment Status" value={eventDetails.payment_status} onChange={() => {}} disabled={true} />
                                </View>
                            </View>
                        </View>

                        {/* E. Expense Categories */}
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#0f172a] mb-1">E. Expense Categories</Text>
                            <Text className="text-[10px] text-slate-400 mb-4">(Select all that apply)</Text>
                            
                            <View className="flex-row flex-wrap justify-between">
                                {[
                                    { key: 'stall_charges', label: 'Stall Charges (Mandatory)' },
                                    { key: 'hotel_stay', label: 'Hotel Stay' },
                                    { key: 'travel', label: 'Travel' },
                                    { key: 'courier', label: 'Courier' },
                                    { key: 'marketing_material', label: 'Marketing Material' },
                                    { key: 'logistics', label: 'Logistics / Others' }
                                ].map((item) => (
                                    <TouchableOpacity 
                                        key={item.key}
                                        onPress={() => {
                                            if (!isApproved && item.key !== 'stall_charges') {
                                                setExpenseCategories({...expenseCategories, [item.key as keyof typeof expenseCategories]: !expenseCategories[item.key as keyof typeof expenseCategories]});
                                            }
                                        }}
                                        className={`w-[48%] mb-3 p-3 rounded-xl border ${expenseCategories[item.key as keyof typeof expenseCategories] ? 'border-[#16a34a] bg-green-50' : 'border-slate-200 bg-slate-50'} flex-row items-center`}
                                    >
                                        <View className={`w-4 h-4 rounded border ${expenseCategories[item.key as keyof typeof expenseCategories] ? 'border-[#16a34a] bg-[#16a34a]' : 'border-slate-300 bg-white'} items-center justify-center mr-2`}>
                                            {expenseCategories[item.key as keyof typeof expenseCategories] && <CheckCircle2 size={10} color="#fff" />}
                                        </View>
                                        <Text className={`text-[11px] font-bold ${expenseCategories[item.key as keyof typeof expenseCategories] ? 'text-green-800' : 'text-slate-600'} flex-1`}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Step 2: Bank Details */}
                {currentStep === 2 && (
                    <View>
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#16a34a] mb-4">A. Reimbursement Bank Details</Text>
                            <InputField label="Account Holder Name *" value={bankDetails.account_holder_name} onChange={(v: string) => setBankDetails({...bankDetails, account_holder_name: v})} disabled={isApproved} />
                            <InputField label="Bank Name *" value={bankDetails.bank_name} onChange={(v: string) => setBankDetails({...bankDetails, bank_name: v})} disabled={isApproved} />
                            <InputField label="Branch Name *" value={bankDetails.branch_name} onChange={(v: string) => setBankDetails({...bankDetails, branch_name: v})} disabled={isApproved} />
                            <InputField label="Account Number *" value={bankDetails.account_no} onChange={(v: string) => setBankDetails({...bankDetails, account_no: v})} keyboardType="number-pad" disabled={isApproved} />
                            <InputField label="Confirm Account Number *" value={bankDetails.confirm_account_no} onChange={(v: string) => setBankDetails({...bankDetails, confirm_account_no: v})} keyboardType="number-pad" disabled={isApproved} />
                            <InputField label="IFSC Code *" value={bankDetails.ifsc_code} onChange={(v: string) => setBankDetails({...bankDetails, ifsc_code: v})} disabled={isApproved} />
                            <InputField label="MICR Code (Optional)" value={bankDetails.micr_code} onChange={(v: string) => setBankDetails({...bankDetails, micr_code: v})} disabled={isApproved} />
                            
                            <Text className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Account Type *</Text>
                            <View className="flex-row gap-4 mb-2">
                                <TouchableOpacity onPress={() => !isApproved && setBankDetails({...bankDetails, account_type: 'Current Account'})} className="flex-row items-center">
                                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-2 ${bankDetails.account_type === 'Current Account' ? 'border-[#16a34a]' : 'border-slate-300'}`}>
                                        {bankDetails.account_type === 'Current Account' && <View className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />}
                                    </View>
                                    <Text className="text-[13px] font-bold text-slate-700">Current Account</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => !isApproved && setBankDetails({...bankDetails, account_type: 'Savings Account'})} className="flex-row items-center">
                                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-2 ${bankDetails.account_type === 'Savings Account' ? 'border-[#16a34a]' : 'border-slate-300'}`}>
                                        {bankDetails.account_type === 'Savings Account' && <View className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />}
                                    </View>
                                    <Text className="text-[13px] font-bold text-slate-700">Savings Account</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="bg-[#f0fdf4] p-4 rounded-2xl shadow-sm border border-green-200 mb-4">
                            <Text className="text-[14px] font-black text-[#16a34a] mb-2">B. Payment Verification</Text>
                            <View className="flex-row items-center bg-white p-3 rounded-xl border border-green-100">
                                <CheckCircle2 color="#16a34a" size={20} />
                                <View className="ml-3 flex-1">
                                    <Text className="text-[13px] font-bold text-slate-800">Some verifications are pending.</Text>
                                    <Text className="text-[11px] text-slate-500 mt-0.5">Verification is based on your saved exhibitor records.</Text>
                                </View>
                            </View>
                        </View>

                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#5924c6] mb-1">C. Mandatory Bank Documents</Text>
                            <Text className="text-[10px] text-slate-400 mb-4">Please upload the following bank documents. (PDF/JPG Max 10MB)</Text>
                            
                            {BANK_DOCUMENTS.map((doc) => {
                                const uploaded = data?.documents?.find((d: any) => d.documentType === doc.id);
                                return (
                                    <View key={doc.id} className="flex-row items-center justify-between p-3 border border-slate-200 rounded-xl mb-3 bg-slate-50">
                                        <View className="flex-1 flex-row items-center">
                                            <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${uploaded ? 'bg-[#f0fdf4]' : 'bg-slate-200'}`}>
                                                {/* @ts-ignore */}
                                                <FileText size={16} color={uploaded ? '#16a34a' : '#64748b'} />
                                            </View>
                                            <View className="ml-1 flex-1">
                                                <Text className="text-[13px] font-bold text-slate-800">{doc.name}</Text>
                                                <Text className={`text-[10px] font-bold uppercase mt-0.5 ${uploaded ? 'text-green-600' : 'text-slate-400'}`}>
                                                    {uploaded ? 'Uploaded Successfully' : (doc.required ? 'Pending Upload *' : 'Optional')}
                                                </Text>
                                            </View>
                                        </View>
                                        {!isApproved && (
                                            <TouchableOpacity 
                                                onPress={() => handleDocumentUpload(doc.id)}
                                                className="bg-white px-4 py-2 rounded-lg border border-slate-300 flex-row items-center shadow-sm"
                                            >
                                                <Text className="text-[11px] font-black text-slate-700">{uploaded ? 'Replace' : 'Upload'}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                            
                            <View className="bg-[#eff6ff] p-3 rounded-lg border border-[#bfdbfe] mt-2">
                                <Text className="text-[11px] text-[#1e3a8a]">Ensure that the account number and IFSC code are clearly visible in the uploaded documents.</Text>
                            </View>
                        </View>

                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#5924c6] mb-1">D. IHWE Payment Details</Text>
                            <Text className="text-[10px] text-slate-400 mb-4">(Auto Filled)</Text>
                            
                            <View className="flex-row justify-between border-b border-slate-100 py-2">
                                <Text className="text-[12px] text-slate-500 font-bold">Event</Text>
                                <Text className="text-[12px] text-slate-800 font-black text-right flex-1 ml-4">{eventDetails.event_name}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-slate-100 py-2">
                                <Text className="text-[12px] text-slate-500 font-bold">Stall No.</Text>
                                <Text className="text-[12px] text-slate-800 font-black">{eventDetails.stall_number}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-slate-100 py-2">
                                <Text className="text-[12px] text-slate-500 font-bold">Hall</Text>
                                <Text className="text-[12px] text-slate-800 font-black">{eventDetails.hall_number}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-slate-100 py-2">
                                <Text className="text-[12px] text-slate-500 font-bold">Stall Size</Text>
                                <Text className="text-[12px] text-slate-800 font-black">{eventDetails.stall_size}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-slate-100 py-2">
                                <Text className="text-[12px] text-slate-500 font-bold">Invoice Value</Text>
                                <Text className="text-[12px] text-slate-800 font-black">{eventDetails.invoice_value ? `₹ ${eventDetails.invoice_value.toLocaleString('en-IN')}` : '—'}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-slate-100 py-2">
                                <Text className="text-[12px] text-slate-500 font-bold">Amount Paid</Text>
                                <Text className="text-[12px] text-slate-800 font-black">{eventDetails.amount_paid ? `₹ ${eventDetails.amount_paid.toLocaleString('en-IN')}` : '—'}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-slate-100 py-2">
                                <Text className="text-[12px] text-slate-500 font-bold">Payment Status</Text>
                                <Text className="text-[12px] text-[#16a34a] font-black">{eventDetails.payment_status}</Text>
                            </View>
                            <View className="flex-row justify-between py-2">
                                <Text className="text-[12px] text-slate-500 font-bold">Payment Date</Text>
                                <Text className="text-[12px] text-slate-800 font-black">{eventDetails.payment_date ? new Date(eventDetails.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Text>
                            </View>
                        </View>

                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#16a34a] mb-1">E. Reimbursement Claim Calculation</Text>
                            <Text className="text-[10px] text-slate-400 mb-4">(Indicative)</Text>

                            <View className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <View className="flex-row justify-between border-b border-slate-200 pb-2 mb-2">
                                    <Text className="text-[11px] font-bold text-slate-500 uppercase">Particular</Text>
                                    <Text className="text-[11px] font-bold text-slate-500 uppercase text-right">Amount (₹)</Text>
                                </View>
                                <View className="flex-row justify-between py-1.5">
                                    <Text className="text-[12px] font-bold text-slate-700">Stall Charges</Text>
                                    <Text className="text-[12px] font-black text-slate-800">{eventDetails.invoice_value ? eventDetails.invoice_value.toLocaleString('en-IN') : '—'}</Text>
                                </View>
                                <View className="flex-row justify-between py-1.5">
                                    <Text className="text-[12px] font-bold text-slate-700">Hotel Stay</Text>
                                    <Text className="text-[12px] font-black text-slate-800">—</Text>
                                </View>
                                <View className="flex-row justify-between py-1.5">
                                    <Text className="text-[12px] font-bold text-slate-700">Travel</Text>
                                    <Text className="text-[12px] font-black text-slate-800">—</Text>
                                </View>
                                <View className="flex-row justify-between py-1.5">
                                    <Text className="text-[12px] font-bold text-slate-700">Courier</Text>
                                    <Text className="text-[12px] font-black text-slate-800">—</Text>
                                </View>
                                <View className="flex-row justify-between py-1.5 border-b border-slate-200 pb-3 mb-1">
                                    <Text className="text-[12px] font-bold text-slate-700">Marketing</Text>
                                    <Text className="text-[12px] font-black text-slate-800">—</Text>
                                </View>
                                <View className="flex-row justify-between pt-2">
                                    <Text className="text-[13px] font-black text-[#16a34a]">Total Claimed</Text>
                                    <Text className="text-[13px] font-black text-[#16a34a]">{eventDetails.invoice_value ? eventDetails.invoice_value.toLocaleString('en-IN') : '—'}</Text>
                                </View>
                            </View>

                            <View className="bg-[#f0fdf4] p-4 rounded-xl border border-green-200 items-center justify-center">
                                <Text className="text-[12px] font-bold text-[#16a34a] uppercase tracking-widest mb-1">Indicative Eligible Claim</Text>
                                <Text className="text-[24px] font-black text-[#16a34a]">₹ {eventDetails.invoice_value ? eventDetails.invoice_value.toLocaleString('en-IN') : '0'}</Text>
                            </View>
                            <Text className="text-[10px] text-slate-400 mt-3 text-center italic">* Maximum benefit is subject to scheme rules and approval.</Text>
                        </View>
                    </View>
                )}

                {/* Step 3: Documents Upload */}
                {currentStep === 3 && (
                    <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                        <Text className="text-[14px] font-black text-[#1a3a7c] mb-1">Required Documents</Text>
                        <Text className="text-slate-500 text-[11px] mb-4">Upload all documents in PDF or JPG format (Max 10MB each).</Text>
                        
                        {REQUIRED_DOCUMENTS.filter(doc => {
                            if (['udyam', 'gst', 'pan', 'aadhaar'].includes(doc.id)) return true;
                            if (['hotelInvoice', 'hotelPayment'].includes(doc.id)) return expenseCategories.hotel_stay;
                            if (['travelExpense', 'travelInvoice'].includes(doc.id)) return expenseCategories.travel;
                            if (doc.id === 'courier') return expenseCategories.courier;
                            if (doc.id === 'marketing') return expenseCategories.marketing_material;
                            return false;
                        }).map((doc) => {
                            const uploaded = data?.documents?.find((d: any) => d.documentType === doc.id);
                            return (
                                <View key={doc.id} className="flex-row items-center justify-between p-3 border border-slate-200 rounded-xl mb-3 bg-slate-50">
                                    <View className="flex-1 flex-row items-center">
                                        <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${uploaded ? 'bg-green-100' : 'bg-slate-200'}`}>
                                            {/* @ts-ignore */}
                                            <FileText size={16} color={uploaded ? '#16a34a' : '#64748b'} />
                                        </View>
                                        <View className="ml-1 flex-1">
                                            <Text className="text-[13px] font-bold text-slate-800">{doc.name}</Text>
                                            <Text className={`text-[10px] font-bold uppercase mt-0.5 ${uploaded ? 'text-green-600' : 'text-slate-400'}`}>
                                                {uploaded ? 'Uploaded Successfully' : 'Pending Upload'}
                                            </Text>
                                        </View>
                                    </View>
                                    {!isApproved && (
                                        <TouchableOpacity 
                                            onPress={() => handleDocumentUpload(doc.id)}
                                            className="bg-white px-4 py-2 rounded-lg border border-slate-300 flex-row items-center shadow-sm"
                                        >
                                            <Text className="text-[11px] font-black text-slate-700">{uploaded ? 'Replace' : 'Upload'}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                    <View className="mb-4">
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                            <Text className="text-[14px] font-black text-[#1a3a7c] mb-4">Review Application</Text>
                            <ReviewSection title="1. Applicant & MSME Details" data={{...companyDetails, ...authPersonDetails, ...registeredAddress}} />
                            <ReviewSection title="2. Bank Details" data={bankDetails} />
                            
                            {/* 3. Uploaded Documents */}
                            <View className="mb-5 pb-4 border-b border-slate-100">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">3. Uploaded Documents</Text>
                                </View>
                                
                                <View className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                    {[
                                        ...REQUIRED_DOCUMENTS.filter(doc => {
                                            if (['udyam', 'gst', 'pan', 'aadhaar'].includes(doc.id)) return true;
                                            if (['hotelInvoice', 'hotelPayment'].includes(doc.id)) return expenseCategories.hotel_stay;
                                            if (['travelExpense', 'travelInvoice'].includes(doc.id)) return expenseCategories.travel;
                                            if (doc.id === 'courier') return expenseCategories.courier;
                                            if (doc.id === 'marketing') return expenseCategories.marketing_material;
                                            return false;
                                        }),
                                        ...BANK_DOCUMENTS
                                    ].map((doc, idx, arr) => {
                                        const uploaded = data?.documents?.find((d: any) => d.documentType === doc.id);
                                        return (
                                            <View key={doc.id} className={`flex-row items-center justify-between p-3 ${idx < arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                                <Text className="text-[12px] font-bold text-slate-700 flex-1">{doc.name}</Text>
                                                {uploaded ? (
                                                    <View className="flex-row items-center">
                                                        <Text className="text-[11px] font-bold text-[#16a34a] mr-1">Uploaded</Text>
                                                        {/* @ts-ignore */}
                                                        <CheckCircle2 size={14} color="#16a34a" />
                                                    </View>
                                                ) : (
                                                    <View className="flex-row items-center">
                                                        <Text className="text-[11px] font-bold text-red-500 mr-1">{('required' in doc && doc.required === false) ? 'Optional' : 'Pending'}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                                
                                {(data?.documents?.length || 0) < (REQUIRED_DOCUMENTS.filter(doc => {
                                    if (['udyam', 'gst', 'pan', 'aadhaar'].includes(doc.id)) return true;
                                    if (['hotelInvoice', 'hotelPayment'].includes(doc.id)) return expenseCategories.hotel_stay;
                                    if (['travelExpense', 'travelInvoice'].includes(doc.id)) return expenseCategories.travel;
                                    if (doc.id === 'courier') return expenseCategories.courier;
                                    if (doc.id === 'marketing') return expenseCategories.marketing_material;
                                    return false;
                                }).length + BANK_DOCUMENTS.filter(d => d.required).length) && (
                                    <Text className="text-red-500 text-[11px] mt-2 font-bold text-center">Please upload all required documents to proceed.</Text>
                                )}
                            </View>

                            <ReviewSection 
                                title="4. Event Participation Details" 
                                data={{
                                    "Event Name": eventDetails.event_name,
                                    "Stall Number": eventDetails.stall_number,
                                    "Hall Number": eventDetails.hall_number,
                                    "Stall Size": eventDetails.stall_size,
                                    "Participation Type": eventDetails.participation_type,
                                    "Booking Status": eventDetails.booking_status,
                                    "Payment Status": eventDetails.payment_status
                                }} 
                            />

                            <ReviewSection 
                                title="5. Claim Summary" 
                                data={{
                                    "Stall Charges": `₹ ${eventDetails.invoice_value ? eventDetails.invoice_value.toLocaleString('en-IN') : '0'}`,
                                    "Hotel Stay": expenseCategories.hotel_stay ? 'Pending' : '₹ 0',
                                    "Travel": expenseCategories.travel ? 'Pending' : '₹ 0',
                                    "Courier": expenseCategories.courier ? 'Pending' : '₹ 0',
                                    "Marketing": expenseCategories.marketing_material ? 'Pending' : '₹ 0',
                                    "Total Claimed": `₹ ${eventDetails.invoice_value ? eventDetails.invoice_value.toLocaleString('en-IN') : '0'}`,
                                    "Indicative Eligible Claim": `₹ ${eventDetails.invoice_value ? eventDetails.invoice_value.toLocaleString('en-IN') : '0'}`
                                }} 
                            />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Footer Actions */}
            {!isApproved && (
                <View className="bg-white p-4 border-t border-slate-200 flex-row justify-between absolute bottom-0 w-full pb-8">
                    {currentStep > 1 ? (
                        <TouchableOpacity 
                            onPress={() => setCurrentStep(currentStep - 1)}
                            className="bg-slate-100 px-6 py-3.5 rounded-xl border border-slate-200 flex-1 mr-2 items-center"
                        >
                            <Text className="text-slate-700 font-black">Back</Text>
                        </TouchableOpacity>
                    ) : <View className="flex-1 mr-2" />}

                    {currentStep < 4 ? (
                        <TouchableOpacity 
                            onPress={handleNext}
                            disabled={saving}
                            className={`bg-[#1a3a7c] px-6 py-3.5 rounded-xl flex-row justify-center items-center flex-1 ml-2 ${saving ? 'opacity-70' : ''}`}
                        >
                            {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                                <>
                                    <Text className="text-white font-black mr-2">Save & Next</Text>
                                    {/* @ts-ignore */}
                                    <ChevronRight size={18} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            onPress={handleSubmit}
                            disabled={saving}
                            className={`bg-green-600 px-6 py-3.5 rounded-xl flex-row justify-center items-center flex-1 ml-2 ${saving ? 'opacity-70' : ''}`}
                        >
                            {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                                <Text className="text-white font-black">Submit Application</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

function InputField({ label, value, onChange, keyboardType = 'default', disabled = false }: any) {
    return (
        <View className="mb-4">
            <Text className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                editable={!disabled}
                className={`bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-800 text-[14px] ${disabled ? 'opacity-70 bg-slate-100' : ''}`}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor="#cbd5e1"
            />
        </View>
    );
}

function ReviewSection({ title, data, onEdit }: any) {
    return (
        <View className="mb-5 pb-4 border-b border-slate-100">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">{title}</Text>
                {onEdit && (
                    <TouchableOpacity onPress={onEdit}>
                        <Text className="text-blue-600 font-bold text-[12px]">Edit</Text>
                    </TouchableOpacity>
                )}
            </View>
            {Object.entries(data).map(([key, val]: any) => (
                <View key={key} className="flex-row mb-2">
                    <Text className="text-[13px] text-slate-500 capitalize w-[40%]">{key.replace(/_/g, ' ')}</Text>
                    <Text className="text-[13px] text-slate-400 mr-2">:</Text>
                    <Text className="text-[13px] font-bold text-slate-800 flex-1 text-left">{val || '-'}</Text>
                </View>
            ))}
        </View>
    );
}
