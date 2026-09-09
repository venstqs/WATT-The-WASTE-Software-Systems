import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LoginScreen } from '../screens/LoginScreen';
import { MapScreen } from '../screens/MapScreen';
import { NodeDetailScreen } from '../screens/NodeDetailScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import {
  RootStackParamList,
  MainTabParamList,
  MapStackParamList,
} from './types';

const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const MapStack = createStackNavigator<MapStackParamList>();

const MapStackNavigator: React.FC = () => {
  return (
    <MapStack.Navigator
      initialRouteName="MapScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: styles.cardStyle,
      }}
    >
      <MapStack.Screen name="MapScreen" component={MapScreen} />
      <MapStack.Screen name="NodeDetailScreen" component={NodeDetailScreen} />
    </MapStack.Navigator>
  );
};

const MainTabNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'map';

          if (route.name === 'MapTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'AlertsTab') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'AnalyticsTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          return (
            <View style={focused ? styles.activeTabIndicator : undefined}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <MainTab.Screen
        name="MapTab"
        component={MapStackNavigator}
        options={{ tabBarLabel: 'GIS Map' }}
      />
      <MainTab.Screen
        name="AlertsTab"
        component={AlertsScreen}
        options={{ tabBarLabel: 'Alerts' }}
      />
      <MainTab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Analytics' }}
      />
    </MainTab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <RootStack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: styles.cardStyle,
      }}
    >
      <RootStack.Screen name="LoginScreen" component={LoginScreen} />
      <RootStack.Screen name="MainTabNavigator" component={MainTabNavigator} />
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    backgroundColor: Colors.background,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  activeTabIndicator: {
    transform: [{ scale: 1.1 }],
  },
});
