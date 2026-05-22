/**
 * LoginScreen.tsx
 * Location: MinersBuddy/src/screens/auth/LoginScreen.tsx
 *
 * UI-only login screen. Firebase logic baad mein add karna.
 * handleLogin() function ready hai — sirf Firebase call wahan likhna.
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
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Navigation type ───────────────────────────────────────────────────────────
type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type Props = { navigation: LoginNavProp };

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  navy:      '#0F1923',
  navyMid:   '#1A2B3C',
  navyLight: '#243447',
  navyCard:  '#1E2F42',
  gold:      '#F59E0B',
  goldLight: '#FCD34D',
  goldDark:  '#D97706',
  white:     '#FFFFFF',
  offWhite:  '#F1F5F9',
  muted:     '#94A3B8',
  mutedDark: '#64748B',
  success:   '#10B981',
  error:     '#EF4444',
} as const;

const { width } = Dimensions.get('window');

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
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightElement,
  error,
}: InputFieldProps) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

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
  wrapper:    { marginBottom: 16 },
  label:      { fontSize: 12, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  container:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.navyMid, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 54, gap: 10 },
  icon:       { fontSize: 18 },
  input:      { flex: 1, fontSize: 15, color: COLORS.white, fontWeight: '500' },
  errorText:  { fontSize: 11, color: COLORS.error, fontWeight: '600', marginTop: 5, marginLeft: 4 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }: Props) {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [errors,      setErrors]      = useState<{ email?: string; password?: string }>({});

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim())                        newErrors.email    = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email))    newErrors.email    = 'Invalid email format';
    if (!password)                            newErrors.password = 'Password required';
    else if (password.length < 6)            newErrors.password = 'Min 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Login Handler — Firebase yahan add karna ────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      // TODO: Firebase auth call here
      // await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (error) {
      // TODO: Handle Firebase errors here
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Background decorative rings */}
      <View style={styles.bgRing1} />
      <View style={styles.bgRing2} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>Sign in to continue your exam prep</Text>
          </View>

          {/* Form card */}
          <View style={styles.formCard}>
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
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              icon="🔒"
              secureTextEntry={!showPass}
              error={errors.password}
              rightElement={
                <TouchableOpacity onPress={() => setShowPass(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              }
            />

            {/* Forgot password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login CTA */}
            <TouchableOpacity
              style={[styles.ctaBtn, isLoading && styles.ctaBtnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.ctaBtnText}>
                {isLoading ? 'Signing In...' : 'Sign In →'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google SSO placeholder */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <TouchableOpacity
            style={styles.registerRow}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              New to MinersBuddy?{' '}
              <Text style={styles.registerLink}>Create Account</Text>
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

  // Background decor
  bgRing1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: `${COLORS.gold}08`,
    top: -150,
    right: -120,
  },
  bgRing2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: `${COLORS.gold}06`,
    bottom: 80,
    left: -100,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 40,
  },

  // Back
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navyMid,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  backIcon: { fontSize: 18, color: COLORS.muted },

  // Header
  header: { alignItems: 'center', marginBottom: 32 },
  logoWrap: { position: 'relative', marginBottom: 16 },
  logoBg: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: `${COLORS.gold}18`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}35`,
  },
  logoEmoji: { fontSize: 34 },
  logoGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: `${COLORS.gold}20`,
    top: -8,
    left: -8,
  },
  brandName: { fontSize: 22, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3, marginBottom: 20 },
  heading:   { fontSize: 28, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5, marginBottom: 8 },
  subheading:{ fontSize: 14, color: COLORS.muted, fontWeight: '400', textAlign: 'center' },

  // Form card
  formCard: {
    backgroundColor: COLORS.navyCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
    padding: 20,
    marginBottom: 20,
  },

  eyeIcon:   { fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText:{ fontSize: 13, color: COLORS.gold, fontWeight: '600' },

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

  // Divider
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.navyLight },
  dividerText: { fontSize: 12, color: COLORS.mutedDark, fontWeight: '600' },

  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.navyMid,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
  },
  googleIcon: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  googleText: { fontSize: 14, color: COLORS.offWhite, fontWeight: '600' },

  // Register link
  registerRow:  { alignItems: 'center' },
  registerText: { fontSize: 14, color: COLORS.mutedDark, fontWeight: '500' },
  registerLink: { color: COLORS.gold, fontWeight: '700' },
});