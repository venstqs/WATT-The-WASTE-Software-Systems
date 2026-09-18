import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
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
  const isDesktopWeb = Platform.OS === 'web' && windowWidth > 640;

  // Modern presentation frame dimensions
  const presentationHeight = Math.min(844, Math.max(700, windowHeight - 60));
  const presentationWidth = Math.min(390, Math.round(presentationHeight * 0.46));

  return (
    <SafeAreaProvider>
      <View style={isDesktopWeb ? styles.desktopBackdrop : styles.mobileRoot}>
        <StatusBar style="dark" />
        {isDesktopWeb ? (
          <View style={styles.presentationWrapper}>
            <View
              style={[
                styles.deviceFrame,
                { width: presentationWidth, height: presentationHeight },
              ]}
            >
              {/* Screen Container without notch obstruction */}
              <View style={styles.screenInner}>
                <NavigationContainer theme={CustomLightTheme}>
                  <AppNavigator />
                </NavigationContainer>
              </View>

              {/* Minimal Home Indicator Bar */}
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
    backgroundColor: '#EBF0F9', // Subtle presentation gradient feel
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  presentationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryHeader,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 20,
  },
  deviceFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  screenInner: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  homeBarContainer: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  homeBar: {
    width: 120,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  mobileRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
