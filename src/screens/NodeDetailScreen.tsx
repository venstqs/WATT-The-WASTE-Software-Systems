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
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';
import {
  MOCK_NODES,
  MOCK_CHART_DATA,
  NODE_CHART_DATA_MAP,
  Node,
  WaterLevelHistory,
} from '../data/mockData';
import { MapStackParamList } from '../navigation/types';
import { predictEsteroLevel } from '../ai/hydrologyModel';

type NodeDetailScreenRouteProp = RouteProp<MapStackParamList, 'NodeDetailScreen'>;
type NodeDetailScreenNavigationProp = StackNavigationProp<MapStackParamList, 'NodeDetailScreen'>;

interface NodeDetailScreenProps {
  route: NodeDetailScreenRouteProp;
  navigation: NodeDetailScreenNavigationProp;
}

type ScenarioMode = 'baseline' | 'moderate' | 'surge';

export const NodeDetailScreen: React.FC<NodeDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const nodeId = route?.params?.nodeId || 'node-07';

  const defaultNode: Node =
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

  const [scenario, setScenario] = useState<ScenarioMode>('baseline');

  // Interactive Live Edge-AI Neural Net Simulation
  const rainParams: Record<ScenarioMode, { t2: number; t1: number; t0: number; level: number }> = {
    baseline: { t2: 0.5, t1: 1.0, t0: 0.2, level: defaultNode.waterLevel },
    moderate: { t2: 8.0, t1: 16.5, t0: 12.0, level: 95 },
    surge: { t2: 24.0, t1: 36.0, t0: 22.0, level: 127 },
  };

  const activeParams = rainParams[scenario];
  const liveInference = predictEsteroLevel(
    activeParams.t2,
    activeParams.t1,
    activeParams.t0,
    activeParams.level
  );

  const historyData: WaterLevelHistory =
    NODE_CHART_DATA_MAP[defaultNode.id] || MOCK_CHART_DATA;

  // Ensure chart width never overflows phone viewport
  const chartWidth = Math.min(Dimensions.get('window').width - 48, 330);

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: () => Colors.primary,
    labelColor: () => Colors.textSecondary,
    propsForDots: { r: '0' },
    propsForBackgroundLines: {
      stroke: '#F1F5F9',
      strokeDasharray: '4, 4',
    },
  };

  const handleBack = () => {
    navigation.navigate('MapScreen');
  };

  const getRiskStyle = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'HIGH':
        return {
          bg: '#FEF2F2',
          border: '#EF4444',
          text: '#B91C1C',
          iconColor: '#EF4444',
        };
      case 'MEDIUM':
        return {
          bg: '#FFFBEB',
          border: '#F59E0B',
          text: '#B45309',
          iconColor: '#F59E0B',
        };
      case 'LOW':
      default:
        return {
          bg: '#ECFDF5',
          border: '#10B981',
          text: '#047857',
          iconColor: '#10B981',
        };
    }
  };

  const riskStyle = getRiskStyle(liveInference.riskLevel);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {defaultNode.name}
          </Text>
        </View>

        {/* GPS Coordinates Bar */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="location-sharp" size={12} color={Colors.primary} />
            <Text style={styles.metaText}>
              {defaultNode.lat.toFixed(4)}°N, {defaultNode.lng.toFixed(4)}°E
            </Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={12} color={Colors.safe} />
            <Text style={styles.metaText}>Telemetry: {defaultNode.lastSync}</Text>
          </View>
        </View>

        {/* Water Level Gauge Card */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>Real-Time Water Depth</Text>
            <View style={[styles.thresholdMiniBadge, { backgroundColor: riskStyle.bg }]}>
              <Text style={[styles.thresholdMiniText, { color: riskStyle.text }]}>
                {liveInference.riskLevel} SEVERITY
              </Text>
            </View>
          </View>

          <View style={styles.waveRow}>
            <View>
              <Text style={styles.largeDepthText}>{liveInference.predictedWaterLevel} cm</Text>
              <Text style={styles.depthSubtext}>Normal: 50cm • Warning: 120cm</Text>
            </View>
            <View style={styles.waveSvgWrapper}>
              <Svg width={150} height={60} viewBox="0 0 150 60">
                <Path
                  d="M 0 45 C 30 25, 60 55, 90 35 C 115 18, 130 8, 150 16 L 150 60 L 0 60 Z"
                  fill="#0284C7"
                />
                <Path
                  d="M 0 40 C 30 20, 60 50, 90 30 C 115 12, 130 4, 150 12 L 150 60 L 0 60 Z"
                  fill="#38BDF8"
                  opacity={0.8}
                />
                <Path
                  d="M 0 40 C 30 20, 60 50, 90 30 C 115 12, 130 4, 150 12"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  fill="none"
                />
              </Svg>
            </View>
          </View>
        </View>

        {/* Edge-AI Interactive Prediction Card */}
        <View style={[styles.aiCard, { backgroundColor: riskStyle.bg, borderColor: riskStyle.border }]}>
          <View style={styles.aiCardTopRow}>
            <View style={styles.aiTagBadge}>
              <Ionicons name="hardware-chip-outline" size={13} color={Colors.primary} />
              <Text style={styles.aiTagText}>ON-DEVICE EDGE-AI</Text>
            </View>
            <Text style={[styles.confidenceScore, { color: riskStyle.text }]}>
              {liveInference.confidence}% Confidence
            </Text>
          </View>

          <Text style={[styles.aiRiskHeadline, { color: riskStyle.text }]}>
            Flood Risk: {liveInference.riskLevel} (Next {liveInference.leadTimeHours} hrs)
          </Text>
          <Text style={styles.aiRecommendation}>{liveInference.recommendation}</Text>

          {/* Interactive Scenario Buttons for Judges */}
          <View style={styles.scenarioButtonGroup}>
            <Text style={styles.scenarioPrompt}>TEST LIVE MODEL INFERENCE:</Text>
            <View style={styles.scenarioButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.scenarioBtn,
                  scenario === 'baseline' && styles.scenarioBtnActive,
                ]}
                onPress={() => setScenario('baseline')}
              >
                <Text
                  style={[
                    styles.scenarioBtnText,
                    scenario === 'baseline' && styles.scenarioBtnTextActive,
                  ]}
                >
                  Clear (50cm)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scenarioBtn,
                  scenario === 'moderate' && styles.scenarioBtnActive,
                ]}
                onPress={() => setScenario('moderate')}
              >
                <Text
                  style={[
                    styles.scenarioBtnText,
                    scenario === 'moderate' && styles.scenarioBtnTextActive,
                  ]}
                >
                  Rain (+15cm)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scenarioBtn,
                  scenario === 'surge' && styles.scenarioBtnSurgeActive,
                ]}
                onPress={() => setScenario('surge')}
              >
                <Text
                  style={[
                    styles.scenarioBtnText,
                    scenario === 'surge' && styles.scenarioBtnTextActive,
                  ]}
                >
                  Storm Spike ⚡
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Supercapacitor SOC Circular Gauge */}
        <View style={styles.cardCenter}>
          <View style={styles.gaugeWrapper}>
            <Svg width={120} height={120}>
              <Circle
                cx={60}
                cy={60}
                r={48}
                stroke="#E2E8F0"
                strokeWidth={9}
                fill="none"
              />
              <Circle
                cx={60}
                cy={60}
                r={48}
                stroke={Colors.primary}
                strokeWidth={9}
                fill="none"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - defaultNode.soc / 100)}`}
                strokeLinecap="round"
                rotation="-90"
                origin="60, 60"
              />
            </Svg>
            <View style={styles.gaugeTextInside}>
              <Text style={styles.socPercentText}>{defaultNode.soc}%</Text>
              <Text style={styles.chargedText}>Charged</Text>
            </View>
          </View>
          <Text style={styles.gaugeSubtitle}>Supercapacitor State of Charge</Text>
          <Text style={styles.gaugeDetails}>EDLC 3V, 100F • Zero Battery Chemical Waste</Text>
        </View>

        {/* Power Metrics Container */}
        <View style={styles.powerCard}>
          <Text style={styles.cardLabel}>Harvesting & Mesh Telemetry</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Ionicons name="leaf-outline" size={16} color={Colors.safe} />
              <Text style={styles.metricLabelText}>BMFC Bio-Power</Text>
              <Text style={styles.metricValueText}>{defaultNode.powerOutput} mW</Text>
              <Text style={styles.metricSubText}>Sediment Bacteria</Text>
            </View>
            <View style={styles.metricBox}>
              <Ionicons name="radio-outline" size={16} color={Colors.primary} />
              <Text style={styles.metricLabelText}>LoRa Mesh Signal</Text>
              <Text style={styles.metricValueText}>{defaultNode.signalStrength} dBm</Text>
              <Text style={styles.metricSubText}>915 MHz Municipal</Text>
            </View>
          </View>
        </View>

        {/* 24-Hour Telemetry LineChart */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View>
              <Text style={styles.cardLabel}>Telemetry History</Text>
              <Text style={styles.chartSubheader}>Water Level (Last 24 Hours)</Text>
            </View>
            <View style={styles.thresholdPill}>
              <Text style={styles.thresholdPillText}>120cm Critical Line</Text>
            </View>
          </View>

          <LineChart
            data={{
              labels: historyData.labels,
              datasets: historyData.datasets,
            }}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            bezier={true}
            withDots={false}
            withShadow={false}
            fromZero={false}
            style={styles.chart}
          />
        </View>

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnBtn}
          activeOpacity={0.85}
          onPress={handleBack}
        >
          <Text style={styles.returnBtnText}>Return to Naga GIS Dashboard</Text>
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
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCenter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  thresholdMiniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  thresholdMiniText: {
    fontSize: 9,
    fontWeight: '900',
  },
  waveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  largeDepthText: {
    color: Colors.textPrimary,
    fontSize: 36,
    fontWeight: '900',
  },
  depthSubtext: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  waveSvgWrapper: {
    marginRight: -16,
    marginBottom: -16,
  },
  aiCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  aiCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  aiTagText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 4,
  },
  confidenceScore: {
    fontSize: 10,
    fontWeight: '800',
  },
  aiRiskHeadline: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  aiRecommendation: {
    color: Colors.textPrimary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  scenarioButtonGroup: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  scenarioPrompt: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  scenarioButtonsRow: {
    flexDirection: 'row',
  },
  scenarioBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  scenarioBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  scenarioBtnSurgeActive: {
    backgroundColor: Colors.critical,
    borderColor: Colors.critical,
  },
  scenarioBtnText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  scenarioBtnTextActive: {
    color: '#FFFFFF',
  },
  gaugeWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeTextInside: {
    position: 'absolute',
    alignItems: 'center',
  },
  socPercentText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  chargedText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  gaugeSubtitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  gaugeDetails: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  powerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    marginTop: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabelText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  metricValueText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  metricSubText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  chartSubheader: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  thresholdPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  thresholdPillText: {
    color: Colors.critical,
    fontSize: 9,
    fontWeight: '800',
  },
  chart: {
    borderRadius: 14,
    marginTop: 6,
  },
  returnBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
