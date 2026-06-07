/**
 * MobileVerifyScreen.tsx
 * Google Login ke baad aata hai — user ka +91 mobile number leta hai
 * Country code +91 fixed hai, change nahi ho sakta (India only app)
 *
 * Flow: GoogleLogin → MobileVerify → OtpVerify → Register → MainTabs
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MobileVerify'>;
  /**
   * Parent se inject karo — Firebase / your backend ka OTP send call
   * Agar undefined hai toh mock delay use hoga (dev mode)
   */
  onSendOtp?: (phoneE164: string) => Promise<void>;
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const C = {
  navy:      '#0F1923',
  navyMid:   '#1A2B3C',
  navyLight: '#243447',
  navyCard:  '#1E2F42',
  gold:      '#F59E0B',
  goldDim:   'rgba(245,158,11,0.12)',
  white:     '#FFFFFF',
  muted:     '#94A3B8',
  mutedDk:   '#64748B',
  success:   '#10B981',
  error:     '#EF4444',
  errorDim:  'rgba(239,68,68,0.12)',
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function MobileVerifyScreen({ navigation, onSendOtp }: Props) {
  const [mobile,  setMobile]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const shakeAnim    = useRef(new Animated.Value(0)).current;
  const inputScale   = useRef(new Animated.Value(1)).current;
  const btnOpacity   = useRef(new Animated.Value(1)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;

  // Valid Indian mobile: starts with 6-9, exactly 10 digits
  const isValid = /^[6-9]\d{9}$/.test(mobile);

  // ── Animations ──────────────────────────────────────────────────────────────

  const onFocus = () => {
    Animated.parallel([
      Animated.spring(inputScale,  { toValue: 1.012, useNativeDriver: true, speed: 20, bounciness: 5 }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const onBlur = () => {
    Animated.parallel([
      Animated.spring(inputScale,  { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 5 }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setMobile(cleaned);
    if (error) setError('');
  };

  const handleSendOtp = async () => {
    if (!isValid) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      shake();
      return;
    }

    setError('');
    setLoading(true);
    Animated.timing(btnOpacity, { toValue: 0.7, duration: 150, useNativeDriver: true }).start();

    try {
      if (onSendOtp) {
        await onSendOtp(`+91${mobile}`);
      } else {
        // Dev mock — replace with Firebase sendOtp
        await new Promise(r => setTimeout(r, 1000));
      }
      navigation.navigate('OtpVerify', { phone: mobile });
    } catch {
      setError('Failed to send OTP. Please try again.');
      shake();
    } finally {
      setLoading(false);
      Animated.timing(btnOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* Decorative background rings */}
      <View style={s.ring1} />
      <View style={s.ring2} />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.container}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <View style={s.header}>
            <View style={s.iconWrap}>
              <Text style={s.iconEmoji}>📱</Text>
            </View>
            <Text style={s.eyebrow}>STEP 2 OF 3</Text>
            <Text style={s.title}>Verify your{'\n'}mobile number</Text>
            <Text style={s.subtitle}>
              We'll send a one-time password to confirm your Indian number
            </Text>
          </View>

          {/* ── Input ──────────────────────────────────────────────────── */}
          <Animated.View
            style={[
              s.inputOuter,
              { transform: [{ scale: inputScale }, { translateX: shakeAnim }] },
              error ? s.inputOuterError : null,
            ]}
          >
            {/* Gold glow on focus */}
            <Animated.View style={[s.inputGlow, { opacity: glowOpacity }]} />

            <View style={s.inputInner}>
              {/* Country pill — NOT touchable, fixed +91 */}
              <View style={s.countryPill}>
                <Text style={s.flag}>🇮🇳</Text>
                <Text style={s.cc}>+91</Text>
                <View style={s.lockDot} />
              </View>

              <View style={s.divider} />

              <TextInput
                style={s.textInput}
                placeholder="Enter mobile number"
                placeholderTextColor={C.mutedDk}
                keyboardType="number-pad"
                maxLength={10}
                value={mobile}
                onChangeText={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
                selectionColor={C.gold}
                accessibilityLabel="Mobile number input"
              />

              {isValid && (
                <View style={s.validBadge}>
                  <Text style={s.validCheck}>✓</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {error
            ? <Text style={s.errorText}>{error}</Text>
            : <Text style={s.hintText}>🔒 India-only — +91 is fixed and cannot be changed</Text>
          }

          {/* ── Digit progress dots ─────────────────────────────────────── */}
          <View style={s.progressRow}>
            {Array(10).fill(0).map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  i < mobile.length ? s.dotFilled : null,
                  i < mobile.length && isValid ? s.dotValid : null,
                ]}
              />
            ))}
          </View>

          <View style={s.spacer} />

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <View style={s.footer}>
            <Text style={s.footerNote}>
              By continuing you agree to receive SMS from us.{'\n'}
              Standard rates may apply.
            </Text>

            <Animated.View style={{ opacity: btnOpacity }}>
              <TouchableOpacity
                style={[s.btn, !isValid && s.btnDisabled]}
                onPress={handleSendOtp}
                activeOpacity={0.85}
                disabled={loading || !isValid}
                accessibilityRole="button"
                accessibilityLabel="Send OTP"
              >
                {loading
                  ? <ActivityIndicator color={C.navy} size="small" />
                  : <>
                      <Text style={[s.btnText, !isValid && s.btnTextDim]}>
                        Send OTP
                      </Text>
                      {isValid && <Text style={s.btnArrow}>→</Text>}
                    </>
                }
              </TouchableOpacity>
            </Animated.View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.navy },
  flex:      { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },

  // Background decorative rings
  ring1: {
    position: 'absolute', width: 380, height: 380, borderRadius: 190,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.07)',
    top: -170, right: -140, pointerEvents: 'none',
  },
  ring2: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.06)',
    bottom: 80, left: -100, pointerEvents: 'none',
  },

  // Header
  header: { marginBottom: 32 },
  iconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: C.goldDim,
    borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  iconEmoji: { fontSize: 24 },
  eyebrow: {
    fontSize: 11, fontWeight: '700', color: C.gold,
    letterSpacing: 1.2, marginBottom: 10,
  },
  title: {
    fontSize: 30, fontWeight: '800', color: C.white,
    lineHeight: 37, letterSpacing: -0.6, marginBottom: 10,
  },
  subtitle: {
    fontSize: 14, color: C.muted, lineHeight: 21, fontWeight: '400',
  },

  // Input
  inputOuter: {
    borderRadius: 16, marginBottom: 10,
    // Gold border using wrapper trick (shadow as glow)
    borderWidth: 1.5, borderColor: C.navyLight,
    overflow: 'hidden',
  },
  inputOuterError: { borderColor: C.error },
  inputGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.gold,
  },
  inputInner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.navyMid,
    paddingHorizontal: 14, height: 60,
  },
  countryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 4,
  },
  flag:    { fontSize: 20 },
  cc:      { fontSize: 15, fontWeight: '700', color: C.white },
  lockDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: C.mutedDk, marginLeft: 2,
  },
  divider: {
    width: 1, height: 24, backgroundColor: C.navyLight, marginHorizontal: 12,
  },
  textInput: {
    flex: 1, fontSize: 18, color: C.white,
    fontWeight: '600', letterSpacing: 2, padding: 0,
  },
  validBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.2)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  validCheck: { fontSize: 13, color: C.success, fontWeight: '800' },

  errorText: { fontSize: 12, color: C.error, fontWeight: '600', marginLeft: 4, marginBottom: 4 },
  hintText:  { fontSize: 12, color: C.mutedDk, marginLeft: 4, marginBottom: 4 },

  // Digit progress dots
  progressRow: { flexDirection: 'row', gap: 6, marginTop: 12, paddingLeft: 2 },
  dot: {
    flex: 1, height: 3, borderRadius: 2,
    backgroundColor: C.navyLight,
  },
  dotFilled: { backgroundColor: C.gold, opacity: 0.5 },
  dotValid:  { backgroundColor: C.gold, opacity: 1 },

  spacer: { flex: 1 },

  // Footer
  footer:     { gap: 12 },
  footerNote: {
    textAlign: 'center', fontSize: 11.5, color: C.mutedDk,
    lineHeight: 17, fontWeight: '400',
  },

  // Button
  btn: {
    backgroundColor: C.gold, borderRadius: 14, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  btnDisabled:  { backgroundColor: '#4A3B1F', shadowOpacity: 0.1, elevation: 2 },
  btnText:      { fontSize: 16, fontWeight: '800', color: C.navy, letterSpacing: 0.3 },
  btnTextDim:   { color: C.mutedDk },
  btnArrow:     { fontSize: 18, color: C.navy, fontWeight: '800' },
});
