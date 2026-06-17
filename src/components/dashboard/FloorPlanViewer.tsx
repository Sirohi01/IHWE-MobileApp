import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ZoomIn, ZoomOut, MapPin } from 'lucide-react-native';

// ─── Hatched Wall ───────────────────────────────────────────────────────────
const HatchedWall = ({
  x, y, width, height, scale, isDiagonal,
}: {
  x: number; y: number; width: number; height: number; scale: number; isDiagonal?: boolean;
}) => {
  const d = Math.max(width, height);
  const numLines = Math.floor((d * 2) / 6);
  return (
    <View
      style={{
        position: 'absolute',
        top: y * scale,
        left: x * scale,
        width: width * scale,
        height: height * scale,
        borderColor: '#ea580c',
        borderWidth: 1 * scale,
        overflow: 'hidden',
        backgroundColor: '#fff7ed',
        transform: isDiagonal ? [{ rotate: '56deg' }] : undefined,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -d * scale,
          left: -d * scale,
          width: d * 3 * scale,
          height: d * 3 * scale,
          flexDirection: 'row',
        }}
      >
        {[...Array(Math.max(0, numLines))].map((_, i) => (
          <View
            key={i}
            style={{
              width: 1 * scale,
              height: '100%',
              backgroundColor: '#fdba74',
              marginLeft: 5 * scale,
              transform: [{ rotate: '45deg' }],
            }}
          />
        ))}
      </View>
    </View>
  );
};

