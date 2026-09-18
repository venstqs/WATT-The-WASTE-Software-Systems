import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MOCK_ALERTS, Alert } from '../data/mockData';

type FilterType = 'All' | 'Critical' | 'Warnings';

export const AlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'Critical') return alert.type === 'critical';
    if (activeFilter === 'Warnings') return alert.type === 'warning';
    return true;
  });

  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const renderAlertItem = ({ item }: { item: Alert }) => {
    const isAck = acknowledged.has(item.id);
    const isCritical = item.type === 'critical';
    const iconName = isCritical ? 'warning' : (item.type === 'warning' ? 'alert-circle' : 'information-circle');
    const color = isCritical ? Colors.critical : (item.type === 'warning' ? Colors.warning : Colors.info);
    const bgColor = isCritical ? Colors.criticalLight : (item.type === 'warning' ? Colors.warningLight : Colors.infoLight);

    return (
      <View style={[styles.alertCard, isAck && styles.alertCardAck]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBox, { backgroundColor: isAck ? '#F1F5F9' : bgColor }]}>
              <Ionicons name={isAck ? "checkmark-circle" : iconName} size={20} color={isAck ? Colors.safe : color} />
            </View>
            <View>
              <Text style={[styles.alertTitle, isAck && styles.textAck]}>{item.title}</Text>
              <Text style={styles.timestamp}>{item.timestamp} • {item.stationName}</Text>
            </View>
          </View>
          {isCritical && !isAck && <View style={styles.pulseDot} />}
        </View>

        <Text style={[styles.alertMessage, isAck && styles.textAck]}>{item.message}</Text>

        {!isAck && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => handleAcknowledge(item.id)}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnTextPrimary}>Acknowledge</Text>
            </TouchableOpacity>
            {isCritical && (
              <TouchableOpacity style={styles.actionBtnDanger}>
                <Ionicons name="megaphone" size={14} color={Colors.critical} />
                <Text style={styles.actionBtnTextDanger}>Dispatch Siren</Text>
              </TouchableOpacity>
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
            <Text style={styles.realtimeText}>LIVE STREAM</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['All', 'Critical', 'Warnings'] as FilterType[]).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isActive ? styles.filterPillActive : styles.filterPillInactive,
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive ? styles.filterTextActive : styles.filterTextInactive,
                  ]}
                >
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
        />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.critical,
    marginRight: 6,
  },
  realtimeText: {
    color: Colors.critical,
    fontSize: 9,
    fontWeight: '900',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: Colors.textSecondary,
  },
  filterActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginLeft: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  alertCardAck: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    shadowOpacity: 0,
    elevation: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  timestamp: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  alertMessage: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 16,
  },
  textAck: {
    color: Colors.textMuted,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.critical,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  actionBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.criticalLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnTextDanger: {
    color: Colors.critical,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
});
