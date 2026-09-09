import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../theme/colors';
import {
  MOCK_NODES,
  MOCK_CHART_DATA,
  NODE_CHART_DATA_MAP,
  Node,
  WaterLevelHistory,
} from '../data/mockData';
import { WaveGauge } from '../components/WaveGauge';
import { SocCircularGauge } from '../components/SocCircularGauge';
import { AiPredictionBadge } from '../components/AiPredictionBadge';
import { MapStackParamList } from '../navigation/types';
import { predictEsteroLevel } from '../ai/hydrologyModel';

type NodeDetailScreenRouteProp = RouteProp<MapStackParamList, 'NodeDetailScreen'>;
type NodeDetailScreenNavigationProp = StackNavigationProp<MapStackParamList, 'NodeDetailScreen'>;

interface NodeDetailScreenProps {
  route: NodeDetailScreenRouteProp;
  navigation: NodeDetailScreenNavigationProp;
}

export const NodeDetailScreen: React.FC<NodeDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const nodeId = route?.params?.nodeId || 'node-07';

  const node: Node =
    MOCK_NODES.find((n) => n.id === nodeId) ||
    MOCK_NODES[2] || {
      id: 'node-07',
      name: 'Node #07 - Concepcion Pequena',
      lat: 13.62,
      lng: 123.2,
      status: 'normal',
      waterLevel: 67,
      soc: 95,
      powerOutput: 3.1,
      signalStrength: -85,
      aiPrediction: 'LOW',
      lastSync: '30s ago',
    };

  // Interactive Edge-AI Model State
  const [rainSpikeMode, setRainSpikeMode] = useState<'normal' | 'storm'>('normal');

  // Live MLP Model Inference Execution
  const liveInference = predictEsteroLevel(
    rainSpikeMode === 'storm' ? 24 : 1.2,
    rainSpikeMode === 'storm' ? 32 : 2.5,
    rainSpikeMode === 'storm' ? 18 : 0.8,
    node.waterLevel
  );

  const historyData: WaterLevelHistory =
    NODE_CHART_DATA_MAP[node.id] || MOCK_CHART_DATA;

  const chartWidth = Math.min(Dimensions.get('window').width - 32, 420);

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: () => Colors.primary,
    labelColor: () => Colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '0',
    },
    propsForBackgroundLines: {
      stroke: '#F1F5F9',
      strokeDasharray: '4, 4',
    },
  };

  const handleBack = () => {
    navigation.navigate('MapScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={styles.headerNodeId}>TELEMETRY NODE PROFILE</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {node.name}
            </Text>
          </View>
        </View>

        {/* Sync & Location Bar */}
        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeLabel}>GPS POSITION</Text>
            <Text style={styles.metaBadgeValue}>
              {node.lat.toFixed(4)}°N, {node.lng.toFixed(4)}°E
            </Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeLabel}>LAST TELEMETRY PACKET</Text>
            <Text style={styles.metaBadgeValueBlue}>{node.lastSync}</Text>
          </View>
        </View>

        {/* Water Level Gauge */}
        <WaveGauge waterLevel={node.waterLevel} />

        {/* Interactive Edge-AI Simulator Card */}
        <View style={styles.aiSimCard}>
          <View style={styles.aiSimHeader}>
            <View>
              <Text style={styles.aiSimTitle}>EDGE-AI FLOOD PREDICTOR</Text>
              <Text style={styles.aiSimSubtitle}>MLP Neural Network On-Device Inference</Text>
            </View>
            <View style={styles.liveModelBadge}>
              <View style={styles.liveGreenDot} />
              <Text style={styles.liveModelText}>ACTIVE MODEL</Text>
            </View>
          </View>

          <View style={styles.aiSimToggleRow}>
            <TouchableOpacity
              style={[
                styles.simToggleBtn,
                rainSpikeMode === 'normal' ? styles.simToggleActive : styles.simToggleInactive,
              ]}
              onPress={() => setRainSpikeMode('normal')}
            >
              <Text
                style={[
                  styles.simToggleText,
                  rainSpikeMode === 'normal' ? styles.simToggleTextActive : styles.simToggleTextInactive,
                ]}
              >
                Normal Flow
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.simToggleBtn,
                rainSpikeMode === 'storm' ? styles.simToggleStormActive : styles.simToggleInactive,
              ]}
              onPress={() => setRainSpikeMode('storm')}
            >
              <Text
                style={[
                  styles.simToggleText,
                  rainSpikeMode === 'storm' ? styles.simToggleTextActive : styles.simToggleTextInactive,
                ]}
              >
                Simulate Storm Spike
              </Text>
            </TouchableOpacity>
          </View>

          <AiPredictionBadge
            prediction={liveInference.riskLevel}
            showDetails={true}
          />
        </View>

        {/* Supercapacitor SOC Gauge */}
        <SocCircularGauge soc={node.soc} />

        {/* Power Metrics Container (BMFC Output & LoRaWAN Signal) */}
        <View style={styles.powerMetricsContainer}>
          <View style={styles.powerMetricsHeader}>
            <Text style={styles.powerMetricsTitle}>POWER & HARVESTING TELEMETRY</Text>
            <View style={styles.bioTag}>
              <Text style={styles.bioEnergyBadge}>BMFC BIOELECTRICAL</Text>
            </View>
          </View>

          <View style={styles.powerMetricsRow}>
            {/* BMFC Output */}
            <View style={styles.powerMetricBox}>
              <Text style={styles.powerMetricLabel}>BMFC OUTPUT</Text>
              <Text style={styles.powerMetricValue}>{node.powerOutput} mW</Text>
              <Text style={styles.powerMetricDetail}>Benthic Microbial Bio-Cell</Text>
            </View>

            {/* Signal Strength */}
            <View style={styles.powerMetricBox}>
              <Text style={styles.powerMetricLabel}>SIGNAL STRENGTH</Text>
              <Text style={styles.powerMetricValue}>{node.signalStrength} dBm</Text>
              <Text style={styles.powerMetricDetail}>LoRaWAN Municipal Mesh</Text>
            </View>
          </View>
        </View>

        {/* Telemetry Chart (LineChart from react-native-chart-kit) */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartSectionTitle}>Water Level (Last 24 Hours)</Text>
              <Text style={styles.chartSubtitle}>Estero Sensor Telemetry Trend</Text>
            </View>
            <View style={styles.thresholdTag}>
              <Text style={styles.thresholdTagText}>120cm Alert Threshold</Text>
            </View>
          </View>

          <LineChart
            data={{
              labels: historyData.labels,
              datasets: historyData.datasets,
            }}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            bezier={true}
            withDots={false}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={true}
            fromZero={false}
            style={styles.chart}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Text style={styles.actionButtonText}>Return to Naga GIS Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  titleWrapper: {
    flex: 1,
  },
  headerNodeId: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaBadge: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  metaBadgeLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaBadgeValue: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  metaBadgeValueBlue: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  aiSimCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiSimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiSimTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  aiSimSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  liveModelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safeLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  liveModelText: {
    color: Colors.safe,
    fontSize: 9,
    fontWeight: '800',
  },
  aiSimToggleRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  simToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
  },
  simToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  simToggleStormActive: {
    backgroundColor: Colors.critical,
    borderColor: Colors.critical,
  },
  simToggleInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: Colors.cardBorder,
  },
  simToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  simToggleTextActive: {
    color: '#FFFFFF',
  },
  simToggleTextInactive: {
    color: Colors.textSecondary,
  },
  powerMetricsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  powerMetricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  powerMetricsTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  bioTag: {
    backgroundColor: Colors.safeLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bioEnergyBadge: {
    color: Colors.safe,
    fontSize: 10,
    fontWeight: '800',
  },
  powerMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  powerMetricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  powerMetricLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  powerMetricValue: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  powerMetricDetail: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 12,
  },
  chartSectionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  chartSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  thresholdTag: {
    backgroundColor: Colors.criticalLight,
    borderWidth: 1,
    borderColor: Colors.critical,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  thresholdTagText: {
    color: Colors.critical,
    fontSize: 9,
    fontWeight: '800',
  },
  chart: {
    borderRadius: 14,
    marginTop: 6,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
