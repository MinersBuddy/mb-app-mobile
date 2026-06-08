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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Types ───────────────────────────────────────────────────────────────────

type MobileVerifyNavProp = NativeStackNavigationProp<RootStackParamList, 'MobileVerify'>;

interface MobileVerifyScreenProps {
  navigation: MobileVerifyNavProp;
  onSendOtp?: (phoneNumber: string) => Promise<void>;
}

// ─── Component ───────────────────────────────────────────────────────────────

const MobileVerifyScreen: React.FC<MobileVerifyScreenProps> = ({ navigation, onSendOtp }) => {
  const [mobile, setMobile] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const inputScale   = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const shakeAnim    = useRef(new Animated.Value(0)).current;

  const isValid = mobile.length === 10 && /^[6-9]\d{9}$/.test(mobile);

  const onInputFocus = () => {
    Animated.spring(inputScale, { toValue: 1.015, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  const onInputBlur = () => {
    Animated.spring(inputScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOtp = async () => {
    if (!isValid) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      shake();
      return;
    }

    setError('');
    setLoading(true);
    Animated.timing(buttonOpacity, { toValue: 0.75, duration: 150, useNativeDriver: true }).start();

    try {
      await onSendOtp?.(`+91${mobile}`);
      navigation.navigate('OtpVerify', { phone: mobile }); // ← OtpVerify pe navigate
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
      Animated.timing(buttonOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  };

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setMobile(cleaned);
    if (error) setError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Mobile Verification</Text>
            <Text style={styles.title}>Enter your mobile{'\n'}number for OTP</Text>
          </View>

          <Animated.View
            style={[
              styles.inputWrapper,
              { transform: [{ scale: inputScale }, { translateX: shakeAnim }] },
              error ? styles.inputWrapperError : null,
            ]}
          >
            <View style={styles.countryPill}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter mobile number"
              placeholderTextColor="#AAAAAA"
              keyboardType="number-pad"
              maxLength={10}
              value={mobile}
              onChangeText={handleMobileChange}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
              selectionColor="#3B82F6"
              accessibilityLabel="Mobile number input"
            />
            {isValid && (
              <View style={styles.validIcon}>
                <Text style={styles.validIconText}>✓</Text>
              </View>
            )}
          </Animated.View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!error && <Text style={styles.hint}>We'll send a 6-digit OTP to verify your number.</Text>}

          <View style={styles.spacer} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Facing issues? Email us at{' '}
              <Text
                style={styles.footerLink}
                onPress={() => Linking.openURL('mailto:info.minersbuddy@gmail.com')}
                accessibilityRole="link"
              >
                support@getmarks.app
              </Text>
            </Text>

            <Animated.View style={{ opacity: buttonOpacity }}>
              <TouchableOpacity
                style={[styles.button, !isValid && styles.buttonDisabled]}
                onPress={handleSendOtp}
                activeOpacity={0.85}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Send OTP"
                accessibilityState={{ disabled: !isValid || loading }}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>Send OTP</Text>
                }
              </TouchableOpacity>
            </Animated.View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const BLUE          = '#3B82F6';
const BLUE_DISABLED = '#A8C8F8';
const ERROR         = '#EF4444';

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#FFFFFF' },
  flex:      { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16 },

  header:  { marginBottom: 32 },
  eyebrow: { fontSize: 13, fontWeight: '500', color: BLUE, letterSpacing: 0.4, marginBottom: 8 },
  title:   { fontSize: 30, fontWeight: '700', color: '#111827', lineHeight: 38, letterSpacing: -0.5 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    backgroundColor: '#FAFAFA', paddingHorizontal: 14, height: 56,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  inputWrapperError: { borderColor: ERROR, backgroundColor: '#FEF2F2' },
  countryPill:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 4 },
  flag:         { fontSize: 20, lineHeight: 24 },
  countryCode:  { fontSize: 15, fontWeight: '600', color: '#374151' },
  divider:      { width: 1, height: 22, backgroundColor: '#D1D5DB', marginHorizontal: 12 },
  textInput:    { flex: 1, fontSize: 16, color: '#111827', fontWeight: '500', letterSpacing: 0.5, padding: 0 },
  validIcon:    { width: 22, height: 22, borderRadius: 11, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  validIconText:{ fontSize: 12, color: '#059669', fontWeight: '700' },

  errorText: { marginTop: 8, marginLeft: 4, fontSize: 12.5, color: ERROR, fontWeight: '500' },
  hint:      { marginTop: 8, marginLeft: 4, fontSize: 12.5, color: '#9CA3AF' },
  spacer:    { flex: 1 },

  footer:     { gap: 16 },
  footerText: { textAlign: 'center', fontSize: 12.5, color: '#6B7280' },
  footerLink: { color: '#374151', fontWeight: '600', textDecorationLine: 'underline' },

  button: {
    backgroundColor: BLUE, borderRadius: 14, height: 52,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  buttonDisabled:     { backgroundColor: BLUE_DISABLED, shadowOpacity: 0.12, elevation: 2 },
  buttonText:         { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  buttonTextDisabled: { color: '#FFFFFF', opacity: 0.75 },
});

export default MobileVerifyScreen;