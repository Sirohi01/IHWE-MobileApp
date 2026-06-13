import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Edit3, Trash2, Box, Eye, MessageSquare, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';
import * as ImagePicker from 'expo-image-picker';
import { imageUrl } from '@/core/config/env';

export default function MyProductsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        priceUnit: 'per piece',
        moq: '',
        description: '',
        isActive: true,
    });
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]); // For edits

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, statRes] = await Promise.all([
                apiClient.get('/stall-products/my'),
                apiClient.get('/stall-products/analytics/summary')
            ]);
            
            if (prodRes.data && prodRes.data.data) {
                setProducts(prodRes.data.data);
            }
            if (statRes.data && statRes.data.data) {
                setAnalytics(statRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handlePickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 8 - (existingImages.length + selectedImages.length),
            quality: 0.7,
        });

        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            setSelectedImages([...selectedImages, ...newUris]);
        }
    };

    const removeSelectedImage = (index: number) => {
        const updated = [...selectedImages];
        updated.splice(index, 1);
        setSelectedImages(updated);
    };

    const removeExistingImage = (index: number) => {
        const updated = [...existingImages];
        updated.splice(index, 1);
        setExistingImages(updated);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', category: '', price: '', priceUnit: 'per piece', moq: '', description: '', isActive: true });
        setSelectedImages([]);
        setExistingImages([]);
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            category: product.category || '',
            price: product.price ? product.price.toString() : '',
            priceUnit: product.priceUnit || 'per piece',
            moq: product.moq || '',
            description: product.description || '',
            isActive: product.isActive !== undefined ? product.isActive : true,
        });
        setExistingImages(product.images || []);
        setSelectedImages([]);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/stall-products/${id}`);
                            fetchData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete product");
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            Alert.alert("Required", "Product name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('category', formData.category);
            payload.append('price', formData.price || '0');
            payload.append('priceUnit', formData.priceUnit);
            payload.append('moq', formData.moq);
            payload.append('description', formData.description);
            payload.append('isActive', String(formData.isActive));

            if (editingProduct) {
                payload.append('existingImages', JSON.stringify(existingImages));
            }

            selectedImages.forEach((uri, index) => {
                const filename = uri.split('/').pop() || `image_${index}.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                // @ts-ignore
                payload.append('images', { uri, name: filename, type });
            });

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editingProduct) {
                await apiClient.put(`/stall-products/${editingProduct._id}`, payload, config);
            } else {
                await apiClient.post(`/stall-products`, payload, config);
            }

            Alert.alert("Success", `Product ${editingProduct ? 'updated' : 'added'} successfully`);
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error("Submit error", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to save product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return "";
        return imageUrl(imagePath);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#f4f7f9] items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-slate-500 font-bold">Loading Products...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f4f7f9]">
            {/* Header */}
            <View className="w-full bg-white pt-14 pb-4 px-6 border-b border-slate-200 shadow-sm z-10 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <ChevronLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">Catalog</Text>
                        <Text className="text-slate-800 font-black text-[20px] tracking-tight">My Products</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={openAddModal}
                    className="bg-blue-50 px-4 py-2 rounded-xl flex-row items-center border border-blue-100"
                >
                    <Plus size={14} color="#2563eb" className="mr-1" />
                    <Text className="text-blue-600 font-black text-[12px] uppercase tracking-wider">Add</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Analytics Summary */}
                {analytics && (
                    <View className="bg-white rounded-2xl flex-row shadow-sm border border-slate-100 mb-5">
                        <View className="flex-1 py-4 items-center justify-center border-r border-slate-100">
                            <Box size={16} color="#3b82f6" className="mb-1.5" />
                            <Text className="text-[20px] font-black text-slate-800 leading-tight">{analytics.totalProducts || 0}</Text>
                            <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Products</Text>
                        </View>
                        <View className="flex-1 py-4 items-center justify-center border-r border-slate-100">
                            <Eye size={16} color="#10b981" className="mb-1.5" />
                            <Text className="text-[20px] font-black text-slate-800 leading-tight">{analytics.totalViews || 0}</Text>
                            <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Views</Text>
                        </View>
                        <View className="flex-1 py-4 items-center justify-center">
                            <MessageSquare size={16} color="#f43f5e" className="mb-1.5" />
                            <Text className="text-[20px] font-black text-slate-800 leading-tight">{analytics.totalEnquiries || 0}</Text>
                            <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Enquiries</Text>
                        </View>
                    </View>
                )}

                <Text className="text-[14px] font-black text-slate-800 mb-3 ml-1">Product Catalog</Text>

                {products.length === 0 ? (
                    <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm mt-4">
                        <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-4">
                            <Box size={32} color="#cbd5e1" />
                        </View>
                        <Text className="text-[16px] font-black text-slate-700 mb-2">No products added yet</Text>
                        <Text className="text-[13px] text-slate-500 text-center mb-6">Showcase your offerings to buyers by adding your first product or service.</Text>
                        <TouchableOpacity onPress={openAddModal} className="bg-blue-50 px-6 py-2.5 rounded-xl border border-blue-100 mt-2">
                            <Text className="text-blue-600 font-black tracking-wider uppercase text-[11px]">Add Product Now</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    products.map((product) => (
                        <View key={product._id} className="bg-white rounded-3xl mb-4 overflow-hidden border border-slate-100 shadow-sm">
                            <View className="flex-row p-4">
                                <View className="w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden mr-4">
                                    {product.images && product.images.length > 0 ? (
                                        <Image source={{ uri: getImageUrl(product.images[0]) }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <View className="flex-1 items-center justify-center">
                                            <ImageIcon size={24} color="#cbd5e1" />
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1 justify-center">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className="text-[16px] font-black text-slate-800 flex-1" numberOfLines={2}>{product.name}</Text>
                                        <View className={`px-2 py-1 rounded-md ${product.isActive ? 'bg-emerald-100' : 'bg-slate-100'} ml-2`}>
                                            <Text className={`text-[9px] font-bold uppercase tracking-wider ${product.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                {product.isActive ? 'Active' : 'Hidden'}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {product.category && (
                                        <Text className="text-[12px] font-bold text-blue-500 mb-2">{product.category}</Text>
                                    )}
                                    
                                    {product.price > 0 && (
                                        <Text className="text-[14px] font-bold text-slate-700">₹{product.price} <Text className="text-[11px] text-slate-500 font-medium">/ {product.priceUnit}</Text></Text>
                                    )}
                                    
                                    <View className="flex-row items-center mt-3 gap-4">
                                        <View className="flex-row items-center">
                                            <Eye size={14} color="#94a3b8" className="mr-1" />
                                            <Text className="text-[12px] font-bold text-slate-500">{product.views || 0}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <MessageSquare size={14} color="#94a3b8" className="mr-1" />
                                            <Text className="text-[12px] font-bold text-slate-500">{product.enquiryCount || 0}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            
                            <View className="flex-row border-t border-slate-100">
                                <TouchableOpacity 
                                    onPress={() => openEditModal(product)}
                                    className="flex-1 py-2.5 flex-row items-center justify-center border-r border-slate-100 bg-blue-50/50"
                                >
                                    <Edit3 size={14} color="#3b82f6" className="mr-1.5" />
                                    <Text className="text-[12px] font-black uppercase tracking-wider text-blue-600">Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleDelete(product._id)}
                                    className="flex-1 py-2.5 flex-row items-center justify-center bg-rose-50/50"
                                >
                                    <Trash2 size={14} color="#f43f5e" className="mr-1.5" />
                                    <Text className="text-[12px] font-black uppercase tracking-wider text-rose-500">Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add / Edit Modal */}
            <Modal visible={isModalOpen} animationType="slide" transparent>
                <View className="flex-1 bg-slate-900/60 justify-end">
                    <View className="bg-[#f8fafc] rounded-t-[32px] h-[92%] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <View className="px-6 py-5 flex-row justify-between items-center bg-white border-b border-slate-100">
                            <View>
                                <Text className="text-[18px] font-black text-slate-800 tracking-tight">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </Text>
                                <Text className="text-[11px] font-bold text-slate-500 mt-0.5">Fill details below</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)} className="bg-slate-50 p-2 rounded-full border border-slate-200">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 100 }}>
                            
                            {/* Images Section */}
                            <Text className="text-[14px] font-black text-slate-800 mb-3">Product Images</Text>
                            <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-5 shadow-sm">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                    {existingImages.map((img, idx) => (
                                        <View key={`ext_${idx}`} className="w-20 h-20 rounded-xl overflow-hidden mr-3 relative bg-slate-100">
                                            <Image source={{ uri: getImageUrl(img) }} className="w-full h-full" />
                                            <TouchableOpacity 
                                                onPress={() => removeExistingImage(idx)}
                                                className="absolute top-1 right-1 bg-black/50 w-6 h-6 rounded-full items-center justify-center"
                                            >
                                                <X size={12} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {selectedImages.map((uri, idx) => (
                                        <View key={`sel_${idx}`} className="w-20 h-20 rounded-xl overflow-hidden mr-3 relative bg-slate-100 border-2 border-blue-200">
                                            <Image source={{ uri }} className="w-full h-full" />
                                            <TouchableOpacity 
                                                onPress={() => removeSelectedImage(idx)}
                                                className="absolute top-1 right-1 bg-black/50 w-6 h-6 rounded-full items-center justify-center"
                                            >
                                                <X size={12} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {(existingImages.length + selectedImages.length) < 8 && (
                                        <TouchableOpacity 
                                            onPress={handlePickImages}
                                            className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 items-center justify-center"
                                        >
                                            <Plus size={24} color="#94a3b8" />
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>
                                <Text className="text-[11px] font-bold text-slate-400 text-center">Add up to 8 images for your product.</Text>
                            </View>

                            {/* Details Section */}
                            <Text className="text-[14px] font-black text-slate-800 mb-3">Product Details</Text>
                            <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-5 shadow-sm">
                                
                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Product Name *</Text>
                                <TextInput 
                                    value={formData.name}
                                    onChangeText={(val) => setFormData({...formData, name: val})}
                                    placeholder="e.g. Premium Office Chair"
                                    placeholderTextColor="#cbd5e1"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] mb-4"
                                />

                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Category</Text>
                                <TextInput 
                                    value={formData.category}
                                    onChangeText={(val) => setFormData({...formData, category: val})}
                                    placeholder="e.g. Furniture"
                                    placeholderTextColor="#cbd5e1"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] mb-4"
                                />

                                <View className="flex-row gap-4 mb-4">
                                    <View className="flex-1">
                                        <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Price (₹)</Text>
                                        <TextInput 
                                            value={formData.price}
                                            onChangeText={(val) => setFormData({...formData, price: val})}
                                            placeholder="0.00"
                                            placeholderTextColor="#cbd5e1"
                                            keyboardType="numeric"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Unit</Text>
                                        <TextInput 
                                            value={formData.priceUnit}
                                            onChangeText={(val) => setFormData({...formData, priceUnit: val})}
                                            placeholder="e.g. per piece"
                                            placeholderTextColor="#cbd5e1"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px]"
                                        />
                                    </View>
                                </View>

                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">MOQ (Min. Order Qty)</Text>
                                <TextInput 
                                    value={formData.moq}
                                    onChangeText={(val) => setFormData({...formData, moq: val})}
                                    placeholder="e.g. 50 pieces"
                                    placeholderTextColor="#cbd5e1"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] mb-4"
                                />

                                <Text className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Description</Text>
                                <TextInput 
                                    value={formData.description}
                                    onChangeText={(val) => setFormData({...formData, description: val})}
                                    placeholder="Describe your product..."
                                    placeholderTextColor="#cbd5e1"
                                    multiline
                                    numberOfLines={4}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 text-[13px] text-left"
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </View>

                            <TouchableOpacity 
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-xl flex-row items-center justify-center shadow-sm bg-blue-50 border border-blue-100 mt-2 ${isSubmitting ? 'opacity-70' : ''}`}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#2563eb" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} color="#2563eb" className="mr-1.5" />
                                        <Text className="text-blue-600 font-black text-[13px] uppercase tracking-widest">
                                            {editingProduct ? 'Save Changes' : 'Create Product'}
                                        </Text>
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
