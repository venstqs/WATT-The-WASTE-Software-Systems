import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LoginScreen } from '../screens/LoginScreen';
import { MapScreen } from '../screens/MapScreen';
import { NodeDetailScreen } from '../screens/NodeDetailScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { NetworkScreen } from '../screens/NetworkScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CitizenDashboardScreen } from '../screens/CitizenDashboardScreen';
import { CitizenAlertsScreen } from '../screens/CitizenAlertsScreen';
import { CustomTabBar } from '../components/CustomTabBar';
import { useTelemetry } from '../context/TelemetryContext';
import {
  RootStackParamList,
  MainTabParamList,
  MapStackParamList,
  CitizenTabParamList,
} from './types';

const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const CitizenTab = createBottomTabNavigator<CitizenTabParamList>();
const MapStack = createStackNavigator<MapStackParamList>();

// ─── LGU Map Stack ───────────────────────────────────────────────────────────
const MapStackNavigator: React.FC = () => (
  <MapStack.Navigator
    initialRouteName="MapScreen"
    screenOptions={{ headerShown: false, cardStyle: styles.cardStyle }}
  >
    <MapStack.Screen name="MapScreen" component={MapScreen} />
    <MapStack.Screen name="NodeDetailScreen" component={NodeDetailScreen} />
  </MapStack.Navigator>
);

// ─── LGU Full Tab Navigator ───────────────────────────────────────────────────
const MainTabNavigator: React.FC = () => (
  <MainTab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <MainTab.Screen name="MapTab" component={MapStackNavigator} />
    <MainTab.Screen name="NetworkTab" component={NetworkScreen} />
    <MainTab.Screen name="AlertsTab" component={AlertsScreen} />
    <MainTab.Screen name="AnalyticsTab" component={AnalyticsScreen} />
    <MainTab.Screen name="ProfileTab" component={ProfileScreen} />
  </MainTab.Navigator>
);

// ─── Citizen Tab Bar ──────────────────────────────────────────────────────────
const CitizenTabBar: React.FC<any> = ({ state, navigation }) => {
  const { alerts } = useTelemetry();
  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;

  const tabs: { name: keyof CitizenTabParamList; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { name: 'CitizenHomeTab', icon: 'home', label: 'Home' },
    { name: 'CitizenMapTab', icon: 'map', label: 'Map' },
    { name: 'CitizenNetworkTab', icon: 'git-network', label: 'Nodes' },
    { name: 'CitizenAlertsTab', icon: 'warning', label: 'Alerts' },
    { name: 'CitizenAnalyticsTab', icon: 'stats-chart', label: 'Data' },
  ];

  return (
    <View style={styles.citizenTabBar}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        const isAlerts = tab.name === 'CitizenAlertsTab';
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.citizenTabBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(tab.name)}
          >
            <View style={[styles.citizenTabIcon, isFocused && styles.citizenTabIconActive]}>
              <Ionicons
                name={isFocused ? tab.icon : `${tab.icon}-outline` as any}
                size={isFocused ? 18 : 22}
                color={isFocused ? '#FFFFFF' : Colors.textMuted}
              />
              {isFocused && <Text style={styles.citizenTabLabel}>{tab.label}</Text>}
              {isAlerts && !isFocused && criticalCount > 0 && (
                <View style={styles.citizenBadge}>
                  <Text style={styles.citizenBadgeText}>{criticalCount > 9 ? '9+' : criticalCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Citizen Navigator ────────────────────────────────────────────────────────
const CitizenNavigator: React.FC = () => (
  <CitizenTab.Navigator
    tabBar={(props) => <CitizenTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <CitizenTab.Screen name="CitizenHomeTab" component={CitizenDashboardScreen} />
    <CitizenTab.Screen name="CitizenMapTab" component={MapStackNavigator} />
    <CitizenTab.Screen name="CitizenNetworkTab" component={NetworkScreen} />
    <CitizenTab.Screen name="CitizenAlertsTab" component={CitizenAlertsScreen} />
    <CitizenTab.Screen name="CitizenAnalyticsTab" component={AnalyticsScreen} />
  </CitizenTab.Navigator>
);

// ─── Root Stack ───────────────────────────────────────────────────────────────
export const AppNavigator: React.FC = () => (
  <RootStack.Navigator
    initialRouteName="LoginScreen"
    screenOptions={{ headerShown: false, cardStyle: styles.cardStyle }}
  >
    <RootStack.Screen name="LoginScreen" component={LoginScreen} />
    <RootStack.Screen name="MainTabNavigator" component={MainTabNavigator} />
    <RootStack.Screen name="CitizenNavigator" component={CitizenNavigator} />
  </RootStack.Navigator>
);

const styles = StyleSheet.create({
  cardStyle: { backgroundColor: Colors.background },
  citizenTabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  citizenTabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  citizenTabIcon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
  },
  citizenTabIconActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  citizenTabLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginLeft: 6 },
  citizenBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: Colors.critical, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFFFFF', paddingHorizontal: 3,
  },
  citizenBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
});
