import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const TabBarIcon = ({ isFocused, routeName, label, onPress, onLongPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.1 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  let iconName: keyof typeof Ionicons.glyphMap = 'map';
  if (routeName === 'MapTab') iconName = isFocused ? 'map' : 'map-outline';
  else if (routeName === 'NetworkTab') iconName = isFocused ? 'git-network' : 'git-network-outline';
  else if (routeName === 'AlertsTab') iconName = isFocused ? 'warning' : 'warning-outline';
  else if (routeName === 'AnalyticsTab') iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
  else if (routeName === 'ProfileTab') iconName = isFocused ? 'settings' : 'settings-outline';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          isFocused && styles.iconContainerActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={iconName}
          size={isFocused ? 18 : 22}
          color={isFocused ? '#FFFFFF' : Colors.textMuted}
        />
        {isFocused && (
          <Text style={styles.tabLabelActive}>{label}</Text>
        )}
        {/* Red Badge for Alerts Tab */}
        {routeName === 'AlertsTab' && !isFocused && (
          <View style={styles.badgeIndicator} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name === 'MapTab' ? 'Map'
            : route.name === 'NetworkTab' ? 'Nodes'
            : route.name === 'AlertsTab' ? 'Alerts'
            : route.name === 'AnalyticsTab' ? 'Data'
            : 'Settings';

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarIcon
            key={route.key}
            isFocused={isFocused}
            routeName={route.name}
            label={label}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  iconContainerActive: {
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
    marginLeft: 4,
  },
  badgeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.critical,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
