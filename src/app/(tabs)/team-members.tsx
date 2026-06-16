import '../../global.css';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Switch, RefreshControl, Image } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, UserPlus, Users, Mail, Phone, Briefcase, Pencil, Trash2, X, CheckCircle2, Camera, ShieldCheck } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';

type TeamMember = {
  name: string;
  designation: string;
  email: string;
  mobile: string;
  photoUrl?: string;
  isPrimary?: boolean;
};

type ContactPerson = {
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  designation?: string;
  mobile?: string;
  alternateNo?: string;
  photoUrl?: string;
};

type MemberSource = 'contact1' | 'contact2' | 'teamMember';

type DisplayMember = TeamMember & {
  source: MemberSource;
  index?: number;
  label: string;
  canDelete: boolean;
};

type EditingTarget = {
  source: MemberSource;
  index?: number;
} | null;

const emptyMember: TeamMember = {
  name: '',
  designation: '',
  email: '',
  mobile: '',
  photoUrl: '',
  isPrimary: false,
};

const hasContactData = (contact?: ContactPerson) => {
  if (!contact) return false;
  return Boolean(contact.firstName || contact.lastName || contact.email || contact.mobile || contact.designation);
};

const contactName = (contact?: ContactPerson) => {
  if (!contact) return '';
  let name = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim();
  if (typeof name === 'string') {
    name = name.replace(/^(Mr|Mrs|Ms|Dr|Prof)\.?\s+(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+/i, '$1. ');
  }
  return name;
};

const contactToMember = (contact: ContactPerson | undefined, source: 'contact1' | 'contact2'): DisplayMember => ({
  name: contactName(contact) || (source === 'contact1' ? 'Contact Person 1' : 'Contact Person 2'),
  designation: contact?.designation || '',
  email: contact?.email || '',
  mobile: contact?.mobile || '',
  photoUrl: contact?.photoUrl || '',
  isPrimary: source === 'contact1',
  source,
  label: source === 'contact1' ? 'Contact Person 1' : 'Contact Person 2',
  canDelete: false,
});

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || '', lastName: '' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
};

const cleanMember = (member: TeamMember): TeamMember => ({
  name: member.name.trim(),
  designation: member.designation.trim(),
  email: member.email.trim().toLowerCase(),
  mobile: member.mobile.trim(),
  photoUrl: member.photoUrl || '',
  isPrimary: !!member.isPrimary,
});

