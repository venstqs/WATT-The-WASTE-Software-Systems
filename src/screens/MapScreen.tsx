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
        {/* Executive Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroSubtitle}>CDRRMO OPERATIONS</Text>
              <Text style={styles.heroTitle}>Estero-Volt Grid</Text>
            </View>
            {/* Operator Avatar & Search Badge */}
            <View style={styles.headerControls}>
              <View style={styles.searchBtn}>
                <Ionicons name="search" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>CD</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3 Floating Summary Cards (Dribbble styled) */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBoxBlue}>
              <Ionicons name="git-network" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.cardLabel}>Active Nodes</Text>
              <Text style={styles.cardValueText}>24</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBoxGreen}>
              <Ionicons name="battery-charging" size={16} color={Colors.safe} />
            </View>
            <View>
              <Text style={styles.cardLabel}>Grid SOC</Text>
              <Text style={styles.cardValueText}>94%</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBoxCyan}>
              <Ionicons name="radio" size={16} color={Colors.info} />
            </View>
            <View>
              <Text style={styles.cardLabel}>Mesh Sync</Text>
              <Text style={styles.cardValueText}>Live</Text>
            </View>
          </View>
        </View>

        {/* Section Label */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>NAGA GIS HYDROLOGICAL RADAR</Text>
          </View>
        </View>

        {/* GIS Map Component */}
        <GisMapView
          nodes={nodes}
          onSelectNode={handleNodePress}
          selectedNodeId={selectedNodeId}
        />

        {/* Station List Header */}
        <View style={styles.stationHeaderRow}>
          <Text style={styles.sectionTitle}>KEY ESTERO STATIONS ({nodes.length})</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Modern Station Cards */}
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
                <View style={styles.cardMain}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardTopLeft}>
                      {/* Colored Status Circle */}
                      <View style={[styles.statusIconRing, { backgroundColor: markerColor + '20' }]}>
                        <View style={[styles.statusIconDot, { backgroundColor: markerColor }]} />
                      </View>
                      <View>
                        <Text style={styles.nodeStationName}>{shortName}</Text>
                        <Text style={styles.nodeIdTag}>{node.id.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.depthBadge}>
                      <Text style={[styles.depthValue, { color: markerColor }]}>
                        {node.waterLevel}cm
                      </Text>
                    </View>
                  </View>

                  {/* Gradient Threshold Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${thresholdPercent}%`, backgroundColor: markerColor },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Minimalist Telemetry Chips */}
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryChip}>
                      <Ionicons name="battery-half" size={12} color={Colors.textSecondary} />
                      <Text style={styles.telemetryText}>{node.soc}% SOC</Text>
                    </View>
                    <View style={styles.telemetryChip}>
                      <Ionicons name="leaf" size={12} color={Colors.textSecondary} />
                      <Text style={styles.telemetryText}>{node.powerOutput}mW BMFC</Text>
                    </View>
                    <View style={[styles.telemetryChip, { backgroundColor: markerColor + '15' }]}>
                      <Ionicons name="hardware-chip" size={12} color={markerColor} />
                      <Text style={[styles.telemetryText, { color: markerColor, fontWeight: '800' }]}>
                        {node.aiPrediction}
                      </Text>
                    </View>
                  </View>
                </View>
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
    paddingBottom: 110, // Account for floating tab bar
  },
  heroHeader: {
    backgroundColor: Colors.primaryHeader,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 50,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
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
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  avatarText: {
    color: Colors.primaryHeader,
    fontSize: 13,
    fontWeight: '900',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -30,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  summaryIconBoxBlue: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  summaryIconBoxGreen: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.safeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  summaryIconBoxCyan: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
  },
  cardValueText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  stationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  nodeListContainer: {
    paddingHorizontal: 16,
  },
  nodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardMain: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIconDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  nodeStationName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  nodeIdTag: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  depthBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  depthValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telemetryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  telemetryText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
});
