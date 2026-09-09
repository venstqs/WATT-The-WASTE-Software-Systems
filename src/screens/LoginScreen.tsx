import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginScreen'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('cdrrmo.officer@naga.gov.ph');
  const [password, setPassword] = useState('••••••••••••');

  const handleSignIn = () => {
    // Logic: Bypass authentication. onPress of Sign In navigates directly to MainTabNavigator
    navigation.replace('MainTabNavigator');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.cardContainer}>
          {/* Municipal Tech Emblem Logo in Royal Blue */}
          <View style={styles.logoBadge}>
            <Svg width={68} height={68} viewBox="0 0 64 64">
              <Rect width="64" height="64" rx="18" fill={Colors.primary} />
              <Path
                d="M 32 10 L 50 19 L 50 35 C 50 46 32 54 32 54 C 32 54 14 46 14 35 L 14 19 Z"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                fill="#0B2C99"
              />
              <Path
                d="M 34 21 L 25 33 L 32 33 L 30 45 L 39 31 L 32 31 Z"
                fill="#FFFFFF"
              />
              <Circle cx="32" cy="48" r="2.2" fill={Colors.safe} />
            </Svg>
          </View>

          <Text style={styles.title}>Estero-Volt</Text>
          <Text style={styles.subtitle}>
            CDRRMO Municipal Telemetry & Flood Early Warning System
          </Text>
          <View style={styles.cityPill}>
            <Text style={styles.cityTag}>NAGA CITY DISASTER OPERATIONS CENTER</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>OFFICER CREDENTIALS</Text>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SECURITY TOKEN / PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.8}
              onPress={handleSignIn}
            >
              <Text style={styles.signInText}>Access Telemetry Grid</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.authPill}>
              <View style={styles.liveDot} />
              <Text style={styles.footerBadge}>CDRRMO Official Use Only</Text>
            </View>
            <Text style={styles.buildNotice}>Off-Grid BMFC IoT Node Network v1.0</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  keyboardContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  logoBadge: {
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  cityPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 24,
  },
  cityTag: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  formSection: {
    width: '100%',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  authPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safe,
    marginRight: 8,
  },
  footerBadge: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  buildNotice: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
  },
});
