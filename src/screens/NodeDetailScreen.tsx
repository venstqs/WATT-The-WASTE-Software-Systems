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
import Svg, { Path, Circle, Line as SvgLine } from 'react-native-svg';
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

  const [simMode, setSimMode] = useState<'normal' | 'storm'>('normal');

  const liveInference = predictEsteroLevel(
    simMode === 'storm' ? 24 : 1.2,
    simMode === 'storm' ? 32 : 2.5,
    simMode === 'storm' ? 18 : 0.8,
    node.waterLevel
  );

  const historyData: WaterLevelHistory =
    NODE_CHART_DATA_MAP[node.id] || MOCK_CHART_DATA;

  const chartWidth = Math.min(Dimensions.get('window').width - 40, 380);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{node.name}</Text>
        </View>

        {/* Card 1: Water Level Gauge (Matching Screen_3_NodeDetail.png) */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Water Level Gauge</Text>
          <View style={styles.waveRow}>
            <Text style={styles.largeDepthText}>{node.waterLevel} cm</Text>
            <View style={styles.waveSvgWrapper}>
              <Svg width={170} height={70} viewBox="0 0 170 70">
                {/* Flowing Cyan/Blue Wave */}
                <Path
                  d="M 0 55 C 30 35, 60 65, 90 45 C 120 25, 140 10, 170 20 L 170 70 L 0 70 Z"
                  fill="#0284C7"
                />
                <Path
                  d="M 0 50 C 30 30, 60 60, 90 40 C 120 20, 140 5, 170 15 L 170 70 L 0 70 Z"
                  fill="#38BDF8"
                  opacity={0.8}
                />
                <Path
                  d="M 0 50 C 30 30, 60 60, 90 40 C 120 20, 140 5, 170 15"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  fill="none"
                />
              </Svg>
            </View>
          </View>
        </View>

        {/* Card 2: Edge-AI Prediction Badge */}
        <View
          style={[
            styles.aiCard,
            liveInference.riskLevel === 'HIGH' ? styles.aiCardDanger : styles.aiCardSafe,
          ]}
        >
          <View style={styles.aiCardTopRow}>
            <Text style={styles.aiCardLabel}>Edge-AI Prediction Badge</Text>
            {/* Interactive Toggle Pill */}
            <TouchableOpacity
              style={styles.simPill}
              onPress={() => setSimMode(simMode === 'normal' ? 'storm' : 'normal')}
            >
              <Text style={styles.simPillText}>
                {simMode === 'normal' ? 'Simulate Storm ⚡' : 'Reset Flow ↺'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.aiRiskText,
              liveInference.riskLevel === 'HIGH' ? styles.textDanger : styles.textSafe,
            ]}
          >
            Flood Risk: {liveInference.riskLevel} (Next {liveInference.leadTimeHours} hrs) - MLP Neural Net
          </Text>
        </View>

        {/* Card 3: Supercapacitor State of Charge Circular Gauge */}
        <View style={styles.cardCenter}>
          <View style={styles.gaugeWrapper}>
            <Svg width={130} height={130}>
              <Circle
                cx={65}
                cy={65}
                r={52}
                stroke="#E2E8F0"
                strokeWidth={10}
                fill="none"
              />
              <Circle
                cx={65}
                cy={65}
                r={52}
                stroke={Colors.primary}
                strokeWidth={10}
                fill="none"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - node.soc / 100)}`}
                strokeLinecap="round"
                rotation="-90"
                origin="65, 65"
              />
            </Svg>
            <View style={styles.gaugeTextInside}>
              <Text style={styles.socPercentText}>{node.soc}%</Text>
              <Text style={styles.chargedText}>Charged</Text>
            </View>
          </View>
          <Text style={styles.gaugeSubtitle}>Supercapacitor State of Charge</Text>
        </View>

        {/* Card 4: Power Metrics */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Power Metrics</Text>
          <Text style={styles.powerMetricValue}>BMFC Output: {node.powerOutput} mW</Text>
          <Text style={styles.signalMetricValue}>Signal: {node.signalStrength} dBm</Text>
        </View>

        {/* Card 5: LineChart (Water Level Last 24 Hours) */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>LineChart</Text>
          <Text style={styles.chartSubheader}>Water Level (Last 24 Hours)</Text>

          <View style={styles.thresholdRow}>
            <Text style={styles.thresholdLabel}>120cm</Text>
            <View style={styles.dashedLine} />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  backText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCenter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  waveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  largeDepthText: {
    color: Colors.textPrimary,
    fontSize: 38,
    fontWeight: '900',
  },
  waveSvgWrapper: {
    marginRight: -16,
    marginBottom: -16,
  },
  aiCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 14,
  },
  aiCardSafe: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  aiCardDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  aiCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiCardLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  simPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  simPillText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  aiRiskText: {
    fontSize: 13,
    fontWeight: '800',
  },
  textSafe: {
    color: '#047857',
  },
  textDanger: {
    color: '#B91C1C',
  },
  gaugeWrapper: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeTextInside: {
    position: 'absolute',
    alignItems: 'center',
  },
  socPercentText: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
  },
  chargedText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  gaugeSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  powerMetricValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  signalMetricValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6,
  },
  chartSubheader: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  thresholdLabel: {
    color: Colors.critical,
    fontSize: 10,
    fontWeight: '800',
    marginRight: 6,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: Colors.critical,
    borderStyle: 'dashed',
  },
  chart: {
    borderRadius: 14,
    marginVertical: 4,
  },
});
