import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Dimensions, Animated, Easing } from 'react-native';
import { X, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react-native';

interface FloorPlanViewerProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// A helper to draw a stall with scaling
const Stall = ({ id, w, h, x, y, sizeLabel = '3X3', scale }: { id: string, w: number, h: number, x: number, y: number, sizeLabel?: string, scale: number }) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: x * scale,
        top: y * scale,
        width: w * scale,
        height: h * scale,
        borderWidth: 1,
        borderColor: '#94a3b8',
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: Math.max(6, 10 * scale), fontWeight: 'bold', color: '#1e293b' }}>{id}</Text>
      <Text style={{ fontSize: Math.max(5, 8 * scale), color: '#64748b' }}>{sizeLabel}</Text>
    </View>
  );
};

// Helper for structural walls/blocks with scaling
const Block = ({ w, h, x, y, label, bg = '#e2e8f0', angled = false, scale }: any) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: x * scale,
        top: y * scale,
        width: w * scale,
        height: h * scale,
        borderWidth: 1,
        borderColor: '#64748b',
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        ...(angled ? { borderTopRightRadius: 100 * scale } : {})
      }}
    >
      <Text style={{ fontSize: Math.max(8, 14 * scale), fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>{label}</Text>
    </View>
  );
};

// Animated Marquee Component
const MarqueeBanner = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, -800], // Start off-screen right (which is SCREEN_HEIGHT when landscape), end off-screen left
  });

  return (
    <View className="bg-amber-100 py-2 flex-row items-center overflow-hidden border-b border-amber-200">
      <Animated.View style={{ transform: [{ translateX }], flexDirection: 'row', alignItems: 'center' }}>
        {/* @ts-ignore */}
        <AlertTriangle size={14} color="#b45309" style={{ marginRight: 8 }} />
        <Text className="text-amber-700 font-bold text-xs tracking-wider">
          NOTE: 1. FLOOR PLANS NOT TO SCALE   |   2. ORGANISERS RESERVE THE RIGHT TO ALTER THE FLOOR PLAN
        </Text>
      </Animated.View>
    </View>
  );
};

