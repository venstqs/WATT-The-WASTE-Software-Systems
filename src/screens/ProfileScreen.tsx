import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export const ProfileScreen: React.FC = () => {
  const [aiEnabled, setAiEnabled] = React.useState(true);
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const [autoDispatch, setAutoDispatch] = React.useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Profile */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.userName}>Dr. Alejandro Reyes</Text>
          <Text style={styles.userRole}>CDRRMO Operations Chief</Text>
        </View>

        {/* Configuration Section */}
        <View style={styles.configCard}>
          <Text style={styles.sectionTitle}>Edge-AI System Configuration</Text>
          
          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>LSTM Inference Engine</Text>
              <Text style={styles.configSubtitle}>Real-time hydro-surge prediction</Text>
            </View>
            <Switch
              value={aiEnabled}
              onValueChange={setAiEnabled}
              trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>Auto-Dispatch Sirens</Text>
              <Text style={styles.configSubtitle}>Trigger LGU alarms automatically</Text>
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

          <TouchableOpacity style={styles.actionRow}>
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
        <TouchableOpacity style={styles.logoutButton}>
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
    backgroundColor: '#0F172A', // Dark mode tech vibe for settings
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.3)',
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
    borderColor: '#0F172A',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  userRole: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  configCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
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
    borderBottomColor: '#334155',
  },
  configInfo: {
    flex: 1,
    paddingRight: 16,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  configSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
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
    borderColor: 'rgba(239, 68, 68, 0.3)',
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
    color: '#475569',
    fontWeight: '600',
  },
});