export default function TeamMembersScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<EditingTarget>(null);
  const [form, setForm] = useState<TeamMember>(emptyMember);

  const displayMembers = useMemo<DisplayMember[]>(() => {
    const list: DisplayMember[] = [];
    if (hasContactData(profile?.contact1)) list.push(contactToMember(profile.contact1, 'contact1'));
    if (hasContactData(profile?.contact2)) list.push(contactToMember(profile.contact2, 'contact2'));

    members.forEach((member, index) => {
      list.push({
        ...member,
        source: 'teamMember',
        index,
        label: member.isPrimary ? 'Primary Team Member' : 'Team Member',
        canDelete: true,
      });
    });

    return list;
  }, [members, profile]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await apiClient.get('/exhibitor-auth/dashboard');
      const data = res.data?.data;
      setProfile(data);
      setMembers(Array.isArray(data?.teamMembers) ? data.teamMembers : []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not load team members.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openAdd = () => {
    setEditingTarget(null);
    setForm(emptyMember);
    setModalOpen(true);
  };

  const openEdit = (member: DisplayMember) => {
    setEditingTarget({ source: member.source, index: member.index });
    setForm({
      name: member.name || '',
      designation: member.designation || '',
      email: member.email || '',
      mobile: member.mobile || '',
      photoUrl: member.photoUrl || '',
      isPrimary: !!member.isPrimary,
    });
    setModalOpen(true);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setForm((prev) => ({ ...prev, photoUrl: result.assets[0].uri }));
    }
  };

  const uploadPhotoIfNeeded = async (member: TeamMember) => {
    if (!member.photoUrl || member.photoUrl.startsWith('http')) return member.photoUrl || '';

    const fileName = member.photoUrl.split('/').pop() || `team-member-${Date.now()}.jpg`;
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
    const formData = new FormData();
    formData.append('photo', {
      uri: member.photoUrl,
      name: fileName,
      type: mimeType,
    } as any);

    setUploadingPhoto(true);
    try {
      const res = await apiClient.post('/exhibitor-auth/team-member-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.photoUrl || '';
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveProfile = async (payload: Record<string, any>, successMessage: string) => {
    if (!profile?._id) return;
    setSaving(true);
    try {
      const response = await apiClient.put(`/exhibitor-auth/update-profile?id=${profile._id}`, payload);
      const updated = response.data?.data;
      setProfile(updated);
      setMembers(Array.isArray(updated?.teamMembers) ? updated.teamMembers : []);
      setModalOpen(false);
      Alert.alert('Success', successMessage);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not save details.');
    } finally {
      setSaving(false);
    }
  };

  const buildContactPayload = (source: 'contact1' | 'contact2', member: TeamMember) => {
    const existing = profile?.[source] || {};
    const { firstName, lastName } = splitName(member.name);
    return {
      ...existing,
      firstName,
      lastName,
      email: member.email,
      designation: member.designation,
      mobile: member.mobile,
      photoUrl: member.photoUrl || '',
    };
  };

  const handleSubmit = async () => {
    let member = cleanMember(form);
    if (!member.name || !member.designation || !member.email || !member.mobile) {
      Alert.alert('Required Fields', 'Please enter name, designation, email, and mobile number.');
      return;
    }

    try {
      const photoUrl = await uploadPhotoIfNeeded(member);
      member = { ...member, photoUrl };
    } catch (error: any) {
      Alert.alert('Photo Upload Failed', error.response?.data?.message || 'Could not upload photo.');
      return;
    }

    if (editingTarget?.source === 'contact1' || editingTarget?.source === 'contact2') {
      saveProfile(
        { [editingTarget.source]: buildContactPayload(editingTarget.source, member) },
        editingTarget.source === 'contact1' ? 'Contact Person 1 updated.' : 'Contact Person 2 updated.'
      );
      return;
    }

    const nextMembers = [...members];
    if (member.isPrimary) {
      nextMembers.forEach((item) => { item.isPrimary = false; });
    }

    if (!editingTarget) nextMembers.push(member);
    else nextMembers[editingTarget.index ?? 0] = member;

    saveProfile(
      { teamMembers: nextMembers.map(cleanMember) },
      !editingTarget ? 'Team member added.' : 'Team member updated.'
    );
  };

  const deleteMember = (index: number) => {
    Alert.alert('Remove Team Member', 'Are you sure you want to remove this team member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const nextMembers = members.filter((_, itemIndex) => itemIndex !== index);
          saveProfile({ teamMembers: nextMembers.map(cleanMember) }, 'Team member removed.');
        },
      },
    ]);
  };

  const isEditingContact = editingTarget?.source === 'contact1' || editingTarget?.source === 'contact2';

  if (loading) {
    return (
      <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Team...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      <View className="bg-white pt-14 pb-4 px-5 border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-slate-50 rounded-full items-center justify-center border border-slate-200 mr-3">
              <ChevronLeft size={20} color="#334155" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-[#1a3a7c] font-black text-xl">Team Members</Text>
              <Text className="text-slate-500 text-xs">{displayMembers.length} contact/team member records</Text>
            </View>
          </View>
          <TouchableOpacity onPress={openAdd} className="bg-[#1a3a7c] px-3 py-2 rounded-xl flex-row items-center">
            <UserPlus size={15} color="#ffffff" />
            <Text className="text-white font-black text-xs ml-1.5">Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(false); }} />}
      >
        {displayMembers.length === 0 ? (
          <View className="bg-white border border-slate-200 rounded-2xl p-8 items-center">
            <Users size={36} color="#94a3b8" />
            <Text className="text-slate-800 font-black mt-3">No contacts added</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">Add staff members who will represent your stall during the event.</Text>
            <TouchableOpacity onPress={openAdd} className="mt-5 bg-[#1a3a7c] px-5 py-3 rounded-xl flex-row items-center">
              <UserPlus size={16} color="#ffffff" />
              <Text className="text-white font-black text-xs ml-2 uppercase tracking-wider">Add Team Member</Text>
            </TouchableOpacity>
          </View>
        ) : displayMembers.map((member, listIndex) => (
          <View key={`${member.source}-${member.index ?? listIndex}`} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-3">
            <View className="flex-row items-start">
              <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center border border-blue-100 mr-3 overflow-hidden">
                {member.photoUrl ? (
                  <Image source={{ uri: member.photoUrl }} className="w-full h-full" />
                ) : (
                  <Text className="text-[#1a3a7c] font-black">{(member.name || 'T').charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-slate-900 font-black text-[15px] mr-2">{member.name || 'Team Member'}</Text>
                  {member.isPrimary && (
                    <View className="bg-amber-50 border border-amber-100 rounded px-2 py-0.5">
                      <Text className="text-amber-700 text-[9px] font-black uppercase">Primary</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center mt-1">
                  {member.source === 'teamMember' ? <Briefcase size={12} color="#64748b" /> : <ShieldCheck size={12} color="#64748b" />}
                  <Text className="text-slate-500 text-xs font-semibold ml-1.5">{member.label}</Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <Briefcase size={12} color="#64748b" />
                  <Text className="text-slate-500 text-xs font-semibold ml-1.5">{member.designation || 'Designation not set'}</Text>
                </View>
              </View>
              <View className="flex-row">
                <TouchableOpacity onPress={() => openEdit(member)} className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-200 mr-1">
                  <Pencil size={14} color="#334155" />
                </TouchableOpacity>
                {member.canDelete && member.index !== undefined && (
                  <TouchableOpacity onPress={() => deleteMember(member.index!)} className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-100">
                    <Trash2 size={14} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View className="bg-slate-50 rounded-xl p-3 mt-3">
              <View className="flex-row items-center mb-2">
                <Mail size={13} color="#64748b" />
                <Text className="text-slate-600 text-xs font-bold ml-2">{member.email || 'Email not set'}</Text>
              </View>
              <View className="flex-row items-center">
                <Phone size={13} color="#64748b" />
                <Text className="text-slate-600 text-xs font-bold ml-2">{member.mobile || 'Mobile not set'}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-slate-900/60 justify-end">
          <View className="bg-[#f8fafc] rounded-t-[28px] max-h-[88%]">
            <View className="bg-white px-5 py-4 rounded-t-[28px] border-b border-slate-100 flex-row items-center justify-between">
              <View>
                <Text className="text-slate-900 font-black text-lg">
                  {!editingTarget ? 'Add Team Member' : isEditingContact ? 'Edit Contact Person' : 'Edit Team Member'}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  {isEditingContact ? 'This updates Client Overview contact details too' : 'Keep event staff details updated'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalOpen(false)} className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 items-center justify-center">
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-5" contentContainerStyle={{ paddingBottom: 30 }}>
              <View className="items-center mb-5">
                <View className="w-24 h-24 rounded-full bg-blue-50 border border-blue-100 items-center justify-center overflow-hidden">
                  {form.photoUrl ? (
                    <Image source={{ uri: form.photoUrl }} className="w-full h-full" />
                  ) : (
                    <Users size={34} color="#94a3b8" />
                  )}
                </View>
                <TouchableOpacity onPress={pickPhoto} className="mt-3 bg-white border border-slate-200 px-4 py-2 rounded-xl flex-row items-center">
                  <Camera size={15} color="#1a3a7c" />
                  <Text className="text-[#1a3a7c] font-black text-xs ml-2 uppercase tracking-wider">
                    {form.photoUrl ? 'Change Photo' : 'Add Photo'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Input label="Full Name" value={form.name} onChangeText={(name: string) => setForm({ ...form, name })} placeholder="Enter name" />
              <Input label="Designation" value={form.designation} onChangeText={(designation: string) => setForm({ ...form, designation })} placeholder="e.g. Sales Manager" />
              <Input label="Email" value={form.email} onChangeText={(email: string) => setForm({ ...form, email })} placeholder="Enter email address" keyboardType="email-address" autoCapitalize="none" />
              <Input label="Mobile Number" value={form.mobile} onChangeText={(mobile: string) => setForm({ ...form, mobile })} placeholder="Enter mobile number" keyboardType="phone-pad" />

              {!isEditingContact && (
                <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-slate-800 font-black text-sm">Mark as primary team member</Text>
                    <Text className="text-slate-400 text-xs mt-1">Only one added team member can be primary.</Text>
                  </View>
                  <Switch value={!!form.isPrimary} onValueChange={(isPrimary) => setForm({ ...form, isPrimary })} />
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={saving || uploadingPhoto}
                className={`bg-[#1a3a7c] rounded-2xl py-4 flex-row items-center justify-center ${saving ? 'opacity-70' : ''}`}
              >
                {saving || uploadingPhoto ? <ActivityIndicator color="#ffffff" /> : <CheckCircle2 size={18} color="#ffffff" />}
                {!saving && !uploadingPhoto && <Text className="text-white font-black text-xs ml-2 uppercase tracking-wider">Save Details</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Input({ label, ...props }: any) {
  return (
    <View className="mb-4">
      <Text className="text-slate-500 text-[11px] font-black uppercase tracking-wider mb-2">{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#94a3b8"
        className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 font-bold text-sm"
      />
    </View>
  );
}
