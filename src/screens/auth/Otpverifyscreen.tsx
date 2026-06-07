/**
 * OtpVerifyScreen.tsx
 * 4-digit OTP entry — auto-submit on last digit
 * SUCCESS hone ke baad → Register screen
 *
 * Flow: MobileVerify → OtpVerify → Register → MainTabs
 *
 * UPDATED: onVerifyOtp prop calls Firebase confirmation.confirm(otp)
 * AppNavigator se confirmation inject hota hai
 */

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
  Animated,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OtpVerify'>;
  route:      RouteProp<RootStackParamList, 'OtpVerify'>;
  /**
   * AppNavigator se inject karo — Firebase confirmation.confirm(otp) ka wrapper
   * Undefined hone par error throw hoga (no more silent mock!)
   */
  onVerifyOtp?: (phoneE164: string, otp: string) => Promise<void>;
  /**
   * Resend ke liye — phir se signInWithPhoneNumber call karo
   */
  onResendOtp?: (phoneE164: string) => Promise<void>;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_LEN        = 6; // Firebase default 6-digit OTP
const RESEND_SECONDS = 60;

// ─── Design Tokens ────────────────────────────────────────────────────────────

const C = {
  navy:       '#0F1923',
  navyMid:    '#1A2B3C',
  navyLight:  '#243447',
  gold:       '#F59E0B',
  goldDim:    'rgba(245,158,11,0.12)',
  goldBord:   'rgba(245,158,11,0.35)',
  white:      '#FFFFFF',
  muted:      '#94A3B8',
  mutedDk:    '#64748B',
  success:    '#10B981',
  successDim: 'rgba(16,185,129,0.15)',
  error:      '#EF4444',
  errorDim:   'rgba(239,68,68,0.12)',
} as const;

// ─── Single OTP Box ───────────────────────────────────────────────────────────

type BoxProps = {
  value:      string;
  isFocused:  boolean;
  hasError:   boolean;
  isSuccess:  boolean;
  index:      number;
  inputRef:   React.RefObject<TextInput>;
  onFocus:    () => void;
  onChange:   (text: string) => void;
  onKeyPress: (e: NativeSyntheticEvent<TextInputKeyPressEventData>, i: number) => void;
};

