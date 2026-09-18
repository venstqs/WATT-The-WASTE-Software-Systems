import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Rect, Path, Text as SvgText, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Node } from '../data/mockData';

interface GisMapViewProps {
  nodes: Node[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
}

export const getMarkerColor = (waterLevel: number): string => {
  if (waterLevel < 80) return Colors.safe;
  if (waterLevel <= 119) return Colors.warning;
  return Colors.critical;
};

export const GisMapView: React.FC<GisMapViewProps> = ({
  nodes,
  onSelectNode,
  selectedNodeId,
}) => {
  // Use scaled coordinates for web/fallback
  const nodeCoords: Record<string, { x: number; y: number }> = {
    'node-03': { x: 80, y: 80 },   
    'node-05': { x: 200, y: 110 }, 
    'node-07': { x: 270, y: 155 }, 
    'node-12': { x: 290, y: 215 }, 
  };

  return (
    <View style={styles.webContainer}>
      <View style={styles.osmHeader}>
        <View style={styles.osmBadgeRow}>
          <View style={styles.osmLogoDot} />
          <Text style={styles.osmTitle}>OPENSTREETMAP • NAGA BASIN RADAR</Text>
        </View>
        <Text style={styles.osmCoord}>13.6218° N, 123.1948° E</Text>
      </View>

      <View style={styles.svgWrapper}>
        <Svg viewBox="0 0 380 280" style={styles.svgElement}>
          <Defs>
            <LinearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#BAE6FD" />
              <Stop offset="100%" stopColor="#38BDF8" />
            </LinearGradient>
            <LinearGradient id="parkGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#DCFCE7" />
              <Stop offset="100%" stopColor="#BBF7D0" />
            </LinearGradient>
          </Defs>

          {/* Base Terrain */}
          <Rect x="0" y="0" width="380" height="280" fill={Colors.mapLand} />

          {/* Parks & Greenery */}
          <Path d="M 0 0 L 140 0 L 120 70 L 40 90 Z" fill="url(#parkGrad)" opacity={0.6} />
          <Path d="M 280 0 L 380 0 L 380 90 L 260 70 Z" fill="url(#parkGrad)" opacity={0.6} />
          <Path d="M 180 280 L 380 280 L 380 160 L 250 200 Z" fill="url(#parkGrad)" opacity={0.5} />

          {/* Road Grid */}
          <Path d="M 0 60 L 380 60" stroke="#FFFFFF" strokeWidth="4" />
          <Path d="M 0 140 L 380 140" stroke="#FFFFFF" strokeWidth="3" />
          <Path d="M 0 200 L 380 200" stroke="#FFFFFF" strokeWidth="4" />
          <Path d="M 120 0 L 120 280" stroke="#FFFFFF" strokeWidth="5" />
          <Path d="M 240 0 L 240 280" stroke="#FFFFFF" strokeWidth="3.5" />

          {/* Main Highway Arterial */}
          <Path d="M 30 280 Q 80 140 360 20" stroke="#FDE68A" strokeWidth="7" fill="none" />
          <Path d="M 30 280 Q 80 140 360 20" stroke="#D97706" strokeWidth="1.5" fill="none" />

          {/* Naga River Main Stream */}
          <Path
            d="M -10 240 C 80 200, 150 150, 200 130 C 270 100, 320 60, 400 40"
            stroke="url(#waterGrad)"
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M -10 240 C 80 200, 150 150, 200 130 C 270 100, 320 60, 400 40"
            stroke="#0284C7"
            strokeWidth="2"
            fill="none"
          />

          {/* Secondary Estero Tributary */}
          <Path
            d="M 200 130 Q 250 200 320 260"
            stroke="url(#waterGrad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 200 130 Q 250 200 320 260"
            stroke="#0284C7"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Map Labels */}
          <SvgText x="15" y="25" fill="#64748B" fontSize="10" fontWeight="900" letterSpacing="1">
            NAGA RIVER BASIN
          </SvgText>
        </Svg>

        {/* Dynamic Interactive Pin Droplets */}
        {nodes.map((node) => {
          const coords = nodeCoords[node.id] || { x: 190, y: 140 };
          const pinColor = getMarkerColor(node.waterLevel);
          const isSelected = selectedNodeId === node.id;
          const shortName = node.name.split(' - ')[1] || node.name;

          return (
            <TouchableOpacity
              key={node.id}
              activeOpacity={0.9}
              onPress={() => onSelectNode(node.id)}
              style={[
                styles.mapPinTouchable,
                {
                  left: `${(coords.x / 380) * 100}%`,
                  top: `${(coords.y / 280) * 100}%`,
                  zIndex: isSelected ? 10 : 1,
                  transform: [
                    { translateX: -35 }, 
                    { translateY: -18 },
                    { scale: isSelected ? 1.05 : 1 }
                  ],
                  borderColor: isSelected ? Colors.primary : '#FFFFFF',
                  shadowColor: isSelected ? Colors.primary : Colors.cardShadow,
                  shadowOpacity: isSelected ? 0.3 : 0.1,
                },
              ]}
            >
              <View style={styles.pinIndicatorContainer}>
                <View style={[styles.innerPinDot, { backgroundColor: pinColor }]} />
                {isSelected && <View style={[styles.pingRing, { borderColor: pinColor }]} />}
              </View>
              <View style={styles.pinContent}>
                <Text style={styles.pinNameText} numberOfLines={1}>{shortName}</Text>
                <Text style={[styles.pinDepthText, { color: pinColor }]}>
                  {node.waterLevel}cm
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  osmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  osmBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  osmLogoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  osmTitle: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  osmCoord: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  svgWrapper: {
    width: '100%',
    aspectRatio: 380 / 280,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  svgElement: {
    width: '100%',
    height: '100%',
  },
  mapPinTouchable: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    minWidth: 70,
  },
  pinIndicatorContainer: {
    position: 'relative',
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  innerPinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pingRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    opacity: 0.4,
  },
  pinContent: {
    alignItems: 'flex-start',
  },
  pinNameText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: '900',
    maxWidth: 70,
  },
  pinDepthText: {
    fontSize: 10,
    fontWeight: '900',
  },
});
