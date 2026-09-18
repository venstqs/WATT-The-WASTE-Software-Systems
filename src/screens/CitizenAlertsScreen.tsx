// src/screens/CitizenAlertsScreen.tsx
// Simplified public alerts view — no acknowledge/dispatch controls
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTelemetry } from '../context/TelemetryContext';
import { Alert } from '../data/mockData';

export const CitizenAlertsScreen: React.FC = () => {
  const { alerts } = useTelemetry();
  const publicAlerts = alerts.slice(0, 8); // Show most recent 8

  const renderItem = ({ item }: { item: Alert }) => {
    const isCritical = item.type === 'critical';
    const isWarning = item.type === 'warning';
    const iconName = isCritical ? 'warning' : isWarning ? 'alert-circle' : 'information-circle';
    const color = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : Colors.info;
    const bgColor = isCritical ? '#FEF2F2' : isWarning ? '#FFFBEB' : Colors.infoLight;

    return (
      <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBg, { backgroundColor: bgColor }]}>
            <Ionicons name={iconName} size={18} color={color} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.timestamp} • {item.stationName}</Text>
          </View>
        </View>
        <Text style={styles.cardMessage}>{item.message}</Text>
        {isCritical && (
          <View style={styles.actionHint}>
            <Ionicons name="megaphone-outline" size={13} color="#EF4444" />
            <Text style={styles.actionHintText}>Contact CDRRMO if you're in the affected area</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flood Alerts</Text>
        <Text style={styles.headerSub}>Live updates from Naga City estero network</Text>
      </View>
      <FlatList
        data={publicAlerts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle" size={52} color="#10B981" />
            <Text style={styles.emptyTitle}>No Active Alerts</Text>
            <Text style={styles.emptySub}>All estero stations are within safe levels.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  list: { padding: 16, paddingBottom: 110 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18,
    borderWidth: 1, borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
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
  actionHint: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7, marginTop: 10,
  },
  actionHintText: { fontSize: 11, color: '#B91C1C', fontWeight: '700', marginLeft: 6 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 16 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, marginTop: 8 },
});
