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
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

type TimeRange = '7 Days' | '30 Days' | '90 Days';

export const AnalyticsScreen: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30 Days');

  const chartWidth = Math.min(Dimensions.get('window').width - 48, 380);

  const barData = {
    labels: ['Jun', 'Aug', 'Spt', 'Nov', 'Dec'],
    datasets: [
      {
        data: [48, 67, 58, 26, 70],
      },
    ],
  };

  const floodCurveData = {
    labels: ['25', '50', '75', '100'],
    datasets: [
      {
        data: [95, 75, 42, 22],
        strokeWidth: 3,
      },
    ],
  };

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

        {/* 2x2 Dribbble Stats Grid (Aligned with JA WE Proposal) */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {/* Box 1 - SDG 7 */}
            <View style={[styles.statsBox, { backgroundColor: Colors.primary }]}>
              <View style={styles.iconCircleWhite}>
                <Ionicons name="flash" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.statsValueWhite}>2.4 kWh</Text>
              <Text style={styles.statsLabelWhite}>Scope 2 Offset</Text>
            </View>

            {/* Box 2 - SDG 12 */}
            <View style={styles.statsBox}>
              <View style={[styles.iconCircleColor, { backgroundColor: Colors.safeLight }]}>
                <Ionicons name="battery-dead" size={16} color={Colors.safe} />
              </View>
              <Text style={styles.statsValueColor}>144</Text>
              <Text style={styles.statsLabelColor}>E-Waste Eradicated</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Box 3 - SDG 6 */}
            <View style={styles.statsBox}>
              <View style={[styles.iconCircleColor, { backgroundColor: Colors.infoLight }]}>
                <Ionicons name="water" size={16} color={Colors.info} />
              </View>
              <Text style={styles.statsValueColor}>78%</Text>
              <Text style={styles.statsLabelColor}>BOD Drop (Bioremediation)</Text>
            </View>

            {/* Box 4 - Health & Bio-Gas Mitigation */}
            <View style={styles.statsBox}>
              <View style={[styles.iconCircleColor, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="cloud-offline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.statsValueColor}>1.8 kg</Text>
              <Text style={styles.statsLabelColor}>H₂S Mitigation</Text>
            </View>
          </View>
        </View>

        {/* Chart 1: Water Quality */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Water Quality</Text>
            <Text style={styles.chartSubtitle}>BOD/COD Reduction Trend</Text>
          </View>
          <BarChart
            data={barData}
            width={chartWidth}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
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
        </View>

        {/* Chart 2: Flood Curve */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Flood Frequency</Text>
            <Text style={styles.chartSubtitle}>Historical crest variance</Text>
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
              color: () => Colors.primary,
              labelColor: () => Colors.textSecondary,
              propsForDots: { r: '0' },
              propsForBackgroundLines: { stroke: '#F1F5F9', strokeDasharray: '4, 4' },
            }}
            bezier={true}
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
  },
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
  headerRight: {
    flexDirection: 'row',
  },
  sdgBadge: {
    backgroundColor: Colors.safeLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  sdgText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '900',
  },
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
  timeRangePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
  },
  timeRangeActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  timeRangeInactive: {
    backgroundColor: 'transparent',
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
    marginBottom: 12,
  },
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircleColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsValueWhite: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  statsLabelWhite: {
    color: '#E0E7FF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  statsValueColor: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  statsLabelColor: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
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
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  chartSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  chart: {
    borderRadius: 16,
    marginLeft: -10, // Adjust chart kit default padding
  },
});
