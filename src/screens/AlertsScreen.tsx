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

  const getIconBg = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return Colors.criticalLight;
      case 'warning':
        return Colors.warningLight;
      case 'info':
      default:
        return Colors.primaryLight;
    }
  };

  const renderAlertItem = ({ item }: { item: Alert }) => {
    const borderColor = getBorderColor(item.type);
    const iconBg = getIconBg(item.type);

    return (
      <View
        style={[
          styles.alertCard,
          {
            borderLeftColor: borderColor,
            borderLeftWidth: 5,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.leftMeta}>
            <View style={[styles.iconIndicator, { backgroundColor: iconBg }]}>
              <View style={[styles.dotIndicator, { backgroundColor: borderColor }]} />
            </View>
            <Text style={styles.alertTitle}>{item.title}</Text>
          </View>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        <Text style={styles.alertMessage}>{item.message}</Text>

        <View style={styles.alertFooter}>
          <Text style={styles.nodeRefTag}>STATION REF: {item.nodeId.toUpperCase()}</Text>
          <View style={[styles.statusPill, { backgroundColor: iconBg }]}>
            <Text style={[styles.statusPillText, { color: borderColor }]}>
              {item.type.toUpperCase()} DISPATCH
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        {/* Header: Active Alerts ({alerts.length}) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>CDRRMO INCIDENT FEED</Text>
            <Text style={styles.headerTitle}>Active Alerts ({alerts.length})</Text>
          </View>
          <View style={styles.alertBadge}>
            <View style={styles.redDot} />
            <Text style={styles.alertBadgeText}>REAL-TIME</Text>
          </View>
        </View>

        {/* Filter Tabs: Horizontal row of touchables */}
        <View style={styles.filterRow}>
          {(['All', 'Critical', 'Warnings'] as FilterType[]).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  isActive ? styles.filterTabActive : styles.filterTabInactive,
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSub: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.criticalLight,
    borderWidth: 1,
    borderColor: Colors.critical,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.critical,
    marginRight: 6,
  },
  alertBadgeText: {
    color: Colors.critical,
    fontSize: 10,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  filterTabInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.cardBorder,
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
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconIndicator: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  nodeRefTag: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
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
