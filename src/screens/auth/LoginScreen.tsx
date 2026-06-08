/**
 * LoginScreen.tsx
 * TEMP FIX: Google signin removed — direct Register navigate
 * Google signin baad mein fix karenge
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Svg, { Path } from 'react-native-svg';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: Props) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
    ]).start();

    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();

    pulse(ring1Anim, 0);
    pulse(ring2Anim, 600);
    pulse(ring3Anim, 1200);
  }, []);

  // TEMP: Direct Register navigate — Google signin baad mein
  const handleGoogleSignIn = () => {
    navigation.replace('Register');
  };

  const ring1Opacity = ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.04] });
  const ring2Opacity = ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.03] });
  const ring3Opacity = ring3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.02] });

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={s.glowTop} />
      <View style={s.glowBottom} />

      <Animated.View style={[s.ring, s.ring3, { opacity: ring3Opacity }]} />
      <Animated.View style={[s.ring, s.ring2, { opacity: ring2Opacity }]} />
      <Animated.View style={[s.ring, s.ring1, { opacity: ring1Opacity }]} />

      <View style={s.gridWrap} pointerEvents="none">
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[s.gridLine, { top: (height / 8) * i }]} />
        ))}
      </View>

      <Animated.View
        style={[
          s.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
        ]}
      >
        <View style={s.logoSection}>
          <View style={s.logoOuter}>
            <View style={s.logoInner}>
              <Text style={s.logoEmoji}>⛏️</Text>
            </View>
          </View>
          <Text style={s.brand}>
            Miners<Text style={s.brandAccent}>Buddy</Text>
          </Text>
          <View style={s.tagWrap}>
            <View style={s.tagDot} />
            <Text style={s.tagline}>India's #1 Mining Exam Prep</Text>
            <View style={s.tagDot} />
          </View>
        </View>

        <View style={s.badgeRow}>
          {['CMR 2017', 'Mining Mate', 'Overman', 'Manager'].map((label, i) => (
            <View key={i} style={s.badge}>
              <Text style={s.badgeText}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={s.statsRow}>
          {[
            { val: '1200+', lbl: 'Students' },
            { val: '250+',  lbl: 'Questions' },
            { val: '15',    lbl: 'Chapters' },
          ].map((stat, i) => (
            <React.Fragment key={stat.lbl}>
              <View style={s.statItem}>
                <Text style={s.statVal}>{stat.val}</Text>
                <Text style={s.statLbl}>{stat.lbl}</Text>
              </View>
              {i < 2 && <View style={s.statDiv} />}
            </React.Fragment>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[s.bottom, { opacity: fadeAnim }]}>
        <View style={s.separator} />
        <Text style={s.welcomeText}>Welcome to MinersBuddy</Text>
        <Text style={s.subText}>Sign in to start your exam preparation</Text>

        <TouchableOpacity
          style={s.googleBtn}
          onPress={handleGoogleSignIn}
          activeOpacity={0.88}
        >
          <View style={s.googleBtnInner}>
            <View style={s.gWrap}>
              <Svg width={24} height={24} viewBox="0 0 48 48">
                <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </Svg>
            </View>
            <Text style={s.googleBtnText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        <Text style={s.terms}>
          By continuing, you agree to our{' '}
          <Text style={s.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={s.termsLink}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const GOLD   = '#F59E0B';
const NAVY   = '#0D1117';
const CARD   = '#161C25';
const BORDER = '#1E2A38';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'space-between' },

  glowTop: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: GOLD, top: -180, alignSelf: 'center', opacity: 0.04,
  },
  glowBottom: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: GOLD, bottom: -140, alignSelf: 'center', opacity: 0.05,
  },

  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: GOLD, alignSelf: 'center' },
  ring1: { width: 200, height: 200, top: height * 0.18 },
  ring2: { width: 280, height: 280, top: height * 0.14 },
  ring3: { width: 360, height: 360, top: height * 0.10 },

  gridWrap: { position: 'absolute', width, height, opacity: 0.03 },
  gridLine: { position: 'absolute', width, height: 1, backgroundColor: GOLD },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, gap: 28, width: '100%', paddingHorizontal: 24,
  },

  logoSection: { alignItems: 'center', gap: 14 },
  logoOuter: {
    width: 110, height: 110, borderRadius: 32, borderWidth: 1,
    borderColor: `${GOLD}30`, alignItems: 'center', justifyContent: 'center',
    backgroundColor: `${GOLD}08`,
  },
  logoInner: {
    width: 86, height: 86, borderRadius: 24, backgroundColor: `${GOLD}15`,
    borderWidth: 1, borderColor: `${GOLD}40`, alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 42 },

  brand:       { fontSize: 34, fontWeight: '800', color: '#F0F6FC', letterSpacing: -1 },
  brandAccent: { color: GOLD },

  tagWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: `${GOLD}60` },
  tagline: { fontSize: 13, color: '#8B949E', fontWeight: '500', letterSpacing: 0.3 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  badge: {
    borderWidth: 1, borderColor: `${GOLD}30`, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, backgroundColor: `${GOLD}08`,
  },
  badgeText: { fontSize: 11, color: `${GOLD}CC`, fontWeight: '600', letterSpacing: 0.4 },

  statsRow: {
    flexDirection: 'row', backgroundColor: CARD, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, paddingVertical: 16, width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statVal:  { fontSize: 22, fontWeight: '900', color: GOLD, letterSpacing: -0.5 },
  statLbl:  { fontSize: 11, color: '#8B949E', fontWeight: '500' },
  statDiv:  { width: 1, backgroundColor: BORDER, marginVertical: 4 },

  bottom: { width: '100%', paddingHorizontal: 24, paddingBottom: 44, gap: 14, alignItems: 'center' },
  separator: { width: 48, height: 1, backgroundColor: `${GOLD}40`, marginBottom: 4 },

  welcomeText: { fontSize: 20, fontWeight: '800', color: '#F0F6FC', letterSpacing: -0.4 },
  subText:     { fontSize: 13, color: '#8B949E', fontWeight: '400', textAlign: 'center', marginTop: -6 },

  googleBtn: {
    width: '100%', height: 58, backgroundColor: '#FFFFFF', borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 10,
  },
  googleBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gWrap:          { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  googleBtnText:  { fontSize: 16, fontWeight: '700', color: '#1a1a1a', letterSpacing: 0.1 },

  terms:     { textAlign: 'center', fontSize: 12, color: '#484F58', lineHeight: 18, fontWeight: '400' },
  termsLink: { color: '#6B7280', fontWeight: '600' },
});
