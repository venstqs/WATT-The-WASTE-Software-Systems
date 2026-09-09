import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface SocCircularGaugeProps {
  soc: number;
}

export const SocCircularGauge: React.FC<SocCircularGaugeProps> = ({ soc }) => {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedSoc = Math.min(100, Math.max(0, soc));
  const strokeDashoffset = circumference - (circumference * clampedSoc) / 100;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>SUPERCAPACITOR STATE OF CHARGE</Text>
        <View style={styles.offGridPill}>
          <Text style={styles.subLabel}>Zero Chemical Waste</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.gaugeContainer}>
          <Svg width={size} height={size}>
            {/* Background Track Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Royal Blue Progress Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.primary}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>

          <View style={styles.centerTextContainer}>
            <Text style={styles.percentageText}>{clampedSoc}%</Text>
            <Text style={styles.statusText}>Charged</Text>
          </View>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Cell Architecture</Text>
            <Text style={styles.metaValue}>EDLC Supercap (3V, 100F)</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Autonomy Duration</Text>
            <Text style={styles.metaValue}>48h Continuous Buffer</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Degradation Rate</Text>
            <Text style={styles.metaValue}>&lt; 0.01% (Solid Electrolyte)</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  offGridPill: {
    backgroundColor: Colors.safeLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subLabel: {
    color: Colors.safe,
    fontSize: 10,
    fontWeight: '800',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  gaugeContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  metaContainer: {
    flex: 1,
    marginLeft: 18,
    justifyContent: 'space-between',
  },
  metaCard: {
    marginBottom: 8,
  },
  metaLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
});
