
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Dimensions, Animated, Easing, SafeAreaView } from 'react-native';
import { X, ZoomIn, ZoomOut, AlertTriangle, MapPin } from 'lucide-react-native';


const DownArrow = ({ scale }: { scale: number }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={{ width: 16 * scale, height: 24 * scale, backgroundColor: '#111827' }} />
    <View style={{
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 20 * scale,
      borderRightWidth: 20 * scale,
      borderTopWidth: 20 * scale,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: '#111827'
    }} />
  </View>
);




const Hall9Structures = ({ scale, HALL9_OFFSET, AISLE_GAP }: any) => {
  const BLOCK_82_X = 540 + HALL9_OFFSET + AISLE_GAP;
  const BLOCK_70_X = 760; // 540 + 20 + 40 + 160

  return (
    <View style={{ position: 'absolute', left: 0, top: 0 }}>
      {/* Wall and door above 82..84 */}
      <View style={{ position: 'absolute', left: BLOCK_82_X * scale, top: 160 * scale, width: 80 * scale, height: 1 * scale, backgroundColor: '#000' }} />
      <View style={{ position: 'absolute', left: (BLOCK_82_X + 80) * scale, top: 140 * scale, width: 20 * scale, height: 20 * scale, borderBottomWidth: 1 * scale, borderLeftWidth: 1 * scale, borderColor: '#000', borderBottomLeftRadius: 20 * scale }} />

      {/* Staircase Block */}
      <View style={{ position: 'absolute', left: (BLOCK_82_X + 100) * scale, top: 160 * scale, width: 30 * scale, height: 60 * scale, borderWidth: 1 * scale, borderColor: '#000', backgroundColor: '#fff' }}>
        <View style={{ position: 'absolute', top: 20 * scale, left: 0, width: 30 * scale, height: 20 * scale, borderWidth: 1 * scale, borderColor: '#000', flexDirection: 'row' }}>
          <View style={{ flex: 1 }} />
          <View style={{ width: 12 * scale, borderLeftWidth: 1 * scale, borderRightWidth: 1 * scale, borderColor: '#000', flexDirection: 'column' }}>
            {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={{ flex: 1, borderBottomWidth: 1 * scale, borderColor: '#000' }} />)}
          </View>
          <View style={{ flex: 1 }} />
        </View>
        <View style={{ position: 'absolute', bottom: 0, right: 0, width: 10 * scale, height: 10 * scale, borderTopWidth: 1 * scale, borderLeftWidth: 1 * scale, borderColor: '#000', borderTopLeftRadius: 10 * scale }} />
      </View>

      {/* Pillars Bottom */}
      <View style={{ position: 'absolute', left: (BLOCK_82_X + 10) * scale, top: 400 * scale, width: 12 * scale, height: 12 * scale, backgroundColor: '#000' }} />
      <View style={{ position: 'absolute', left: (BLOCK_82_X + 130) * scale, top: 400 * scale, width: 12 * scale, height: 12 * scale, backgroundColor: '#000' }} />
      <View style={{ position: 'absolute', left: (BLOCK_82_X + 10) * scale, top: 490 * scale, width: 12 * scale, height: 12 * scale, backgroundColor: '#000' }} />
      <View style={{ position: 'absolute', left: (BLOCK_82_X + 130) * scale, top: 490 * scale, width: 12 * scale, height: 12 * scale, backgroundColor: '#000' }} />

      {/* Entry Doors at bottom */}
      <View style={{ position: 'absolute', left: (BLOCK_82_X + 30) * scale, top: 490 * scale, flexDirection: 'row' }}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={{ width: 20 * scale, height: 20 * scale, borderBottomWidth: 1 * scale, borderLeftWidth: 1 * scale, borderColor: '#000', borderBottomLeftRadius: 20 * scale, transform: [{ scaleY: -1 }] }} />
        ))}
      </View>

      {/* Desk */}
      <View style={{ position: 'absolute', left: (BLOCK_82_X + 110) * scale, top: 410 * scale, width: 20 * scale, height: 80 * scale, borderWidth: 1 * scale, borderColor: '#ea580c', borderTopRightRadius: 15 * scale, backgroundColor: '#fff' }}>
        <View style={{ position: 'absolute', top: 15 * scale, left: 0, right: 0, bottom: 0, borderWidth: 1 * scale, borderColor: '#ea580c' }} />
      </View>

      {/* Utility Icons */}
      <UtilityIcon type="orange-swirl" x={BLOCK_82_X - 10} y={410} scale={scale} />
      <UtilityIcon type="orange-swirl" x={BLOCK_82_X + 145} y={470} scale={scale} />

      <UtilityIcon type="purple-box" x={BLOCK_70_X + 135} y={94} scale={scale} />
      <UtilityIcon type="purple-solid" x={BLOCK_70_X + 195} y={94} scale={scale} />
      <UtilityIcon type="purple-solid" x={BLOCK_70_X + 340} y={285} scale={scale} />
      <UtilityIcon type="orange-swirl" x={BLOCK_70_X - 25} y={465} scale={scale} />
      <UtilityIcon type="purple-box" x={BLOCK_70_X + 195} y={494} scale={scale} />
      <UtilityIcon type="purple-box" x={BLOCK_70_X + 235} y={494} scale={scale} />
    </View>
  );
}


