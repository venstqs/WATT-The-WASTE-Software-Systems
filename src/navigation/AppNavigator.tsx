import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
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
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
        },
        tabBarIconStyle: {
          width: 'auto',
          height: 'auto',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'map';

          if (route.name === 'MapTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'AlertsTab') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'AnalyticsTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
          
          useEffect(() => {
            Animated.spring(scaleAnim, {
              toValue: focused ? 1.05 : 1,
              friction: 5,
              tension: 100,
              useNativeDriver: true,
            }).start();
          }, [focused]);

          return (
            <Animated.View style={[
              styles.tabIconContainer, 
              focused && styles.tabIconContainerActive,
              { transform: [{ scale: scaleAnim }] }
            ]}>
              <Ionicons
                name={iconName}
                size={focused ? 20 : 22}
                color={focused ? '#FFFFFF' : Colors.textMuted}
              />
              {focused && (
                <Text style={styles.tabLabelActive}>
                  {route.name === 'MapTab' ? 'Map' : route.name === 'AlertsTab' ? 'Alerts' : 'Data'}
                </Text>
              )}
              {/* Red Badge for Alerts Tab */}
              {route.name === 'AlertsTab' && !focused && (
                <View style={styles.badgeIndicator} />
              )}
            </Animated.View>
          );
        },
      })}
    >
      <MainTab.Screen name="MapTab" component={MapStackNavigator} />
      <MainTab.Screen name="AlertsTab" component={AlertsScreen} />
      <MainTab.Screen name="AnalyticsTab" component={AnalyticsScreen} />
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
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 64,
    borderTopWidth: 0,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    paddingHorizontal: 8,
    paddingBottom: 0, // ensure no safe area bottom padding pushes it up inside the absolute container
  },
  tabIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    height: 44, // give it a fixed height
  },
  tabIconContainerActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  badgeIndicator: {
    position: 'absolute',
    top: 10,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.critical,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
