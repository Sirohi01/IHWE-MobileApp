import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';
import RenderHtml from 'react-native-render-html';

export default function PolicyScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { width } = useWindowDimensions();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchPolicy(id);
        }
    }, [id]);

    const fetchPolicy = async (policyId: string) => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get(`/policies/${policyId}`);
            
            if (response.data && response.data.success) {
                setTitle(response.data.data.title || formatTitle(policyId));
                setContent(response.data.data.content || '<p>No content available.</p>');
            } else {
                setError('Policy not found or could not be loaded.');
                setTitle(formatTitle(policyId));
            }
        } catch (err) {
            console.error('Error fetching policy:', err);
            setError('Failed to load policy. Please try again later.');
            setTitle(formatTitle(policyId));
        } finally {
            setLoading(false);
        }
    };

    const formatTitle = (slug: string) => {
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const tagsStyles = {
        body: {
            color: '#334155',
            fontSize: 14,
            lineHeight: 24,
        },
        p: {
            marginBottom: 12,
        },
        h1: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginTop: 16, marginBottom: 8 },
        h2: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 16, marginBottom: 8 },
        h3: { fontSize: 18, fontWeight: 'bold', color: '#334155', marginTop: 12, marginBottom: 6 },
        ul: { marginLeft: -15, marginBottom: 12 },
        ol: { marginLeft: -15, marginBottom: 12 },
        li: { marginBottom: 6 },
        a: { color: '#2563eb', textDecorationLine: 'underline' },
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Legal Info</Text>
                        <Text className="text-slate-800 font-black text-[18px] tracking-tight" numberOfLines={1}>
                            {title || 'Loading...'}
                        </Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center bg-slate-50">
                    <ActivityIndicator size="large" color="#0d4b27" />
                    <Text className="mt-4 text-slate-500 font-medium">Loading policy...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center bg-slate-50 px-6">
                    <Text className="text-slate-400 text-center mb-4">{error}</Text>
                    <TouchableOpacity 
                        onPress={() => id && fetchPolicy(id)}
                        className="bg-blue-600 px-6 py-2 rounded-full"
                    >
                        <Text className="text-white font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView 
                    className="flex-1 bg-slate-50" 
                    contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                >
                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <RenderHtml
                            contentWidth={width - 40}
                            source={{ html: content }}
                            /* @ts-ignore */
                            tagsStyles={tagsStyles}
                            enableExperimentalMarginCollapsing={true}
                        />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
