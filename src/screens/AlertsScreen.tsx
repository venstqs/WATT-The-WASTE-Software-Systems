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
import { Colors } from '../theme/colors';
import { MOCK_ALERTS, Alert } from '../data/mockData';

type FilterType = 'All' | 'Critical' | 'Warnings';

export const AlertsScreen: React.FC = () => {
  const [alerts] = useState<Alert[]>(MOCK_ALERTS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'Critical') return alert.type === 'critical';
    if (activeFilter === 'Warnings') return alert.type === 'warning';
    return true;
  });

  const getBorderColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return Colors.critical;
      case 'warning':
        return Colors.warning;
      case 'info':
      default:
        return Colors.primary;
    }
  };

  const renderAlertItem = ({ item }: { item: Alert }) => {
    const borderColor = getBorderColor(item.type);

    return (
      <View
        style={[
          styles.alertCard,
          {
            borderLeftColor: borderColor,
            borderLeftWidth: 6,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.alertTitle}>{item.title}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        <Text style={styles.alertMessage}>{item.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        {/* Header: Active Alerts (3) */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Active Alerts ({alerts.length})</Text>
          <View style={styles.realtimeBadge}>
            <Text style={styles.realtimeText}>REAL-TIME</Text>
          </View>
        </View>

        {/* Filter Pills (Matching Screen_4_Alerts.png) */}
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
                activeOpacity={0.7}
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
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Alert List (FlatList) */}
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlertItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No alerts found for this filter category.</Text>
            </View>
          }
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
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  realtimeBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  realtimeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '900',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 1.5,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
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
  listContent: {
    paddingBottom: 28,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
  },
  timestamp: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginLeft: 8,
  },
  alertMessage: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
