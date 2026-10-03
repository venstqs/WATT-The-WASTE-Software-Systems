// src/screens/CitizenAlertsScreen.tsx
// Public-facing flood alert feed — Naga City residents
// Shows live alerts from TelemetryContext with safety guidance
// No admin controls (no Acknowledge / Dispatch Siren)
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TouchableOpacity, Linking, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTelemetry } from '../context/TelemetryContext';
import { Alert } from '../data/mockData';

type FilterType = 'All' | 'Critical' | 'Safe';

const CDRRMO_HOTLINE = '(054) 473-9999';

export const CitizenAlertsScreen: React.FC = () => {
  const { alerts, nodes } = useTelemetry();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;

  // Pulse animation for the live indicator
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    if (criticalCount > 0) pulse.start();
    else pulse.stop();
    return () => pulse.stop();
  }, [criticalCount]);

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'Critical') return a.type === 'critical';
    if (activeFilter === 'Safe') return a.type === 'info';
    return true;
  }).slice(0, 10);

  // Strip technical jargon from alert messages for citizen view
  const publicMessage = (msg: string): string => {
    return msg
      .replace(/Edge-AI MLP[^.]*\./g, '')
      .replace(/\(R²=[^)]*\)/g, '')
      .replace(/LoRaWAN[^.]*\./g, '')
      .replace(/Adaptive duty cycle[^.]*\./g, '')
      .trim();
  };

  const renderItem = ({ item }: { item: Alert }) => {
    const isCritical = item.type === 'critical';
    const isWarning = item.type === 'warning';
    const isInfo = item.type === 'info';
    const iconName: keyof typeof Ionicons.glyphMap = isCritical ? 'warning' : isWarning ? 'alert-circle' : 'checkmark-circle';
    const color = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
    const bgColor = isCritical ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#F0FDF4';

    return (
      <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBg, { backgroundColor: bgColor }]}>
            <Ionicons name={iconName} size={20} color={color} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.timestamp} • {item.stationName}</Text>
          </View>
          {isCritical && !item.acknowledged && (
            <Animated.View style={[styles.criticalDot, { transform: [{ scale: pulseAnim }] }]} />
          )}
        </View>

        <Text style={styles.cardMessage}>{publicMessage(item.message)}</Text>

        {isCritical && (
          <TouchableOpacity
            style={styles.callButton}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`tel:${CDRRMO_HOTLINE.replace(/\D/g, '')}`)}
          >
            <Ionicons name="call" size={13} color="#FFFFFF" />
            <Text style={styles.callButtonText}>Call CDRRMO Now — {CDRRMO_HOTLINE}</Text>
          </TouchableOpacity>
        )}

        {isWarning && (
          <View style={styles.warningHint}>
            <Ionicons name="information-circle-outline" size={14} color="#B45309" />
            <Text style={styles.warningHintText}>
              Prepare an emergency bag. Monitor your Barangay Captain's announcements.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Flood Alerts</Text>
          <Text style={styles.headerSub}>Live updates — Naga City estero network</Text>
        </View>
        <View style={[
          styles.liveBadge,
          criticalCount > 0 ? styles.liveBadgeCritical : styles.liveBadgeNormal,
        ]}>
          <View style={[styles.liveDot, { backgroundColor: criticalCount > 0 ? '#EF4444' : '#10B981' }]} />
          <Text style={[styles.liveText, { color: criticalCount > 0 ? '#EF4444' : '#065F46' }]}>
            {criticalCount > 0 ? `${criticalCount} CRITICAL` : 'ALL CLEAR'}
          </Text>
        </View>
      </View>

      {/* Current Status Banner */}
      {criticalCount > 0 ? (
        <View style={styles.criticalBanner}>
          <Ionicons name="warning" size={20} color="#FFFFFF" />
          <Text style={styles.criticalBannerText}>
            {criticalCount} critical flood alert{criticalCount > 1 ? 's' : ''} active — Follow CDRRMO instructions
          </Text>
        </View>
      ) : (
        <View style={styles.clearBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#065F46" />
          <Text style={styles.clearBannerText}>
            All {nodes.length} estero stations within safe levels — No immediate flood risk
          </Text>
        </View>
      )}

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {(['All', 'Critical', 'Safe'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
            activeOpacity={0.8}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alert List */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle" size={56} color="#10B981" />
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySub}>
              No {activeFilter !== 'All' ? activeFilter.toLowerCase() + ' ' : ''}alerts at this time.{'\n'}
              Stay safe and check back regularly.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1,
  },
  liveBadgeNormal: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  liveBadgeCritical: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  liveText: { fontSize: 9, fontWeight: '900' },
  criticalBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 12,
  },
  criticalBannerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', marginLeft: 10, flex: 1 },
  clearBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FDF4', paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#BBF7D0',
  },
  clearBannerText: { color: '#065F46', fontSize: 12, fontWeight: '700', marginLeft: 8 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  filterText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  filterTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingBottom: 110 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18,
    borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBg: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  cardMeta: { fontSize: 11, color: Colors.textMuted, fontWeight: '500', marginTop: 2 },
  cardMessage: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontWeight: '500' },
  criticalDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginLeft: 8,
  },
  callButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 10, marginTop: 12,
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  callButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', marginLeft: 6 },
  warningHint: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFFBEB', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, marginTop: 10,
  },
  warningHintText: {
    fontSize: 11, color: '#92400E', fontWeight: '600', marginLeft: 6, flex: 1,
  },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, marginTop: 16 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
