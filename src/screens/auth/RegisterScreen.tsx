/**
 * RegisterScreen.tsx
 * Location: MinersBuddy/src/screens/auth/RegisterScreen.tsx
 *
 * UI-only registration screen. Firebase logic baad mein add karna.
 * handleRegister() function ready hai — sirf Firebase call wahan likhna.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Navigation type ───────────────────────────────────────────────────────────
type RegisterNavProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;
type Props = { navigation: RegisterNavProp };

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  navy:      '#0F1923',
  navyMid:   '#1A2B3C',
  navyLight: '#243447',
  navyCard:  '#1E2F42',
  gold:      '#F59E0B',
  goldLight: '#FCD34D',
  white:     '#FFFFFF',
  offWhite:  '#F1F5F9',
  muted:     '#94A3B8',
  mutedDark: '#64748B',
  success:   '#10B981',
  error:     '#EF4444',
  purple:    '#8B5CF6',
} as const;

// ─── Exam Role Options ─────────────────────────────────────────────────────────
type ExamRole = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

const EXAM_ROLES: ExamRole[] = [
  { id: 'mining_mate',   label: 'Mining Mate',   emoji: '⛏️', color: COLORS.gold   },
  { id: 'overman',       label: 'Overman',        emoji: '🪖', color: '#0D9488'     },
  { id: 'mining_sirdar', label: 'Mining Sirdar',  emoji: '🏔️', color: COLORS.purple },
  { id: 'manager',       label: 'Manager',        emoji: '👷', color: '#D97706'     },
];

// ─── Reusable Input Field ──────────────────────────────────────────────────────
type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  rightElement?: React.ReactNode;
  error?: string;
};

const InputField = ({
  label, placeholder, value, onChangeText, icon,
  secureTextEntry = false, keyboardType = 'default',
  autoCapitalize = 'none', rightElement, error,
}: InputFieldProps) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onBlur  = () => Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.error : COLORS.navyLight, error ? COLORS.error : COLORS.gold],
  });

  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <Animated.View style={[inputStyles.container, { borderColor }]}>
        <Text style={inputStyles.icon}>{icon}</Text>
        <TextInput
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.mutedDark}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          onBlur={onBlur}
          selectionColor={COLORS.gold}
        />
        {rightElement}
      </Animated.View>
      {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrapper:   { marginBottom: 14 },
  label:     { fontSize: 12, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.navyMid, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 54, gap: 10 },
  icon:      { fontSize: 18 },
  input:     { flex: 1, fontSize: 15, color: COLORS.white, fontWeight: '500' },
  errorText: { fontSize: 11, color: COLORS.error, fontWeight: '600', marginTop: 5, marginLeft: 4 },
});

// ─── Password Strength Indicator ──────────────────────────────────────────────
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (): { level: number; label: string; color: string } => {
    if (password.length === 0) return { level: 0, label: '', color: COLORS.navyLight };
    let score = 0;
    if (password.length >= 8)             score++;
    if (/[A-Z]/.test(password))           score++;
    if (/[0-9]/.test(password))           score++;
    if (/[^A-Za-z0-9]/.test(password))    score++;

    if (score <= 1) return { level: 1, label: 'Weak',   color: COLORS.error   };
    if (score === 2) return { level: 2, label: 'Fair',  color: '#F59E0B'       };
    if (score === 3) return { level: 3, label: 'Good',  color: '#0D9488'       };
    return              { level: 4, label: 'Strong', color: COLORS.success  };
  };

  const { level, label, color } = getStrength();
  if (level === 0) return null;

  return (
    <View style={pwStyles.container}>
      <View style={pwStyles.bars}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              pwStyles.bar,
              { backgroundColor: i <= level ? color : COLORS.navyLight },
            ]}
          />
        ))}
      </View>
      <Text style={[pwStyles.label, { color }]}>{label}</Text>
    </View>
  );
};

const pwStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: -6 },
  bars:      { flex: 1, flexDirection: 'row', gap: 4 },
  bar:       { flex: 1, height: 4, borderRadius: 2 },
  label:     { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, width: 44, textAlign: 'right' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }: Props) {
  const [fullName,     setFullName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [phone,        setPhone]        = useState('');
  const [password,     setPassword]     = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [agreedTerms,  setAgreedTerms]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim())                             e.fullName    = 'Full name required';
    if (!email.trim())                                e.email       = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email))            e.email       = 'Invalid email format';
    if (phone && !/^[6-9]\d{9}$/.test(phone))        e.phone       = 'Enter valid 10-digit number';
    if (!password)                                    e.password    = 'Password required';
    else if (password.length < 6)                    e.password    = 'Min 6 characters';
    if (password !== confirmPass)                     e.confirmPass = 'Passwords do not match';
    if (!selectedRole)                                e.role        = 'Please select your exam target';
    if (!agreedTerms)                                 e.terms       = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Register Handler — Firebase yahan add karna ─────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      // TODO: Firebase auth call here
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // await updateProfile(userCredential.user, { displayName: fullName });
      // Save selectedRole to Firestore/RTDB here
      navigation.replace('MainTabs');
    } catch (error) {
      // TODO: Handle Firebase errors here
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Background decor rings */}
      <View style={styles.bgRing1} />
      <View style={styles.bgRing2} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <View style={styles.logoBg}>
                <Text style={styles.logoEmoji}>⛏️</Text>
              </View>
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.brandName}>
              Miners<Text style={{ color: COLORS.gold }}>Buddy</Text>
            </Text>
            <Text style={styles.heading}>Create Account</Text>
            <Text style={styles.subheading}>Join 1,200+ miners preparing smarter</Text>
          </View>

          {/* ── Personal Details ── */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👤</Text>
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            <InputField
              label="Full Name"
              placeholder="Your full name"
              value={fullName}
              onChangeText={setFullName}
              icon="🧑"
              autoCapitalize="words"
              error={errors.fullName}
            />
            <InputField
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              icon="✉️"
              keyboardType="email-address"
              error={errors.email}
            />
            <InputField
              label="Phone (Optional)"
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={setPhone}
              icon="📱"
              keyboardType="phone-pad"
              error={errors.phone}
            />
          </View>

          {/* ── Security ── */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔐</Text>
              <Text style={styles.sectionTitle}>Set Password</Text>
            </View>

            <InputField
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              icon="🔒"
              secureTextEntry={!showPass}
              error={errors.password}
              rightElement={
                <TouchableOpacity onPress={() => setShowPass(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              }
            />
            <PasswordStrength password={password} />

            <InputField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPass}
              onChangeText={setConfirmPass}
              icon="🔑"
              secureTextEntry={!showConfirm}
              error={errors.confirmPass}
              rightElement={
                <TouchableOpacity onPress={() => setShowConfirm(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ fontSize: 16 }}>{showConfirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              }
            />
          </View>

          {/* ── Exam Target ── */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <Text style={styles.sectionTitle}>Exam Target</Text>
            </View>
            <Text style={styles.roleSubtitle}>Which certificate are you preparing for?</Text>

            <View style={styles.roleGrid}>
              {EXAM_ROLES.map(role => {
                const isSelected = selectedRole === role.id;
                return (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleCard,
                      isSelected && { borderColor: role.color, backgroundColor: `${role.color}15` },
                    ]}
                    onPress={() => setSelectedRole(role.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.roleEmoji}>{role.emoji}</Text>
                    <Text style={[styles.roleLabel, isSelected && { color: role.color }]}>
                      {role.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.roleCheck, { backgroundColor: role.color }]}>
                        <Text style={styles.roleCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.role ? <Text style={styles.fieldError}>{errors.role}</Text> : null}
          </View>

          {/* ── Terms ── */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedTerms(p => !p)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedTerms && styles.checkboxActive]}>
              {agreedTerms && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms ? <Text style={[styles.fieldError, { marginTop: -8, marginBottom: 12 }]}>{errors.terms}</Text> : null}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, isLoading && styles.ctaBtnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <Text style={styles.ctaBtnText}>
              {isLoading ? 'Creating Account...' : 'Create Account →'}
            </Text>
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            style={styles.loginRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },

  bgRing1: {
    position: 'absolute',
    width: 400, height: 400,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: `${COLORS.gold}08`,
    top: -150, right: -120,
  },
  bgRing2: {
    position: 'absolute',
    width: 300, height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: `${COLORS.purple}08`,
    bottom: 100, left: -80,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 48,
  },

  // Back
  backBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navyMid,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backIcon: { fontSize: 18, color: COLORS.muted },

  // Header
  header:     { alignItems: 'center', marginBottom: 28 },
  logoWrap:   { position: 'relative', marginBottom: 14 },
  logoBg: {
    width: 68, height: 68,
    borderRadius: 20,
    backgroundColor: `${COLORS.gold}18`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}35`,
  },
  logoEmoji: { fontSize: 32 },
  logoGlow: {
    position: 'absolute',
    width: 84, height: 84,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: `${COLORS.gold}20`,
    top: -8, left: -8,
  },
  brandName:  { fontSize: 20, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3, marginBottom: 16 },
  heading:    { fontSize: 26, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5, marginBottom: 6 },
  subheading: { fontSize: 14, color: COLORS.muted, fontWeight: '400', textAlign: 'center' },

  // Form card
  formCard: {
    backgroundColor: COLORS.navyCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
    padding: 18,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navyLight,
  },
  sectionIcon:  { fontSize: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.white, letterSpacing: 0.2 },

  // Exam role selector
  roleSubtitle: { fontSize: 12, color: COLORS.mutedDark, fontWeight: '500', marginBottom: 14, marginTop: -4 },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleCard: {
    width: '47%',
    backgroundColor: COLORS.navyMid,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.navyLight,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  roleEmoji: { fontSize: 26 },
  roleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  roleCheck: {
    position: 'absolute',
    top: 8, right: 8,
    width: 18, height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCheckText: { fontSize: 10, color: COLORS.navy, fontWeight: '800' },

  fieldError: { fontSize: 11, color: COLORS.error, fontWeight: '600', marginTop: 6, marginLeft: 2 },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.navyLight,
    backgroundColor: COLORS.navyMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  checkMark:  { fontSize: 12, color: COLORS.navy, fontWeight: '800' },
  termsText:  { flex: 1, fontSize: 13, color: COLORS.mutedDark, lineHeight: 20, fontWeight: '500' },
  termsLink:  { color: COLORS.gold, fontWeight: '700' },

  // CTA
  ctaBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { color: COLORS.navy, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // Login link
  loginRow: { alignItems: 'center' },
  loginText: { fontSize: 14, color: COLORS.mutedDark, fontWeight: '500' },
  loginLink: { color: COLORS.gold, fontWeight: '700' },
});