const Hall8Structures = ({ scale, x, y }: { scale: number, x: number, y: number }) => {
  return (
    <View style={{ position: 'absolute', left: x * scale, top: y * scale }}>
      {/* Stairs & Lift Area */}
      <View style={{ position: 'absolute', top: 50 * scale, left: 0, width: 120 * scale, height: 160 * scale, borderWidth: 2 * scale, borderColor: '#000', backgroundColor: '#fff' }}>
        <View style={{ position: 'absolute', top: 80 * scale, right: 0, width: 50 * scale, height: 50 * scale, borderWidth: 1 * scale, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 10 * scale, fontWeight: 'bold' }}>LIFT</Text>
        </View>
        <View style={{ position: 'absolute', top: 130 * scale, left: 10 * scale, width: 60 * scale, height: 20 * scale, borderWidth: 1 * scale, borderColor: '#000', flexDirection: 'row' }}>
          {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={{ flex: 1, borderRightWidth: 1 * scale, borderColor: '#000' }} />)}
        </View>
      </View>

      {/* Toilets */}
      <View style={{ position: 'absolute', top: 0, left: 120 * scale, width: 80 * scale, height: 210 * scale, borderWidth: 2 * scale, borderColor: '#000', backgroundColor: '#fff' }}>
        <View style={{ height: 60 * scale, borderBottomWidth: 1 * scale, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 8 * scale, textAlign: 'center', fontWeight: 'bold', color: '#000' }}>LADIES{'\n'}TOILET</Text>
        </View>
        <View style={{ height: 40 * scale, borderBottomWidth: 1 * scale, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 7 * scale, textAlign: 'center', fontWeight: 'bold', color: '#000' }}>DISABLED{'\n'}TOILET</Text>
        </View>
        <View style={{ height: 110 * scale, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 8 * scale, textAlign: 'center', fontWeight: 'bold', color: '#000' }}>GENT\'S{'\n'}TOILET</Text>
        </View>
      </View>

      {/* Buyer Meet */}
      <View style={{ position: 'absolute', top: 210 * scale, left: -60 * scale, width: 260 * scale, height: 80 * scale, flexDirection: 'row', gap: 5 * scale }}>
        <View style={{ flex: 1, backgroundColor: '#fde047', borderWidth: 2 * scale, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 9 * scale, fontWeight: 'bold', transform: [{ rotate: '-90deg' }] }}>BUYER MEET</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#fde047', borderWidth: 2 * scale, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 9 * scale, fontWeight: 'bold', transform: [{ rotate: '-90deg' }] }}>BUYER MEET</Text>
        </View>
      </View>

      {/* Seminar Hall */}
      <View style={{ position: 'absolute', top: 0, left: 200 * scale, width: 220 * scale, height: 290 * scale, backgroundColor: '#fde047', borderWidth: 2 * scale, borderColor: '#000' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 10 * scale, gap: 5 * scale, height: 180 * scale, overflow: 'hidden' }}>
          {[...Array(60)].map((_, i) => <View key={i} style={{ width: 14 * scale, height: 10 * scale, backgroundColor: '#64748b', borderRadius: 2 * scale }} />)}
        </View>
        <View style={{ position: 'absolute', bottom: 20 * scale, left: 20 * scale, right: 20 * scale, height: 60 * scale, backgroundColor: '#fbcfe8', borderWidth: 1 * scale, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 11 * scale, fontWeight: '900', color: '#000' }}>SEMINAR HALL</Text>
        </View>
      </View>

      {/* Arrow Down */}
      <View style={{ position: 'absolute', top: 320 * scale, left: 100 * scale }}>
        <DownArrow scale={scale} />
      </View>
    </View>
  );
}

