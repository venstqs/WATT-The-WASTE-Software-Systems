import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Line, Path, Text as SvgText } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Node } from '../data/mockData';

interface GisMapViewProps {
  nodes: Node[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
}

// OpenStreetMap Clean Light Style for Native react-native-maps
const openStreetMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#F2EFE9' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#525252' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#C9C2AF' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#E8E4DA' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#D4EAD0' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#DBD5C5' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#FCD8A5' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#EBB97D' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#A5D7F2' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284C7' }],
  },
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
  // If native mobile, dynamically require react-native-maps
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
            showsScale={true}
          >
            {nodes.map((node) => {
              const markerColor = getMarkerColor(node.waterLevel);
              return (
                <Marker
                  key={node.id}
                  coordinate={{ latitude: node.lat, longitude: node.lng }}
                  title={node.name}
                  description={`Water: ${node.waterLevel}cm | SOC: ${node.soc}% | Risk: ${node.aiPrediction}`}
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

  // OpenStreetMap Light Vector Map for Naga City Bounds
  const minLat = 13.610;
  const maxLat = 13.630;
  const minLng = 123.180;
  const maxLng = 123.205;

  const width = Math.min(Dimensions.get('window').width - 32, 420);
  const height = 290;

  const latToY = (lat: number) => {
    const fraction = (lat - minLat) / (maxLat - minLat);
    return height - fraction * (height - 50) - 25;
  };

  const lngToX = (lng: number) => {
    const fraction = (lng - minLng) / (maxLng - minLng);
    return fraction * (width - 60) + 30;
  };

  return (
    <View style={styles.webContainer}>
      <View style={styles.osmHeader}>
        <View style={styles.osmBadgeRow}>
          <View style={styles.osmLogoDot} />
          <Text style={styles.osmTitle}>OPENSTREETMAP • NAGA ESTERO GRID</Text>
        </View>
        <Text style={styles.osmCoord}>GIS 13.6218° N, 123.1948° E</Text>
      </View>

      <Svg width={width} height={height} style={styles.svgMap}>
        {/* OpenStreetMap Base Land */}
        <Rect x="0" y="0" width={width} height={height} rx="16" fill="#F4F1EA" />

        {/* Green Parks / Eco Buffer */}
        <Path
          d={`M 10 20 C 40 10, 80 30, 100 50 C 90 90, 40 80, 20 70 Z`}
          fill="#D6EBD0"
        />
        <Path
          d={`M ${width - 120} ${height - 90} C ${width - 60} ${height - 110}, ${width - 20} ${height - 70}, ${width - 30} ${height - 20} C ${width - 80} ${height - 10}, ${width - 110} ${height - 40}, ${width - 120} ${height - 90} Z`}
          fill="#D6EBD0"
        />

        {/* Road Grid Lines (OpenStreetMap Styled White with Grey Outlines) */}
        <Line x1="0" y1={height * 0.3} x2={width} y2={height * 0.3} stroke="#FFFFFF" strokeWidth="8" />
        <Line x1="0" y1={height * 0.3} x2={width} y2={height * 0.3} stroke="#DCD6C8" strokeWidth="1" strokeDasharray="0, 8" />
        
        <Line x1="0" y1={height * 0.72} x2={width} y2={height * 0.72} stroke="#FFFFFF" strokeWidth="6" />
        <Line x1={width * 0.35} y1="0" x2={width * 0.35} y2={height} stroke="#FFFFFF" strokeWidth="7" />
        <Line x1={width * 0.75} y1="0" x2={width * 0.75} y2={height} stroke="#FFFFFF" strokeWidth="6" />

        {/* Primary Highway Arterial (Yellow-Orange casing like OSM) */}
        <Line x1="20" y1={height - 10} x2={width - 20} y2="15" stroke="#FDE68A" strokeWidth="7" />
        <Line x1="20" y1={height - 10} x2={width - 20} y2="15" stroke="#D97706" strokeWidth="1.2" />

        {/* Naga River Main Stream (Vivid OpenStreetMap Sky Blue) */}
        <Path
          d={`M 10 ${height * 0.82} Q ${width * 0.28} ${height * 0.68} ${width * 0.52} ${height * 0.46} T ${width - 15} ${height * 0.18}`}
          stroke="#BAE6FD"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M 10 ${height * 0.82} Q ${width * 0.28} ${height * 0.68} ${width * 0.52} ${height * 0.46} T ${width - 15} ${height * 0.18}`}
          stroke="#0284C7"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Estero Tributary */}
        <Path
          d={`M ${width * 0.52} ${height * 0.46} Q ${width * 0.66} ${height * 0.72} ${width * 0.88} ${height * 0.85}`}
          stroke="#BAE6FD"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M ${width * 0.52} ${height * 0.46} Q ${width * 0.66} ${height * 0.72} ${width * 0.88} ${height * 0.85}`}
          stroke="#0284C7"
          strokeWidth="2"
          fill="none"
        />

        {/* Street & Waterway Labels */}
        <SvgText x="18" y="42" fill="#475569" fontSize="10" fontWeight="700">
          NAGA RIVER WATERWAY
        </SvgText>
        <SvgText x={width - 130} y={height - 16} fill="#64748B" fontSize="9" fontWeight="600">
          OpenStreetMap Baseline
        </SvgText>
      </Svg>

      {/* Modern Floating Pins */}
      <View style={[StyleSheet.absoluteFill, styles.overlayContainer]} pointerEvents="box-none">
        {nodes.map((node) => {
          const posX = lngToX(node.lng);
          const posY = latToY(node.lat) + 36;
          const pinColor = getMarkerColor(node.waterLevel);
          const isSelected = selectedNodeId === node.id;

          return (
            <TouchableOpacity
              key={node.id}
              activeOpacity={0.8}
              onPress={() => onSelectNode(node.id)}
              style={[
                styles.mapPinTouchable,
                {
                  left: posX - 24,
                  top: posY - 28,
                  borderColor: isSelected ? Colors.primary : Colors.cardBorder,
                },
              ]}
            >
              <View style={[styles.innerPin, { backgroundColor: pinColor }]} />
              <View style={styles.pinBadge}>
                <Text style={styles.pinShortName}>#{node.id.replace('node-', '')}</Text>
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
    height: 310,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  nativeMap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  calloutCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    minWidth: 170,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  osmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  osmBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  osmLogoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  osmTitle: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  osmCoord: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  svgMap: {
    borderRadius: 16,
  },
  overlayContainer: {
    top: 36,
  },
  mapPinTouchable: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  innerPin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  pinBadge: {
    alignItems: 'center',
  },
  pinShortName: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
  },
  pinDepthText: {
    fontSize: 10,
    fontWeight: '900',
  },
});