// ─── ZigZag Gate ────────────────────────────────────────────────────────────
const ZigZagGate = ({
  x, y, width, scale,
}: {
  x: number; y: number; width: number; scale: number;
}) => {
  const segments = Math.max(1, Math.floor(width / 15));
  const segW = width / segments;
  return (
    <View
      style={{
        position: 'absolute',
        left: x * scale,
        top: y * scale,
        width: width * scale,
        height: 10 * scale,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {[...Array(segments)].map((_, i) => (
        <View
          key={i}
          style={{
            width: segW * scale,
            height: 10 * scale,
            borderLeftWidth: 1 * scale,
            borderRightWidth: i === segments - 1 ? 1 * scale : 0,
            borderColor: '#475569',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -2 * scale,
              left: (segW / 2 - 1) * scale,
              width: 1 * scale,
              height: 14 * scale,
              backgroundColor: '#475569',
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: -2 * scale,
              left: (segW / 2 - 1) * scale,
              width: 1 * scale,
              height: 14 * scale,
              backgroundColor: '#475569',
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </View>
      ))}
      <View
        style={{
          position: 'absolute',
          right: -4 * scale,
          top: -2 * scale,
          width: 4 * scale,
          height: 14 * scale,
          backgroundColor: '#ef4444',
        }}
      />
    </View>
  );
};

// ─── Down Arrow ─────────────────────────────────────────────────────────────
const DownArrow = ({ scale }: { scale: number }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={{ width: 16 * scale, height: 24 * scale, backgroundColor: '#111827' }} />
    <View
      style={{
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 20 * scale,
        borderRightWidth: 20 * scale,
        borderTopWidth: 20 * scale,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#111827',
      }}
    />
  </View>
);

// ─── Door Arc ───────────────────────────────────────────────────────────────
const Door = ({
  x, y, width, isTop, scale,
}: {
  x: number; y: number; width: number; isTop: boolean; scale: number;
}) => (
  <View
    style={{
      position: 'absolute',
      left: x * scale,
      top: y * scale,
      width: width * scale,
      height: 20 * scale,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      justifyContent: 'center',
      zIndex: 5,
    }}
  >
    <View
      style={{
        width: (width / 2) * scale,
        height: (width / 2) * scale,
        borderTopWidth: isTop ? 1 * scale : 0,
        borderBottomWidth: !isTop ? 1 * scale : 0,
        borderRightWidth: 1 * scale,
        borderColor: '#000',
        borderTopRightRadius: isTop ? (width / 2) * scale : 0,
        borderBottomRightRadius: !isTop ? (width / 2) * scale : 0,
        transform: [{ translateY: isTop ? -10 * scale : 10 * scale }],
      }}
    />
    <View
      style={{
        width: (width / 2) * scale,
        height: (width / 2) * scale,
        borderTopWidth: isTop ? 1 * scale : 0,
        borderBottomWidth: !isTop ? 1 * scale : 0,
        borderLeftWidth: 1 * scale,
        borderColor: '#000',
        borderTopLeftRadius: isTop ? (width / 2) * scale : 0,
        borderBottomLeftRadius: !isTop ? (width / 2) * scale : 0,
        transform: [{ translateY: isTop ? -10 * scale : 10 * scale }],
      }}
    />
  </View>
);

// ─── Utility Icon ────────────────────────────────────────────────────────────
type UtilType = 'purple-box' | 'orange-box' | 'purple-solid' | 'orange-swirl' | 'purple-box-v';
const UtilityIcon = ({
  x, y, type, scale,
}: {
  x: number; y: number; type: UtilType; scale: number;
}) => {
  if (type === 'purple-box') {
    return (
      <View
        style={{
          position: 'absolute',
          left: x * scale,
          top: y * scale,
          width: 16 * scale,
          height: 8 * scale,
          borderWidth: 2 * scale,
          borderColor: '#6b21a8',
          backgroundColor: 'transparent',
        }}
      />
    );
  }
  if (type === 'purple-box-v') {
    return (
      <View
        style={{
          position: 'absolute',
          left: x * scale,
          top: y * scale,
          width: 8 * scale,
          height: 16 * scale,
          borderWidth: 2 * scale,
          borderColor: '#6b21a8',
          backgroundColor: 'transparent',
        }}
      />
    );
  }
  if (type === 'purple-solid') {
    return (
      <View
        style={{
          position: 'absolute',
          left: x * scale,
          top: y * scale,
          width: 14 * scale,
          height: 14 * scale,
          backgroundColor: '#6b21a8',
          borderRadius: 2 * scale,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 6 * scale,
            height: 6 * scale,
            backgroundColor: 'white',
            borderRadius: 3 * scale,
          }}
        />
      </View>
    );
  }
  if (type === 'orange-box') {
    return (
      <View
        style={{
          position: 'absolute',
          left: x * scale,
          top: y * scale,
          width: 12 * scale,
          height: 12 * scale,
          borderWidth: 1 * scale,
          borderColor: '#ea580c',
          backgroundColor: '#fed7aa',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -5 * scale,
            left: 5 * scale,
            width: 1 * scale,
            height: 20 * scale,
            backgroundColor: '#ea580c',
            transform: [{ rotate: '45deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: -5 * scale,
            left: 2 * scale,
            width: 1 * scale,
            height: 20 * scale,
            backgroundColor: '#ea580c',
            transform: [{ rotate: '45deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: -5 * scale,
            left: 8 * scale,
            width: 1 * scale,
            height: 20 * scale,
            backgroundColor: '#ea580c',
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    );
  }
  if (type === 'orange-swirl') {
    return (
      <View
        style={{
          position: 'absolute',
          left: x * scale,
          top: y * scale,
          width: 20 * scale,
          height: 20 * scale,
          borderWidth: 2 * scale,
          borderColor: '#ea580c',
          backgroundColor: 'transparent',
          borderRadius: 10 * scale,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 10 * scale,
            height: 10 * scale,
            borderWidth: 2 * scale,
            borderColor: '#ea580c',
            borderRadius: 5 * scale,
          }}
        />
      </View>
    );
  }
  return null;
};

// ─── Pillar ──────────────────────────────────────────────────────────────────
const Pillar = ({ x, y, scale }: { x: number; y: number; scale: number }) => (
  <View
    style={{
      position: 'absolute',
      left: x * scale,
      top: y * scale,
      width: 12 * scale,
      height: 12 * scale,
      backgroundColor: '#000',
      zIndex: 10,
    }}
  />
);

// ─── Round Table with Chairs (Buyer Meet) ────────────────────────────────────
const RoundTable = ({ x, y, scale }: { x: number; y: number; scale: number }) => {
  const tableSize = 22 * scale;
  const chairSize = 7 * scale;
  const offset = 14 * scale;
  return (
    <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: 36 * scale, height: 36 * scale }}>
      {/* Top chair */}
      <View style={{ position: 'absolute', left: 14 * scale, top: 0, width: chairSize, height: chairSize, backgroundColor: '#374151', borderRadius: 2 * scale }} />
      {/* Bottom chair */}
      <View style={{ position: 'absolute', left: 14 * scale, bottom: 0, width: chairSize, height: chairSize, backgroundColor: '#374151', borderRadius: 2 * scale }} />
      {/* Left chair */}
      <View style={{ position: 'absolute', left: 0, top: 14 * scale, width: chairSize, height: chairSize, backgroundColor: '#374151', borderRadius: 2 * scale }} />
      {/* Right chair */}
      <View style={{ position: 'absolute', right: 0, top: 14 * scale, width: chairSize, height: chairSize, backgroundColor: '#374151', borderRadius: 2 * scale }} />
      {/* Round table */}
      <View style={{
        position: 'absolute',
        left: 7 * scale,
        top: 7 * scale,
        width: tableSize,
        height: tableSize,
        backgroundColor: '#d1d5db',
        borderRadius: tableSize / 2,
        borderWidth: 1 * scale,
        borderColor: '#374151',
      }} />
    </View>
  );
};

// ─── Stall ───────────────────────────────────────────────────────────────────
const getColorForStatus = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'premium': return '#0284c7';
    case 'booked': return '#16a34a';
    case 'hold': return '#eab308';
    default: return '#cbd5e1';
  }
};

const Stall = ({
  id, backendId, w, h, x, y, scale, statusMap, defaultStatus,
}: {
  id: string; backendId: string; w: number; h: number; x: number; y: number;
  scale: number; statusMap: Record<string, string>; defaultStatus?: string;
}) => {
  const status = statusMap[backendId] ?? defaultStatus ?? 'available';
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
        numberOfLines={4}
      >
        {id}
      </Text>
    </View>
  );
};

// ─── Hall 9 Structures ───────────────────────────────────────────────────────
const Hall9Structures = ({
  scale, BLOCK_82_X,
}: {
  scale: number; BLOCK_82_X: number;
}) => (
  <View style={{ position: 'absolute', left: 0, top: 0 }}>
    {/* Horizontal wall above 82-84 */}
    <View
      style={{
        position: 'absolute',
        left: BLOCK_82_X * scale,
        top: 160 * scale,
        width: 80 * scale,
        height: 1 * scale,
        backgroundColor: '#000',
      }}
    />
    {/* Arc door */}
    <View
      style={{
        position: 'absolute',
        left: (BLOCK_82_X + 80) * scale,
        top: 140 * scale,
        width: 20 * scale,
        height: 20 * scale,
        borderBottomWidth: 1 * scale,
        borderLeftWidth: 1 * scale,
        borderColor: '#000',
        borderBottomLeftRadius: 20 * scale,
      }}
    />

    {/* Staircase block */}
    <View
      style={{
        position: 'absolute',
        left: (BLOCK_82_X + 100) * scale,
        top: 160 * scale,
        width: 30 * scale,
        height: 60 * scale,
        borderWidth: 1 * scale,
        borderColor: '#000',
        backgroundColor: '#fff',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 20 * scale,
          left: 0,
          width: 30 * scale,
          height: 20 * scale,
          borderWidth: 1 * scale,
          borderColor: '#000',
          flexDirection: 'row',
        }}
      >
        <View style={{ flex: 1 }} />
        <View
          style={{
            width: 12 * scale,
            borderLeftWidth: 1 * scale,
            borderRightWidth: 1 * scale,
            borderColor: '#000',
            flexDirection: 'column',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ flex: 1, borderBottomWidth: 1 * scale, borderColor: '#000' }} />
          ))}
        </View>
        <View style={{ flex: 1 }} />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 10 * scale,
          height: 10 * scale,
          borderTopWidth: 1 * scale,
          borderLeftWidth: 1 * scale,
          borderColor: '#000',
          borderTopLeftRadius: 10 * scale,
        }}
      />
    </View>

    {/* Entry arc doors at bottom */}
    <View
      style={{
        position: 'absolute',
        left: (BLOCK_82_X + 30) * scale,
        top: 490 * scale,
        flexDirection: 'row',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            width: 20 * scale,
            height: 20 * scale,
            borderBottomWidth: 1 * scale,
            borderLeftWidth: 1 * scale,
            borderColor: '#000',
            borderBottomLeftRadius: 20 * scale,
            transform: [{ scaleY: -1 }],
          }}
        />
      ))}
    </View>

    {/* Pillars bottom left block */}
    <Pillar x={BLOCK_82_X + 10} y={400} scale={scale} />
    <Pillar x={BLOCK_82_X + 130} y={400} scale={scale} />
    <Pillar x={BLOCK_82_X + 10} y={490} scale={scale} />
    <Pillar x={BLOCK_82_X + 130} y={490} scale={scale} />

    {/* Desk */}
    <View
      style={{
        position: 'absolute',
        left: (BLOCK_82_X + 110) * scale,
        top: 410 * scale,
        width: 20 * scale,
        height: 80 * scale,
        borderWidth: 1 * scale,
        borderColor: '#ea580c',
        borderTopRightRadius: 15 * scale,
        backgroundColor: '#fff',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 15 * scale,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: 1 * scale,
          borderColor: '#ea580c',
        }}
      />
    </View>

    {/* Hall 9 utility icons */}
    <UtilityIcon type="orange-swirl" x={BLOCK_82_X - 10} y={410} scale={scale} />
    <UtilityIcon type="orange-swirl" x={BLOCK_82_X + 145} y={470} scale={scale} />
  </View>
);

