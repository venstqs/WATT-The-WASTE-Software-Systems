import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTelemetry } from '../context/TelemetryContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/types';

type NetworkNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'NetworkTab'>,
  StackNavigationProp<RootStackParamList>
>;

export const NetworkScreen: React.FC = () => {
  const navigation = useNavigation<NetworkNavigationProp>();
  const { nodes, esgStats } = useTelemetry();

  const criticalCount = nodes.filter(n => n.status === 'critical').length;
  const avgSOC = Math.round(nodes.reduce((s, n) => s + n.soc, 0) / nodes.length);
  const totalPower = nodes.reduce((s, n) => s + n.powerOutput, 0).toFixed(1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Network Status</Text>
        <Text style={styles.headerSubtitle}>BMFC Edge-AI Sensor Grid</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{nodes.length}</Text>
            <Text style={styles.statLabel}>Active Nodes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, criticalCount > 0 && { color: Colors.critical }]}>
              {criticalCount > 0 ? criticalCount : avgSOC + '%'}
            </Text>
            <Text style={styles.statLabel}>{criticalCount > 0 ? 'Critical' : 'Avg SOC'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalPower}</Text>
            <Text style={styles.statLabel}>Total mW</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Deployed Sensors</Text>
        
        {nodes.map((node) => {
          const isWarning = node.status === 'warning';
          const isCritical = node.status === 'critical';
          const aiColor = node.aiPrediction === 'HIGH' ? Colors.critical : node.aiPrediction === 'MEDIUM' ? Colors.warning : Colors.safe;

          return (
            <TouchableOpacity
              key={node.id}
              style={[styles.nodeCard, isCritical && styles.nodeCardCritical]}
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate('MapTab', { screen: 'NodeDetailScreen', params: { nodeId: node.id } } as any);
              }}
            >
              <View style={styles.nodeHeader}>
                <View style={[styles.nodeIconBg, isCritical && { backgroundColor: Colors.criticalLight }]}>
                  <Ionicons name="hardware-chip" size={20} color={isCritical ? Colors.critical : Colors.primary} />
                </View>
                <View style={styles.nodeInfo}>
                  <Text style={styles.nodeName}>{node.name}</Text>
                  <Text style={styles.nodeCoordinates}>{node.lat.toFixed(4)}°N, {node.lng.toFixed(4)}°E</Text>
                </View>
                <View style={[styles.statusBadge, isWarning && styles.statusBadgeWarning, isCritical && styles.statusBadgeCritical]}>
                  <Text style={[styles.statusText, isWarning && styles.statusTextWarning, isCritical && styles.statusTextCritical]}>
                    {node.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.telemetryRow}>
                <View style={styles.telemetryItem}>
                  <Ionicons name="water" size={14} color={Colors.info} />
                  <Text style={styles.telemetryValue}>{node.waterLevel.toFixed(1)} cm</Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Ionicons name="battery-charging" size={14} color={Colors.safe} />
                  <Text style={styles.telemetryValue}>{node.soc}% SOC</Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Ionicons name="leaf" size={14} color={Colors.primary} />
                  <Text style={styles.telemetryValue}>{node.powerOutput.toFixed(1)}mW</Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Ionicons name="hardware-chip" size={14} color={aiColor} />
                  <Text style={[styles.telemetryValue, { color: aiColor, fontWeight: '800' }]}>
                    {node.aiPrediction}
                  </Text>
                </View>
              </View>

              {/* Signal strength & duty cycle */}
              <View style={styles.signalRow}>
                <Ionicons name="radio-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.signalText}>
                  LoRaWAN {node.signalStrength} dBm  •  Duty: {node.dutyCycle}  •  Sync: {node.lastSync}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  nodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nodeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nodeInfo: {
    flex: 1,
  },
  nodeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nodeCoordinates: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.safeLight,
  },
  statusBadgeWarning: {
    backgroundColor: Colors.warningLight,
  },
  statusBadgeCritical: {
    backgroundColor: Colors.criticalLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.safe,
  },
  statusTextWarning: {
    color: Colors.warning,
  },
  statusTextCritical: {
    color: Colors.critical,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 12,
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telemetryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textLight,
    marginLeft: 6,
  },
  nodeCardCritical: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.critical,
    borderColor: '#FECACA',
    backgroundColor: '#FFFAFA',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 10,
    marginTop: 10,
  },
  signalText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginLeft: 6,
  },
});

