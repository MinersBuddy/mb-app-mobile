/**
 * RegisterScreen.tsx
 * OTP verify hone ke baad aata hai — phone number auto-fill hota hai
 * Firebase logic ke liye handleRegister() ready hai
 *
 * Flow: OtpVerify → Register → MainTabs
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
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
  route:      RouteProp<RootStackParamList, 'Register'>;
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const C = {
  navy:      '#0F1923',
  navyMid:   '#1A2B3C',
  navyLight: '#243447',
  navyCard:  '#1E2F42',
  gold:      '#F59E0B',
  goldLight: '#FCD34D',
  goldDim:   'rgba(245,158,11,0.12)',
  white:     '#FFFFFF',
  muted:     '#94A3B8',
  mutedDk:   '#64748B',
  success:   '#10B981',
  error:     '#EF4444',
  purple:    '#8B5CF6',
  teal:      '#0D9488',
  orange:    '#D97706',
} as const;

// ─── Exam Roles ───────────────────────────────────────────────────────────────

const ROLES = [
  { id: 'mining_mate',   label: 'Mining Mate',  emoji: '⛏️', color: C.gold    },
  { id: 'overman',       label: 'Overman',       emoji: '🪖', color: C.teal    },
  { id: 'mining_sirdar', label: 'Mining Sirdar', emoji: '🏔️', color: C.purple  },
  { id: 'manager',       label: 'Manager',       emoji: '👷', color: C.orange  },
] as const;

// ─── Reusable Input ───────────────────────────────────────────────────────────

type InputProps = {
  label:            string;
  placeholder:      string;
  value:            string;
  onChangeText:     (t: string) => void;
  icon:             string;
  secureTextEntry?: boolean;
  keyboardType?:    'default' | 'email-address' | 'phone-pad';
  autoCapitalize?:  'none' | 'sentences' | 'words';
  editable?:        boolean;
  rightElement?:    React.ReactNode;
  error?:           string;
  verified?:        boolean;
};

const InputField = ({
  label, placeholder, value, onChangeText, icon,
  secureTextEntry = false, keyboardType = 'default',
  autoCapitalize = 'none', editable = true,
  rightElement, error, verified,
}: InputProps) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () =>
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onBlur = () =>
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      error    ? C.error   :
      verified ? C.success :
      C.navyLight,
      error    ? C.error   :
      verified ? C.success :
      C.gold,
    ],
  });

  return (
    <View style={inp.wrapper}>
      <Text style={inp.label}>{label}</Text>
      <Animated.View
        style={[
          inp.container,
          { borderColor },
          verified && inp.containerVerified,
          !editable && inp.containerLocked,
        ]}
      >
        <Text style={inp.icon}>{icon}</Text>
        <TextInput
          style={[inp.input, !editable && inp.inputLocked]}
          placeholder={placeholder}
          placeholderTextColor={C.mutedDk}
          value={value}
          onChangeText={editable ? onChangeText : undefined}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={editable ? onFocus : undefined}
          onBlur={editable ? onBlur : undefined}
          selectionColor={C.gold}
          editable={editable}
        />
        {verified && !rightElement && (
          <View style={inp.verifiedBadge}>
            <Text style={inp.verifiedText}>✓</Text>
          </View>
        )}
        {rightElement}
      </Animated.View>
      {error ? <Text style={inp.errorText}>{error}</Text> : null}
    </View>
  );
};

const inp = StyleSheet.create({
  wrapper:        { marginBottom: 14 },
  label:          { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginBottom: 7, textTransform: 'uppercase' },
  container:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.navyMid, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 52, gap: 10 },
  containerVerified: { backgroundColor: 'rgba(16,185,129,0.07)', borderColor: C.success },
  containerLocked:   { opacity: 0.8 },
  icon:           { fontSize: 17 },
  input:          { flex: 1, fontSize: 15, color: C.white, fontWeight: '500' },
  inputLocked:    { color: C.success },
  verifiedBadge:  { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },
  verifiedText:   { fontSize: 12, color: C.success, fontWeight: '800' },
  errorText:      { fontSize: 11, color: C.error, fontWeight: '600', marginTop: 5, marginLeft: 4 },
});

// ─── Password Strength ────────────────────────────────────────────────────────

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Weak',   color: C.error   },
    { label: 'Fair',   color: '#F59E0B' },
    { label: 'Good',   color: C.teal    },
    { label: 'Strong', color: C.success },
  ];
  const { label, color } = levels[Math.min(score - 1, 3)];

  return (
    <View style={pw.row}>
      <View style={pw.bars}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={[pw.bar, { backgroundColor: i <= score ? color : C.navyLight }]} />
        ))}
      </View>
      <Text style={[pw.label, { color }]}>{label}</Text>
    </View>
  );
};

const pw = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: -6 },
  bars:  { flex: 1, flexDirection: 'row', gap: 4 },
  bar:   { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, width: 42, textAlign: 'right' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RegisterScreen({ navigation, route }: Props) {
  // ✅ Phone auto-filled from OTP verification
  const verifiedPhone = route?.params?.phone ?? '';

  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role,        setRole]        = useState('');
  const [agreed,      setAgreed]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim())                        e.fullName    = 'Full name required';
    if (!email.trim())                           e.email       = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email))       e.email       = 'Invalid email format';
    if (!password)                               e.password    = 'Password required';
    else if (password.length < 6)               e.password    = 'Minimum 6 characters';
    if (password !== confirmPass)                e.confirmPass = 'Passwords do not match';
    if (!role)                                   e.role        = 'Please select your exam target';
    if (!agreed)                                 e.terms       = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Register — Firebase yahan add karna ────────────────────────────────────

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      /**
       * TODO: Firebase call here
       *
       * const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       * await updateProfile(userCredential.user, { displayName: fullName });
       * await setDoc(doc(db, 'users', userCredential.user.uid), {
       *   fullName, email,
       *   phone: `+91${verifiedPhone}`,   // ← verified phone
       *   examRole: role,
       *   createdAt: serverTimestamp(),
       * });
       */
      await new Promise(r => setTimeout(r, 1500)); // dev mock
      navigation.replace('MainTabs');
    } catch (err) {
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />
      <View style={s.ring1} />
      <View style={s.ring2} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.header}>
            <View style={s.logoBox}>
              <Text style={s.logoEmoji}>⛏️</Text>
            </View>
            <Text style={s.brand}>Miners<Text style={{ color: C.gold }}>Buddy</Text></Text>
            <Text style={s.heading}>Create Account</Text>
            <Text style={s.subheading}>Step 3 of 3 — Almost there!</Text>

            {/* Verified phone badge */}
            <View style={s.verifiedBanner}>
              <Text style={s.verifiedBannerText}>
                ✓ Mobile verified — +91 {verifiedPhone}
              </Text>
            </View>
          </View>

          {/* ── Personal Details ── */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardIcon}>👤</Text>
              <Text style={s.cardTitle}>Personal Details</Text>
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

            {/* Phone — auto-filled, not editable */}
            <InputField
              label="Mobile Number (Verified)"
              placeholder=""
              value={`+91 ${verifiedPhone}`}
              onChangeText={() => {}}
              icon="📱"
              editable={false}
              verified
            />
          </View>

          {/* ── Security ── */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardIcon}>🔐</Text>
              <Text style={s.cardTitle}>Set Password</Text>
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
                <TouchableOpacity
                  onPress={() => setShowPass(p => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
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
                <TouchableOpacity
                  onPress={() => setShowConfirm(p => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 16 }}>{showConfirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              }
            />
          </View>

          {/* ── Exam Target ── */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardIcon}>🎯</Text>
              <Text style={s.cardTitle}>Exam Target</Text>
            </View>
            <Text style={s.roleSubtitle}>Which certificate are you preparing for?</Text>

            <View style={s.roleGrid}>
              {ROLES.map(r => {
                const selected = role === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      s.roleCard,
                      selected && { borderColor: r.color, backgroundColor: `${r.color}15` },
                    ]}
                    onPress={() => setRole(r.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.roleEmoji}>{r.emoji}</Text>
                    <Text style={[s.roleLabel, selected && { color: r.color }]}>
                      {r.label}
                    </Text>
                    {selected && (
                      <View style={[s.roleCheck, { backgroundColor: r.color }]}>
                        <Text style={s.roleCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.role ? <Text style={s.fieldError}>{errors.role}</Text> : null}
          </View>

          {/* ── Terms ── */}
          <TouchableOpacity
            style={s.termsRow}
            onPress={() => setAgreed(p => !p)}
            activeOpacity={0.8}
          >
            <View style={[s.checkbox, agreed && s.checkboxActive]}>
              {agreed && <Text style={s.checkMark}>✓</Text>}
            </View>
            <Text style={s.termsText}>
              I agree to the{' '}
              <Text style={s.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={s.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms
            ? <Text style={[s.fieldError, { marginTop: -8, marginBottom: 14 }]}>{errors.terms}</Text>
            : null
          }

          {/* CTA */}
          <TouchableOpacity
            style={[s.cta, loading && s.ctaLoading]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={C.navy} size="small" />
              : <Text style={s.ctaText}>Create Account →</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.navy },

  ring1: {
    position: 'absolute', width: 420, height: 420, borderRadius: 210,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.06)', top: -180, right: -150,
  },
  ring2: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.06)', bottom: 100, left: -90,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 48,
  },

  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: C.navyMid, borderWidth: 1, borderColor: C.navyLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  backIcon: { fontSize: 17, color: C.muted },

  // Header
  header:    { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 62, height: 62, borderRadius: 18,
    backgroundColor: C.goldDim,
    borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.3)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoEmoji: { fontSize: 30 },
  brand:     { fontSize: 19, fontWeight: '800', color: C.white, letterSpacing: -0.3, marginBottom: 14 },
  heading:   { fontSize: 26, fontWeight: '800', color: C.white, letterSpacing: -0.5, marginBottom: 4 },
  subheading:{ fontSize: 13, color: C.gold, fontWeight: '600', marginBottom: 14 },

  verifiedBanner: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  verifiedBannerText: {
    fontSize: 13, color: C.success, fontWeight: '700', letterSpacing: 0.2,
  },

  // Card
  card: {
    backgroundColor: C.navyCard,
    borderRadius: 20, borderWidth: 1, borderColor: C.navyLight,
    padding: 18, marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.navyLight,
    marginBottom: 16,
  },
  cardIcon:  { fontSize: 15 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: C.white, letterSpacing: 0.2 },

  // Role selector
  roleSubtitle: { fontSize: 12, color: C.mutedDk, fontWeight: '500', marginBottom: 14, marginTop: -4 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: {
    width: '47%',
    backgroundColor: C.navyMid, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.navyLight,
    padding: 14, alignItems: 'center', gap: 6, position: 'relative',
  },
  roleEmoji: { fontSize: 24 },
  roleLabel: { fontSize: 12, fontWeight: '700', color: C.muted, textAlign: 'center' },
  roleCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  roleCheckText: { fontSize: 10, color: C.navy, fontWeight: '800' },

  fieldError: { fontSize: 11, color: C.error, fontWeight: '600', marginTop: 6, marginLeft: 2 },

  // Terms
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: C.navyLight,
    backgroundColor: C.navyMid,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxActive: { backgroundColor: C.gold, borderColor: C.gold },
  checkMark:  { fontSize: 12, color: C.navy, fontWeight: '800' },
  termsText:  { flex: 1, fontSize: 13, color: C.mutedDk, lineHeight: 20, fontWeight: '500' },
  termsLink:  { color: C.gold, fontWeight: '700' },

  // CTA
  cta: {
    backgroundColor: C.gold, borderRadius: 14,
    height: 54, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  ctaLoading: { opacity: 0.7 },
  ctaText:    { color: C.navy, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
