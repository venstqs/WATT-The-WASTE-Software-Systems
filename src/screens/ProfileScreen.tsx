import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, StatusBar, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTelemetry } from '../context/TelemetryContext';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { isRunning, setIsRunning, autoDispatch, setAutoDispatch, esgStats, nodes } = useTelemetry();
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Profile */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={Colors.primary} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'Operator'}</Text>
          <Text style={styles.userRole}>{user?.department || 'Operations'}</Text>
        </View>

        {/* Configuration Section */}
        <View style={styles.configCard}>
          <Text style={styles.sectionTitle}>Edge-AI System Configuration</Text>
          
          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>LSTM Inference Engine</Text>
              <Text style={styles.configSubtitle}>Real-time hydro-surge prediction (MAE: 4.2cm)</Text>
            </View>
            <Switch
              value={isRunning}
              onValueChange={setIsRunning}
              trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>Auto-Dispatch Sirens</Text>
              <Text style={styles.configSubtitle}>Trigger LGU alarms automatically on CRITICAL</Text>
            </View>
            <Switch
              value={autoDispatch}
              onValueChange={setAutoDispatch}
              trackColor={{ false: Colors.cardBorder, true: Colors.critical }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.configRow, { borderBottomWidth: 0 }]}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>Push Notifications</Text>
              <Text style={styles.configSubtitle}>Receive critical mobile alerts</Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* API & Data Management */}
        <View style={styles.configCard}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionIcon}>
              <Ionicons name="key" size={18} color={Colors.textLight} />
            </View>
            <Text style={styles.actionText}>LGU API Keys</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={async () => {
            const csv = [
              'Estero-Volt ESG Report',
              `Generated: ${new Date().toLocaleDateString('en-PH')}`,
              '',
              'Metric,Value,SDG',
              `Scope 2 Energy Offset,${esgStats.totalKwhOffset.toFixed(2)} kWh,SDG 7`,
              `E-Waste Batteries Replaced,${esgStats.eWasteEradicated} units,SDG 12`,
              `BOD Reduction (Bioremediation),${esgStats.bodReductionPct}%,SDG 6`,
              `H2S Mitigation,${esgStats.h2sMitigationKg} kg,SDG 11`,
              `Active Nodes,${nodes.length},—`,
              `Average SOC,${esgStats.averageSoc}%,—`,
            ].join('\n');
            await Share.share({ message: csv, title: 'Estero-Volt ESG Report' });
          }}>
            <View style={styles.actionIcon}>
              <Ionicons name="cloud-download" size={18} color={Colors.textLight} />
            </View>
            <Text style={styles.actionText}>Export ESG Report (CSV)</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]}>
            <View style={styles.actionIcon}>
              <Ionicons name="server" size={18} color={Colors.textLight} />
            </View>
            <Text style={styles.actionText}>System Diagnostics</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        }}>
          <Ionicons name="log-out-outline" size={20} color={Colors.critical} />
          <Text style={styles.logoutText}>Terminate Secure Session</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Estero-Volt v2.4.0 (Build 4912)</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.safe,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  configInfo: {
    flex: 1,
    paddingRight: 16,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  configSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.critical,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
