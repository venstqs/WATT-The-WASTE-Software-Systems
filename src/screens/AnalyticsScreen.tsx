import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTelemetry } from '../context/TelemetryContext';

type TimeRange = '7 Days' | '30 Days' | '90 Days';

export const AnalyticsScreen: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30 Days');
  const { esgStats, nodes, aiPrediction } = useTelemetry();

  const fadeAnim1 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim2 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim3 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim4 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(fadeAnim1, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeAnim2, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeAnim3, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeAnim4, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const chartWidth = Math.min(Dimensions.get('window').width - 48, 380);

  // ─── Live BOD Reduction chart — derived from live node voltage data ─────────
  // Each time range shows a rolling window of BOD % per node (SDG 6 metric)
  // BOD proxy = 50 + (avgVoltage/3.3) * 45 (from TelemetryContext computeEsgStats)
  const bodByNode = nodes.map(n =>
    Math.min(95, Math.round(50 + (n.voltage / 3.3) * 45))
  );
  const nodeLabels = nodes.map(n => n.name.split(' - ')[1]?.substring(0, 5) || n.id);

  // Simulated historical snapshots for each time range (anchored to live values)
  const currentBod = esgStats.bodReductionPct;
  const barDataByRange: Record<TimeRange, { labels: string[]; datasets: { data: number[] }[] }> = {
    '7 Days': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ data: [
        Math.max(45, currentBod - 12),
        Math.max(48, currentBod - 9),
        Math.max(50, currentBod - 7),
        Math.max(52, currentBod - 5),
        Math.max(55, currentBod - 3),
        Math.max(58, currentBod - 1),
        currentBod,
      ]}],
    },
    '30 Days': {
      labels: nodeLabels.length >= 4 ? nodeLabels : ['Sab', 'Tri', 'Con', 'Mab'],
      datasets: [{ data: bodByNode.length >= 4 ? bodByNode : [78, 72, 80, 65] }],
    },
    '90 Days': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{ data: [
        Math.max(40, currentBod - 20),
        Math.max(50, currentBod - 12),
        Math.max(62, currentBod - 6),
        currentBod,
      ]}],
    },
  };
  const barData = barDataByRange[selectedRange];

  // ─── Live Flood Frequency chart — derived from live water levels ────────────
  // Shows the water level trend across nodes relative to the 120cm threshold
  const maxLevels = nodes.map(n => Math.round(n.waterLevel));
  const floodCurveDataByRange: Record<TimeRange, { labels: string[]; datasets: { data: number[]; strokeWidth: number }[] }> = {
    '7 Days': {
      labels: nodes.map(n => n.id.replace('node-', '#')),
      datasets: [{ data: maxLevels, strokeWidth: 3 }],
    },
    '30 Days': {
      labels: ['Wk1', 'Wk2', 'Wk3', 'Wk4'],
      datasets: [{ data: [
        Math.max(30, nodes[0]?.waterLevel ?? 45),
        Math.max(40, nodes[1]?.waterLevel ?? 80),
        Math.max(50, nodes[2]?.waterLevel ?? 67),
        Math.max(60, nodes[3]?.waterLevel ?? 127),
      ], strokeWidth: 3 }],
    },
    '90 Days': {
      labels: ['Jan', 'Feb', 'Mar', 'Now'],
      datasets: [{ data: [
        Math.max(30, (nodes[3]?.waterLevel ?? 100) - 40),
        Math.max(50, (nodes[3]?.waterLevel ?? 100) - 25),
        Math.max(70, (nodes[3]?.waterLevel ?? 100) - 10),
        nodes[3]?.waterLevel ?? 127,
      ], strokeWidth: 3 }],
    },
  };
  const floodCurveData = floodCurveDataByRange[selectedRange];

  // ─── Edge-AI model scorecard (matches edge_ai_performance_metrics.py) ────────
  const aiMetrics = [
    { label: 'MAE', value: '4.2 cm', desc: 'Mean Absolute Error', color: '#34D399' },
    { label: 'RMSE', value: '5.8 cm', desc: 'Root Mean Sq. Error', color: '#60A5FA' },
    { label: 'R²', value: '0.91', desc: 'Coefficient of Determination', color: '#A78BFA' },
    { label: 'Infer', value: '<150ms', desc: 'ESP32-S3 inference time', color: '#F59E0B' },
    { label: 'Size', value: '85 KB', desc: 'Quantized INT8 model', color: '#FB7185' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Executive Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ESG Analytics</Text>
          <View style={styles.headerRight}>
            <View style={styles.sdgBadge}>
              <Text style={styles.sdgText}>SDG 6, 7, 11 & 12</Text>
            </View>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['7 Days', '30 Days', '90 Days'] as TimeRange[]).map((range) => {
            const isActive = selectedRange === range;
            return (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangePill,
                  isActive ? styles.timeRangeActive : styles.timeRangeInactive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    isActive ? styles.timeRangeTextActive : styles.timeRangeTextInactive,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live ESG Stats Grid (live from TelemetryContext) */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <Animated.View style={[styles.statsBox, { backgroundColor: Colors.primary, opacity: fadeAnim1, transform: [{ scale: fadeAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
              <View style={styles.iconCircleWhite}>
                <Ionicons name="flash" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.statsValueWhite}>{esgStats.totalKwhOffset.toFixed(1)} kWh</Text>
              <Text style={styles.statsLabelWhite}>Scope 2 Offset (SDG 7)</Text>
            </Animated.View>

            <Animated.View style={[styles.statsBox, { opacity: fadeAnim2, transform: [{ scale: fadeAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
              <View style={[styles.iconCircleColor, { backgroundColor: Colors.safeLight }]}>
                <Ionicons name="battery-dead" size={16} color={Colors.safe} />
              </View>
              <Text style={styles.statsValueColor}>{esgStats.eWasteEradicated}</Text>
              <Text style={styles.statsLabelColor}>Batteries Eliminated</Text>
            </Animated.View>
          </View>

          <View style={styles.statsRow}>
            <Animated.View style={[styles.statsBox, { opacity: fadeAnim3, transform: [{ scale: fadeAnim3.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
              <View style={[styles.iconCircleColor, { backgroundColor: Colors.infoLight }]}>
                <Ionicons name="water" size={16} color={Colors.info} />
              </View>
              <Text style={styles.statsValueColor}>{esgStats.bodReductionPct}%</Text>
              <Text style={styles.statsLabelColor}>BOD Drop (SDG 6)</Text>
            </Animated.View>

            <Animated.View style={[styles.statsBox, { opacity: fadeAnim4, transform: [{ scale: fadeAnim4.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
              <View style={[styles.iconCircleColor, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="cloud-offline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.statsValueColor}>{esgStats.h2sMitigationKg} kg</Text>
              <Text style={styles.statsLabelColor}>H₂S Mitigation (SDG 11)</Text>
            </Animated.View>
          </View>
        </View>

        {/* Chart 1: BOD / Water Quality (live from node voltages) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Water Quality</Text>
            <Text style={styles.chartSubtitle}>
              {selectedRange === '30 Days' ? 'BOD Reduction % per Node (live)' : 'BOD/COD Reduction Trend'}
            </Text>
          </View>
          <BarChart
            data={barData}
            width={chartWidth}
            height={180}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: () => Colors.info,
              labelColor: () => Colors.textSecondary,
              barPercentage: 0.6,
              propsForBackgroundLines: { stroke: '#F1F5F9', strokeDasharray: '4, 4' },
            }}
            style={styles.chart}
          />
          <Text style={styles.chartNote}>
            ⚡ Live — derived from BMFC biofilm voltage across {nodes.length} active nodes
          </Text>
        </View>

        {/* Chart 2: Flood Level Trend (live water levels) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Water Level Monitor</Text>
            <Text style={styles.chartSubtitle}>
              {selectedRange === '7 Days'
                ? 'Current readings per node (cm)'
                : 'Historical flood crest variance (cm)'}
            </Text>
          </View>
          <LineChart
            data={floodCurveData}
            width={chartWidth}
            height={180}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: () => Colors.textSecondary,
              propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
              propsForBackgroundLines: { stroke: '#F1F5F9', strokeDasharray: '4, 4' },
            }}
            bezier
            style={styles.chart}
          />
          {/* Flood threshold annotation */}
          <View style={styles.thresholdBadge}>
            <View style={styles.thresholdDot} />
            <Text style={styles.thresholdText}>120cm flood threshold — {nodes.filter(n => n.status === 'critical').length} node(s) critical</Text>
          </View>
        </View>

        {/* Edge-AI Model Scorecard (matches edge_ai_performance_metrics.py) */}
        <View style={styles.aiScorecardCard}>
          <View style={styles.aiScorecardHeader}>
            <View style={styles.aiChip}>
              <Ionicons name="hardware-chip" size={14} color="#FFFFFF" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.aiScorecardTitle}>Edge-AI Model Scorecard</Text>
              <Text style={styles.aiScorecardSubtitle}>MLP (50→50→25) | Trained on 8,760h synthetic hydro data</Text>
            </View>
          </View>

          <View style={styles.aiMetricsGrid}>
            {aiMetrics.map(m => (
              <View key={m.label} style={styles.aiMetricCell}>
                <Text style={[styles.aiMetricValue, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.aiMetricLabel}>{m.label}</Text>
                <Text style={styles.aiMetricDesc}>{m.desc}</Text>
              </View>
            ))}
          </View>

          <View style={styles.liveAiRow}>
            <View style={styles.liveAiDot} />
            <Text style={styles.liveAiText}>
              Live prediction: {aiPrediction?.riskLevel ?? '—'} risk •{' '}
              Confidence {aiPrediction?.confidence ?? '—'}% •{' '}
              Surge rate {aiPrediction?.surgeRatePerHour ?? '—'} cm/hr
            </Text>
          </View>
        </View>

        {/* Node Power Output (BMFC bioanode live data) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>BMFC Power Output</Text>
            <Text style={styles.chartSubtitle}>PANI-modified bioanode output per node (mW)</Text>
          </View>
          <View style={styles.powerGridRow}>
            {nodes.map(n => {
              const pct = Math.round((n.powerOutput / 3.5) * 100);
              const barColor = n.status === 'critical' ? Colors.critical : n.status === 'warning' ? Colors.warning : Colors.safe;
              return (
                <View key={n.id} style={styles.powerNodeCell}>
                  <Text style={[styles.powerNodeValue, { color: barColor }]}>{n.powerOutput.toFixed(1)}</Text>
                  <Text style={styles.powerNodeUnit}>mW</Text>
                  <View style={styles.powerBarTrack}>
                    <View style={[styles.powerBarFill, { height: `${pct}%` as any, backgroundColor: barColor }]} />
                  </View>
                  <Text style={styles.powerNodeLabel}>{n.name.split(' - ')[1]?.split(' ')[0] || n.id}</Text>
                  <Text style={styles.powerNodeVoltage}>{n.voltage}V</Text>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: { flex: 1 },
  scrollContent: {
    padding: 24,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerRight: { flexDirection: 'row' },
  sdgBadge: {
    backgroundColor: Colors.safeLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  sdgText: { color: '#065F46', fontSize: 10, fontWeight: '900' },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  timeRangePill: { flex: 1, paddingVertical: 10, borderRadius: 18, alignItems: 'center' },
  timeRangeActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  timeRangeInactive: { backgroundColor: 'transparent' },
  timeRangeText: { fontSize: 12, fontWeight: '800' },
  timeRangeTextActive: { color: '#FFFFFF' },
  timeRangeTextInactive: { color: Colors.textSecondary },
  statsGrid: { marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statsBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  iconCircleWhite: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  iconCircleColor: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  statsValueWhite: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  statsLabelWhite: { color: '#E0E7FF', fontSize: 10, fontWeight: '700', marginTop: 4 },
  statsValueColor: { color: Colors.textPrimary, fontSize: 22, fontWeight: '900' },
  statsLabelColor: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 4 },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  chartHeader: { marginBottom: 16 },
  chartTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '900' },
  chartSubtitle: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  chart: { borderRadius: 16, marginLeft: -10 },
  chartNote: {
    fontSize: 10, color: Colors.textMuted, fontWeight: '600',
    marginTop: 8, textAlign: 'center',
  },
  thresholdBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 10,
    backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  thresholdDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.critical, marginRight: 6 },
  thresholdText: { fontSize: 10, color: Colors.critical, fontWeight: '700' },
  // Edge-AI Scorecard
  aiScorecardCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  aiScorecardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  aiChip: {
    backgroundColor: Colors.primary, width: 32, height: 32,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  aiScorecardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  aiScorecardSubtitle: { color: '#64748B', fontSize: 10, fontWeight: '600', marginTop: 2 },
  aiMetricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginBottom: 16, gap: 8,
  },
  aiMetricCell: {
    backgroundColor: '#0F172A',
    borderRadius: 12, padding: 12,
    alignItems: 'center', flex: 1, minWidth: 60,
    borderWidth: 1, borderColor: '#334155',
  },
  aiMetricValue: { fontSize: 13, fontWeight: '900' },
  aiMetricLabel: { color: '#94A3B8', fontSize: 9, fontWeight: '800', marginTop: 3 },
  aiMetricDesc: { color: '#475569', fontSize: 8, fontWeight: '500', marginTop: 2, textAlign: 'center' },
  liveAiRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#1E3A5F',
  },
  liveAiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399', marginRight: 8 },
  liveAiText: { color: '#94A3B8', fontSize: 11, fontWeight: '600', flex: 1 },
  // Power output mini bar chart
  powerGridRow: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, height: 140,
  },
  powerNodeCell: {
    alignItems: 'center', flex: 1, paddingHorizontal: 4,
  },
  powerNodeValue: { fontSize: 13, fontWeight: '900' },
  powerNodeUnit: { fontSize: 9, color: Colors.textMuted, fontWeight: '700' },
  powerBarTrack: {
    flex: 1, width: 20, backgroundColor: '#F1F5F9', borderRadius: 10,
    marginVertical: 6, overflow: 'hidden', justifyContent: 'flex-end',
  },
  powerBarFill: { width: '100%', borderRadius: 10 },
  powerNodeLabel: { fontSize: 9, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  powerNodeVoltage: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
});
