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
  const isDesktopWeb = Platform.OS === 'web' && windowWidth > 540;

  // Calculate phone frame height responsive to viewport
  const phoneHeight = Math.min(840, Math.max(680, windowHeight - 40));
  const phoneWidth = Math.min(400, Math.round(phoneHeight * 0.48));

  return (
    <SafeAreaProvider>
      <View style={isDesktopWeb ? styles.desktopBackdrop : styles.mobileRoot}>
        <StatusBar style="dark" />
        {isDesktopWeb ? (
          <View style={styles.phoneShadowWrapper}>
            <View
              style={[
                styles.phoneBezel,
                { width: phoneWidth, height: phoneHeight },
              ]}
            >
              {/* Dynamic Island / Notch */}
              <View style={styles.dynamicIsland} />
              
              {/* Screen Container */}
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
    backgroundColor: '#EEF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  phoneShadowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 20,
  },
  phoneBezel: {
    backgroundColor: '#0F172A',
    borderRadius: 44,
    padding: 9,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#334155',
  },
  dynamicIsland: {
    position: 'absolute',
    top: 14,
    left: '50%',
    marginLeft: -45,
    width: 90,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    zIndex: 999,
  },
  screenInner: {
    flex: 1,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  homeBarContainer: {
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  homeBar: {
    width: 110,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },
  mobileRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
