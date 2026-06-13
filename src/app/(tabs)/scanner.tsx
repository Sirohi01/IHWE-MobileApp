import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, Flashlight, FlashlightOff, X, Building, Phone, Mail, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '@/core/api/axios';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Animation for the scanning line
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission?.granted && !scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: SCANNER_SIZE,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }
  }, [permission, scanned]);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-[#f4f7f9] items-center justify-center px-6">
        <View className="bg-white p-8 rounded-3xl items-center shadow-sm border border-slate-100 w-full">
          <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-6">
            {/* @ts-ignore */}
            <Camera size={32} color="#1a3a7c" />
          </View>
          <Text className="text-xl font-bold text-slate-800 mb-3 text-center">Camera Access Required</Text>
          <Text className="text-slate-500 text-center mb-8 leading-relaxed">
            We need your permission to use the camera so you can scan visitor badges and capture leads.
          </Text>
          <TouchableOpacity 
            className="bg-[#1a3a7c] w-full py-4 rounded-2xl items-center shadow-lg shadow-blue-900/20"
            onPress={requestPermission}
          >
            <Text className="text-white font-bold text-[15px] tracking-wider">Allow Camera Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: any) => {
    if (scanned) return;
    
    setScanned(true);
    Vibration.vibrate(100); // Haptic feedback on scan
    
    try {
      const res = await apiClient.post('/exhibitor-leads/resolve-scan', { raw: data });
      setScannedData(res.data.data);
    } catch (e) {
      Alert.alert("Invalid QR", "The scanned QR code could not be resolved.");
      setScanned(false);
    }
  };

  const handleSaveLead = async () => {
    if (!scannedData) return;
    setSaving(true);
    try {
      await apiClient.post('/exhibitor-leads', scannedData);
      Alert.alert("Lead Saved!", "Visitor/buyer details have been added to your captured leads.");
      setScannedData(null);
      setScanned(false);
    } catch (error: any) {
      Alert.alert("Save Failed", error.response?.data?.message || "Could not save this lead.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelScan = () => {
    setScannedData(null);
    setScanned(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 z-20 absolute top-10 w-full">
        <View>
          <Text className="text-white font-black text-2xl tracking-tight shadow-md">Scan Badge</Text>
          <Text className="text-white/80 font-medium text-sm">Align QR code within frame</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setFlashMode(!flashMode)}
          className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/20 backdrop-blur-md"
        >
          {flashMode ? (
            /* @ts-ignore */
            <Flashlight color="#ffdd00" size={22} />
          ) : (
            /* @ts-ignore */
            <FlashlightOff color="white" size={22} />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-1 rounded-[40px] overflow-hidden m-2 bg-black relative">
        <CameraView 
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flashMode}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        {/* Overlay mask */}
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.topOverlay} />
          <View style={styles.middleOverlay}>
            <View style={styles.leftOverlay} />
            <View style={styles.scannerFrame}>
              {/* Scanner Frame Corners */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Animated Scanning Line */}
              {!scanned && (
                <Animated.View 
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLineAnim }] }
                  ]} 
                />
              )}
            </View>
            <View style={styles.rightOverlay} />
          </View>
          <View style={styles.bottomOverlay} />
        </View>
      </View>

      {/* Scanned Result Modal / Bottom Sheet */}
      {scanned && scannedData && (
        <View className="absolute bottom-0 w-full bg-white rounded-t-[32px] p-6 shadow-2xl z-30" style={{ elevation: 20 }}>
          <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
          
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2">
                  {/* @ts-ignore */}
                  <CheckCircle2 size={16} color="#16a34a" />
                </View>
                <Text className="text-green-600 font-bold text-[11px] uppercase tracking-widest">Successfully Scanned</Text>
              </View>
              <Text className="text-2xl font-black text-slate-800 tracking-tight">{scannedData.name || scannedData.company || 'Scanned Lead'}</Text>
              <Text className="text-[#1a3a7c] font-bold text-[15px]">{scannedData.designation}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleCancelScan}
              className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
            >
              {/* @ts-ignore */}
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
            <View className="flex-row items-center mb-4">
              {/* @ts-ignore */}
              <Building size={16} color="#64748b" className="mr-3" />
              <Text className="text-slate-700 font-medium">{scannedData.company || scannedData.registrationId || 'Company not available'}</Text>
            </View>
            <View className="h-[1px] bg-slate-200 w-full mb-4" />
            <View className="flex-row items-center mb-4">
              {/* @ts-ignore */}
              <Phone size={16} color="#64748b" className="mr-3" />
              <Text className="text-slate-700 font-medium">{scannedData.phone || 'Phone not available'}</Text>
            </View>
            <View className="flex-row items-center">
              {/* @ts-ignore */}
              <Mail size={16} color="#64748b" className="mr-3" />
              <Text className="text-slate-700 font-medium">{scannedData.email || 'Email not available'}</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={handleCancelScan}
              className="flex-1 py-4 rounded-xl items-center border border-slate-200 bg-white"
            >
              <Text className="text-slate-600 font-bold text-[14px]">Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSaveLead}
              disabled={saving}
              className="flex-[2] py-4 rounded-xl items-center bg-[#1a3a7c] shadow-lg shadow-blue-900/20"
            >
              <Text className="text-white font-bold text-[14px]">{saving ? 'Saving...' : 'Save Lead'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const overlayColor = 'rgba(0,0,0,0.6)';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  middleOverlay: {
    flexDirection: 'row',
    height: SCANNER_SIZE,
  },
  leftOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  rightOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#ffdd00',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 24,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 24,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 24,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 24,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#ffdd00',
    shadowColor: '#ffdd00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  }
});