// ─── Hall 8 Structures ───────────────────────────────────────────────────────
const Hall8Structures = ({
  scale, x, y,
}: {
  scale: number; x: number; y: number;
}) => (
  <View style={{ position: 'absolute', left: x * scale, top: y * scale }}>
    {/* Stairs & Lift block */}
    <View
      style={{
        position: 'absolute',
        top: 50 * scale,
        left: 0,
        width: 120 * scale,
        height: 160 * scale,
        borderWidth: 2 * scale,
        borderColor: '#000',
        backgroundColor: '#fff',
      }}
    >
      {/* LIFT box */}
      <View
        style={{
          position: 'absolute',
          top: 80 * scale,
          right: 0,
          width: 50 * scale,
          height: 50 * scale,
          borderWidth: 1 * scale,
          borderColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 8 * scale, fontWeight: 'bold' }}>LIFT</Text>
      </View>
      {/* Stair steps */}
      <View
        style={{
          position: 'absolute',
          top: 130 * scale,
          left: 10 * scale,
          width: 60 * scale,
          height: 20 * scale,
          borderWidth: 1 * scale,
          borderColor: '#000',
          flexDirection: 'row',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={{ flex: 1, borderRightWidth: 1 * scale, borderColor: '#000' }} />
        ))}
      </View>
    </View>

    {/* Toilets block */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 120 * scale,
        width: 80 * scale,
        height: 210 * scale,
        borderWidth: 2 * scale,
        borderColor: '#000',
        backgroundColor: '#fff',
      }}
    >
      <View
        style={{
          height: 60 * scale,
          borderBottomWidth: 1 * scale,
          borderColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 8 * scale, textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
          {'LADIES\nTOILET'}
        </Text>
      </View>
      <View
        style={{
          height: 40 * scale,
          borderBottomWidth: 1 * scale,
          borderColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 7 * scale, textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
          {'DISABLED\nTOILET'}
        </Text>
      </View>
      <View
        style={{ height: 110 * scale, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ fontSize: 8 * scale, textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
          {"GENT'S\nTOILET"}
        </Text>
      </View>
    </View>

    {/* Buyer Meet rooms — 4 rooms with round tables matching image */}
    <View
      style={{
        position: 'absolute',
        top: 210 * scale,
        left: -60 * scale,
        width: 260 * scale,
        height: 80 * scale,
        flexDirection: 'row',
        gap: 4 * scale,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: '#fde047',
            borderWidth: 1.5 * scale,
            borderColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Round table with chairs */}
          <View style={{ transform: [{ scale: 0.7 }] }}>
            <RoundTable x={0} y={0} scale={scale} />
          </View>
        </View>
      ))}
    </View>

    {/* Seminar Hall */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 200 * scale,
        width: 220 * scale,
        height: 290 * scale,
        backgroundColor: '#fde047',
        borderWidth: 2 * scale,
        borderColor: '#000',
      }}
    >
      {/* Seats grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          padding: 8 * scale,
          gap: 2 * scale,
          height: 210 * scale,
          overflow: 'hidden',
        }}
      >
        {[...Array(100)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 13 * scale,
              height: 9 * scale,
              backgroundColor: '#374151',
              borderRadius: 1.5 * scale,
            }}
          />
        ))}
      </View>
      {/* Stage/Label */}
      <View
        style={{
          position: 'absolute',
          bottom: 16 * scale,
          left: 16 * scale,
          right: 16 * scale,
          height: 55 * scale,
          backgroundColor: '#fbcfe8',
          borderWidth: 1 * scale,
          borderColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 11 * scale, fontWeight: '900', color: '#000' }}>
          SEMINAR HALL
        </Text>
      </View>
    </View>
  </View>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
export interface StallData {
  id: string;
  status?: 'available' | 'booked' | 'hold' | 'premium';
}

const cs = (
  idText: string, backendId: string, w: number, h: number,
  x: number, y: number, defaultStatus = 'available',
) => ({ id: idText, backendId, w, h, x, y, defaultStatus });

const seq = (
  start: number, count: number, sqm: string,
  w: number, h: number,
  startX: number, startY: number,
  dx: number, dy: number,
  decrement = true, defaultStatus = 'available',
) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const num = decrement ? start - i : start + i;
    arr.push(cs(`Stall No. ${num}\n${sqm} Sqm`, num.toString(), w, h, startX + i * dx, startY + i * dy, defaultStatus));
  }
  return arr;
};

// ─── Main Component ──────────────────────────────────────────────────────────
export interface FloorPlanViewerProps {
  visible: boolean;
  onClose: () => void;
  backendStalls?: StallData[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FloorPlanViewer = ({
  visible, onClose, backendStalls = [],
}: FloorPlanViewerProps) => {
  const BASE_WIDTH = 2200;
  const BASE_HEIGHT = 800;
  const [scale, setScale] = useState(0.5);

  const CANVAS_WIDTH = BASE_WIDTH * scale;
  const CANVAS_HEIGHT = BASE_HEIGHT * scale;

  const statusMap = backendStalls.reduce<Record<string, string>>((acc, s) => {
    if (s.status) acc[s.id] = s.status;
    return acc;
  }, {});

  // Hall 9 geometry
  const HALL9_OFFSET = -20;
  const AISLE_GAP = 40;
  const BLOCK_82_X = 540 + HALL9_OFFSET + AISLE_GAP; // 560
  const BLOCK_70_X = 760;

  // ── All stalls ─────────────────────────────────────────────────────────────
  const allStalls = [
    // ══ HALL 10 ══
    cs('Stall No. 180\n15 Sqm', '180', 30, 50, 100, 100, 'premium'),
    ...seq(181, 7, '09', 30, 30, 100, 150, 0, 30, false),
    ...seq(188, 3, '09', 30, 30, 100, 360, 0, 30, false),

    cs('Stall No.\n159, 160 & 179\n24 Sqm', '159,160,179', 40, 60, 160, 100, 'premium'),
    ...seq(178, 8, '09', 30, 30, 200, 100, 30, 0),
    ...seq(161, 8, '09', 30, 30, 200, 130, 30, 0, false),
    cs('Stall No.\n169 & 170\n18 Sqm', '169,170', 30, 60, 440, 100, 'premium'),

    cs('Stall No.\n138, 139 & 158\n24 Sqm', '138,139,158', 40, 60, 160, 190, 'premium'),
    ...seq(157, 7, '09', 30, 30, 200, 190, 30, 0),
    ...seq(140, 5, '09', 30, 30, 200, 220, 30, 0, false),
    ...seq(145, 2, '09', 30, 30, 350, 220, 30, 0, false),
    cs('Stall No.\n147, 148, 149 & 150\n36 Sqm', '147,148,149,150', 60, 60, 410, 190, 'premium'),

    cs('Stall No.\n117, 118 & 137\n24 Sqm', '117,118,137', 40, 60, 160, 280, 'premium'),
    ...seq(136, 2, '09', 30, 30, 200, 280, 30, 0),
    ...seq(134, 2, '09', 30, 30, 260, 280, 30, 0),
    ...seq(132, 3, '09', 30, 30, 320, 280, 30, 0),
    ...seq(119, 1, '09', 30, 30, 200, 310, 30, 0, false),
    ...seq(120, 6, '09', 30, 30, 230, 310, 30, 0, false),
    cs('Stall No.\n126, 127, 128 & 129\n36 Sqm', '126,127,128,129', 60, 60, 410, 280, 'premium'),

    cs('Stall No.\n96, 97 & 116\n24 Sqm', '96,97,116', 40, 60, 160, 370, 'premium'),
    ...seq(115, 6, '09', 30, 30, 200, 370, 30, 0),
    ...seq(109, 1, '09', 30, 30, 380, 370, 30, 0),
    ...seq(98, 7, '09', 30, 30, 200, 400, 30, 0, false),
    cs('Stall No.\n105, 106, 107 & 108\n36 Sqm', '105,106,107,108', 60, 60, 410, 370, 'premium'),

    cs('Stall No.\n94 & 95\n18 Sqm', '94,95', 60, 30, 100, 460, 'premium'),
    ...seq(93, 3, '12', 40, 30, 160, 460, 40, 0),
    ...seq(90, 2, '12', 40, 30, 280, 460, 40, 0),
    cs('Stall No. 88\n12 Sqm', '88', 40, 30, 360, 460),
    cs('Stall No. 87\n12 Sqm', '87', 40, 30, 400, 460),
    cs('Stall No.\n85 & 86\n18 Sqm', '85,86', 60, 30, 440, 460, 'premium'),

    // ══ HALL 9 — Left block (82..72) ══
    cs('Stall No.\n82, 83 & 84\n27 Sqm', '82,83,84', 90, 30, BLOCK_82_X, 190),
    cs('Stall No.\n79, 80 & 81\n24 Sqm', '79,80,81', 80, 30, BLOCK_82_X, 280, 'premium'),
    cs('Stall No.\n75, 76, 77 & 78\n32 Sqm', '75,76,77,78', 80, 40, BLOCK_82_X, 310, 'premium'),
    cs('Stall No.\n72, 73 & 74\n24 Sqm', '72,73,74', 60, 40, BLOCK_82_X + 80, 310, 'premium'),

    // ══ HALL 9 — Right section ══
    // Row 1
    cs('Stall No.\n70 & 71\n18 Sqm', '70,71', 60, 30, BLOCK_70_X, 190, 'premium'),
    ...seq(69, 6, '09', 30, 30, BLOCK_70_X + 60, 190, 30, 0),
    cs('Stall No. 63\n09 Sqm', '63', 30, 30, BLOCK_70_X + 240, 190),
    cs('Stall No.\n61 & 62\n18 Sqm', '61,62', 60, 30, BLOCK_70_X + 270, 190, 'premium'),

    // Row 2
    cs('Stall No.\n40, 41 & 60\n24 Sqm', '40,41,60', 60, 60, BLOCK_70_X, 280, 'premium'),
    cs('Stall No. 59\n09 Sqm', '59', 30, 30, BLOCK_70_X + 60, 280),
    ...seq(58, 5, '09', 30, 30, BLOCK_70_X + 90, 280, 30, 0),
    cs('Stall No. 53\n09 Sqm', '53', 30, 30, BLOCK_70_X + 240, 280),
    cs('Stall No. 42\n09 Sqm', '42', 30, 30, BLOCK_70_X + 60, 310),
    cs('Stall No. 43\n09 Sqm', '43', 30, 30, BLOCK_70_X + 90, 310),
    cs('Stall No. 44\n09 Sqm', '44', 30, 30, BLOCK_70_X + 120, 310),
    ...seq(45, 3, '09', 30, 30, BLOCK_70_X + 150, 310, 30, 0, false),
    cs('Stall No. 48\n09 Sqm', '48', 30, 30, BLOCK_70_X + 240, 310),
    cs('Stall No.\n51 & 52\n18 Sqm', '51,52', 60, 30, BLOCK_70_X + 270, 280, 'premium'),
    cs('Stall No.\n49 & 50\n18 Sqm', '49,50', 60, 30, BLOCK_70_X + 270, 310, 'premium'),

    // Row 3
    cs('Stall No.\n13, 14 & 39\n28 Sqm', '13,14,39', 60, 60, BLOCK_70_X, 370, 'premium'),
    cs('Stall No.\n37 & 38\n15 Sqm', '37,38', 50, 30, BLOCK_70_X + 60, 370),
    cs('Stall No.\n35 & 36\n12 Sqm', '35,36', 40, 30, BLOCK_70_X + 110, 370),
    cs('Stall No.\n33 & 34\n12 Sqm', '33,34', 40, 30, BLOCK_70_X + 150, 370),
    cs('Stall No.\n31 & 32\n12 Sqm', '31,32', 40, 30, BLOCK_70_X + 190, 370),
    cs('Stall No.\n29 & 30\n12 Sqm', '29,30', 40, 30, BLOCK_70_X + 230, 370),
    cs('Stall No.\n15 & 16\n20 Sqm', '15,16', 50, 30, BLOCK_70_X + 60, 400),
    cs('Stall No.\n17 & 18\n16 Sqm', '17,18', 40, 30, BLOCK_70_X + 110, 400),
    cs('Stall No.\n19 & 20\n16 Sqm', '19,20', 40, 30, BLOCK_70_X + 150, 400),
    cs('Stall No.\n21 & 22\n16 Sqm', '21,22', 40, 30, BLOCK_70_X + 190, 400),
    cs('Stall No.\n23 & 24\n16 Sqm', '23,24', 40, 30, BLOCK_70_X + 230, 400),
    cs('Stall No.\n27 & 28\n18 Sqm', '27,28', 60, 30, BLOCK_70_X + 270, 370, 'premium'),
    cs('Stall No.\n25 & 26\n20 Sqm', '25,26', 60, 30, BLOCK_70_X + 270, 400, 'premium'),

    // Row 4
    cs('Stall No.\n11 & 12\n18 Sqm', '11,12', 60, 30, BLOCK_70_X, 460, 'premium'),
    cs('Stall No. 10\n12 Sqm', '10', 40, 30, BLOCK_70_X + 60, 460),
    cs('Stall No. 09\n12 Sqm', '09', 40, 30, BLOCK_70_X + 100, 460),
    cs('Stall No. 08\n12 Sqm', '08', 40, 30, BLOCK_70_X + 140, 460),
    ...seq(7, 5, '12', 40, 30, BLOCK_70_X + 180, 460, 40, 0),
    cs('Stall No.\n01 & 02\n20 Sqm', '01,02', 50, 30, BLOCK_70_X + 380, 460, 'premium'),
  ];

  // ── Hall 9 right: utility icons that need BLOCK_70_X ──────────────────────
  const Hall9RightUtils = () => (
    <>
      <UtilityIcon type="purple-box" x={BLOCK_70_X + 135} y={94} scale={scale} />
      <UtilityIcon type="purple-solid" x={BLOCK_70_X + 195} y={94} scale={scale} />
      <UtilityIcon type="purple-solid" x={BLOCK_70_X + 340} y={285} scale={scale} />
      <UtilityIcon type="orange-swirl" x={BLOCK_70_X - 25} y={465} scale={scale} />
      <UtilityIcon type="purple-box" x={BLOCK_70_X + 195} y={494} scale={scale} />
      <UtilityIcon type="purple-box" x={BLOCK_70_X + 235} y={494} scale={scale} />
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Rotated landscape container */}
        <View
          style={{
            width: SCREEN_HEIGHT,
            height: SCREEN_WIDTH,
            transform: [{ rotate: '90deg' }],
            position: 'absolute',
            top: (SCREEN_HEIGHT - SCREEN_WIDTH) / 2,
            left: (SCREEN_WIDTH - SCREEN_HEIGHT) / 2,
            backgroundColor: 'white',
          }}
        >
          {/* ── Header ── */}
          <View
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderColor: '#e2e8f0',
              backgroundColor: '#fff',
              zIndex: 20,
            }}
          >
            {/* Left: icon + title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MapPin size={24} color="#0f172a" />
              <View>
                <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 20 }}>Floor Plan</Text>
                <Text style={{ color: '#64748b', fontWeight: '500', fontSize: 12 }}>Hall 8, 9 & 10</Text>
              </View>
            </View>

            {/* Center: event info */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#111827', fontWeight: '900', fontSize: 14 }}>21 TO 23 AUGUST 2026</Text>
              <Text style={{ color: '#374151', fontWeight: '500', fontSize: 11 }}>Pragati Maidan New Delhi, Bharat</Text>
              <Text style={{ color: '#111827', fontWeight: '900', fontSize: 16 }}>Exhibition Layout</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {/* Zoom controls */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                }}
              >
                <TouchableOpacity
                  onPress={() => setScale((s) => Math.max(0.3, +(s - 0.1).toFixed(1)))}
                  style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                >
                  <ZoomOut size={18} color="#0f172a" />
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', color: '#334155', fontSize: 13, width: 40, textAlign: 'center' }}>
                  {Math.round(scale * 100)}%
                </Text>
                <TouchableOpacity
                  onPress={() => setScale((s) => Math.min(1.5, +(s + 0.1).toFixed(1)))}
                  style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                >
                  <ZoomIn size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              {/* Close */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 40, height: 40,
                  backgroundColor: '#fef2f2',
                  borderWidth: 1, borderColor: '#fecaca',
                  borderRadius: 20,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Canvas ── */}
          <View style={{ flex: 1, marginTop: 70, backgroundColor: '#f8fafc' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator bounces={false}>
              <ScrollView showsVerticalScrollIndicator bounces={false}>

                <View
                  style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    position: 'relative',
                    backgroundColor: 'white',
                  }}
                >
                  {/* Grid */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08 }}>
                    {[...Array(150)].map((_, i) => (
                      <View key={`v${i}`} style={{ position: 'absolute', left: i * 15 * scale, top: 0, bottom: 0, width: 1, backgroundColor: '#3b82f6' }} />
                    ))}
                    {[...Array(80)].map((_, i) => (
                      <View key={`h${i}`} style={{ position: 'absolute', top: i * 15 * scale, left: 0, right: 0, height: 1, backgroundColor: '#3b82f6' }} />
                    ))}
                  </View>

                  {/* ── Legend ── */}
                  <View style={{ position: 'absolute', top: 10 * scale, right: 200 * scale }}>
                    {[
                      '09 sqm - 87', '12 sqm - 19', '15 sqm - 05', '16 sqm - 04',
                      '18 sqm - 06', '20 sqm - 02', '24 sqm - 07', '27 sqm - 01',
                      '28 sqm - 01', '32 sqm - 01', '36 sqm - 06',
                    ].map((t) => (
                      <Text key={t} style={{ fontSize: 20 * scale, color: '#111827', fontFamily: 'monospace', marginVertical: 2 * scale }}>
                        {t}
                      </Text>
                    ))}
                  </View>

                  {/* ══ OUTER WALLS ══ */}
                  {/* Top */}
                  <HatchedWall y={88} x={88} width={436} height={4} scale={scale} />
                  <HatchedWall y={88} x={520} width={4} height={76} scale={scale} />
                  <HatchedWall y={160} x={520} width={44} height={4} scale={scale} />
                  <HatchedWall y={88} x={560} width={4} height={76} scale={scale} />
                  <HatchedWall y={88} x={560} width={634} height={4} scale={scale} />
                  <HatchedWall y={88} x={1190} width={4} height={76} scale={scale} />
                  <HatchedWall y={160} x={1190} width={44} height={4} scale={scale} />
                  <HatchedWall y={88} x={1230} width={4} height={76} scale={scale} />
                  <HatchedWall y={88} x={1230} width={250} height={4} scale={scale} />
                  {/* Bottom */}
                  <HatchedWall y={498} x={88} width={436} height={4} scale={scale} />
                  <HatchedWall y={410} x={520} width={4} height={92} scale={scale} />
                  <HatchedWall y={410} x={520} width={44} height={4} scale={scale} />
                  <HatchedWall y={410} x={560} width={4} height={92} scale={scale} />
                  <HatchedWall y={498} x={560} width={634} height={4} scale={scale} />
                  <HatchedWall y={450} x={1190} width={4} height={52} scale={scale} />
                  <HatchedWall y={450} x={1190} width={480} height={4} scale={scale} />
                  {/* Left */}
                  <HatchedWall y={88} x={88} width={4} height={414} scale={scale} />
                  {/* Diagonal right Hall 8 */}
                  <HatchedWall y={290} x={1478} width={250} height={4} scale={scale} isDiagonal />

                  {/* ══ PILLARS ══ */}
                  {[90, 200, 300, 400, 500].map((py) => (
                    <Pillar key={`pl${py}`} x={84} y={py} scale={scale} />
                  ))}
                  {[90, 250, 400, 500, 680, 850, 1000, 1150, 1300, 1450, 1550].map((px) => (
                    <Pillar key={`pt${px}`} x={px < 600 ? px : px + AISLE_GAP} y={84} scale={scale} />
                  ))}
                  {[90, 250, 400, 500, 680, 850, 1000, 1150].map((px) => (
                    <Pillar key={`pb${px}`} x={px < 600 ? px : px + AISLE_GAP} y={496} scale={scale} />
                  ))}
                  {[1230, 1350, 1470, 1600].map((px) => (
                    <Pillar key={`pb8${px}`} x={px} y={446} scale={scale} />
                  ))}

                  {/* ══ DOORS ══ */}
                  <Door x={280} y={80} width={60} isTop scale={scale} />
                  <Door x={1190} y={152} width={40} isTop scale={scale} />

                  {/* ══ ZIGZAG GATES ══ */}
                  <ZigZagGate x={520} y={406} width={40} scale={scale} />
                  <ZigZagGate x={1190} y={446} width={40} scale={scale} />

                  {/* ══ DOWN ARROW (entry/exit) ══ */}
                  <View style={{ position: 'absolute', top: 460 * scale, left: 1195 * scale }}>
                    <DownArrow scale={scale * 1.5} />
                  </View>

                  {/* ══ UTILITY ICONS — HALL 10 ══ */}
                  <UtilityIcon type="orange-box" x={290} y={94} scale={scale} />
                  <UtilityIcon type="purple-solid" x={320} y={94} scale={scale} />
                  <UtilityIcon type="purple-box" x={160} y={94} scale={scale} />
                  <UtilityIcon type="purple-box" x={400} y={94} scale={scale} />
                  <UtilityIcon type="purple-box" x={480} y={94} scale={scale} />
                  <UtilityIcon type="orange-box" x={520} y={105} scale={scale} />
                  <UtilityIcon type="purple-box-v" x={525} y={165} scale={scale} />
                  <UtilityIcon type="purple-box-v" x={525} y={255} scale={scale} />
                  <UtilityIcon type="purple-solid" x={525} y={305} scale={scale} />
                  <UtilityIcon type="orange-swirl" x={85} y={470} scale={scale} />
                  <UtilityIcon type="purple-solid" x={85} y={435} scale={scale} />
                  <UtilityIcon type="purple-box" x={160} y={494} scale={scale} />
                  <UtilityIcon type="purple-box" x={200} y={494} scale={scale} />
                  <UtilityIcon type="purple-box" x={400} y={494} scale={scale} />
                  <UtilityIcon type="purple-box" x={460} y={494} scale={scale} />
                  <UtilityIcon type="purple-solid" x={490} y={494} scale={scale} />
                  <UtilityIcon type="orange-box" x={520} y={475} scale={scale} />

                  {/* ══ UTILITY ICONS — HALL 9 RIGHT ══ */}
                  <Hall9RightUtils />

                  {/* ══ LABELS ══ */}
                  <Text style={{ position: 'absolute', top: 540 * scale, left: 200 * scale, fontSize: 50 * scale, fontWeight: '900', color: '#111827' }}>HALL 10</Text>
                  <Text style={{ position: 'absolute', top: 540 * scale, left: 800 * scale, fontSize: 50 * scale, fontWeight: '900', color: '#111827' }}>HALL 9</Text>
                  <Text style={{ position: 'absolute', top: 540 * scale, left: 1260 * scale, fontSize: 50 * scale, fontWeight: '900', color: '#111827' }}>HALL 8</Text>

                  <Text style={{ position: 'absolute', left: 250 * scale, top: 50 * scale, fontSize: 16 * scale, fontWeight: '900', color: '#000', textAlign: 'center' }}>
                    {'CARGO\nENTRY/EXIT'}
                  </Text>
                  <Text style={{ position: 'absolute', left: 1160 * scale, top: 50 * scale, fontSize: 16 * scale, fontWeight: '900', color: '#000', textAlign: 'center' }}>
                    {'CARGO\nENTRY/EXIT'}
                  </Text>

                  {/* ══ STALLS ══ */}
                  {allStalls.map((s, idx) => (
                    <Stall key={idx} scale={scale} statusMap={statusMap} {...s} />
                  ))}

                  {/* ══ HALL 9 STRUCTURES ══ */}
                  <Hall9Structures scale={scale} BLOCK_82_X={BLOCK_82_X} />

                  {/* ══ HALL 8 STRUCTURES ══ */}
                  <Hall8Structures
                    scale={scale}
                    x={1210 + HALL9_OFFSET + AISLE_GAP}
                    y={150}
                  />

                </View>
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FloorPlanViewer;