export interface StallData {
  id: string;
  status?: 'available' | 'booked' | 'hold' | 'premium';
}

interface FloorPlanViewerProps {
  visible: boolean;
  onClose: () => void;
  backendStalls?: StallData[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getColorForStatus = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'premium': return '#0284c7';
    case 'booked': return '#16a34a';
    case 'hold': return '#eab308';
    case 'available':
    default: return '#cbd5e1';
  }
}

const Stall = ({ id, backendId, w, h, x, y, scale, statusMap, defaultStatus }: any) => {
  const status = statusMap?.[backendId] || defaultStatus || 'available';
  const bg = getColorForStatus(status);

  return (
    <View
      style={{
        position: 'absolute',
        left: x * scale,
        top: y * scale,
        width: w * scale,
        height: h * scale,
        borderWidth: 1 * scale,
        borderColor: 'rgba(0,0,0,0.3)',
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: Math.max(3.5, 7 * scale),
          fontWeight: 'bold',
          color: bg === '#cbd5e1' ? '#1e293b' : '#ffffff',
          textAlign: 'center',
          paddingHorizontal: 1 * scale,
        }}
        adjustsFontSizeToFit
      >
        {id}
      </Text>
    </View>
  );
};

const Block = ({ w, h, x, y, label, bg = '#e2e8f0', borderColor = '#94a3b8', scale }: any) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: x * scale,
        top: y * scale,
        width: w * scale,
        height: h * scale,
        borderWidth: 2 * scale,
        borderColor: borderColor,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: Math.max(5, 10 * scale), fontWeight: '900', color: '#0f172a', textAlign: 'center', letterSpacing: 1 * scale }}>{label}</Text>
    </View>
  );
};

const Pillar = ({ x, y, scale }: { x: number, y: number, scale: number }) => (
  <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: 12 * scale, height: 12 * scale, backgroundColor: '#000', zIndex: 10 }} />
);

const seq = (start: number, count: number, sqm: string, w: number, h: number, startX: number, startY: number, dx: number, dy: number, decrement: boolean = true, defaultStatus: string = 'available') => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const num = decrement ? start - i : start + i;
    arr.push({
      id: `Stall No. ${num}\n${sqm} Sqm`,
      backendId: num.toString(),
      w, h,
      x: startX + i * dx,
      y: startY + i * dy,
      defaultStatus,
    });
  }
  return arr;
};

const customStall = (idText: string, backendId: string, w: number, h: number, x: number, y: number, defaultStatus: string = 'available') => ({
  id: idText, backendId, w, h, x, y, defaultStatus
});


