import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginScreen'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

type Persona = 'CDRRMO' | 'DENR';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [persona, setPersona] = useState<Persona>('CDRRMO');
  const { login, isLoading, error } = useAuth();

  // Animation Values
  const fadeAnimHero = useRef(new Animated.Value(0)).current;
  const translateYHero = useRef(new Animated.Value(-30)).current;
  const fadeAnimSheet = useRef(new Animated.Value(0)).current;
  const translateYSheet = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeAnimHero, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(translateYHero, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnimSheet, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(translateYSheet, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Shake animation when error occurs
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const handleSignIn = async () => {
    const success = await login(email, password);
    if (success) {
      navigation.replace('MainTabNavigator');
    }
  };

  const handleQuickDemoFill = () => {
    if (persona === 'CDRRMO') {
      setEmail('disaster-ops@naga.gov.ph');
    } else {
      setEmail('water-quality@emb.gov.ph');
    }
    setPassword('estero-volt-99');
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
          {/* Deep Corporate Royal Blue Hero Banner */}
          <Animated.View style={[styles.heroHeader, { opacity: fadeAnimHero, transform: [{ translateY: translateYHero }] }]}>
            <View style={styles.crestBadge}>
              <Ionicons name="water" size={32} color={Colors.primary} />
            </View>

            <Text style={styles.heroTitle}>Estero-Volt</Text>
            <Text style={styles.heroSubtitle}>
              BMFC-Powered Smart Flood Monitoring Network
            </Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>EDGE-AI TELEMETRY GRID ACTIVE • NAGA CITY</Text>
            </View>
          </Animated.View>

          {/* Floating Form Content Sheet */}
          <Animated.View style={[styles.sheetContainer, { opacity: fadeAnimSheet, transform: [{ translateY: translateYSheet }] }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Stakeholder Portal</Text>
              <Text style={styles.sheetSubtitle}>
                Access real-time LoRaWAN flood telemetry and BMFC bioremediation metrics.
              </Text>
            </View>

            {/* Persona Toggle */}
            <View style={styles.personaToggleContainer}>
              <TouchableOpacity
                style={[styles.personaBtn, persona === 'CDRRMO' && styles.personaBtnActive]}
                onPress={() => { setPersona('CDRRMO'); setEmail(''); }}
              >
                <Ionicons name="warning" size={14} color={persona === 'CDRRMO' ? '#FFFFFF' : Colors.textSecondary} />
                <Text style={[styles.personaText, persona === 'CDRRMO' && styles.personaTextActive]}>CDRRMO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.personaBtn, persona === 'DENR' && styles.personaBtnActive]}
                onPress={() => { setPersona('DENR'); setEmail(''); }}
              >
                <Ionicons name="leaf" size={14} color={persona === 'DENR' ? '#FFFFFF' : Colors.textSecondary} />
                <Text style={[styles.personaText, persona === 'DENR' && styles.personaTextActive]}>DENR-EMB</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
                <Ionicons name="alert-circle" size={16} color={Colors.critical} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>Official Credentials</Text>
                <TouchableOpacity onPress={handleQuickDemoFill}>
                  <Text style={styles.demoFillText}>Quick Fill Demo</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={Colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={persona === 'CDRRMO' ? 'disaster-ops@naga.gov.ph' : 'water-quality@emb.gov.ph'}
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
              <Text style={styles.inputLabel}>Security Hash</Text>
              <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
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
              style={[styles.signInBtn, isLoading && styles.signInBtnLoading]}
              activeOpacity={0.85}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.signInBtnText}>Access Dashboard</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.btnArrow} />
                </>
              )}
            </TouchableOpacity>

            {/* Demo hint */}
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.info} />
              <Text style={styles.hintText}>
                Demo: tap "Quick Fill Demo" above then sign in. Password: <Text style={styles.hintPassword}>estero-volt-99</Text>
              </Text>
            </View>

            {/* Security Verification Badge */}
            <View style={styles.footerBadgeContainer}>
              <View style={styles.securityPill}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.safe} />
                <Text style={styles.securityText}>Authorized Access Only — JA WE Challenge 2026–2027</Text>
              </View>
              <Text style={styles.versionNote}>Estero-Volt v2.4 • Naga City Bicol Region</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroHeader: {
    backgroundColor: Colors.primaryHeader,
    paddingTop: 60,
    paddingBottom: 60,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  crestBadge: {
    backgroundColor: '#FFFFFF',
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -30,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetHeader: {
    marginBottom: 20,
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  sheetSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  personaToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  personaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  personaBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  personaText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  personaTextActive: {
    color: '#FFFFFF',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.criticalLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.critical,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  demoFillText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 54,
  },
  inputError: {
    borderColor: Colors.critical,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 8,
  },
  signInBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  signInBtnLoading: {
    opacity: 0.8,
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
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.infoLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  hintText: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  hintPassword: {
    fontWeight: '800',
    color: Colors.primary,
  },
  footerBadgeContainer: {
    alignItems: 'center',
    marginTop: 24,
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
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
  },
  versionNote: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 8,
  },
});
