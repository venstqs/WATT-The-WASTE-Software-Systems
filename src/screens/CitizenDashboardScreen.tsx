// src/screens/CitizenDashboardScreen.tsx
// Public-facing flood status dashboard for Naga City residents
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTelemetry } from '../context/TelemetryContext';
import { useAuth } from '../context/AuthContext';

const EMERGENCY_HOTLINES = [
  { name: 'CDRRMO Naga City', number: '(054) 473-9999', icon: 'warning' as const, color: '#EF4444' },
  { name: 'Naga City Fire Station', number: '(054) 811-1345', icon: 'flame' as const, color: '#F97316' },
  { name: 'Philippine Red Cross', number: '143', icon: 'medkit' as const, color: '#EF4444' },
  { name: 'NDRRMC Operations', number: '(02) 8911-5061', icon: 'radio' as const, color: Colors.primary },
];

const getFloodStatus = (maxWaterLevel: number): {
  label: string;
  color: string;
  bgColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  advice: string;
} => {
  if (maxWaterLevel >= 120) return {
    label: 'CRITICAL FLOOD RISK',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    icon: 'warning',
    advice: 'Water levels are CRITICAL. Follow evacuation orders from your Barangay Captain immediately.',
  };
  if (maxWaterLevel >= 80) return {
    label: 'FLOOD WARNING',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    icon: 'alert-circle',
    advice: 'Estero levels are rising. Prepare an emergency bag. Monitor announcements from CDRRMO.',
  };
  return {
    label: 'NORMAL — ALL CLEAR',
    color: '#10B981',
    bgColor: '#F0FDF4',
    icon: 'checkmark-circle',
    advice: 'All estero stations are within safe levels. No immediate flood risk at this time.',
  };
};

