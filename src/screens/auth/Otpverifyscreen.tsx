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
  Linking,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────

type OtpVerifyNavProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerify'>;
type OtpVerifyRouteProp = RouteProp<RootStackParamList, 'OtpVerify'>;

type Props = {
  navigation: OtpVerifyNavProp;
  route: OtpVerifyRouteProp;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_LENGTH = 4;
const RESEND_COUNTDOWN = 30; // seconds

const BLUE       = '#3B82F6';
const BLUE_LIGHT = '#BFDBFE';
const ERROR      = '#EF4444';

// ─── Single OTP box ───────────────────────────────────────────────────────────

type OtpBoxProps = {
  value: string;
  isFocused: boolean;
  hasError: boolean;
  index: number;
  inputRef: React.RefObject<TextInput>;
  onFocus: () => void;
  onChangeText: (text: string) => void;
  onKeyPress: (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => void;
};

const OtpBox = ({
  value,
  isFocused,
  hasError,
  index,
  inputRef,
  onFocus,
  onChangeText,
  onKeyPress,
}: OtpBoxProps) => {
  const borderColor = hasError
    ? ERROR
    : isFocused
    ? BLUE
    : value
    ? BLUE_LIGHT
    : '#D1D5DB';

  return (
    <View
      style={[
        styles.otpBox,
        {
          borderColor,
          backgroundColor: isFocused ? '#EFF6FF' : '#FFFFFF',
        },
      ]}
    >
      <TextInput
        ref={inputRef}
        style={styles.otpInput}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={(e) => onKeyPress(e, index)}
        onFocus={onFocus}
        keyboardType="number-pad"
        maxLength={1}
        textAlign="center"
        selectionColor={BLUE}
        caretHidden
        accessibilityLabel={`OTP digit ${index + 1}`}
      />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OtpVerifyScreen({ navigation, route }: Props) {
  const phone: string = route?.params?.phone ?? '9142342848';

  const [otp, setOtp]               = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIdx, setFocusedIdx] = useState<number>(0);
  const [loading, setLoading]       = useState<boolean>(false);
  const [error, setError]           = useState<string>('');
  const [countdown, setCountdown]   = useState<number>(RESEND_COUNTDOWN);
  const [canResend, setCanResend]   = useState<boolean>(false);

  // One ref per box
  const inputRefs = useRef<React.RefObject<TextInput>[]>(
    Array(OTP_LENGTH).fill(null).map(() => React.createRef<TextInput>()),
  );

  // Shake animation for wrong OTP
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Button opacity for loading state
  const btnOpacity = useRef(new Animated.Value(1)).current;

  // ── Auto-focus first box on mount ──
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.current?.focus(), 300);
  }, []);

  // ── Countdown timer ──
  useEffect(() => {
    if (countdown === 0) { setCanResend(true); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // ── Shake animation ──
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ── Handle digit input ──
  const handleChange = (text: string, index: number) => {
    if (error) setError('');
    const digit = text.replace(/\D/g, '');
    if (!digit) return;

    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    // Move to next box
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.current?.focus();
      setFocusedIdx(index + 1);
    } else {
      // Last box filled — auto submit
      inputRefs.current[index]?.current?.blur();
      handleVerify(updated.join(''));
    }
  };

  // ── Handle backspace ──
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

  // ── Verify OTP ──
  const handleVerify = async (code?: string) => {
    const finalOtp = code ?? otp.join('');

    if (finalOtp.length < OTP_LENGTH) {
      setError('Please enter the complete OTP.');
      shake();
      return;
    }

    setLoading(true);
    Animated.timing(btnOpacity, { toValue: 0.7, duration: 150, useNativeDriver: true }).start();

    try {
      // 🔌 Replace with your actual API call:
      // await authService.verifyOtp(phone, finalOtp);
      await new Promise((res) => setTimeout(res, 1500)); // mock delay

      navigation.navigate('MainTabs');
    } catch {
      setError('Invalid OTP. Please try again.');
      shake();
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => {
        inputRefs.current[0]?.current?.focus();
        setFocusedIdx(0);
      }, 100);
    } finally {
      setLoading(false);
      Animated.timing(btnOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(RESEND_COUNTDOWN);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    // 🔌 Replace with your actual resend call:
    // await authService.sendOtp(phone);
    inputRefs.current[0]?.current?.focus();
    setFocusedIdx(0);
  };

  const isComplete = otp.every((d) => d !== '');

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Mobile Verification</Text>
            <Text style={styles.title}>Please verify OTP</Text>
            <Text style={styles.subtitle}>
              We have sent an OTP on{' '}
              <Text
                style={styles.phoneLink}
                onPress={() => navigation.goBack()}
              >
                {phone} ✏️
              </Text>
            </Text>
          </View>

          {/* ── OTP Boxes ── */}
          <Animated.View
            style={[
              styles.otpRow,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            {otp.map((digit, i) => (
              <OtpBox
                key={i}
                index={i}
                value={digit}
                isFocused={focusedIdx === i}
                hasError={!!error}
                inputRef={inputRefs.current[i]}
                onFocus={() => setFocusedIdx(i)}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={handleKeyPress}
              />
            ))}
          </Animated.View>

          {/* ── Error ── */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* ── Spacer ── */}
          <View style={styles.spacer} />

          {/* ── Footer ── */}
          <View style={styles.footer}>
            {/* Resend countdown */}
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendText, canResend && styles.resendActive]}>
                {canResend
                  ? 'Resend OTP'
                  : `Resend OTP in ${countdown} sec(s)`}
              </Text>
            </TouchableOpacity>

            {/* Verify button */}
            <Animated.View style={{ opacity: btnOpacity }}>
              <TouchableOpacity
                style={[styles.button, !isComplete && styles.buttonDisabled]}
                onPress={() => handleVerify()}
                activeOpacity={0.85}
                disabled={loading || !isComplete}
                accessibilityRole="button"
                accessibilityLabel="Verify OTP"
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },

  // Header
  eyebrow: {
    fontSize: 13,
    fontWeight: '500',
    color: BLUE,
    letterSpacing: 0.4,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif-medium',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif-condensed',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    lineHeight: 20,
  },
  phoneLink: {
    color: BLUE,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // OTP boxes row
  otpRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 32,
  },
  otpBox: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif-condensed',
  },

  // Error
  errorText: {
    marginTop: 10,
    marginLeft: 2,
    fontSize: 12.5,
    color: ERROR,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },

  header: { marginBottom: 4 },
  spacer: { flex: 1 },

  // Footer
  footer: { gap: 16 },
  resendText: {
    textAlign: 'left',
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  resendActive: {
    color: BLUE,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Button
  button: {
    backgroundColor: BLUE,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: BLUE_LIGHT,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif-medium',
  },
});