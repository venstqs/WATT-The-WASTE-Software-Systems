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

  const getSeverityBadge = (status: Node['status']) => {
    switch (status) {
      case 'critical':
        return { color: Colors.critical, bg: Colors.criticalLight, label: 'CRITICAL' };
      case 'warning':
        return { color: Colors.warning, bg: Colors.warningLight, label: 'WARNING' };
      case 'normal':
      default:
        return { color: Colors.safe, bg: Colors.safeLight, label: 'NORMAL' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryHeader} />
      
      {/* Curved Royal Blue Hero Header (Inspired by Reference UI) */}
      <View style={styles.heroHeader}>
        <View style={styles.heroHeaderTop}>
          <View>
            <Text style={styles.heroSubtitle}>CDRRMO MUNICIPAL DASHBOARD</Text>
            <Text style={styles.heroTitle}>Estero-Volt Network</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.livePulse} />
            <Text style={styles.liveBadgeText}>ONLINE</Text>
          </View>
        </View>
        <Text style={styles.heroDescription}>
          Real-time hydrological monitoring & bio-energy telemetry across Naga City.
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards Row (Horizontal Flex with Soft Drop Shadows) */}
        <View style={styles.summaryRow}>
          {/* Card 1: Active Nodes: 24/24 */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>NODES ONLINE</Text>
            <Text style={styles.cardGreenText}>24/24</Text>
            <Text style={styles.summarySubtext}>Active Nodes</Text>
          </View>

          {/* Card 2: Avg SOC: 94% */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>STORAGE SOC</Text>
            <Text style={styles.cardBlueText}>94%</Text>
            <Text style={styles.summarySubtext}>Avg Supercap</Text>
          </View>

          {/* Card 3: Last Sync: 2m ago */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>TELEMETRY</Text>
            <Text style={styles.cardGrayText}>2m ago</Text>
            <Text style={styles.summarySubtext}>Last Sync</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitle}>NAGA CITY OPENSTREETMAP GIS</Text>
          </View>
          <Text style={styles.sectionHint}>Tap marker to inspect node</Text>
        </View>

        {/* Map Component (OpenStreetMap Styled MapView / Web GIS) */}
        <GisMapView
          nodes={nodes}
          onSelectNode={handleNodePress}
          selectedNodeId={selectedNodeId}
        />

        {/* Monitored Estero Nodes Header */}
        <View style={styles.nodeListHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.nodeListTitle}>MONITORED ESTERO STATIONS</Text>
          </View>
          <Text style={styles.nodeCount}>{nodes.length} Stations</Text>
        </View>

        {/* Node Cards List */}
        <View style={styles.nodeListContainer}>
          {nodes.map((node) => {
            const badge = getSeverityBadge(node.status);
            const markerColor = getMarkerColor(node.waterLevel);
            return (
              <TouchableOpacity
                key={node.id}
                style={styles.nodeCard}
                activeOpacity={0.8}
                onPress={() => handleNodePress(node.id)}
              >
                <View style={[styles.nodeCardStatusStripe, { backgroundColor: markerColor }]} />
                <View style={styles.nodeCardBody}>
                  <View style={styles.nodeCardTop}>
                    <Text style={styles.nodeName}>{node.name}</Text>
                    <View style={[styles.badgePill, { backgroundColor: badge.bg, borderColor: badge.color }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <View style={styles.nodeMetricsRow}>
                    <View style={styles.nodeMetric}>
                      <Text style={styles.metricLabel}>Water Depth</Text>
                      <Text style={[styles.metricValue, { color: markerColor }]}>
                        {node.waterLevel} cm
                      </Text>
                    </View>

                    <View style={styles.nodeMetric}>
                      <Text style={styles.metricLabel}>Supercap SOC</Text>
                      <Text style={styles.metricValueBlue}>{node.soc}%</Text>
                    </View>

                    <View style={styles.nodeMetric}>
                      <Text style={styles.metricLabel}>BMFC Power</Text>
                      <Text style={styles.metricValue}>{node.powerOutput} mW</Text>
                    </View>

                    <View style={styles.nodeMetric}>
                      <Text style={styles.metricLabel}>AI 4h Risk</Text>
                      <Text style={[styles.metricValue, { color: markerColor }]}>
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
  heroHeader: {
    backgroundColor: Colors.primaryHeader,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroHeaderTop: {
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
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  heroDescription: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B237C',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -14,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryCardLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardGreenText: {
    color: Colors.safe,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 4,
  },
  cardBlueText: {
    color: Colors.primary,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 4,
  },
  cardGrayText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  summarySubtext: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentBar: {
    width: 4,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionHint: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  nodeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  nodeListTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  nodeCount: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  nodeListContainer: {
    width: '100%',
  },
  nodeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nodeCardStatusStripe: {
    width: 6,
  },
  nodeCardBody: {
    flex: 1,
    padding: 14,
  },
  nodeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nodeName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  nodeMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nodeMetric: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  metricValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  metricValueBlue: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
});
