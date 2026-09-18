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
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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

  // Responsive Dribbble Chart Width
  const chartWidth = Math.min(Dimensions.get('window').width - 48, 330);

  const handleBack = () => {
    navigation.navigate('MapScreen');
  };

  const getRiskStyle = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'HIGH':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#B91C1C',
          iconColor: Colors.critical,
          gradient: ['#FCA5A5', '#EF4444'],
        };
      case 'MEDIUM':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
          iconColor: Colors.warning,
          gradient: ['#FCD34D', '#F59E0B'],
        };
      case 'LOW':
      default:
        return {
          bg: '#ECFEFF',
          border: '#A5F3FC',
          text: '#0369A1',
          iconColor: Colors.info,
          gradient: ['#7DD3FC', '#0284C7'],
        };
    }
  };

  const riskStyle = getRiskStyle(liveInference.riskLevel);
  const gaugePercent = Math.min(100, Math.max(0, (liveInference.predictedWaterLevel / 150) * 100));

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
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {defaultNode.name.split(' - ')[1]}
          </Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>SYNCED</Text>
          </View>
        </View>

        {/* High-Tech Radial Telemetry Gauge (Inspired by Speed Test Dribbble) */}
        <View style={styles.gaugeCard}>
          <View style={styles.gaugeWrapper}>
            <Svg width={220} height={150} viewBox="0 0 220 150">
              <Defs>
                <LinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor={riskStyle.gradient[0]} />
                  <Stop offset="100%" stopColor={riskStyle.gradient[1]} />
                </LinearGradient>
              </Defs>
              {/* Background Arc */}
              <Path
                d="M 20 130 A 90 90 0 0 1 200 130"
                stroke="#F1F5F9"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
              />
              {/* Foreground Arc */}
              <Path
                d="M 20 130 A 90 90 0 0 1 200 130"
                stroke="url(#arcGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * gaugePercent) / 100}
              />
            </Svg>
            <View style={styles.gaugeTextInside}>
              <Text style={styles.gaugeValue}>{liveInference.predictedWaterLevel}</Text>
              <Text style={styles.gaugeUnit}>Centimeters</Text>
              <View style={[styles.riskPill, { backgroundColor: riskStyle.bg, borderColor: riskStyle.border }]}>
                <Text style={[styles.riskPillText, { color: riskStyle.text }]}>{liveInference.riskLevel}</Text>
              </View>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Ionicons name="water-outline" size={16} color={Colors.info} />
              <Text style={styles.metricVal}>120cm</Text>
              <Text style={styles.metricLbl}>Spill Limit</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="battery-charging-outline" size={16} color={Colors.safe} />
              <Text style={styles.metricVal}>{defaultNode.soc}%</Text>
              <Text style={styles.metricLbl}>Supercap SOC</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="leaf-outline" size={16} color={Colors.primary} />
              <Text style={styles.metricVal}>{defaultNode.powerOutput}mW</Text>
              <Text style={styles.metricLbl}>BMFC Harvest</Text>
            </View>
          </View>
        </View>

        {/* Edge-AI Interactive Prediction Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiBadgeRow}>
              <View style={styles.aiChip}>
                <Ionicons name="hardware-chip" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.aiTitle}>On-Device Neural Net Inference</Text>
            </View>
            <Text style={styles.confidenceScore}>{liveInference.confidence}% Confidence</Text>
          </View>
          
          <Text style={styles.aiRecommendation}>{liveInference.recommendation}</Text>
          
          <View style={styles.scenarioButtonGroup}>
            <Text style={styles.scenarioPrompt}>SIMULATE ENVIRONMENTAL SCENARIO:</Text>
            <View style={styles.scenarioButtonsRow}>
              <TouchableOpacity
                style={[styles.scenarioBtn, scenario === 'baseline' && styles.scenarioBtnActive]}
                onPress={() => setScenario('baseline')}
              >
                <Text style={[styles.scenarioBtnText, scenario === 'baseline' && styles.scenarioBtnTextActive]}>
                  ☀️ Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scenarioBtn, scenario === 'moderate' && styles.scenarioBtnActive]}
                onPress={() => setScenario('moderate')}
              >
                <Text style={[styles.scenarioBtnText, scenario === 'moderate' && styles.scenarioBtnTextActive]}>
                  🌧️ Rain
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scenarioBtn, scenario === 'surge' && styles.scenarioBtnSurgeActive]}
                onPress={() => setScenario('surge')}
              >
                <Text style={[styles.scenarioBtnText, scenario === 'surge' && styles.scenarioBtnTextActive]}>
                  ⚡ Surge
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 24-Hour Telemetry LineChart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Telemetry History</Text>
            <Text style={styles.chartSubtitle}>Water depth over last 24h</Text>
          </View>
          <LineChart
            data={{
              labels: historyData.labels,
              datasets: historyData.datasets,
            }}
            width={chartWidth}
            height={180}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: () => Colors.primary,
              labelColor: () => Colors.textSecondary,
              propsForDots: { r: '0' },
              propsForBackgroundLines: { stroke: '#F1F5F9', strokeDasharray: '4, 4' },
            }}
            bezier={true}
            withDots={false}
            withShadow={false}
            fromZero={false}
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safeLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  liveText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '800',
  },
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: 16,
  },
  gaugeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 140,
  },
  gaugeTextInside: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 52,
  },
  gaugeUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  riskPill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  riskPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: '#1E293B', // Slate 800 - dark modern aesthetic
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiChip: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  aiTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  confidenceScore: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
  },
  aiRecommendation: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 20,
  },
  scenarioButtonGroup: {
    borderTopWidth: 1,
    borderColor: '#334155',
    paddingTop: 16,
  },
  scenarioPrompt: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  scenarioButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scenarioBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  scenarioBtnActive: {
    backgroundColor: Colors.primary,
  },
  scenarioBtnSurgeActive: {
    backgroundColor: Colors.critical,
  },
  scenarioBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
  },
  scenarioBtnTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 10,
  },
  chartTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  chartSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
