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
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Colors } from '../theme/colors';

type TimeRange = '7 Days' | '30 Days' | '90 Days';

export const AnalyticsScreen: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30 Days');

  const chartWidth = Math.min(Dimensions.get('window').width - 32, 420);

  const barData = {
    labels: ['Sabang', 'Triangulo', 'Concepcion', 'Mabolo'],
    datasets: [
      {
        data: [42, 58, 65, 38],
      },
    ],
  };

  const barChartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: () => Colors.safe,
    labelColor: () => Colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      stroke: '#F1F5F9',
      strokeDasharray: '4, 4',
    },
  };

  const floodCurveData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [12, 10, 8, 6, 4, 2],
        strokeWidth: 3,
      },
    ],
  };

  const lineChartConfig = {
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
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
    propsForBackgroundLines: {
      stroke: '#F1F5F9',
      strokeDasharray: '4, 4',
    },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Network Analytics & ESG Impact */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>MUNICIPAL SUSTAINABILITY</Text>
            <Text style={styles.headerTitle}>Network Analytics & ESG</Text>
          </View>
          <View style={styles.esgBadge}>
            <Text style={styles.esgBadgeText}>SDG 11 & 13</Text>
          </View>
        </View>

        {/* Time Range Selector: 7 Days | 30 Days | 90 Days */}
        <View style={styles.timeRangeContainer}>
          {(['7 Days', '30 Days', '90 Days'] as TimeRange[]).map((range) => {
            const isActive = selectedRange === range;
            return (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeTab,
                  isActive ? styles.timeRangeActive : styles.timeRangeInactive,
                ]}
                activeOpacity={0.7}
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

        {/* Stats Grid (2x2 Flex Layout) */}
        <View style={styles.statsGrid}>
          {/* Row 1 */}
          <View style={styles.statsRow}>
            {/* Box 1: Energy Generated: 2.4 kWh */}
            <View style={styles.statsBox}>
              <Text style={styles.statsLabel}>ESTERO BIO-ENERGY</Text>
              <Text style={styles.statsValueGreen}>2.4 kWh</Text>
              <Text style={styles.statsSubtext}>Energy Generated</Text>
            </View>

            {/* Box 2: Batteries Prevented: 144 */}
            <View style={styles.statsBox}>
              <Text style={styles.statsLabel}>SUPERCAP OFFSET</Text>
              <Text style={styles.statsValueBlue}>144</Text>
              <Text style={styles.statsSubtext}>Batteries Prevented</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.statsRow}>
            {/* Box 3: CO2 Offset: 1.8 kg */}
            <View style={styles.statsBox}>
              <Text style={styles.statsLabel}>CARBON REDUCTION</Text>
              <Text style={styles.statsValueGreen}>1.8 kg</Text>
              <Text style={styles.statsSubtext}>CO2 Offset</Text>
            </View>

            {/* Box 4: Edge-AI Accuracy: 98.4% */}
            <View style={styles.statsBox}>
              <Text style={styles.statsLabel}>PREDICTIVE ACCURACY</Text>
              <Text style={styles.statsValueBlue}>98.4%</Text>
              <Text style={styles.statsSubtext}>Edge-AI Neural Net</Text>
            </View>
          </View>
        </View>

        {/* Chart 1 (BarChart): Water Quality (BOD/COD Reduction) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Water Quality (BOD/COD Reduction)</Text>
              <Text style={styles.chartDescription}>
                % Bio-Oxidation Efficiency by Estero Sector
              </Text>
            </View>
            <View style={styles.greenTag}>
              <Text style={styles.greenTagText}>+28% Avg</Text>
            </View>
          </View>

          <BarChart
            data={barData}
            width={chartWidth}
            height={210}
            chartConfig={barChartConfig}
            yAxisLabel=""
            yAxisSuffix="%"
            fromZero={true}
            showValuesOnTopOfBars={true}
            style={styles.chart}
          />
        </View>

        {/* Chart 2 (LineChart): Flood Event Frequency */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Flood Event Frequency</Text>
              <Text style={styles.chartDescription}>
                Historical Flash Flooding Incidents (Declining Trend)
              </Text>
            </View>
            <View style={styles.blueTag}>
              <Text style={styles.blueTagText}>-83% YTD</Text>
            </View>
          </View>

          <LineChart
            data={floodCurveData}
            width={chartWidth}
            height={210}
            chartConfig={lineChartConfig}
            bezier={true}
            fromZero={true}
            style={styles.chart}
          />
        </View>

        {/* Edge-AI Hydrological Architecture Callout */}
        <View style={styles.aiInfoCard}>
          <View style={styles.aiInfoTitleRow}>
            <View style={styles.aiInfoDot} />
            <Text style={styles.aiInfoHeader}>NAGA HYDROLOGICAL PREDICTION ENGINE</Text>
          </View>
          <Text style={styles.aiInfoBody}>
            Estero-Volt nodes execute on-device MLP Neural Network regression (mirroring
            LSTM hydrology models) predicting water surges up to 4 hours in advance with
            zero reliance on external cloud servers during power outages.
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  headerSub: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  esgBadge: {
    backgroundColor: Colors.safeLight,
    borderColor: Colors.safe,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  esgBadgeText: {
    color: Colors.safe,
    fontSize: 10,
    fontWeight: '800',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  timeRangeTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    marginHorizontal: 3,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeRangeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  timeRangeInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.cardBorder,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  timeRangeTextInactive: {
    color: Colors.textSecondary,
  },
  statsGrid: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statsValueGreen: {
    color: Colors.safe,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  statsValueBlue: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  statsSubtext: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  chartCard: {
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
  chartTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  chartDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  greenTag: {
    backgroundColor: Colors.safeLight,
    borderColor: Colors.safe,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenTagText: {
    color: Colors.safe,
    fontSize: 10,
    fontWeight: '800',
  },
  blueTag: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  blueTagText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  chart: {
    borderRadius: 14,
    marginTop: 6,
  },
  aiInfoCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    marginTop: 4,
  },
  aiInfoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiInfoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  aiInfoHeader: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  aiInfoBody: {
    color: Colors.primaryDark,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});
