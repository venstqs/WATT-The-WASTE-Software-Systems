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
import { NetworkScreen } from '../screens/NetworkScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomTabBar } from '../components/CustomTabBar';
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
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainTab.Screen name="MapTab" component={MapStackNavigator} />
      <MainTab.Screen name="NetworkTab" component={NetworkScreen} />
      <MainTab.Screen name="AlertsTab" component={AlertsScreen} />
      <MainTab.Screen name="AnalyticsTab" component={AnalyticsScreen} />
      <MainTab.Screen name="ProfileTab" component={ProfileScreen} />
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
});