const UtilityIcon = ({ x, y, type, scale }: { x: number, y: number, type: 'purple-box' | 'orange-box' | 'purple-solid' | 'orange-swirl' | 'purple-box-v', scale: number }) => {
  if (type === 'purple-box') {
    return <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: 16 * scale, height: 8 * scale, borderWidth: 2 * scale, borderColor: '#6b21a8', backgroundColor: 'transparent' }} />
  }
  if (type === 'purple-box-v') {
    return <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: 8 * scale, height: 16 * scale, borderWidth: 2 * scale, borderColor: '#6b21a8', backgroundColor: 'transparent' }} />
  }
  if (type === 'purple-solid') {
    return <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: 14 * scale, height: 14 * scale, backgroundColor: '#6b21a8', borderRadius: 2 * scale, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 6 * scale, height: 6 * scale, backgroundColor: 'white', borderRadius: 3 * scale }} />
    </View>
  }
  if (type === 'orange-box') {
    return <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: 12 * scale, height: 12 * scale, borderWidth: 1 * scale, borderColor: '#ea580c', backgroundColor: '#fed7aa', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', top: -5 * scale, left: 5 * scale, width: 1 * scale, height: 20 * scale, backgroundColor: '#ea580c', transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', top: -5 * scale, left: 2 * scale, width: 1 * scale, height: 20 * scale, backgroundColor: '#ea580c', transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', top: -5 * scale, left: 8 * scale, width: 1 * scale, height: 20 * scale, backgroundColor: '#ea580c', transform: [{ rotate: '45deg' }] }} />
    </View>
  }
  if (type === 'orange-swirl') {
    return <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: 20 * scale, height: 20 * scale, borderWidth: 2 * scale, borderColor: '#ea580c', backgroundColor: 'transparent', borderRadius: 10 * scale, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 10 * scale, height: 10 * scale, borderWidth: 2 * scale, borderColor: '#ea580c', borderRadius: 5 * scale }} />
    </View>
  }
  return null;
}

const Door = ({ x, y, width, isTop, scale }: any) => (
  <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: width * scale, height: 20 * scale, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', zIndex: 5 }}>
    <View style={{ width: (width / 2) * scale, height: (width / 2) * scale, borderTopWidth: isTop ? 1 * scale : 0, borderBottomWidth: !isTop ? 1 * scale : 0, borderRightWidth: 1 * scale, borderColor: '#000', borderTopRightRadius: isTop ? (width / 2) * scale : 0, borderBottomRightRadius: !isTop ? (width / 2) * scale : 0, transform: [{ translateY: isTop ? -10 * scale : 10 * scale }] }} />
    <View style={{ width: (width / 2) * scale, height: (width / 2) * scale, borderTopWidth: isTop ? 1 * scale : 0, borderBottomWidth: !isTop ? 1 * scale : 0, borderLeftWidth: 1 * scale, borderColor: '#000', borderTopLeftRadius: isTop ? (width / 2) * scale : 0, borderBottomLeftRadius: !isTop ? (width / 2) * scale : 0, transform: [{ translateY: isTop ? -10 * scale : 10 * scale }] }} />
  </View>
);

