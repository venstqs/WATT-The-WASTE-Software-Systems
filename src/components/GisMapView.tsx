import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Rect, Line, Path, Text as SvgText, Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Node } from '../data/mockData';

interface GisMapViewProps {
  nodes: Node[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
}

const openStreetMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#F4F1EA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#D6EBD0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E2E8F0' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#FEF3C7' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#BAE6FD' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0284C7' }] },
];

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
  if (Platform.OS !== 'web') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const MapView = require('react-native-maps').default;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Marker, Callout } = require('react-native-maps');

      const initialRegion = {
        latitude: 13.6218,
        longitude: 123.1948,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      return (
        <View style={styles.nativeContainer}>
          <MapView
            style={styles.nativeMap}
            initialRegion={initialRegion}
            customMapStyle={openStreetMapStyle}
            showsCompass={true}
          >
            {nodes.map((node) => {
              const markerColor = getMarkerColor(node.waterLevel);
              return (
                <Marker
                  key={node.id}
                  coordinate={{ latitude: node.lat, longitude: node.lng }}
                  title={node.name}
                  description={`Water: ${node.waterLevel}cm | SOC: ${node.soc}%`}
                  pinColor={markerColor}
                  onPress={() => onSelectNode(node.id)}
                >
                  <Callout onPress={() => onSelectNode(node.id)}>
                    <View style={styles.calloutCard}>
                      <Text style={styles.calloutTitle}>{node.name}</Text>
                      <Text style={[styles.calloutLevel, { color: markerColor }]}>
                        {node.waterLevel} cm ({node.aiPrediction} Risk)
                      </Text>
                      <Text style={styles.calloutPrompt}>Tap to view telemetry ➔</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
        </View>
      );
    } catch {
      // Fall through to OpenStreetMap vector radar view
    }
  }

  // Pre-calculated scaled pin coordinates on 360 x 250 canvas
  const nodeCoords: Record<string, { x: number; y: number }> = {
    'node-03': { x: 75, y: 70 },   // Sabang Estero
    'node-05': { x: 195, y: 105 }, // Triangulo Drain
    'node-07': { x: 260, y: 145 }, // Concepcion Pequena
    'node-12': { x: 275, y: 195 }, // Mabolo Outfall
  };

  return (
    <View style={styles.webContainer}>
      <View style={styles.osmHeader}>
        <View style={styles.osmBadgeRow}>
          <View style={styles.osmLogoDot} />
          <Text style={styles.osmTitle}>OPENSTREETMAP • NAGA ESTERO GRID</Text>
        </View>
        <Text style={styles.osmCoord}>13.6218° N, 123.1948° E</Text>
      </View>

      <View style={styles.svgWrapper}>
        <Svg viewBox="0 0 360 250" style={styles.svgElement}>
          {/* Base Terrain */}
          <Rect x="0" y="0" width="360" height="250" rx="16" fill="#F4F1EA" />

          {/* Green Parks / Eco Buffers */}
          <Path
            d="M 15 20 C 50 10, 90 25, 110 50 C 90 85, 45 75, 20 65 Z"
            fill="#D6EBD0"
          />
          <Path
            d="M 230 15 C 270 5, 320 20, 345 55 C 330 90, 275 80, 245 55 Z"
            fill="#D6EBD0"
          />
          <Path
            d="M 240 180 C 280 160, 335 180, 345 220 C 310 245, 255 235, 240 180 Z"
            fill="#D6EBD0"
          />

          {/* Secondary Roads Grid */}
          <Line x1="0" y1="55" x2="360" y2="55" stroke="#FFFFFF" strokeWidth="5" />
          <Line x1="0" y1="130" x2="360" y2="130" stroke="#FFFFFF" strokeWidth="4" />
          <Line x1="0" y1="185" x2="360" y2="185" stroke="#FFFFFF" strokeWidth="4" />
          <Line x1="120" y1="0" x2="120" y2="250" stroke="#FFFFFF" strokeWidth="5" />
          <Line x1="220" y1="0" x2="220" y2="250" stroke="#FFFFFF" strokeWidth="4" />

          {/* Primary Highway Arterial (Yellow-Orange casing like OSM) */}
          <Line x1="25" y1="240" x2="335" y2="15" stroke="#FDE68A" strokeWidth="6" />
          <Line x1="25" y1="240" x2="335" y2="15" stroke="#D97706" strokeWidth="1" />

          {/* Naga River Main Stream (Sky Blue Ribbon) */}
          <Path
            d="M 10 210 Q 95 170 175 125 T 350 45"
            stroke="#BAE6FD"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 10 210 Q 95 170 175 125 T 350 45"
            stroke="#0284C7"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Estero Tributaries */}
          <Path
            d="M 175 125 Q 230 170 295 210"
            stroke="#BAE6FD"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 175 125 Q 230 170 295 210"
            stroke="#0284C7"
            strokeWidth="2"
            fill="none"
          />

          {/* Waterway Labels */}
          <SvgText x="20" y="32" fill="#475569" fontSize="9" fontWeight="bold">
            NAGA RIVER BASIN
          </SvgText>
          <SvgText x="220" y="238" fill="#64748B" fontSize="8" fontWeight="600">
            OpenStreetMap Baseline
          </SvgText>
        </Svg>

        {/* Dynamic Clickable Pin Badges */}
        {nodes.map((node) => {
          const coords = nodeCoords[node.id] || { x: 180, y: 120 };
          const pinColor = getMarkerColor(node.waterLevel);
          const isSelected = selectedNodeId === node.id;
          const shortName = node.name.split(' - ')[1] || node.name;

          return (
            <TouchableOpacity
              key={node.id}
              activeOpacity={0.8}
              onPress={() => onSelectNode(node.id)}
              style={[
                styles.mapPinTouchable,
                {
                  left: `${(coords.x / 360) * 100}%`,
                  top: `${(coords.y / 250) * 100}%`,
                  borderColor: isSelected ? Colors.primary : '#FFFFFF',
                },
              ]}
            >
              <View style={[styles.innerPinDot, { backgroundColor: pinColor }]} />
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
  nativeContainer: {
    height: 290,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  nativeMap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  calloutCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    minWidth: 160,
  },
  calloutTitle: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  calloutLevel: {
    fontWeight: '800',
    fontSize: 14,
    marginVertical: 4,
  },
  calloutPrompt: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  webContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  osmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  osmBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  osmLogoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  osmTitle: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  osmCoord: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  svgWrapper: {
    width: '100%',
    aspectRatio: 360 / 250,
    position: 'relative',
    borderRadius: 14,
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
    transform: [{ translateX: -35 }, { translateY: -16 }],
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  innerPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  pinContent: {
    alignItems: 'flex-start',
  },
  pinNameText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
    maxWidth: 65,
  },
  pinDepthText: {
    fontSize: 9,
    fontWeight: '900',
  },
});