export const FloorPlanViewer = ({ visible, onClose }: FloorPlanViewerProps) => {
  // Reduced from 2400 to remove massive right-side space, but keeping enough for Hall 8 padding
  const BASE_WIDTH = 2150;
  const BASE_HEIGHT = 900;
  const [scale, setScale] = useState(0.4);

  const CANVAS_WIDTH = BASE_WIDTH * scale;
  const CANVAS_HEIGHT = BASE_HEIGHT * scale;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>

      <View
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
        }}
      >
        <View
          style={{
            width: SCREEN_HEIGHT,
            height: SCREEN_WIDTH,
            transform: [{ rotate: '90deg' }],
            position: 'absolute',
            top: (SCREEN_HEIGHT - SCREEN_WIDTH) / 2,
            left: (SCREEN_WIDTH - SCREEN_HEIGHT) / 2,
            backgroundColor: 'white'
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-slate-200">
            <View>
              <Text className="text-[#0f172a] font-black text-xl">Floor Plan</Text>
              <Text className="text-[#0f172a] font-black text-sm">Hall 8, 9 & 10</Text>
            </View>

            <View className="flex-row items-center gap-3">
              {/* Custom Zoom Controls */}
              <View className="flex-row items-center bg-slate-100 rounded-full">
                <TouchableOpacity onPress={() => setScale(s => Math.max(0.3, s - 0.1))} className="w-10 h-10 items-center justify-center">
                  {/* @ts-ignore */}
                  <ZoomOut size={18} color="#0f172a" />
                </TouchableOpacity>
                <Text className="font-bold text-slate-600 text-xs w-8 text-center">{Math.round(scale * 100)}%</Text>
                <TouchableOpacity onPress={() => setScale(s => Math.min(1.5, s + 0.1))} className="w-10 h-10 items-center justify-center">
                  {/* @ts-ignore */}
                  <ZoomIn size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                {/* @ts-ignore */}
                <X size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Marquee Note */}
          <MarqueeBanner />

          {/* Pannable Canvas */}
          <View className="flex-1 bg-slate-100">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
              <ScrollView showsVerticalScrollIndicator={true} bounces={false}>

                <View style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, position: 'relative', backgroundColor: 'white' }}>

                  {/* --- CANVAS BORDERS / STRUCTURE --- */}
                  <View style={{ position: 'absolute', top: 50 * scale, left: 100 * scale, right: 100 * scale, bottom: 50 * scale, borderWidth: 4 * scale, borderColor: '#1e293b' }} />

                  {/* --- HALL LABELS --- */}
                  <Text style={{ position: 'absolute', bottom: 10 * scale, left: 400 * scale, fontSize: 30 * scale, fontWeight: '900', color: '#0f172a' }}>HALL 10</Text>
                  <Text style={{ position: 'absolute', bottom: 10 * scale, left: 1300 * scale, fontSize: 30 * scale, fontWeight: '900', color: '#0f172a' }}>HALL 9</Text>
                  <Text style={{ position: 'absolute', bottom: 10 * scale, left: 1700 * scale, fontSize: 30 * scale, fontWeight: '900', color: '#0f172a' }}>HALL 8</Text>


                  {/* === HALL 10 (LEFT SIDE) === */}

                  {/* Block A */}
                  <Stall scale={scale} id="A-1" w={60} h={40} x={250} y={150} sizeLabel="6X3" />
                  <Stall scale={scale} id="A-2" w={60} h={40} x={310} y={150} sizeLabel="5X3" />
                  <Stall scale={scale} id="A-3" w={50} h={40} x={450} y={150} sizeLabel="5X3" />
                  <Stall scale={scale} id="A-4" w={50} h={40} x={500} y={150} sizeLabel="5X3" />
                  <Stall scale={scale} id="A-5" w={50} h={40} x={550} y={150} sizeLabel="4X3" />
                  <Stall scale={scale} id="A-6" w={50} h={40} x={600} y={150} sizeLabel="5X3" />

                  {/* Block B */}
                  <Stall scale={scale} id="B-1" w={70} h={80} x={250} y={250} sizeLabel="7X8" />
                  <Stall scale={scale} id="B-2" w={60} h={40} x={320} y={250} sizeLabel="6X3" />
                  <Stall scale={scale} id="B-6" w={60} h={40} x={320} y={290} sizeLabel="6X4" />
                  <Stall scale={scale} id="B-3" w={50} h={80} x={380} y={250} sizeLabel="7X3" />
                  <Stall scale={scale} id="B-4" w={50} h={80} x={480} y={250} sizeLabel="7X3" />
                  <Stall scale={scale} id="B-5" w={50} h={80} x={530} y={250} sizeLabel="7X3" />
                  <Stall scale={scale} id="B-9" w={80} h={40} x={630} y={250} sizeLabel="8X3" />
                  <Stall scale={scale} id="B-7" w={40} h={40} x={630} y={290} sizeLabel="4X3" />
                  <Stall scale={scale} id="B-8" w={40} h={40} x={670} y={290} sizeLabel="4X3" />

                  {/* Block C */}
                  <Stall scale={scale} id="C-1" w={80} h={80} x={250} y={400} sizeLabel="8X5" />
                  <Stall scale={scale} id="C-2" w={50} h={40} x={330} y={400} sizeLabel="6X4" />
                  <Stall scale={scale} id="C-8" w={50} h={40} x={330} y={440} sizeLabel="4X4" />
                  <Stall scale={scale} id="C-3" w={50} h={40} x={380} y={400} sizeLabel="4X3" />
                  <Stall scale={scale} id="C-3A" w={50} h={40} x={380} y={440} sizeLabel="5X4" />
                  <Stall scale={scale} id="C-4" w={50} h={40} x={480} y={400} sizeLabel="4X3" />
                  <Stall scale={scale} id="C-9" w={50} h={40} x={480} y={440} sizeLabel="5X3" />
                  <Stall scale={scale} id="C-5" w={50} h={40} x={530} y={400} sizeLabel="4X3" />
                  <Stall scale={scale} id="C-10" w={50} h={40} x={530} y={440} sizeLabel="4X3" />
                  <Stall scale={scale} id="C-6" w={50} h={40} x={630} y={400} sizeLabel="4X3" />
                  <Stall scale={scale} id="C-11" w={50} h={40} x={630} y={440} sizeLabel="4X3" />
                  <Stall scale={scale} id="C-7" w={50} h={40} x={680} y={400} sizeLabel="4X3" />
                  <Stall scale={scale} id="C-12" w={50} h={40} x={680} y={440} sizeLabel="4X3" />

                  {/* Block D */}
                  <Stall scale={scale} id="D-1" w={60} h={40} x={250} y={550} sizeLabel="6X3" />
                  <Stall scale={scale} id="D-1A" w={60} h={40} x={250} y={590} sizeLabel="5X3" />
                  <Stall scale={scale} id="D-2" w={60} h={40} x={310} y={550} sizeLabel="6X3" />
                  <Stall scale={scale} id="D-4" w={60} h={40} x={310} y={590} sizeLabel="6X3" />
                  <Stall scale={scale} id="D-3" w={50} h={80} x={370} y={550} sizeLabel="6X3" />
                  <Stall scale={scale} id="S" w={80} h={80} x={480} y={550} sizeLabel="6X3" />
                  <Stall scale={scale} id="D-5" w={80} h={40} x={630} y={550} sizeLabel="6X3" />
                  <Stall scale={scale} id="D-6" w={80} h={40} x={630} y={590} sizeLabel="6X3" />

                  {/* Block E */}
                  <Stall scale={scale} id="E-1" w={80} h={40} x={250} y={700} sizeLabel="7X3" />
                  <Stall scale={scale} id="E-2" w={50} h={40} x={330} y={700} sizeLabel="4X3" />
                  <Stall scale={scale} id="E-3" w={50} h={40} x={380} y={700} sizeLabel="4X3" />
                  <Stall scale={scale} id="E-4" w={50} h={40} x={430} y={700} sizeLabel="4X3" />
                  <Stall scale={scale} id="E-5" w={60} h={40} x={480} y={700} sizeLabel="5X3" />
                  <Stall scale={scale} id="E-6" w={60} h={40} x={540} y={700} sizeLabel="5X3" />
                  <Stall scale={scale} id="E-7" w={40} h={40} x={600} y={700} sizeLabel="3X3" />
                  <Stall scale={scale} id="E-8" w={50} h={40} x={640} y={700} sizeLabel="4X3" />

                  {/* === CORRIDOR / R-1 === */}
                  <Stall scale={scale} id="R-1" w={60} h={60} x={800} y={350} sizeLabel="6X6" />
                  <Block scale={scale} label="Stairs" w={40} h={60} x={880} y={350} />

                  {/* === HALL 9 (MIDDLE SIDE) === */}

                  {/* Block F */}
                  <Stall scale={scale} id="F-1" w={50} h={30} x={950} y={280} sizeLabel="4X2" />
                  <Stall scale={scale} id="F-2" w={40} h={30} x={1000} y={280} sizeLabel="3X2" />
                  <Stall scale={scale} id="F-3" w={40} h={30} x={1040} y={280} sizeLabel="3X2" />
                  <Stall scale={scale} id="F-4" w={50} h={30} x={1080} y={280} sizeLabel="4X2" />
                  <Stall scale={scale} id="F-5" w={40} h={30} x={1130} y={280} sizeLabel="3X2" />
                  <Stall scale={scale} id="F-6" w={40} h={30} x={1170} y={280} sizeLabel="3X2" />
                  <Stall scale={scale} id="F-7" w={40} h={30} x={1210} y={280} sizeLabel="3X2" />
                  <Stall scale={scale} id="F-8" w={50} h={30} x={1250} y={280} sizeLabel="4X2" />
                  <Stall scale={scale} id="F-9" w={50} h={30} x={1300} y={280} sizeLabel="4X2" />

                  {/* Blocks G, H Grid */}
                  <Stall scale={scale} id="G-1" w={40} h={40} x={980} y={360} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-2" w={50} h={40} x={1020} y={360} sizeLabel="4X3" />
                  <Stall scale={scale} id="G-8" w={40} h={40} x={980} y={400} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-9" w={50} h={40} x={1020} y={400} sizeLabel="3X3" />
                  <Stall scale={scale} id="H-1" w={40} h={40} x={980} y={450} sizeLabel="3X3" />
                  <Stall scale={scale} id="H-2" w={50} h={40} x={1020} y={450} sizeLabel="3X3" />

                  <Stall scale={scale} id="G-3" w={50} h={40} x={1120} y={360} sizeLabel="4X3" />
                  <Stall scale={scale} id="G-4" w={40} h={40} x={1170} y={360} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-10" w={50} h={40} x={1120} y={400} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-11" w={40} h={40} x={1170} y={400} sizeLabel="3X3" />
                  <Stall scale={scale} id="H-3" w={50} h={40} x={1120} y={450} sizeLabel="3X3" />
                  <Stall scale={scale} id="H-4" w={40} h={40} x={1170} y={450} sizeLabel="3X3" />

                  <Stall scale={scale} id="G-5" w={40} h={40} x={1260} y={360} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-6" w={40} h={40} x={1300} y={360} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-7" w={40} h={40} x={1340} y={360} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-12" w={40} h={40} x={1260} y={400} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-13" w={40} h={40} x={1300} y={400} sizeLabel="3X3" />
                  <Stall scale={scale} id="G-14" w={40} h={40} x={1340} y={400} sizeLabel="3X3" />
                  <Stall scale={scale} id="H-5" w={40} h={40} x={1260} y={450} sizeLabel="3X3" />
                  <Stall scale={scale} id="H-6" w={40} h={40} x={1300} y={450} sizeLabel="3X3" />
                  <Stall scale={scale} id="H-7" w={40} h={40} x={1340} y={450} sizeLabel="3X3" />

                  {/* L Grid Bottom */}
                  <Stall scale={scale} id="L-1" w={50} h={40} x={980} y={550} sizeLabel="4X3" />
                  <Stall scale={scale} id="L-2" w={40} h={40} x={1030} y={550} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-8" w={50} h={40} x={980} y={590} sizeLabel="4X3" />
                  <Stall scale={scale} id="L-9" w={40} h={40} x={1030} y={590} sizeLabel="3X3" />

                  <Stall scale={scale} id="L-3" w={40} h={40} x={1120} y={550} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-4" w={40} h={40} x={1160} y={550} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-10" w={40} h={40} x={1120} y={590} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-11" w={40} h={40} x={1160} y={590} sizeLabel="3X3" />

                  <Stall scale={scale} id="L-5" w={40} h={40} x={1260} y={550} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-6" w={40} h={40} x={1300} y={550} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-7" w={40} h={40} x={1340} y={550} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-12" w={40} h={40} x={1260} y={590} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-13" w={40} h={40} x={1300} y={590} sizeLabel="3X3" />
                  <Stall scale={scale} id="L-14" w={40} h={40} x={1340} y={590} sizeLabel="3X3" />

                  {/* Block I (Bottom Edge Hall 9) */}
                  <Stall scale={scale} id="I-1" w={80} h={30} x={980} y={700} sizeLabel="8X2" />
                  <Stall scale={scale} id="I-2" w={40} h={30} x={1060} y={700} sizeLabel="3X2" />
                  <Stall scale={scale} id="I-3" w={40} h={30} x={1100} y={700} sizeLabel="3X2" />
                  <Stall scale={scale} id="I-4" w={40} h={30} x={1140} y={700} sizeLabel="3X2" />
                  <Stall scale={scale} id="I-5" w={40} h={30} x={1180} y={700} sizeLabel="3X2" />
                  <Stall scale={scale} id="I-6" w={30} h={30} x={1220} y={700} sizeLabel="2X2" />
                  <Stall scale={scale} id="I-7" w={30} h={30} x={1250} y={700} sizeLabel="2X2" />
                  <Stall scale={scale} id="I-8" w={40} h={30} x={1280} y={700} sizeLabel="3X2" />
                  <Stall scale={scale} id="I-9" w={40} h={30} x={1320} y={700} sizeLabel="3X2" />


                  {/* === HALL 8 (RIGHT SIDE) === */}

                  <Block scale={scale} label="WASHROOM" w={150} h={100} x={1550} y={450} bg="#e2e8f0" />
                  <Block scale={scale} label="FOOD COURT" w={150} h={150} x={1720} y={550} bg="#e2e8f0" />

                  {/* Structural Walls Hall 8 */}
                  <View style={{ position: 'absolute', left: 1450 * scale, top: 250 * scale, width: 100 * scale, height: 180 * scale, borderWidth: 2 * scale, borderColor: '#ca8a04', backgroundColor: '#fef08a' }} />
                  <View style={{ position: 'absolute', left: 1550 * scale, top: 320 * scale, width: 60 * scale, height: 110 * scale, borderWidth: 2 * scale, borderColor: '#ca8a04', backgroundColor: '#fef08a' }} />

                  {/* Angled Wall Approximation */}
                  <View style={{ position: 'absolute', left: 1720 * scale, top: 450 * scale, width: 150 * scale, height: 100 * scale, borderTopRightRadius: 150 * scale, borderTopWidth: 4 * scale, borderRightWidth: 4 * scale, borderColor: '#1e293b' }} />
                  <View style={{ position: 'absolute', left: 1870 * scale, top: 550 * scale, width: 100 * scale, height: 180 * scale, borderBottomRightRadius: 50 * scale, borderRightWidth: 4 * scale, borderBottomWidth: 4 * scale, borderColor: '#1e293b' }} />

                  {/* Entry Arrows */}
                  <Text style={{ position: 'absolute', left: 110 * scale, top: 350 * scale, fontSize: 30 * scale, fontWeight: '900', transform: [{ rotate: '-90deg' }] }}>ENTRY</Text>
                  <Text style={{ position: 'absolute', left: 170 * scale, top: 350 * scale, fontSize: 40 * scale, fontWeight: '900' }}>{"\u27A1"}</Text>
                  <Text style={{ position: 'absolute', left: 110 * scale, top: 480 * scale, fontSize: 30 * scale, fontWeight: '900', transform: [{ rotate: '-90deg' }] }}>ENTRY</Text>
                  <Text style={{ position: 'absolute', left: 170 * scale, top: 480 * scale, fontSize: 40 * scale, fontWeight: '900' }}>{"\u27A1"}</Text>

                  <Text style={{ position: 'absolute', left: 350 * scale, top: 100 * scale, fontSize: 16 * scale, fontWeight: '900' }}>CARGO ENTRY/EXIT</Text>
                  <Text style={{ position: 'absolute', left: 1300 * scale, top: 220 * scale, fontSize: 16 * scale, fontWeight: '900' }}>CARGO ENTRY/EXIT</Text>

                  {/* Title */}
                  {/* <Text style={{ position: 'absolute', top: 80 * scale, left: 850 * scale, fontSize: 60 * scale, fontWeight: '900', color: '#0f172a' }}>FLOOR PLAN</Text> */}
                  <Text style={{ position: 'absolute', top: 80 * scale, left: 1000 * scale, fontSize: 40 * scale, fontWeight: 'bold', color: '#334155' }}>Exhibition Layout</Text>

                </View>
              </ScrollView>
            </ScrollView>
          </View>

        </View>
      </View>
    </Modal>
  );
};
