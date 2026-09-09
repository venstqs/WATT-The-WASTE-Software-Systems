import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MOCK_NODES, Node } from '../data/mockData';
import { GisMapView, getMarkerColor } from '../components/GisMapView';
import { MapStackParamList } from '../navigation/types';

type MapScreenNavigationProp = StackNavigationProp<MapStackParamList, 'MapScreen'>;

interface MapScreenProps {
  navigation: MapScreenNavigationProp;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [nodes] = useState<Node[]>(MOCK_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-07');

  const handleNodePress = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    navigation.navigate('NodeDetailScreen', { nodeId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryHeader} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Royal Blue Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroSubtitle}>CDRRMO OPERATIONS</Text>
              <Text style={styles.heroTitle}>Estero-Volt Network</Text>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.greenPulse} />
              <Text style={styles.onlineText}>ONLINE</Text>
            </View>
          </View>
          <Text style={styles.heroTagline}>
            Autonomous IoT Flood Early Warning • Naga City
          </Text>
        </View>

        {/* 3 Floating Summary Cards */}
        <View style={styles.summaryRow}>
          {/* Card 1 */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>Active Nodes</Text>
            <Text style={styles.cardGreenText}>24/24</Text>
            <Text style={styles.cardSubtext}>100% Online</Text>
          </View>

          {/* Card 2 */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>Avg SOC</Text>
            <Text style={styles.cardBlueText}>94%</Text>
            <Text style={styles.cardSubtext}>Supercap Grid</Text>
          </View>

          {/* Card 3 */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>Last Sync</Text>
            <Text style={styles.cardGrayText}>2m ago</Text>
            <Text style={styles.cardSubtext}>LoRa Mesh</Text>
          </View>
        </View>

        {/* Section Label */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitle}>NAGA GIS HYDROLOGICAL RADAR</Text>
          </View>
          <Text style={styles.sectionHint}>Tap pin to drill down</Text>
        </View>

        {/* OpenStreetMap Component */}
        <GisMapView
          nodes={nodes}
          onSelectNode={handleNodePress}
          selectedNodeId={selectedNodeId}
        />

        {/* Station List Header */}
        <View style={styles.stationHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitle}>KEY ESTERO STATIONS ({nodes.length})</Text>
          </View>
        </View>

        {/* Station Cards */}
        <View style={styles.nodeListContainer}>
          {nodes.map((node) => {
            const markerColor = getMarkerColor(node.waterLevel);
            const shortName = node.name.split(' - ')[1] || node.name;
            const thresholdPercent = Math.min(100, Math.round((node.waterLevel / 120) * 100));

            return (
              <TouchableOpacity
                key={node.id}
                style={styles.nodeCard}
                activeOpacity={0.8}
                onPress={() => handleNodePress(node.id)}
              >
                <View style={[styles.cardStripe, { backgroundColor: markerColor }]} />
                <View style={styles.cardMain}>
                  <View style={styles.cardTop}>
                    <View>
                      <Text style={styles.nodeStationName}>{shortName}</Text>
                      <Text style={styles.nodeIdTag}>{node.id.toUpperCase()}</Text>
                    </View>
                    <View style={styles.depthPill}>
                      <Text style={[styles.depthValue, { color: markerColor }]}>
                        {node.waterLevel} cm
                      </Text>
                    </View>
                  </View>

                  {/* Threshold Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${thresholdPercent}%`,
                            backgroundColor: markerColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.thresholdPercentText}>{thresholdPercent}% of 120cm limit</Text>
                  </View>

                  {/* Telemetry Chips */}
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryChip}>
                      <Ionicons name="battery-charging" size={12} color={Colors.primary} />
                      <Text style={styles.telemetryText}>SOC: {node.soc}%</Text>
                    </View>
                    <View style={styles.telemetryChip}>
                      <Ionicons name="flash-outline" size={12} color={Colors.safe} />
                      <Text style={styles.telemetryText}>BMFC: {node.powerOutput}mW</Text>
                    </View>
                    <View style={styles.telemetryChip}>
                      <Ionicons name="pulse" size={12} color={markerColor} />
                      <Text style={[styles.telemetryText, { color: markerColor, fontWeight: '800' }]}>
                        {node.aiPrediction} Risk
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryHeader,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  heroHeader: {
    backgroundColor: Colors.primaryHeader,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSubtitle: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  heroTagline: {
    color: '#E0E7FF',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B237C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  cardGreenText: {
    color: Colors.safe,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  cardBlueText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  cardGrayText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  cardSubtext: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
    marginTop: 4,
  },
  stationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentBar: {
    width: 3.5,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionHint: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  nodeListContainer: {
    paddingHorizontal: 16,
  },
  nodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardStripe: {
    width: 5,
    alignSelf: 'stretch',
  },
  cardMain: {
    flex: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nodeStationName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  nodeIdTag: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  depthPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  depthValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  thresholdPercentText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telemetryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  telemetryText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  arrowIcon: {
    marginRight: 12,
  },
});