export const CitizenDashboardScreen: React.FC = () => {
  const { nodes, alerts } = useTelemetry();
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const maxWaterLevel = Math.max(...nodes.map(n => n.waterLevel));
  const criticalNodes = nodes.filter(n => n.status === 'critical');
  const warningNodes = nodes.filter(n => n.status === 'warning');
  const unackAlerts = alerts.filter(a => !a.acknowledged && a.type === 'critical');
  const floodStatus = getFloodStatus(maxWaterLevel);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Resident'} 👋</Text>
            <Text style={styles.subtitle}>Naga City Estero Flood Status</Text>
          </View>
          <View style={styles.logoMark}>
            <Ionicons name="water" size={20} color={Colors.primary} />
          </View>
        </Animated.View>

        {/* Main Flood Status Card */}
        <Animated.View
          style={[
            styles.statusCard,
            { backgroundColor: floodStatus.bgColor, borderColor: floodStatus.color + '40', opacity: fadeAnim },
          ]}
        >
          <View style={styles.statusIconRow}>
            <View style={[styles.statusIconBg, { backgroundColor: floodStatus.color + '20' }]}>
              <Ionicons name={floodStatus.icon} size={32} color={floodStatus.color} />
            </View>
            <View style={styles.statusTextBlock}>
              <Text style={[styles.statusLabel, { color: floodStatus.color }]}>{floodStatus.label}</Text>
              <Text style={styles.statusTimestamp}>Updated just now • Auto-refresh every 3s</Text>
            </View>
          </View>
          <Text style={styles.statusAdvice}>{floodStatus.advice}</Text>
        </Animated.View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{nodes.length}</Text>
            <Text style={styles.quickStatLabel}>Stations{'\n'}Online</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: criticalNodes.length > 0 ? '#EF4444' : Colors.textPrimary }]}>
              {criticalNodes.length}
            </Text>
            <Text style={styles.quickStatLabel}>Critical{'\n'}Zones</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: warningNodes.length > 0 ? '#F59E0B' : Colors.textPrimary }]}>
              {warningNodes.length}
            </Text>
            <Text style={styles.quickStatLabel}>Warning{'\n'}Zones</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{Math.round(maxWaterLevel)}</Text>
            <Text style={styles.quickStatLabel}>Highest{'\n'}Level (cm)</Text>
          </View>
        </View>

        {/* Estero Stations — Simplified */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ESTERO STATIONS</Text>
          <Text style={styles.sectionSubtitle}>Real-time water level readings</Text>
        </View>

        {nodes.map((node) => {
          const shortName = node.name.split(' - ')[1] || node.name;
          const levelPct = Math.min(100, Math.round((node.waterLevel / 150) * 100));
          const barColor = node.status === 'critical' ? '#EF4444' : node.status === 'warning' ? '#F59E0B' : '#10B981';
          const statusLabel = node.status === 'critical' ? 'Critical' : node.status === 'warning' ? 'Warning' : 'Safe';

          return (
            <View key={node.id} style={styles.stationCard}>
              <View style={styles.stationTop}>
                <View style={styles.stationLeft}>
                  <View style={[styles.statusDot, { backgroundColor: barColor }]} />
                  <View>
                    <Text style={styles.stationName}>{shortName}</Text>
                    <Text style={styles.stationLocation}>Naga City, Bicol</Text>
                  </View>
                </View>
                <View style={[styles.statusPill, { backgroundColor: barColor + '20' }]}>
                  <Text style={[styles.statusPillText, { color: barColor }]}>{statusLabel}</Text>
                </View>
              </View>

              {/* Water level bar */}
              <View style={styles.levelBarRow}>
                <View style={styles.levelTrack}>
                  <View style={[styles.levelFill, { width: `${levelPct}%`, backgroundColor: barColor }]} />
                </View>
                <Text style={[styles.levelValue, { color: barColor }]}>{node.waterLevel.toFixed(0)}cm</Text>
              </View>
              <Text style={styles.levelCaption}>
                Threshold: 80cm (Warning) / 120cm (Critical)
              </Text>
            </View>
          );
        })}

        {/* Active Alerts Banner (if any) */}
        {unackAlerts.length > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <View style={styles.alertBannerText}>
              <Text style={styles.alertBannerTitle}>{unackAlerts.length} Active Critical Alert{unackAlerts.length > 1 ? 's' : ''}</Text>
              <Text style={styles.alertBannerMsg}>{unackAlerts[0].message}</Text>
            </View>
          </View>
        )}

        {/* Tip Box */}
        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Flood Preparedness Tip</Text>
            <Text style={styles.tipText}>
              Keep a "go bag" ready with 3-day supplies. Know your nearest evacuation center — usually your Barangay Hall or a designated school.
            </Text>
          </View>
        </View>

        {/* Emergency Hotlines */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EMERGENCY HOTLINES</Text>
          <Text style={styles.sectionSubtitle}>Tap to call directly</Text>
        </View>

        {EMERGENCY_HOTLINES.map((hotline) => (
          <TouchableOpacity
            key={hotline.name}
            style={styles.hotlineCard}
            activeOpacity={0.75}
            onPress={() => Linking.openURL(`tel:${hotline.number.replace(/\D/g, '')}`)}
          >
            <View style={[styles.hotlineIconBg, { backgroundColor: hotline.color + '15' }]}>
              <Ionicons name={hotline.icon} size={20} color={hotline.color} />
            </View>
            <View style={styles.hotlineInfo}>
              <Text style={styles.hotlineName}>{hotline.name}</Text>
              <Text style={styles.hotlineNumber}>{hotline.number}</Text>
            </View>
            <Ionicons name="call" size={18} color={hotline.color} />
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Estero-Volt • Flood Monitoring & Off-Grid Energy • Naga City
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 110 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  greeting: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  logoMark: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  // Main status card
  statusCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
  },
  statusIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  statusIconBg: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  statusTextBlock: { flex: 1 },
  statusLabel: { fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  statusTimestamp: { fontSize: 11, color: Colors.textMuted, marginTop: 4, fontWeight: '500' },
  statusAdvice: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontWeight: '500' },

  // Quick stats
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  quickStatLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  divider: { width: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },

  // Section headers
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 0.8 },
  sectionSubtitle: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },

  // Station cards
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  stationTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stationLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  stationName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  stationLocation: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  levelBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  levelTrack: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginRight: 10 },
  levelFill: { height: '100%', borderRadius: 4 },
  levelValue: { fontSize: 14, fontWeight: '900', minWidth: 45, textAlign: 'right' },
  levelCaption: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },

  // Alert banner
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  alertBannerText: { flex: 1, marginLeft: 12 },
  alertBannerTitle: { fontSize: 13, fontWeight: '900', color: '#EF4444' },
  alertBannerMsg: { fontSize: 12, color: '#B91C1C', marginTop: 4, lineHeight: 18 },

  // Tip box
  tipBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    alignItems: 'flex-start',
  },
  tipContent: { flex: 1, marginLeft: 12 },
  tipTitle: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  tipText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },

  // Hotlines
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  hotlineIconBg: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  hotlineInfo: { flex: 1 },
  hotlineName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  hotlineNumber: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginTop: 2 },

  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500', textAlign: 'center' },
});
