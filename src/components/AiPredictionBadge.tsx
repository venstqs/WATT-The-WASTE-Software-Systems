import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface AiPredictionBadgeProps {
  prediction: 'LOW' | 'MEDIUM' | 'HIGH';
  showDetails?: boolean;
}

export const AiPredictionBadge: React.FC<AiPredictionBadgeProps> = ({
  prediction,
  showDetails = true,
}) => {
  const getBadgeStyle = () => {
    switch (prediction) {
      case 'HIGH':
        return {
          borderColor: Colors.critical,
          backgroundColor: Colors.criticalLight,
          textColor: Colors.critical,
          inference: 'Flash flood alert. Projected water level will exceed 120cm threshold within 4 hours.',
          confidence: '96.8% Confidence',
        };
      case 'MEDIUM':
        return {
          borderColor: Colors.warning,
          backgroundColor: Colors.warningLight,
          textColor: Colors.warning,
          inference: 'Moderate risk. Hydro-surge detected (+15cm/h). Monitoring upstream Naga drainage.',
          confidence: '94.2% Confidence',
        };
      case 'LOW':
      default:
        return {
          borderColor: Colors.safe,
          backgroundColor: Colors.safeLight,
          textColor: Colors.safe,
          inference: 'Stable hydrological flow. Normal tidal discharge across Bicol river basin.',
          confidence: '98.5% Confidence',
        };
    }
  };

  const badgeConfig = getBadgeStyle();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: badgeConfig.borderColor,
          backgroundColor: badgeConfig.backgroundColor,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>EDGE-AI NEURAL NET</Text>
        </View>
        <Text style={[styles.confidenceText, { color: badgeConfig.textColor }]}>
          {badgeConfig.confidence}
        </Text>
      </View>

      <View style={styles.riskRow}>
        <View
          style={[styles.indicatorDot, { backgroundColor: badgeConfig.textColor }]}
        />
        <Text style={[styles.riskText, { color: badgeConfig.textColor }]}>
          Flood Risk: {prediction} (Next 4 hrs)
        </Text>
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.inferenceText}>{badgeConfig.inference}</Text>
          <View style={styles.modelTagContainer}>
            <Text style={styles.modelTagText}>MLPRegressor (50-50-25) • Autonomous Edge Inferencing</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiTagText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '800',
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  riskText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  detailsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
    paddingTop: 8,
  },
  inferenceText: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  modelTagContainer: {
    marginTop: 6,
  },
  modelTagText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
});
