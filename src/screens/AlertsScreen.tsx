import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Alert } from '../data/mockData';
import { useTelemetry } from '../context/TelemetryContext';

type FilterType = 'All' | 'Critical' | 'Warnings';

export const AlertsScreen: React.FC = () => {
  const { alerts, acknowledgeAlert, dispatchSiren } = useTelemetry();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [sirenModal, setSirenModal] = useState<{ visible: boolean; alert: Alert | null }>({ visible: false, alert: null });
  const [sirenDispatched, setSirenDispatched] = useState<Set<string>>(new Set());

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'Critical') return alert.type === 'critical';
    if (activeFilter === 'Warnings') return alert.type === 'warning';
    return true;
  });

  const unacknowledgedCritical = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;

  const handleDispatchConfirm = () => {
    if (sirenModal.alert) {
      dispatchSiren(sirenModal.alert.nodeId);
      setSirenDispatched(prev => new Set(prev).add(sirenModal.alert!.id));
      acknowledgeAlert(sirenModal.alert.id);
    }
    setSirenModal({ visible: false, alert: null });
  };

  const renderAlertItem = ({ item }: { item: Alert }) => {
    const isAck = item.acknowledged;
    const isCritical = item.type === 'critical';
    const isWarning = item.type === 'warning';
    const wasDispatched = sirenDispatched.has(item.id);
    const iconName = isCritical ? 'warning' : (isWarning ? 'alert-circle' : 'information-circle');
    const color = isCritical ? Colors.critical : (isWarning ? Colors.warning : Colors.info);
    const bgColor = isCritical ? Colors.criticalLight : (isWarning ? Colors.warningLight : Colors.infoLight);

    return (
      <View style={[styles.alertCard, isAck && styles.alertCardAck]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBox, { backgroundColor: isAck ? '#F1F5F9' : bgColor }]}>
              <Ionicons name={isAck ? 'checkmark-circle' : iconName} size={20} color={isAck ? Colors.safe : color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, isAck && styles.textAck]} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.timestamp}>{item.timestamp} • {item.stationName}</Text>
            </View>
          </View>
          {isCritical && !isAck && <View style={styles.pulseDot} />}
        </View>

        <Text style={[styles.alertMessage, isAck && styles.textAck]}>{item.message}</Text>

        {!isAck && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => acknowledgeAlert(item.id)}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnTextPrimary}>Acknowledge</Text>
            </TouchableOpacity>
            {isCritical && !wasDispatched && (
              <TouchableOpacity
                style={styles.actionBtnDanger}
                onPress={() => setSirenModal({ visible: true, alert: item })}
              >
                <Ionicons name="megaphone" size={14} color={Colors.critical} />
                <Text style={styles.actionBtnTextDanger}>Dispatch Siren</Text>
              </TouchableOpacity>
            )}
            {wasDispatched && (
              <View style={styles.dispatchedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.safe} />
                <Text style={styles.dispatchedText}>Siren Active</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        {/* Executive Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Emergency Alerts</Text>
            <Text style={styles.headerSubtitle}>CDRRMO Operations Center</Text>
          </View>
          <View style={styles.realtimeBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.realtimeText}>
              {unacknowledgedCritical > 0 ? `${unacknowledgedCritical} CRITICAL` : 'LIVE STREAM'}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['All', 'Critical', 'Warnings'] as FilterType[]).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive ? styles.filterPillActive : styles.filterPillInactive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, isActive ? styles.filterTextActive : styles.filterTextInactive]}>
                  {filter}
                </Text>
                {isActive && <View style={styles.filterActiveDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Alert List */}
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlertItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.safe} />
              <Text style={styles.emptyTitle}>All Clear</Text>
              <Text style={styles.emptySubtitle}>No {activeFilter !== 'All' ? activeFilter.toLowerCase() + ' ' : ''}alerts at this time.</Text>
            </View>
          }
        />
      </View>

      {/* Dispatch Siren Confirmation Modal */}
      <Modal
        visible={sirenModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setSirenModal({ visible: false, alert: null })}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSirenModal({ visible: false, alert: null })}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalIconBg}>
              <Ionicons name="megaphone" size={28} color={Colors.critical} />
            </View>
            <Text style={styles.modalTitle}>Dispatch Emergency Siren?</Text>
            <Text style={styles.modalMessage}>
              This will activate the emergency siren for{' '}
              <Text style={{ fontWeight: '800' }}>{sirenModal.alert?.stationName}</Text>.
              {'\n\n'}Barangay evacuation protocols will be initiated immediately.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setSirenModal({ visible: false, alert: null })}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleDispatchConfirm}>
                <Ionicons name="megaphone" size={16} color="#FFFFFF" />
                <Text style={styles.modalBtnConfirmText}>DISPATCH NOW</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headerSubtitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.criticalLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  recordingDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.critical, marginRight: 6,
  },
  realtimeText: { color: Colors.critical, fontSize: 9, fontWeight: '900' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, marginRight: 8, borderWidth: 1.5,
  },
  filterPillActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  filterPillInactive: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  filterText: { fontSize: 13, fontWeight: '800' },
  filterTextActive: { color: '#FFFFFF' },
  filterTextInactive: { color: Colors.textSecondary },
  filterActiveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#FFFFFF', marginLeft: 6,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 110 },
  alertCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1,
    borderColor: '#E2E8F0', padding: 20, marginBottom: 16,
    shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 3,
  },
  alertCardAck: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9', shadowOpacity: 0, elevation: 0 },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  alertTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '900' },
  timestamp: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  alertMessage: {
    color: Colors.textSecondary, fontSize: 13,
    lineHeight: 20, fontWeight: '500', marginBottom: 16,
  },
  textAck: { color: Colors.textMuted },
  pulseDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.critical, marginTop: 6, marginLeft: 8,
  },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  actionBtnPrimary: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 10,
  },
  actionBtnTextPrimary: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', marginLeft: 6 },
  actionBtnDanger: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.criticalLight,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
  },
  actionBtnTextDanger: { color: Colors.critical, fontSize: 12, fontWeight: '800', marginLeft: 6 },
  dispatchedBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.safeLight,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
  },
  dispatchedText: { color: Colors.safe, fontSize: 12, fontWeight: '800', marginLeft: 6 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },
  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 28,
    padding: 28, marginHorizontal: 24, width: '88%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25, shadowRadius: 40, elevation: 20,
  },
  modalIconBg: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.criticalLight, alignItems: 'center',
    justifyContent: 'center', marginBottom: 20, alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20, fontWeight: '900', color: Colors.textPrimary,
    textAlign: 'center', marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14, color: Colors.textSecondary, lineHeight: 22,
    textAlign: 'center', marginBottom: 28,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F1F5F9', alignItems: 'center', marginRight: 12,
  },
  modalBtnCancelText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 14 },
  modalBtnConfirm: {
    flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.critical, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.critical, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  modalBtnConfirmText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, marginLeft: 8 },
});
