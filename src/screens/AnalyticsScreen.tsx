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

  const chartWidth = Math.min(Dimensions.get('window').width - 40, 380);

  const barData = {
    labels: ['Jun', 'Aug', 'Spt', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [
      {
        data: [48, 67, 58, 50, 26, 50, 52, 70],
      },
    ],
  };

  const barChartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: () => '#10B981',
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
    labels: ['25', '50', '75', '100'],
    datasets: [
      {
        data: [95, 75, 52, 48, 42, 28, 22],
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
      r: '0',
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
        {/* Header: Network Analytics & ESG */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Network Analytics & ESG</Text>
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
                  styles.timeRangePill,
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

        {/* 2x2 Stats Grid (Matching Screen_5_Analytics.png) */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {/* Box 1: Energy Generated */}
            <View style={styles.statsBox}>
              <Text style={styles.statsLabel}>Energy Generated:</Text>
              <Text style={styles.statsValueGreen}>2.4 kWh</Text>
            </View>

            {/* Box 2: Batteries Prevented */}
            <View style={styles.statsBox}>
              <Text style={styles.statsLabel}>Batteries Prevented:</Text>
              <Text style={styles.statsValueBlue}>144</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Box 3: CO2 Offset */}
            <View style={styles.statsBox}>
              <Text style={styles.statsLabel}>CO2 Offset:</Text>
              <Text style={styles.statsValueGreen}>1.8 kg</Text>
            </View>

            {/* Box 4: Edge-AI Accuracy */}
            <View style={styles.statsBox}>
              <Text style={styles.statsLabel}>Edge-AI Accuracy:</Text>
              <Text style={styles.statsValueBlue}>98.4%</Text>
            </View>
          </View>
        </View>

        {/* Chart 1: Water Quality (BOD/COD Reduction) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Water Quality (BOD/COD Reduction)</Text>
          <BarChart
            data={barData}
            width={chartWidth}
            height={190}
            chartConfig={barChartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero={true}
            showValuesOnTopOfBars={false}
            style={styles.chart}
          />
        </View>

        {/* Chart 2: Flood Event Frequency */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Flood Event Frequency</Text>
          <LineChart
            data={floodCurveData}
            width={chartWidth}
            height={190}
            chartConfig={lineChartConfig}
            bezier={true}
            fromZero={true}
            withDots={false}
            withShadow={true}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  esgBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  esgBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '900',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeRangePill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 22,
    marginHorizontal: 3,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  timeRangeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  timeRangeInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
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
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsLabel: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  statsValueGreen: {
    color: Colors.safe,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  statsValueBlue: {
    color: Colors.primary,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    alignItems: 'flex-start',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
    marginLeft: 4,
  },
  chart: {
    borderRadius: 14,
    marginTop: 4,
  },
});
