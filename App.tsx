import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, Dimensions, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.cardBorder,
    notification: Colors.critical,
  },
};

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && windowWidth > 520;

  return (
    <SafeAreaProvider>
      <View style={isDesktopWeb ? styles.desktopBackdrop : styles.mobileRoot}>
        <StatusBar style="dark" />
        {isDesktopWeb ? (
          <View style={styles.phoneFrameContainer}>
            {/* Phone Bezel Header / Dynamic Island */}
            <View style={styles.phoneBezel}>
              <View style={styles.dynamicIsland} />
              <View style={styles.screenInner}>
                <NavigationContainer theme={CustomLightTheme}>
                  <AppNavigator />
                </NavigationContainer>
              </View>
              {/* Home Indicator Bar */}
              <View style={styles.homeBarContainer}>
                <View style={styles.homeBar} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mobileRoot}>
            <NavigationContainer theme={CustomLightTheme}>
              <AppNavigator />
            </NavigationContainer>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  desktopBackdrop: {
    flex: 1,
    backgroundColor: '#E8EDF5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  phoneFrameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneBezel: {
    width: 412,
    height: 870,
    backgroundColor: '#1E293B',
    borderRadius: 48,
    padding: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  dynamicIsland: {
    position: 'absolute',
    top: 18,
    left: '50%',
    marginLeft: -48,
    width: 96,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    zIndex: 100,
  },
  screenInner: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  homeBarContainer: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  homeBar: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },
  mobileRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
