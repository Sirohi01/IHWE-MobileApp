import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput, Alert, Modal, FlatList } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/core/api/axios';
import { ChevronLeft, Search, ShoppingCart, LayoutGrid, Zap, Megaphone, Monitor, Wrench, Coffee, Users, Plus, Minus, Trash2, CheckCircle2, ChevronRight, FileText, Image as ImageIcon, Info, Store, Gift } from 'lucide-react-native';
import { imageUrl } from '@/core/config/env';
import { RazorpayWebView } from '@/components/dashboard/RazorpayWebView';

interface CartItem {
  accessoryId: string;
  name: string;
  type: string;
  qty: number;
  unitPrice: number;
  gstPercent: number;
  imageUrl?: string;
  availableQty?: number;
}

const ICONS_MAP: Record<string, any> = {
  'Furniture': LayoutGrid,
  'Electrical': Zap,
  'Branding': Megaphone,
  'Technology': Monitor,
  'Utilities': Wrench,
  'Hospitality': Coffee,
  'Manpower': Users,
  'Default': LayoutGrid
};

export default function AddOnServicesScreen() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showComplementary, setShowComplementary] = useState(false);
  const [paying, setPaying] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Items');
  const [exhibitorData, setExhibitorData] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [activeTab, searchQuery]);

  // Razorpay state
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [rzpOrder, setRzpOrder] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('exhibitorToken');

      // Get exhibitor profile
      const profRes = await apiClient.get('/exhibitor-auth/dashboard');
      let exhId = '';
      if (profRes.data.success) {
        setExhibitorData(profRes.data.data);
        exhId = profRes.data.data._id;
      }

      // Get catalog
      const catRes = await fetch(`${apiClient.defaults.baseURL}/stall-accessories/accessories`);
      const catData = await catRes.json();
      if (catData.data) {
        setCatalog(catData.data);
      }

      // Get orders
      if (exhId && token) {
        const ordRes = await fetch(`${apiClient.defaults.baseURL}/stall-accessories/orders?exhibitorId=${exhId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordData = await ordRes.json();
        if (ordData.data) {
          setOrders(ordData.data);
        }
      }
    } catch (err) {
      console.log('Error fetching add-ons', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    const available = item.availableQty || 0;
    if (available <= 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }

    setCart(prev => {
      const exists = prev.find(c => c.accessoryId === item._id);
      if (exists) {
        if (exists.qty >= available) {
          Alert.alert('Limit Reached', `Maximum available quantity reached (${available})`);
          return prev;
        }
        return prev.map(c => c.accessoryId === item._id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, {
        accessoryId: item._id,
        name: item.name,
        type: item.type,
        availableQty: available,
        qty: 1,
        unitPrice: item.price || 0,
        gstPercent: item.gstPercent || 18,
        imageUrl: item.imageUrl
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.accessoryId === id) {
        const newQty = c.qty + delta;
        if (delta > 0 && newQty > (c.availableQty || 0)) {
          Alert.alert('Limit Reached', `Maximum available quantity reached (${c.availableQty})`);
          return c;
        }
        return { ...c, qty: Math.max(1, newQty) };
      }
      return c;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.accessoryId !== id));

  const cartBaseTotal = cart.reduce((sum, c) => sum + (c.unitPrice * c.qty), 0);
  const cartGstTotal = cart.reduce((sum, c) => sum + ((c.unitPrice * c.qty * c.gstPercent) / 100), 0);
  const cartTotal = cartBaseTotal + cartGstTotal;
  const gatewayFee = Math.round(cartTotal * 2.5) / 100;
  const cartTotalWithFee = Math.round((cartTotal * 1.025) * 100) / 100;
  const totalCartQty = cart.reduce((s, c) => s + c.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setPaying(true);
    try {
      const token = await SecureStore.getItemAsync('exhibitorToken');
      const orderRes = await fetch(`${apiClient.defaults.baseURL}/stall-accessories/create-payment-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: cartTotalWithFee }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        Alert.alert('Error', orderData.message || 'Failed to create order');
        setPaying(false);
        return;
      }

      setRzpOrder(orderData.order);
      setShowRazorpay(true);
      setShowCart(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Checkout failed');
      setPaying(false);
    }
  };

  const onPaymentSuccess = async (response: any) => {
    setShowRazorpay(false);
    try {
      const token = await SecureStore.getItemAsync('exhibitorToken');
      const verifyRes = await fetch(`${apiClient.defaults.baseURL}/stall-accessories/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          exhibitorRegistrationId: exhibitorData?._id,
          items: cart,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        Alert.alert('Success', 'Payment successful! Receipt sent to your email.');
        setCart([]);
        fetchData();
      } else {
        Alert.alert('Payment Verification Failed', verifyData.message || 'Please contact support.');
      }
    } catch (err) {
      Alert.alert('Error', 'Payment verification failed. Contact support.');
    } finally {
      setPaying(false);
    }
  };

  const onPaymentFailed = (error: any) => {
    setShowRazorpay(false);
    setPaying(false);
    Alert.alert('Payment Failed', error?.description || 'The payment was not completed.');
    setShowCart(true); // Re-open cart
  };

  const onPaymentClosed = () => {
    setShowRazorpay(false);
    setPaying(false);
    setShowCart(true);
  };

  const purchasableItems = catalog.filter(i => i.type === 'purchasable' && i.isActive);
  const complementaryItems = catalog.filter(i => i.type === 'complimentary' && i.isActive);

  let filteredItems = purchasableItems;
  if (activeTab !== 'All Items') {
    filteredItems = filteredItems.filter(i => i.category === activeTab);
  }
  if (searchQuery) {
    filteredItems = filteredItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const SERVER_URL = apiClient.defaults.baseURL?.replace('/api', '') || '';

  if (loading && !catalog.length) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator size="large" color="#1a3a7c" />
        <Text className="text-[#1a3a7c] font-bold text-[12px] mt-4 tracking-widest uppercase">Loading Catalog...</Text>
      </View>
    );
  }

  const loadMore = () => {
    if (visibleCount < filteredItems.length) {
      setVisibleCount(prev => prev + 12);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const inCart = cart.find(c => c.accessoryId === item._id);

    let finalImageUrl = item.imageUrl ? imageUrl(item.imageUrl) : null;
    if (finalImageUrl) {

      finalImageUrl = finalImageUrl.replace(/ /g, '%20');
    }
    return (
      <View className="bg-white w-[48%] rounded-xl mb-3 shadow-sm border border-slate-200 overflow-hidden">
        <View className="h-28 bg-slate-50 relative border-b border-slate-100 items-center justify-center p-2">
          {finalImageUrl ? (
            <Image source={{ uri: finalImageUrl }} className="w-full h-full" resizeMode="contain" />
          ) : (
            // @ts-ignore
            <ImageIcon size={30} color="#cbd5e1" />
          )}
          {item.label && (
            <View className="absolute top-2 left-2 bg-[#16a34a] px-1.5 py-0.5 rounded shadow-sm">
              <Text className="text-white text-[8px] font-black uppercase tracking-widest">{item.label}</Text>
            </View>
          )}
        </View>
        <View className="p-2.5">
          <Text className="text-slate-800 font-bold text-[11px] mb-1" numberOfLines={2}>{item.name}</Text>
          <View className="flex-row items-baseline mb-2">
            <Text className="text-[#1a3a7c] font-black text-[13px] mr-1">{fmt(item.price)}</Text>
            <Text className="text-slate-400 font-bold text-[8px]">/{item.unit || 'Unit'}</Text>
          </View>

          {inCart ? (
            <View className="flex-row items-center justify-between bg-blue-50 border border-blue-200 rounded-lg h-8 px-1">
              <TouchableOpacity onPress={() => updateQty(item._id, -1)} className="w-8 h-full items-center justify-center">
                {/* @ts-ignore */}
                <Minus size={14} color="#1a3a7c" />
              </TouchableOpacity>
              <Text className="font-black text-[#1a3a7c] text-[12px]">{inCart.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(item._id, 1)} className="w-8 h-full items-center justify-center">
                {/* @ts-ignore */}
                <Plus size={14} color="#1a3a7c" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => addToCart(item)}
              disabled={(item.availableQty || 0) <= 0}
              className={`flex-row items-center justify-center h-8 rounded-lg border ${(item.availableQty || 0) <= 0 ? 'bg-slate-100 border-slate-200' : 'bg-white border-[#1a3a7c]'
                }`}
            >
              {/* @ts-ignore */}
              <ShoppingCart size={12} color={(item.availableQty || 0) <= 0 ? "#94a3b8" : "#1a3a7c"} className="mr-1" />
              <Text className={`text-[10px] font-bold ${(item.availableQty || 0) <= 0 ? 'text-slate-400' : 'text-[#1a3a7c]'}`}>
                {(item.availableQty || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#f4f7f9]">
      {/* Header */}
      <View className="bg-[#1a3a7c] pt-14 pb-4 px-5 z-10 relative overflow-hidden">
        <View className="absolute right-[-40px] top-[-20px] w-40 h-40 rounded-full border-[15px] border-white/10" />
        <View className="flex-row items-center justify-between mb-4 z-10">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
              {/* @ts-ignore */}
              <ChevronLeft size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-black tracking-wider">Add On Services</Text>
          </View>
          <TouchableOpacity onPress={() => setShowCart(true)} className="relative w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            {/* @ts-ignore */}
            <ShoppingCart size={20} color="white" />
            {totalCartQty > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center border-2 border-[#1a3a7c]">
                <Text className="text-white text-[10px] font-bold">{totalCartQty}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-between mt-1 z-10">
          <Text className="text-blue-100 text-[12px] leading-tight flex-1 mr-4">Enhance your stall with premium facilities. Select items to add to your cart.</Text>
          <TouchableOpacity onPress={() => setShowComplementary(true)} className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full border border-white/30">
            {/* @ts-ignore */}
            <Gift size={12} color="white" className="mr-1.5" />
            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Free Items</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search & Filter */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          {/* @ts-ignore */}
          <Search size={16} color="#64748b" className="mr-2" />
          <TextInput
            placeholder="Search for furniture, lighting..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-[13px] text-slate-800"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ paddingRight: 20 }}>
          {(() => {
            const dynamicCategories = ['All Items'];
            catalog.forEach(item => {
              if (item.category && !dynamicCategories.includes(item.category)) {
                dynamicCategories.push(item.category);
              }
            });

            return dynamicCategories.map(catName => {
              const Icon = ICONS_MAP[catName] || ICONS_MAP['Default'];
              const isActive = activeTab === catName;
              return (
                <TouchableOpacity
                  key={catName}
                  onPress={() => setActiveTab(catName)}
                  className={`flex-row items-center px-3 py-1.5 rounded-lg mr-2 border ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}
                >
                  {/* @ts-ignore */}
                  <Icon size={12} color={isActive ? "#1a3a7c" : "#64748b"} className="mr-1.5" />
                  <Text className={`text-[11px] font-bold ${isActive ? 'text-[#1a3a7c]' : 'text-slate-500'}`}>{catName}</Text>
                </TouchableOpacity>
              );
            });
          })()}
        </ScrollView>
      </View>

      <FlatList
        className="flex-1 px-4 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        data={filteredItems.slice(0, visibleCount)}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <Text className="text-[#1a3a7c] font-black text-[13px] mb-2 ml-1 uppercase tracking-wider">{activeTab} ({filteredItems.length})</Text>
        }
        ListEmptyComponent={
          filteredItems.length === 0 && !loading ? (
            <View className="items-center justify-center py-10 opacity-50">
              {/* @ts-ignore */}
              <Store size={40} color="#64748b" className="mb-2" />
              <Text className="text-slate-500 font-bold">No items found</Text>
            </View>
          ) : null
        }
      />

      {/* Floating Action Bar */}
      {totalCartQty > 0 && !showCart && (
        <View className="absolute bottom-6 left-4 right-4 bg-[#1a3a7c] p-3 rounded-2xl flex-row items-center justify-between shadow-xl">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
              {/* @ts-ignore */}
              <ShoppingCart size={20} color="white" />
            </View>
            <View>
              <Text className="text-white font-bold text-[13px]">{totalCartQty} Items Selected</Text>
              <Text className="text-blue-200 font-bold text-[11px] mt-0.5">{fmt(cartTotalWithFee)} (Incl. taxes & fees)</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowCart(true)} className="bg-white px-4 py-2 rounded-xl">
            <Text className="text-[#1a3a7c] font-black text-[12px]">View Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" transparent={true} onRequestClose={() => setShowCart(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white h-[85%] rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
            <View className="flex-row items-center justify-between p-5 border-b border-slate-100 bg-white">
              <View className="flex-row items-center">
                <Text className="text-[#0f172a] text-lg font-black tracking-wider">Your Cart</Text>
                <View className="bg-[#1a3a7c] px-2 py-0.5 rounded-full ml-2">
                  <Text className="text-white text-[10px] font-bold">{totalCartQty}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowCart(false)} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                {/* @ts-ignore */}
                <ChevronLeft size={20} color="#64748b" style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
              {cart.length === 0 ? (
                <View className="items-center justify-center py-20 opacity-50">
                  {/* @ts-ignore */}
                  <ShoppingCart size={50} color="#94a3b8" className="mb-3" />
                  <Text className="text-slate-500 font-bold">Your cart is empty</Text>
                </View>
              ) : (
                cart.map(item => {
                  let finalImageUrl = item.imageUrl ? imageUrl(item.imageUrl) : null;
                  if (finalImageUrl) {
                    finalImageUrl = finalImageUrl.replace(/ /g, '%20');
                  }
                  const itemTotal = (item.unitPrice * item.qty) * (1 + item.gstPercent / 100);
                  return (
                    <View key={item.accessoryId} className="flex-row items-center py-3 border-b border-slate-100">
                      <View className="w-14 h-14 bg-slate-50 rounded-lg border border-slate-200 items-center justify-center p-1 mr-3">
                        {finalImageUrl ? (
                          <Image source={{ uri: finalImageUrl }} className="w-full h-full" resizeMode="contain" />
                        ) : (
                          // @ts-ignore
                          <ImageIcon size={20} color="#cbd5e1" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-800 font-bold text-[12px] mb-0.5" numberOfLines={1}>{item.name}</Text>
                        <Text className="text-[#1a3a7c] font-black text-[11px] mb-1.5">{fmt(item.unitPrice)}</Text>
                        <View className="flex-row items-center border border-slate-200 rounded-md self-start">
                          <TouchableOpacity onPress={() => updateQty(item.accessoryId, -1)} className="w-6 h-6 items-center justify-center bg-slate-50 border-r border-slate-200">
                            {/* @ts-ignore */}
                            <Minus size={10} color="#64748b" />
                          </TouchableOpacity>
                          <Text className="w-6 text-center font-bold text-[11px]">{item.qty}</Text>
                          <TouchableOpacity onPress={() => updateQty(item.accessoryId, 1)} className="w-6 h-6 items-center justify-center bg-slate-50 border-l border-slate-200">
                            {/* @ts-ignore */}
                            <Plus size={10} color="#64748b" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-slate-800 font-black text-[13px] mb-3">{fmt(itemTotal)}</Text>
                        <TouchableOpacity onPress={() => removeFromCart(item.accessoryId)} className="w-7 h-7 bg-red-50 rounded-full items-center justify-center">
                          {/* @ts-ignore */}
                          <Trash2 size={12} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {cart.length > 0 && (
              <View className="p-5 bg-slate-50 border-t border-slate-200">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-slate-500 font-medium text-[12px]">Subtotal</Text>
                  <Text className="text-slate-800 font-bold text-[13px]">{fmt(cartBaseTotal)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-slate-500 font-medium text-[12px]">GST (18%)</Text>
                  <Text className="text-slate-800 font-bold text-[13px]">{fmt(cartGstTotal)}</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-slate-500 font-medium text-[12px]">Gateway Fee (2.5%)</Text>
                  <Text className="text-slate-800 font-bold text-[13px]">{fmt(gatewayFee)}</Text>
                </View>
                <View className="flex-row justify-between pt-3 border-t border-slate-200 mb-4">
                  <Text className="text-[#0f172a] font-black text-[15px]">Total Amount</Text>
                  <Text className="text-[#16a34a] font-black text-[16px]">{fmt(cartTotalWithFee)}</Text>
                </View>

                <TouchableOpacity
                  onPress={handleCheckout}
                  disabled={paying}
                  className="bg-[#16a34a] w-full py-3.5 rounded-xl flex-row items-center justify-center shadow-sm"
                >
                  {paying ? <ActivityIndicator size="small" color="white" className="mr-2" /> : null}
                  <Text className="text-white font-black text-[14px] uppercase tracking-wider">{paying ? 'Processing...' : 'Pay Securely'}</Text>
                  {!paying && <ChevronRight size={16} color="white" className="ml-1" />}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Razorpay WebView Checkout */}
      {showRazorpay && rzpOrder && (
        <RazorpayWebView
          visible={showRazorpay}
          orderId={rzpOrder.id}
          amount={cartTotalWithFee}
          name={exhibitorData?.exhibitorName}
          email={exhibitorData?.contact1?.email}
          contact={exhibitorData?.contact1?.mobile}
          onSuccess={onPaymentSuccess}
          onFailed={onPaymentFailed}
          onClose={onPaymentClosed}
        />
      )}

      {/* Complementary Items Modal */}
      <Modal visible={showComplementary} animationType="slide" transparent={true} onRequestClose={() => setShowComplementary(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white h-[75%] rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
            <View className="flex-row items-center justify-between p-5 border-b border-slate-100 bg-[#1a3a7c]">
              <View className="flex-row items-center">
                {/* @ts-ignore */}
                <Gift size={20} color="white" className="mr-2" />
                <Text className="text-white text-lg font-black tracking-wider">Complementary Items</Text>
              </View>
              <TouchableOpacity onPress={() => setShowComplementary(false)} className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                {/* @ts-ignore */}
                <ChevronLeft size={20} color="white" style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
              <Text className="text-slate-500 font-bold text-[12px] mb-4 text-center">These items are provided for free based on your stall allocation.</Text>

              {complementaryItems.length === 0 ? (
                <View className="items-center justify-center py-10 opacity-50">
                  {/* @ts-ignore */}
                  <Gift size={40} color="#94a3b8" className="mb-2" />
                  <Text className="text-slate-500 font-bold">No complementary items available.</Text>
                </View>
              ) : (
                complementaryItems.map(item => {
                  let finalImageUrl = item.imageUrl ? imageUrl(item.imageUrl) : null;
                  if (finalImageUrl) {
                    finalImageUrl = finalImageUrl.replace(/ /g, '%20');
                  }

                  return (
                    <View key={item._id} className="flex-row items-center py-3 px-3 mb-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <View className="w-14 h-14 bg-white rounded-lg border border-slate-200 items-center justify-center p-1 mr-3">
                        {finalImageUrl ? (
                          <Image source={{ uri: finalImageUrl }} className="w-full h-full" resizeMode="contain" />
                        ) : (
                          // @ts-ignore
                          <ImageIcon size={20} color="#cbd5e1" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-800 font-bold text-[13px] mb-1">{item.name}</Text>
                        <View className="bg-green-100 self-start px-2 py-0.5 rounded-full">
                          <Text className="text-green-700 font-bold text-[9px] uppercase tracking-widest">Included Free</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