const OtpBox = ({
  value, isFocused, hasError, isSuccess,
  index, inputRef, onFocus, onChange, onKeyPress,
}: BoxProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (value) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 8 }),
      ]).start();
    }
  }, [value]);

  const borderColor = hasError  ? C.error
                    : isSuccess ? C.success
                    : isFocused ? C.gold
                    : value     ? C.goldBord
                    : C.navyLight;

  const bgColor = hasError  ? C.errorDim
                : isSuccess ? C.successDim
                : isFocused ? C.goldDim
                : C.navyMid;

  return (
    <Animated.View
      style={[
        styles.boxWrap,
        { borderColor, backgroundColor: bgColor, transform: [{ scale: scaleAnim }] },
        isFocused && styles.boxFocusShadow,
      ]}
    >
      <TextInput
        ref={inputRef}
        style={[
          styles.boxInput,
          value && { color: isSuccess ? C.success : hasError ? C.error : C.gold },
        ]}
        value={value}
        onChangeText={onChange}
        onKeyPress={(e) => onKeyPress(e, index)}
        onFocus={onFocus}
        keyboardType="number-pad"
        maxLength={1}
        textAlign="center"
        selectionColor={C.gold}
        caretHidden
        accessibilityLabel={`OTP digit ${index + 1}`}
      />
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OtpVerifyScreen({ navigation, route, onVerifyOtp, onResendOtp }: Props) {
  const phone = route?.params?.phone ?? '';

  const [otp,        setOtp]        = useState<string[]>(Array(OTP_LEN).fill(''));
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);
  const [countdown,  setCountdown]  = useState(RESEND_SECONDS);
  const [canResend,  setCanResend]  = useState(false);

  const inputRefs = useRef<React.RefObject<TextInput>[]>(
    Array(OTP_LEN).fill(null).map(() => React.createRef<TextInput>()),
  );
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(1)).current;

  // Auto-focus first box
  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) { setCanResend(true); return; }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();

  // ── Digit input ──────────────────────────────────────────────────────────

  const handleChange = (text: string, index: number) => {
    if (error) setError('');
    const digit = text.replace(/\D/g, '');
    if (!digit) return;

    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    if (index < OTP_LEN - 1) {
      inputRefs.current[index + 1]?.current?.focus();
      setFocusedIdx(index + 1);
    } else {
      // Last digit entered — auto submit
      inputRefs.current[index]?.current?.blur();
      handleVerify(updated.join(''));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const updated = [...otp];
      if (updated[index]) {
        updated[index] = '';
        setOtp(updated);
      } else if (index > 0) {
        updated[index - 1] = '';
        setOtp(updated);
        inputRefs.current[index - 1]?.current?.focus();
        setFocusedIdx(index - 1);
      }
    }
  };

  // ── Verify ───────────────────────────────────────────────────────────────

  const handleVerify = async (code?: string) => {
    const finalOtp = code ?? otp.join('');
    if (finalOtp.length < OTP_LEN) {
      setError(`Please enter all ${OTP_LEN} digits.`);
      shake();
      return;
    }

    if (!onVerifyOtp) {
      setError('Auth not configured. Check AppNavigator.');
      shake();
      return;
    }

    setLoading(true);
    Animated.timing(btnOpacity, { toValue: 0.7, duration: 150, useNativeDriver: true }).start();

    try {
      // REAL Firebase OTP verify — koi bhi random number kaam nahi karega
      await onVerifyOtp(`+91${phone}`, finalOtp);

      setSuccess(true);

      // Brief success flash → Register screen pe navigate karo
      setTimeout(() => {
        navigation.navigate('Register', { phone });
      }, 700);

    } catch (err: any) {
      // Firebase specific errors
      if (
        err?.code === 'auth/invalid-verification-code' ||
        err?.code === 'auth/code-expired'
      ) {
        setError('Wrong OTP. Please check and try again.');
      } else if (err?.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait and resend.');
      } else if (err?.code === 'auth/session-expired') {
        setError('OTP expired. Please resend.');
      } else {
        setError('Verification failed. Please try again.');
      }
      shake();
      // Reset boxes on error
      setOtp(Array(OTP_LEN).fill(''));
      setTimeout(() => {
        inputRefs.current[0]?.current?.focus();
        setFocusedIdx(0);
      }, 100);
    } finally {
      setLoading(false);
      Animated.timing(btnOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  };

  // ── Resend ───────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(RESEND_SECONDS);
    setOtp(Array(OTP_LEN).fill(''));
    setError('');

    try {
      if (onResendOtp) {
        await onResendOtp(`+91${phone}`);
      }
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    }

    inputRefs.current[0]?.current?.focus();
    setFocusedIdx(0);
  };

  const isComplete = otp.every(d => d !== '');

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      <View style={styles.ring1} />
      <View style={styles.ring2} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>

          {/* ── Back ── */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>STEP 2 OF 3 — OTP VERIFICATION</Text>
            <Text style={styles.title}>Enter the code</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.subtitle}>
                Sent to{' '}
                <Text style={styles.phoneHighlight}>+91 {phone}</Text>
                {'  '}
                <Text style={styles.editHint}>✏️ Change</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── OTP Boxes ── */}
          <Animated.View
            style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {otp.map((digit, i) => (
              <OtpBox
                key={i}
                index={i}
                value={digit}
                isFocused={focusedIdx === i}
                hasError={!!error}
                isSuccess={success}
                inputRef={inputRefs.current[i]}
                onFocus={() => setFocusedIdx(i)}
                onChange={(text) => handleChange(text, i)}
                onKeyPress={handleKeyPress}
              />
            ))}
          </Animated.View>

          {/* ── Status text ── */}
          {error
            ? <Text style={styles.errorText}>⚠️ {error}</Text>
            : success
            ? <Text style={styles.successText}>✓ Verified! Redirecting...</Text>
            : <Text style={styles.hintText}>
                Enter the {OTP_LEN}-digit code sent via SMS
              </Text>
          }

          <View style={styles.spacer} />

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendText, canResend && styles.resendActive]}>
                {canResend
                  ? '🔁 Resend OTP'
                  : `Resend OTP in ${countdown}s`
                }
              </Text>
            </TouchableOpacity>

            <Animated.View style={{ opacity: btnOpacity }}>
              <TouchableOpacity
                style={[styles.btn, (!isComplete || success) && styles.btnDisabled]}
                onPress={() => handleVerify()}
                activeOpacity={0.85}
                disabled={loading || !isComplete || success}
                accessibilityRole="button"
                accessibilityLabel="Verify OTP"
              >
                {loading
                  ? <ActivityIndicator color={C.navy} size="small" />
                  : success
                  ? <Text style={styles.btnText}>✓ Verified</Text>
                  : <>
                      <Text style={[styles.btnText, !isComplete && styles.btnTextDim]}>
                        Verify OTP
                      </Text>
                      {isComplete && <Text style={styles.btnArrow}>→</Text>}
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

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.navy },
  flex:      { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },

  ring1: {
    position: 'absolute', width: 380, height: 380, borderRadius: 190,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.07)',
    top: -160, right: -140,
  },
  ring2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.06)',
    bottom: 60, left: -80,
  },

  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: C.navyMid,
    borderWidth: 1, borderColor: C.navyLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  backIcon: { fontSize: 17, color: C.muted },

  header:         { marginBottom: 6 },
  eyebrow:        { fontSize: 11, fontWeight: '700', color: C.gold, letterSpacing: 1.2, marginBottom: 10 },
  title:          { fontSize: 30, fontWeight: '800', color: C.white, letterSpacing: -0.6, marginBottom: 10 },
  subtitle:       { fontSize: 14, color: C.muted, lineHeight: 20 },
  phoneHighlight: { color: C.white, fontWeight: '700' },
  editHint:       { color: C.gold, fontSize: 13, fontWeight: '600' },

  otpRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
    marginBottom: 12,
  },
  boxWrap: {
    flex: 1,
    height: 62,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocusShadow: {
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  boxInput: {
    width: '100%', height: '100%',
    fontSize: 24, fontWeight: '800', color: C.white,
    textAlign: 'center', padding: 0,
  },

  errorText:   { marginTop: 6, fontSize: 13, color: C.error,   fontWeight: '600' },
  successText: { marginTop: 6, fontSize: 13, color: C.success, fontWeight: '700' },
  hintText:    { marginTop: 6, fontSize: 12, color: C.mutedDk },

  spacer: { flex: 1 },

  footer:       { gap: 14 },
  resendText:   { fontSize: 14, color: C.mutedDk, fontWeight: '500', textAlign: 'center' },
  resendActive: { color: C.gold, fontWeight: '700', textDecorationLine: 'underline' },

  btn: {
    backgroundColor: C.gold, borderRadius: 14, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  btnDisabled:  { backgroundColor: '#3A2E0F', shadowOpacity: 0.1, elevation: 2 },
  btnText:      { fontSize: 16, fontWeight: '800', color: C.navy, letterSpacing: 0.3 },
  btnTextDim:   { color: C.mutedDk },
  btnArrow:     { fontSize: 18, color: C.navy, fontWeight: '800' },
});
