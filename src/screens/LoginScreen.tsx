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
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginScreen'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('officer@naga.gov.ph');
  const [password, setPassword] = useState('esterovolt2026');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    navigation.replace('MainTabNavigator');
  };

  const handleQuickDemoFill = () => {
    setEmail('cdrrmo.telemetry@naga.gov.ph');
    setPassword('naga-edge-ai-99');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryHeader} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Royal Blue Hero Banner */}
          <View style={styles.heroHeader}>
            {/* Background Aesthetic Waves */}
            <View style={styles.bgWaveWrapper}>
              <Svg width={360} height={120} viewBox="0 0 360 120">
                <Path
                  d="M 0 40 Q 90 80, 180 40 T 360 40 L 360 120 L 0 120 Z"
                  fill="#0B2588"
                  opacity={0.4}
                />
                <Path
                  d="M 0 65 Q 90 20, 180 65 T 360 65 L 360 120 L 0 120 Z"
                  fill="#1B42D9"
                  opacity={0.3}
                />
              </Svg>
            </View>

            {/* Glowing Tech Shield Crest */}
            <View style={styles.crestBadge}>
              <Svg width={64} height={64} viewBox="0 0 64 64">
                <Path
                  d="M 32 4 L 56 15 L 56 36 C 56 50 32 60 32 60 C 32 60 8 50 8 36 L 8 15 Z"
                  fill="#FFFFFF"
                />
                <Path
                  d="M 32 8 L 52 17 L 52 35 C 52 46 32 55 32 55 C 32 55 12 46 12 35 L 12 17 Z"
                  fill={Colors.primary}
                />
                <Path
                  d="M 34 16 L 24 31 L 32 31 L 30 46 L 41 29 L 32 29 Z"
                  fill="#FFFFFF"
                />
                <Circle cx="32" cy="50" r="2.5" fill="#38BDF8" />
              </Svg>
            </View>

            <Text style={styles.heroTitle}>Estero-Volt</Text>
            <Text style={styles.heroSubtitle}>
              Naga City Disaster Risk Reduction & Management Office
            </Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>CDRRMO IOT TELEMETRY GRID</Text>
            </View>
          </View>

          {/* Form Content Sheet */}
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Officer Sign In</Text>
              <Text style={styles.sheetSubtitle}>
                Access autonomous off-grid hydrological sensors & Edge-AI flood alerts
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Official Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={Colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="officer@naga.gov.ph"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>Security Credential</Text>
                <TouchableOpacity onPress={handleQuickDemoFill}>
                  <Text style={styles.demoFillText}>Quick Fill Demo</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={Colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.signInBtn}
              activeOpacity={0.85}
              onPress={handleSignIn}
            >
              <Text style={styles.signInBtnText}>Access Telemetry Grid</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.btnArrow} />
            </TouchableOpacity>

            {/* Security Verification Badge */}
            <View style={styles.footerBadgeContainer}>
              <View style={styles.securityPill}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.safe} />
                <Text style={styles.securityText}>CDRRMO Official Use Only</Text>
              </View>
              <Text style={styles.versionNote}>BMFC Off-Grid Mesh • Firmware v2.4</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroHeader: {
    backgroundColor: Colors.primaryHeader,
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgWaveWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  crestBadge: {
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: '#E0E7FF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B237C',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safe,
    marginRight: 8,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  sheetHeader: {
    marginBottom: 20,
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  sheetSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  demoFillText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  signInBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 3,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  btnArrow: {
    marginLeft: 8,
  },
  footerBadgeContainer: {
    alignItems: 'center',
    marginTop: 22,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safeLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  securityText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },
  versionNote: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 8,
  },
});
