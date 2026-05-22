import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Navigation type ───────────────────────────────────────────────────────────
type OnboardingNavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
type Props = { navigation: OnboardingNavProp };

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  navy:      '#0F1923',
  navyMid:   '#1A2B3C',
  navyLight: '#243447',
  gold:      '#F59E0B',  
  white:     '#FFFFFF',
  muted:     '#94A3B8',
  mutedDark: '#64748B',
  success:   '#10B981',
  purple:    '#8B5CF6',
} as const;

const { width } = Dimensions.get('window');

// ─── Data Types ─────────────────────────────────────────────────────────────────
type StatEntry = { value: string; label: string };
type SlideData = {
  id: string;
  emoji: string;
  tag: string;
  title: string;
  subtitle: string;
  accent: string;
  stats: StatEntry[];
};

// ─── Static Data ──────────────────────────────────────────────────────────────
const SLIDES: SlideData[] = [
  {
    id: '1',
    emoji: '⛏️',
    tag: 'DGMS CERTIFIED CONTENT',
    title: 'Master Mining\nRegulations',
    subtitle: 'Structured CMR 2017 & MMR 1961 content crafted for every mining certification level.',
    accent: COLORS.gold,
    stats: [
      { value: '1200+', label: 'Questions' },
      { value: '12',    label: 'Courses'   },
      { value: '95%',   label: 'Pass Rate' },
    ],
  },
  {
    id: '2',
    emoji: '📝',
    tag: 'SMART PRACTICE',
    title: 'PYQs & Mock\nTests Built-in',
    subtitle: 'Practice with 10 years of previous papers and full-length mock exams with real exam timing.',
    accent: COLORS.success,
    stats: [
      { value: '50+', label: 'Mock Tests' },
      { value: 'PYQ', label: '10 Yrs'    },
      { value: '120', label: 'Min Timer' },
    ],
  },
  {
    id: '3',
    emoji: '🏆',
    tag: 'YOUR EXAM. YOUR TIMELINE.',
    title: 'Countdown to\nYour Success',
    subtitle: 'Set your exam date, track your progress, and get daily regulation tips to stay sharp every day.',
    accent: COLORS.purple,
    stats: [
      { value: '36d', label: 'Avg. Prep'  },
      { value: '85%', label: 'Avg Score'  },
      { value: '45',  label: 'Note Slots' },
    ],
  },
];

// ─── Dot Indicator ─────────────────────────────────────────────────────────────
// FIX: width interpolation not supported on Animated.View in RN new arch.
// Solution: use a fixed base width + transform scaleX to expand active dot.
const DotsIndicator = ({
  scrollX,
  accent,
}: {
  scrollX: Animated.Value;
  accent: string;
}) => (
  <View style={styles.dotsRow}>
    {SLIDES.map((_, i) => {
      const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

      const scaleX = scrollX.interpolate({
        inputRange,
        outputRange: [1, 3.5, 1],
        extrapolate: 'clamp',
      });

      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.3, 1, 0.3],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity,
              backgroundColor: accent,
              transform: [{ scaleX }],
            },
          ]}
        />
      );
    })}
  </View>
);

// ─── Slide Component ───────────────────────────────────────────────────────────
const Slide = ({ item }: { item: SlideData }) => (
  <View style={[styles.slide, { width }]}>
    <View style={styles.topBlock}>
      {[220, 300, 380].map((size, i) => (
        <View
          key={size}
          style={[
            styles.decorCircle,
            {
              width: size,
              height: size,
              borderColor: `${item.accent}${['30', '20', '10'][i]}`,
            },
          ]}
        />
      ))}

      <View
        style={[
          styles.tagPill,
          { backgroundColor: `${item.accent}20`, borderColor: `${item.accent}50` },
        ]}
      >
        <View style={[styles.tagDot, { backgroundColor: item.accent }]} />
        <Text style={[styles.tagText, { color: item.accent }]}>{item.tag}</Text>
      </View>

      <View style={[styles.emojiCard, { shadowColor: item.accent }]}>
        <View style={[styles.emojiCardInner, { backgroundColor: `${item.accent}15` }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={[styles.emojiGlow, { borderColor: `${item.accent}40` }]} />
      </View>
    </View>

    <View style={styles.contentBlock}>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>

      <View style={[styles.statsRow, { borderColor: `${item.accent}25` }]}>
        {item.stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: item.accent }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            {i < item.stats.length - 1 && (
              <View style={[styles.statDivider, { backgroundColor: `${item.accent}30` }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideData>>(null);
  const scrollX     = useRef(new Animated.Value(0)).current;

  const isLastSlide   = currentIndex === SLIDES.length - 1;
  const currentAccent = SLIDES[currentIndex]?.accent ?? COLORS.gold;

  const goToHome = () => navigation.replace('MainTabs');

  const handleNext = () => {
    if (!isLastSlide) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      goToHome();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <Animated.FlatList<SlideData>
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }, // ← false required for transform interpolation
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => <Slide item={item} />}
      />

      <View style={styles.bottomControls}>

        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: currentAccent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>
            {isLastSlide ? 'Get Started →' : 'Next →'}
          </Text>
        </TouchableOpacity>

        {isLastSlide && (
          <TouchableOpacity
            style={styles.signInRow}
            onPress={() => navigation.navigate('Login')}
          >
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },

  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 24,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.navyLight,
    borderWidth: 1,
    borderColor: COLORS.navyMid,
  },
  skipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },

  slide:    { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  topBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },

  decorCircle: { position: 'absolute', borderRadius: 999, borderWidth: 1 },

  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  tagDot:  { width: 6, height: 6, borderRadius: 3 },
  tagText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  emojiCard: {
    width: 140, height: 140,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    backgroundColor: COLORS.navyMid,
    position: 'relative',
  },
  emojiCardInner: { width: 120, height: 120, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emojiGlow:      { position: 'absolute', width: 160, height: 160, borderRadius: 50, borderWidth: 1.5 },
  emoji:          { fontSize: 60 },

  contentBlock:  { paddingHorizontal: 28, paddingBottom: 16 },
  slideTitle:    { fontSize: 34, fontWeight: '800', color: COLORS.white, lineHeight: 42, letterSpacing: -0.5, marginBottom: 14 },
  slideSubtitle: { fontSize: 15, color: COLORS.muted, lineHeight: 24, fontWeight: '400', marginBottom: 24 },

  statsRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.navyMid, borderRadius: 16, borderWidth: 1, paddingVertical: 16, paddingHorizontal: 8 },
  statItem:    { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel:   { fontSize: 11, color: COLORS.mutedDark, fontWeight: '600', marginTop: 2, letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32 },

  bottomControls: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    paddingTop: 8,
    gap: 16,
  },

  // ✅ Fixed dot: base 8×8, scaleX animates the active state
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:     { width: 8, height: 8, borderRadius: 4 },

  ctaBtn:     { borderRadius: 16, paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  ctaBtnText: { color: COLORS.navy, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  signInRow:  { alignItems: 'center' },
  signInText: { color: COLORS.mutedDark, fontSize: 14, fontWeight: '500' },
  signInLink: { fontWeight: '700' },
});