import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface WaveGaugeProps {
  waterLevel: number;
}

export const WaveGauge: React.FC<WaveGaugeProps> = ({ waterLevel }) => {
  const getSeverityColor = (level: number) => {
    if (level < 80) return Colors.safe;
    if (level <= 119) return Colors.warning;
    return Colors.critical;
  };

  const getSeverityBg = (level: number) => {
    if (level < 80) return Colors.safeLight;
    if (level <= 119) return Colors.warningLight;
    return Colors.criticalLight;
  };

  const getStatusLabel = (level: number) => {
    if (level < 80) return 'SAFE RANGE';
    if (level <= 119) return 'WARNING THRESHOLD';
    return 'CRITICAL FLOOD LEVEL';
  };

  const statusColor = getSeverityColor(waterLevel);
  const statusBg = getSeverityBg(waterLevel);
  const statusLabel = getStatusLabel(waterLevel);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithDot}>
          <View style={[styles.pulseDot, { backgroundColor: statusColor }]} />
          <Text style={styles.label}>ESTERO WATER DEPTH</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusBg, borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.gaugeContent}>
        <View style={styles.svgWrapper}>
          <Svg width={116} height={74} viewBox="0 0 116 74">
            <Defs>
              <LinearGradient id="waveBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.25" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="116" height="74" rx="14" fill="#F0F5FF" />
            <Path
              d="M 6 46 C 22 28, 38 60, 58 46 C 78 30, 94 60, 110 46 L 110 70 L 6 70 Z"
              fill="url(#waveBlueGrad)"
            />
            <Path
              d="M 6 46 C 22 28, 38 60, 58 46 C 78 30, 94 60, 110 46"
              fill="none"
              stroke={Colors.primary}
              strokeWidth="3"
            />
            <Path
              d="M 6 36 C 24 22, 42 50, 62 36 C 82 22, 98 48, 110 36"
              fill="none"
              stroke={statusColor}
              strokeWidth="2"
              strokeDasharray="4, 3"
            />
          </Svg>
        </View>

        <View style={styles.valueWrapper}>
          <View style={styles.rowAlign}>
            <Text style={styles.valueText}>{waterLevel}</Text>
            <Text style={styles.unitText}>cm</Text>
          </View>
          <Text style={styles.subtext}>Estero Baseline: 50 cm | Alert: 120 cm</Text>
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
    marginBottom: 14,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  gaugeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  svgWrapper: {
    marginRight: 16,
  },
  valueWrapper: {
    flex: 1,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueText: {
    color: Colors.textPrimary,
    fontSize: 44,
    fontWeight: '900',
  },
  unitText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 6,
  },
  subtext: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});