export const FloorPlanViewer = ({ visible, onClose, backendStalls = [] }: FloorPlanViewerProps) => {
  const BASE_WIDTH = 2200;
  const BASE_HEIGHT = 800;
  const [scale, setScale] = useState(0.5);

  const CANVAS_WIDTH = BASE_WIDTH * scale;
  const CANVAS_HEIGHT = BASE_HEIGHT * scale;

  const statusMap = backendStalls.reduce((acc, stall) => {
    if (stall.status) {
      acc[stall.id] = stall.status;
    }
    return acc;
  }, {} as Record<string, string>);

  const HALL9_OFFSET = -20;
  const AISLE_GAP = 40;

  const allStalls = [
    // === HALL 10 ===
    customStall("Stall No. 180\n15 Sqm", "180", 30, 50, 100, 100, 'premium'),
    ...seq(181, 7, '09', 30, 30, 100, 150, 0, 30, false, 'available'),
    ...seq(188, 3, '09', 30, 30, 100, 360, 0, 30, false, 'available'),

    customStall("Stall No.\n159, 160 & 179\n24 Sqm", "159,160,179", 40, 60, 160, 100, 'premium'),
    ...seq(178, 8, '09', 30, 30, 200, 100, 30, 0, true, 'available'),
    ...seq(161, 8, '09', 30, 30, 200, 130, 30, 0, false, 'available'),
    customStall("Stall No.\n169 & 170\n18 Sqm", "169,170", 30, 60, 440, 100, 'premium'),

    customStall("Stall No.\n138, 139 & 158\n24 Sqm", "138,139,158", 40, 60, 160, 190, 'premium'),
    ...seq(157, 7, '09', 30, 30, 200, 190, 30, 0, true, 'available'),
    ...seq(140, 5, '09', 30, 30, 200, 220, 30, 0, false, 'available'),
    ...seq(145, 2, '09', 30, 30, 350, 220, 30, 0, false, 'available'),
    customStall("Stall No.\n147, 148, 149 & 150\n36 Sqm", "147,148,149,150", 60, 60, 410, 190, 'premium'),

    customStall("Stall No.\n117, 118 & 137\n24 Sqm", "117,118,137", 40, 60, 160, 280, 'premium'),
    ...seq(136, 2, '09', 30, 30, 200, 280, 30, 0, true, 'available'),
    ...seq(134, 2, '09', 30, 30, 260, 280, 30, 0, true, 'available'),
    ...seq(132, 3, '09', 30, 30, 320, 280, 30, 0, true, 'available'),
    ...seq(119, 1, '09', 30, 30, 200, 310, 30, 0, false, 'available'),
    ...seq(120, 6, '09', 30, 30, 230, 310, 30, 0, false, 'available'),
    customStall("Stall No.\n126, 127, 128 & 129\n36 Sqm", "126,127,128,129", 60, 60, 410, 280, 'premium'),

    customStall("Stall No.\n96, 97 & 116\n24 Sqm", "96,97,116", 40, 60, 160, 370, 'premium'),
    ...seq(115, 6, '09', 30, 30, 200, 370, 30, 0, true, 'available'),
    ...seq(109, 1, '09', 30, 30, 380, 370, 30, 0, true, 'available'),
    ...seq(98, 7, '09', 30, 30, 200, 400, 30, 0, false, 'available'),
    customStall("Stall No.\n105, 106, 107 & 108\n36 Sqm", "105,106,107,108", 60, 60, 410, 370, 'premium'),

    customStall("Stall No.\n94 & 95\n18 Sqm", "94,95", 60, 30, 100, 460, 'premium'),
    ...seq(93, 3, '12', 40, 30, 160, 460, 40, 0, true, 'available'),
    ...seq(90, 2, '12', 40, 30, 280, 460, 40, 0, true, 'available'),
    customStall("Stall No. 88\n12 Sqm", "88", 40, 30, 360, 460, 'available'),
    customStall("Stall No. 87\n12 Sqm", "87", 40, 30, 400, 460, 'available'),
    customStall("Stall No.\n85 & 86\n18 Sqm", "85,86", 60, 30, 440, 460, 'premium'),




    // === HALL 9 ===
    // Right Section -> NOW LEFT SECTION (82..84)
    customStall("Stall No.\n82, 83 & 84\n27 Sqm", "82,83,84", 90, 30, 540 + HALL9_OFFSET + AISLE_GAP, 190, 'available'),
    customStall("Stall No.\n79, 80 & 81\n24 Sqm", "79,80,81", 80, 30, 540 + HALL9_OFFSET + AISLE_GAP, 280, 'premium'),
    customStall("Stall No.\n75, 76, 77 & 78\n32 Sqm", "75,76,77,78", 80, 40, 540 + HALL9_OFFSET + AISLE_GAP, 310, 'premium'),
    customStall("Stall No.\n72, 73 & 74\n24 Sqm", "72,73,74", 60, 40, 540 + HALL9_OFFSET + AISLE_GAP + 80, 310, 'premium'),

    // Row 1 -> NOW RIGHT SECTION (70..01)
    customStall("Stall No.\n70 & 71\n18 Sqm", "70,71", 60, 30, 760, 100, 'premium'),
    ...seq(69, 6, '09', 30, 30, 760 + 60, 100, 30, 0, true, 'available'),
    customStall("Stall No. 63\n09 Sqm", "63", 30, 30, 760 + 240, 100, 'available'),
    customStall("Stall No.\n61 & 62\n18 Sqm", "61,62", 60, 30, 760 + 270, 100, 'premium'),

    // Row 2
    customStall("Stall No.\n40, 41 & 60\n24 Sqm", "40,41,60", 60, 60, 760, 190, 'premium'),
    customStall("Stall No. 59\n09 Sqm", "59", 30, 30, 760 + 60, 190, 'available'),
    ...seq(58, 5, '09', 30, 30, 760 + 90, 190, 30, 0, true, 'available'),
    customStall("Stall No. 53\n09 Sqm", "53", 30, 30, 760 + 240, 190, 'available'),
    customStall("Stall No. 42\n09 Sqm", "42", 30, 30, 760 + 60, 220, 'available'),
    customStall("Stall No. 43\n09 Sqm", "43", 30, 30, 760 + 90, 220, 'available'),
    customStall("Stall No. 44\n09 Sqm", "44", 30, 30, 760 + 120, 220, 'available'),
    ...seq(45, 3, '09', 30, 30, 760 + 150, 220, 30, 0, false, 'available'),
    customStall("Stall No. 48\n09 Sqm", "48", 30, 30, 760 + 240, 220, 'available'),
    customStall("Stall No.\n51 & 52\n18 Sqm", "51,52", 60, 30, 760 + 270, 190, 'premium'),
    customStall("Stall No.\n49 & 50\n18 Sqm", "49,50", 60, 30, 760 + 270, 220, 'premium'),

    // Row 3
    customStall("Stall No.\n13, 14 & 39\n28 Sqm", "13,14,39", 60, 60, 760, 280, 'premium'),
    customStall("Stall No.\n37 & 38\n15 Sqm", "37,38", 50, 30, 760 + 60, 280, 'available'),
    customStall("Stall No.\n35 & 36\n12 Sqm", "35,36", 40, 30, 760 + 110, 280, 'available'),
    customStall("Stall No.\n33 & 34\n12 Sqm", "33,34", 40, 30, 760 + 150, 280, 'available'),
    customStall("Stall No.\n31 & 32\n12 Sqm", "31,32", 40, 30, 760 + 190, 280, 'available'),
    customStall("Stall No.\n29 & 30\n12 Sqm", "29,30", 40, 30, 760 + 230, 280, 'available'),
    customStall("Stall No.\n15 & 16\n20 Sqm", "15,16", 50, 30, 760 + 60, 310, 'available'),
    customStall("Stall No.\n17 & 18\n16 Sqm\nBOOKED", "17,18", 40, 30, 760 + 110, 310, 'available'),
    customStall("Stall No.\n19 & 20\n16 Sqm\nBOOKED", "19,20", 40, 30, 760 + 150, 310, 'available'),
    customStall("Stall No.\n21 & 22\n16 Sqm", "21,22", 40, 30, 760 + 190, 310, 'available'),
    customStall("Stall No.\n23 & 24\n16 Sqm", "23,24", 40, 30, 760 + 230, 310, 'available'),
    customStall("Stall No.\n27 & 28\n18 Sqm", "27,28", 60, 30, 760 + 270, 280, 'premium'),
    customStall("Stall No.\n25 & 26\n20 Sqm\nBOOKED", "25,26", 60, 30, 760 + 270, 310, 'premium'),

    // Row 4
    customStall("Stall No.\n11 & 12\n18 Sqm", "11,12", 60, 30, 760, 460, 'premium'),
    customStall("Stall No. 10\n12 Sqm", "10", 40, 30, 760 + 60, 460, 'available'),
    customStall("Stall No. 09\n12 Sqm\nBOOKED", "09", 40, 30, 760 + 100, 460, 'available'),
    customStall("Stall No. 08\n12 Sqm\nBOOKED", "08", 40, 30, 760 + 140, 460, 'available'),
    ...seq(7, 5, '12', 40, 30, 760 + 180, 460, 40, 0, true, 'available'),
    customStall("Stall No.\n01 & 02\n20 Sqm", "01,02", 50, 30, 760 + 380, 460, 'premium')
  ];



  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
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
          {/* Header Controls */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-slate-200 bg-white z-10 shadow-sm" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View className="flex-row items-center gap-2">
              <MapPin size={24} color="#0f172a" />
              <View>
                <Text className="text-[#0f172a] font-black text-xl">Floor Plan</Text>
                <Text className="text-slate-500 font-medium text-xs">Hall 8, 9 & 10</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center bg-slate-100 rounded-full border border-slate-200 shadow-sm">
                <TouchableOpacity onPress={() => setScale(s => Math.max(0.3, s - 0.1))} className="w-10 h-10 items-center justify-center">
                  <ZoomOut size={18} color="#0f172a" />
                </TouchableOpacity>
                <Text className="font-bold text-slate-700 text-sm w-10 text-center">{Math.round(scale * 100)}%</Text>
                <TouchableOpacity onPress={() => setScale(s => Math.min(1.5, s + 0.1))} className="w-10 h-10 items-center justify-center">
                  <ZoomIn size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-red-50 border border-red-200 rounded-full items-center justify-center">
                <X size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Canvas Container */}
          <View style={{ flex: 1, marginTop: 70, backgroundColor: '#f8fafc' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
              <ScrollView showsVerticalScrollIndicator={true} bounces={false}>

                <View style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, position: 'relative', backgroundColor: 'white' }}>

                  {/* Faint Blue Grid Background */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
                    {[...Array(150)].map((_, i) => (
                      <View key={`v-${i}`} style={{ position: 'absolute', left: i * 15 * scale, top: 0, bottom: 0, width: 1, backgroundColor: '#3b82f6' }} />
                    ))}
                    {[...Array(80)].map((_, i) => (
                      <View key={`h-${i}`} style={{ position: 'absolute', top: i * 15 * scale, left: 0, right: 0, height: 1, backgroundColor: '#3b82f6' }} />
                    ))}
                  </View>

                  {/* Legend */}
                  <View style={{ position: 'absolute', top: 10 * scale, right: 200 * scale }}>
                    {[
                      '09 sqm - 87', '12 sqm - 19', '15 sqm - 05', '16 sqm - 04',
                      '18 sqm - 06', '20 sqm - 02', '24 sqm - 07', '27 sqm - 01',
                      '28 sqm - 01', '32 sqm - 01', '36 sqm - 06'
                    ].map(text => (
                      <Text key={text} style={{ fontSize: 20 * scale, color: '#111827', fontFamily: 'monospace', marginVertical: 2 * scale }}>{text}</Text>
                    ))}
                  </View>

                  {/* Reduced translation to 0 */}
                  <View style={{ transform: [{ translateY: 0 }] }}>

                    {/* Structural Walls (Inner layout boundary) */}
                    <View style={{ position: 'absolute', top: 90 * scale, left: 90 * scale, width: 1700 * scale + AISLE_GAP * scale, height: 2 * scale, backgroundColor: '#cbd5e1' }} />
                    <View style={{ position: 'absolute', top: 500 * scale, left: 90 * scale, width: 1700 * scale + AISLE_GAP * scale, height: 2 * scale, backgroundColor: '#cbd5e1' }} />

                    {/* Black Pillars (Outer boundary) */}
                    {[90, 200, 300, 400, 500].map((y) => (
                      <Pillar key={`p-left-${y}`} x={84} y={y} scale={scale} />
                    ))}
                    {[90, 250, 400, 520, 680, 850, 1000, 1150, 1300, 1450, 1600, 1750].map((x) => (
                      <Pillar key={`p-top-${x}`} x={x < 680 ? x : x + AISLE_GAP} y={84} scale={scale} />
                    ))}
                    {[90, 250, 400, 520, 680, 850, 1000, 1150, 1300, 1450, 1600, 1750].map((x) => (
                      <Pillar key={`p-bot-${x}`} x={x < 680 ? x : x + AISLE_GAP} y={496} scale={scale} />
                    ))}


                    {/* Hall 10 Doors */}
                    <Door x={280} y={80} width={60} isTop={true} scale={scale} />

                    {/* Hall 10 Top Utilities */}
                    <UtilityIcon type="orange-box" x={290} y={94} scale={scale} />
                    <UtilityIcon type="purple-solid" x={320} y={94} scale={scale} />
                    <UtilityIcon type="purple-box" x={160} y={94} scale={scale} />
                    <UtilityIcon type="purple-box" x={400} y={94} scale={scale} />
                    <UtilityIcon type="purple-box" x={480} y={94} scale={scale} />
                    <UtilityIcon type="orange-box" x={520} y={105} scale={scale} />

                    {/* Hall 10 Right Utilities */}
                    <UtilityIcon type="purple-box-v" x={525} y={165} scale={scale} />
                    <UtilityIcon type="purple-box-v" x={525} y={255} scale={scale} />
                    <UtilityIcon type="purple-solid" x={525} y={305} scale={scale} />

                    {/* Hall 10 Bottom Utilities */}
                    <UtilityIcon type="orange-swirl" x={85} y={470} scale={scale} />
                    <UtilityIcon type="purple-solid" x={85} y={435} scale={scale} />
                    <UtilityIcon type="purple-box" x={160} y={494} scale={scale} />
                    <UtilityIcon type="purple-box" x={200} y={494} scale={scale} />
                    <UtilityIcon type="purple-box" x={400} y={494} scale={scale} />
                    <UtilityIcon type="purple-box" x={460} y={494} scale={scale} />
                    <UtilityIcon type="purple-solid" x={490} y={494} scale={scale} />
                    <UtilityIcon type="orange-box" x={520} y={475} scale={scale} />

                    {/* Hall Labels */}
                    <Text style={{ position: 'absolute', top: 530 * scale, left: 250 * scale, fontSize: 44 * scale, fontWeight: '600', color: '#111827' }}>HALL 10</Text>
                    <Text style={{ position: 'absolute', top: 530 * scale, left: 750 * scale + HALL9_OFFSET + AISLE_GAP * scale, fontSize: 44 * scale, fontWeight: '600', color: '#111827' }}>HALL 9</Text>
                    <Text style={{ position: 'absolute', top: 530 * scale, left: 1340 * scale + HALL9_OFFSET + AISLE_GAP * scale, fontSize: 44 * scale, fontWeight: '600', color: '#111827' }}>HALL 8</Text>

                    {/* Cargo Entries */}
                    <Text style={{ position: 'absolute', left: 260 * scale, top: 50 * scale, fontSize: 16 * scale, fontWeight: '900', color: '#000' }}>CARGO ENTRY/EXIT</Text>
                    <Text style={{ position: 'absolute', left: 950 * scale + HALL9_OFFSET + AISLE_GAP * scale, top: 60 * scale, fontSize: 16 * scale, fontWeight: '900', color: '#000' }}>CARGO ENTRY/EXIT</Text>

                    {/* Render All Stalls */}
                    {allStalls.map((s, idx) => (
                      <Stall key={idx} scale={scale} statusMap={statusMap} {...s} />
                    ))}


                    <Hall9Structures scale={scale} HALL9_OFFSET={HALL9_OFFSET} AISLE_GAP={AISLE_GAP} />
                    <Hall8Structures scale={scale} x={1210 + HALL9_OFFSET + AISLE_GAP} y={150} />

                  </View>

                </View>
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
