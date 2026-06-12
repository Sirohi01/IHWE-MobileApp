import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, ChevronLeft, CheckCircle2, Clock, XCircle, AlertCircle, UploadCloud, Download, Trash2, Search } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { apiClient } from '@/core/api/axios';

type DocStatus = "Approved" | "Under Review" | "Rejected" | "Pending Upload";
type DocCategory = "MSME Related" | "General Documents";

interface Doc {
  id: string;
  title: string;
  type: string;
  size: string;
  date: string;
  category: DocCategory;
  status: DocStatus;
  uploadedBy: string;
  uploadDate: string;
  feedback?: string;
  previewUrl?: string;
  originalPdfUrl?: string;
}

const StatusConfig = {
  "Approved": { color: "#059669", bg: "#d1fae5", text: "text-emerald-700" },
  "Under Review": { color: "#d97706", bg: "#fef3c7", text: "text-amber-700" },
  "Rejected": { color: "#dc2626", bg: "#fee2e2", text: "text-red-700" },
  "Pending Upload": { color: "#64748b", bg: "#f1f5f9", text: "text-slate-600" },
};

export default function DocumentCenterScreen() {
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All Documents");
  const [clientId, setClientId] = useState<string | null>(null);
  const [exhibitorName, setExhibitorName] = useState<string | null>(null);

  // Stats
  const totalCount = docs.length;
  const approvedCount = docs.filter(d => d.status === "Approved").length;
  const pendingCount = docs.filter(d => d.status === "Under Review" || d.status === "Pending Upload").length;
  const rejectedCount = docs.filter(d => d.status === "Rejected").length;

  const filteredDocs = docs.filter(doc => activeTab === "All Documents" || doc.category === activeTab);

  const fetchProfileAndDocs = async () => {
    try {
      setLoading(true);
      const profRes = await apiClient.get('/exhibitor-auth/dashboard');
      if (profRes.data?.data) {
        const exhId = profRes.data.data._id;
        setClientId(exhId);
        setExhibitorName(profRes.data.data.exhibitorName || 'Exhibitor');
        await fetchDocs(exhId);
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
      Alert.alert("Error", "Could not load exhibitor profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocs = async (cId: string) => {
    try {
      const SERVER_URL = apiClient.defaults.baseURL?.replace('/api', '') || '';
      
      const [reqRes, docsRes] = await Promise.all([
        apiClient.get('/document-requirements'),
        apiClient.get(`/client-documents/${cId}`)
      ]);
      
      const reqData = reqRes.data;
      const docsData = docsRes.data;

      if (Array.isArray(reqData)) {
        const uploadedMap = new Map();
        if (Array.isArray(docsData)) {
          docsData.forEach((d: any) => uploadedMap.set(d.document_name, d));
        }

        const formatted = reqData.map((d: any) => {
          const uploaded = uploadedMap.get(d.document_name);
          return {
            id: uploaded?._id || d._id || d.id,
            title: d.document_name,
            type: uploaded?.file_type || "PDF",
            size: uploaded?.size || "-",
            date: uploaded ? new Date(uploaded.updated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
            category: (d.category === "MSME Related Documents" ? "MSME Related" : "General Documents") as DocCategory,
            status: (uploaded?.status === "Approved" ? "Approved" : uploaded?.status === "Rejected" ? "Rejected" : uploaded?.status === "Pending" ? "Under Review" : "Pending Upload") as DocStatus,
            uploadedBy: uploaded?.uploaded_by || "-",
            uploadDate: uploaded ? new Date(uploaded.added).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-",
            originalPdfUrl: uploaded?.file_url ? (uploaded.file_url.startsWith('http') ? uploaded.file_url : `${SERVER_URL}${uploaded.file_url}`) : undefined,
            feedback: uploaded?.feedback
          };
        });
        setDocs(formatted);
      }
    } catch(e) {
      console.error("Failed to fetch documents", e);
      Alert.alert("Error", "Could not load documents");
    }
  };

  useEffect(() => {
    fetchProfileAndDocs();
  }, []);

  const getDocumentUrl = (url: string | undefined) => {
    if (!url) return '#';
    let validUrl = url;
    const SERVER_URL = apiClient.defaults.baseURL?.replace('/api', '') || '';
    if (!validUrl.startsWith('http')) {
      validUrl = `${SERVER_URL}${validUrl}`;
    }
    if (validUrl.includes('cloudinary.com') && validUrl.startsWith('http://')) {
      validUrl = validUrl.replace('http://', 'https://');
    }
    return validUrl;
  };

  const handleUpload = async (doc: Doc) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return;
      if (!clientId) {
        Alert.alert("Error", "Client ID is missing.");
        return;
      }

      const file = result.assets[0];
      
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf'
      } as any);
      
      formData.append('client_id', clientId);
      formData.append('document_name', doc.title);
      formData.append('category', doc.category === "MSME Related" ? "MSME Related Documents" : "General Documents");
      formData.append('uploaded_by', exhibitorName || 'Exhibitor');

      const res = await apiClient.post('/client-documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200 || res.status === 201) {
        Alert.alert("Success", "Document uploaded successfully.");
        await fetchDocs(clientId);
      } else {
        Alert.alert("Error", "Failed to upload document.");
      }
    } catch (e: any) {
      console.error("Upload error", e);
      Alert.alert("Error", e.response?.data?.message || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (doc: Doc) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to remove this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await apiClient.delete(`/client-documents/${doc.id}`);
              Alert.alert("Deleted", "Document has been removed.");
              if (clientId) await fetchDocs(clientId);
            } catch (e) {
              console.error("Delete error", e);
              Alert.alert("Error", "Failed to delete document.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const StatCard = ({ title, count, icon: Icon, color, bg }: any) => (
    <View className="bg-white p-3 rounded-xl mr-2 shadow-sm flex-row items-center min-w-[110px]" style={{ shadowColor: '#94a3b8', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
      <View style={{ backgroundColor: bg }} className="w-8 h-8 rounded-full items-center justify-center mr-2">
        {/* @ts-ignore */}
        <Icon size={14} color={color} />
      </View>
      <View>
        <Text className="text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-0.5">{title}</Text>
        <Text className="text-[#0f172a] font-black text-lg tracking-tight leading-none">{count}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-5 flex-row items-center justify-between border-b border-slate-200 shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
            {/* @ts-ignore */}
            <ChevronLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text className="text-[#0f172a] font-black text-[18px] tracking-tight">Document Center</Text>
            <Text className="text-slate-500 font-medium text-[11px]">Manage MSME & General Documents</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-slate-500 mt-2 font-medium">Loading documents...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Stats Row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mt-4">
            <StatCard title="Total" count={totalCount} icon={FileText} color="#0ea5e9" bg="#e0f2fe" />
            <StatCard title="Approved" count={approvedCount} icon={CheckCircle2} color="#059669" bg="#d1fae5" />
            <StatCard title="Pending" count={pendingCount} icon={Clock} color="#d97706" bg="#fef3c7" />
            <StatCard title="Rejected" count={rejectedCount} icon={XCircle} color="#dc2626" bg="#fee2e2" />
          </ScrollView>

          {/* Tabs */}
          <View className="px-5 mt-2 mb-3">
            <View className="flex-row bg-slate-200/60 p-1 rounded-xl">
              {["All Documents", "MSME Related", "General Documents"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[
                      { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
                      isActive ? { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 } : { backgroundColor: 'transparent' }
                    ]}
                  >
                    <Text style={[
                      { fontSize: 11, fontWeight: 'bold' },
                      isActive ? { color: '#0f172a' } : { color: '#64748b' }
                    ]}>
                      {tab.replace(' Documents', '').replace(' Related', '')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* List */}
          <View className="px-5">
            {filteredDocs.length === 0 ? (
              <View className="items-center justify-center bg-white p-8 rounded-2xl border border-slate-100">
                {/* @ts-ignore */}
                <FileText size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
                <Text className="text-slate-400 font-bold">No documents found</Text>
              </View>
            ) : (
              filteredDocs.map((doc, idx) => {
                const conf = StatusConfig[doc.status];
                return (
                  <View key={doc.id || idx} className="bg-white p-4 rounded-2xl mb-3 shadow-sm flex-col" style={{ shadowColor: '#94a3b8', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 pr-4 flex-row items-start">
                        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3`} style={{ backgroundColor: doc.category === 'MSME Related' ? '#eff6ff' : '#f5f3ff' }}>
                          {/* @ts-ignore */}
                          <FileText size={18} color={doc.category === 'MSME Related' ? '#3b82f6' : '#8b5cf6'} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[#0f172a] font-black text-[14px] leading-snug tracking-tight mb-1">{doc.title}</Text>
                          <Text className="text-slate-500 font-bold text-[10px]">{doc.category}</Text>
                        </View>
                      </View>
                      <View style={{ backgroundColor: conf.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ fontSize: 9, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }} className={conf.text}>{doc.status}</Text>
                      </View>
                    </View>

                    {/* Feedback if Rejected */}
                    {doc.status === 'Rejected' && doc.feedback && (
                      <View className="bg-red-50/80 border border-red-100 p-3 rounded-lg mb-3 flex-row items-start">
                        {/* @ts-ignore */}
                        <AlertCircle size={14} color="#dc2626" style={{ marginTop: 2, marginRight: 6 }} />
                        <View className="flex-1">
                          <Text className="text-red-800 font-black text-[10px] uppercase tracking-wider mb-0.5">Admin Feedback</Text>
                          <Text className="text-red-700 text-[11px] leading-relaxed font-medium">{doc.feedback}</Text>
                        </View>
                      </View>
                    )}

                    <View className="flex-row items-center mb-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
                      <View className="flex-1 border-r border-slate-200/50 pr-2">
                        <Text className="text-slate-400 text-[9px] uppercase font-bold tracking-widest mb-0.5">Uploaded</Text>
                        <Text className="text-slate-800 font-black text-[11px] tracking-tight">{doc.uploadDate}</Text>
                      </View>
                      <View className="flex-1 pl-3">
                        <Text className="text-slate-400 text-[9px] uppercase font-bold tracking-widest mb-0.5">Type & Size</Text>
                        <Text className="text-slate-800 font-black text-[11px] tracking-tight">{doc.type} • {doc.size}</Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-2 pt-1">
                      {doc.status === 'Under Review' || doc.status === 'Approved' ? (
                        <>
                          <TouchableOpacity
                            className="flex-1 bg-white border border-slate-200 py-2.5 rounded-lg items-center justify-center flex-row shadow-sm"
                            onPress={() => Linking.openURL(getDocumentUrl(doc.originalPdfUrl))}
                          >
                            {/* @ts-ignore */}
                            <Search size={14} color="#64748b" style={{ marginRight: 6 }} />
                            <Text className="text-slate-600 font-black text-[12px] tracking-tight">View</Text>
                          </TouchableOpacity>
                          {doc.status === 'Under Review' && (
                            <TouchableOpacity
                              className="flex-1 bg-red-50 border border-red-100 py-2.5 rounded-lg items-center justify-center flex-row shadow-sm"
                              onPress={() => handleDelete(doc)}
                            >
                              {/* @ts-ignore */}
                              <Trash2 size={14} color="#dc2626" style={{ marginRight: 6 }} />
                              <Text className="text-red-600 font-black text-[12px] tracking-tight">Delete</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      ) : (
                        <TouchableOpacity
                          className="flex-1 bg-[#1a3a7c] py-2.5 rounded-lg items-center justify-center flex-row shadow-sm shadow-blue-900/20"
                          onPress={() => handleUpload(doc)}
                        >
                          {/* @ts-ignore */}
                          <UploadCloud size={16} color="#ffffff" style={{ marginRight: 6 }} />
                          <Text className="text-white font-black text-[12px] tracking-tight">
                            {doc.status === 'Pending Upload' ? 'Upload Document' : 'Re-upload Document'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
