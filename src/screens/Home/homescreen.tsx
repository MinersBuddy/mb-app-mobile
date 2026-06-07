// src/screens/Home/HomeScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, StatusBar, Platform, ActivityIndicator,
  FlatList, ViewToken,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MINING_MATE } from '../../data/courseConfig';
import {
  BellIcon, HeartPulse, ChevronRight,
  BookOpen, ClipboardList, FileText,
  Zap, Target, Award,
} from 'lucide-react-native';

import { useExamData, ExamData, BannerSlide, PYQEntry, QuickPracticeItem } from '../../hooks/useExamData';

const { width: SW } = Dimensions.get('window');

// ─── Design System ────────────────────────────────────────────────────────────
const C = {
  bg: '#0D1117', bgCard: '#1E2F42', bgRaised: '#1C2128', bgBorder: '#30363D',
  gold: '#F59E0B', goldDim: '#92600A', goldGlow: '#F59E0B18',
  white: '#F0F6FC', whiteD: '#C9D1D9',
  success: '#3FB950', teal: '#0D9488', purple: '#8B5CF6',
  red: '#F85149', orange: '#F0883E',
  textPrimary: '#F0F6FC', textSecondary: '#8B949E', textMuted: '#484F58',
} as const;

// ─── Icon Map ─────────────────────────────────────────────────────────────────
// JSON mein iconType string hota hai — yahan map karke real component milta hai
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Zap, BookOpen, ClipboardList, FileText, Target, Award,
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <View style={ss.secRow}>
    <View style={ss.secLeft}>
      <View style={ss.secAccent} />
      <Text style={ss.secTitle}>{title}</Text>
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} style={ss.seeAllBtn}>
        <Text style={ss.seeAllText}>See All</Text>
        <ChevronRight size={13} color={C.gold} />
      </TouchableOpacity>
    )}
  </View>
);

const ss = StyleSheet.create({
  secRow:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  secLeft:   { flexDirection:'row', alignItems:'center', gap:10 },
  secAccent: { width:3, height:18, borderRadius:2, backgroundColor:C.gold },
  secTitle:  { fontSize:17, fontWeight:'800', color:C.textPrimary, letterSpacing:-0.3 },
  seeAllBtn: { flexDirection:'row', alignItems:'center', gap:2 },
  seeAllText:{ fontSize:12, color:C.gold, fontWeight:'600' },
});

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
// Data load hone tak placeholder dikhata hai
const SkeletonBox = ({ width, height, style }: { width: number | string; height: number; style?: object }) => (
  <View style={[{ width: width as number, height, borderRadius: 10, backgroundColor: C.bgCard, opacity: 0.5 }, style]} />
);

const HomeSkeleton = () => (
  <View style={{ paddingHorizontal: 16, gap: 16, marginTop: 12 }}>
    <SkeletonBox width="100%" height={110} />
    <SkeletonBox width="100%" height={72} />
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {[1,2,3,4].map(i => <SkeletonBox key={i} width={72} height={80} />)}
    </View>
  </View>
);

// ─── Error View ───────────────────────────────────────────────────────────────
const ErrorView = ({ onRetry }: { onRetry: () => void }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
    <Text style={{ fontSize: 32 }}>⚠️</Text>
    <Text style={{ color: C.textPrimary, fontSize: 16, fontWeight: '700' }}>Data load nahi hua</Text>
    <Text style={{ color: C.textSecondary, fontSize: 13, textAlign: 'center' }}>
      Internet check karo ya GitHub URL verify karo
    </Text>
    <TouchableOpacity
      onPress={onRetry}
      style={{ backgroundColor: C.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
    >
      <Text style={{ color: '#0D1117', fontWeight: '800' }}>Retry</Text>
    </TouchableOpacity>
  </View>
);

// ─── Banner Slider ─────────────────────────────────────────────────────────────
const BannerSlider = ({ slides }: { slides: BannerSlide[] }) => {
  const realCount = slides.length;
  const allSlides = [...slides, slides[0]]; // infinite loop trick

  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef    = useRef<FlatList>(null);
  const timer      = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  useEffect(() => {
    timer.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = prev + 1;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const onMomentumScrollEnd = () => {
    if (activeIdx >= realCount) {
      flatRef.current?.scrollToIndex({ index: 0, animated: false });
      setActiveIdx(0);
    }
  };

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIdx(viewableItems[0].index ?? 0);
  });

  return (
    <View style={bss.wrap}>
      <FlatList
        ref={flatRef}
        data={allSlides}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfig.current}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={[bss.slide, { backgroundColor: item.bgColor, width: SW - 32 }]}>
            <View style={[bss.leftBar, { backgroundColor: item.accentColor }]} />
            <View style={bss.content}>
              <View style={[bss.tag, { backgroundColor: `${item.accentColor}22`, borderColor: `${item.accentColor}44` }]}>
                <Text style={[bss.tagText, { color: item.accentColor }]}>{item.tag}</Text>
              </View>
              <Text style={bss.headline}>{item.headline}</Text>
              <Text style={bss.sub}>{item.sub}</Text>
            </View>
            <View style={bss.iconCluster}>
              <View style={[bss.iconRing, { borderColor: `${item.accentColor}30` }]}>
                <Text style={{ fontSize: 36 }}>⛏️</Text>
              </View>
            </View>
          </View>
        )}
      />
      <View style={bss.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[bss.dot, (activeIdx % realCount) === i && bss.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const bss = StyleSheet.create({
  wrap:        { marginBottom: 20 },
  slide:       { borderRadius:16, borderWidth:1, borderColor:C.bgBorder, overflow:'hidden', flexDirection:'row', alignItems:'center', minHeight:110, paddingRight:12 },
  leftBar:     { width:4, alignSelf:'stretch' },
  content:     { flex:1, padding:16, gap:6 },
  tag:         { alignSelf:'flex-start', borderWidth:1, borderRadius:6, paddingHorizontal:8, paddingVertical:3, marginBottom:2 },
  tagText:     { fontSize:9, fontWeight:'800', letterSpacing:1.2 },
  headline:    { fontSize:20, fontWeight:'900', color:C.textPrimary, lineHeight:26, letterSpacing:-0.5 },
  sub:         { fontSize:11, color:C.textSecondary, fontWeight:'500', lineHeight:16 },
  iconCluster: { width:80, alignItems:'center', justifyContent:'center' },
  iconRing:    { width:70, height:70, borderRadius:35, borderWidth:2, alignItems:'center', justifyContent:'center' },
  dots:        { flexDirection:'row', justifyContent:'center', gap:5, marginTop:10 },
  dot:         { width:5, height:5, borderRadius:3, backgroundColor:C.bgBorder },
  dotActive:   { width:18, backgroundColor:C.gold },
});

// ─── Stats Strip ──────────────────────────────────────────────────────────────
const StatsStrip = ({ data }: { data: ExamData }) => (
  <View style={stss.wrap}>
    {[
      { val: `🔥 ${data.streak}`,      lbl: 'Day Streak' },
      { val: `${data.accuracy}%`,       lbl: 'Accuracy'   },
      { val: `${data.testsTaken}`,      lbl: 'Tests'      },
      { val: `${data.studyHours}h`,     lbl: 'Studied'    },
    ].map((s, i, arr) => (
      <React.Fragment key={s.lbl}>
        <View style={stss.item}>
          <Text style={stss.val}>{s.val}</Text>
          <Text style={stss.lbl}>{s.lbl}</Text>
        </View>
        {i < arr.length - 1 && <View style={stss.div} />}
      </React.Fragment>
    ))}
  </View>
);

const stss = StyleSheet.create({
  wrap: { flexDirection:'row', backgroundColor:C.bgCard, borderRadius:14, borderWidth:1, borderColor:`${C.gold}25`, paddingVertical:14, marginBottom:20 },
  item: { flex:1, alignItems:'center', gap:3 },
  val:  { fontSize:18, fontWeight:'900', color:C.textPrimary, letterSpacing:-0.5 },
  lbl:  { fontSize:10, color:C.textSecondary, fontWeight:'600', letterSpacing:0.3 },
  div:  { width:1, backgroundColor:C.bgBorder, marginVertical:4 },
});

// ─── PYQ Cards ────────────────────────────────────────────────────────────────
const PYQCards = ({
  pyqList, navigation
}: {
  pyqList: PYQEntry[];
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap:12, paddingRight:16 }}>
    {pyqList.map(p => {
      const Icon = ICON_MAP[p.iconType] ?? BookOpen; // fallback icon
      return (
        <TouchableOpacity key={p.id} style={pyss.card} activeOpacity={0.85}
          onPress={() => navigation.navigate('ChapterList', { course: MINING_MATE })}>
          <View style={[pyss.iconWrap, { backgroundColor:`${p.iconColor}15` }]}>
            <Icon size={24} color={p.iconColor} />
          </View>
          <View style={[pyss.yearBadge, { backgroundColor:`${p.iconColor}20` }]}>
            <Text style={[pyss.year, { color: p.iconColor }]}>PYQ {p.year}</Text>
          </View>
          <Text style={pyss.topic} numberOfLines={2}>{p.topic}</Text>
          <Text style={pyss.qCount}>{p.qCount} Questions</Text>
          <TouchableOpacity style={[pyss.btn, { backgroundColor: C.gold }]} activeOpacity={0.85}
            onPress={() => navigation.navigate('ChapterList', { course: MINING_MATE })}>
            <Text style={pyss.btnText}>Practice →</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const pyss = StyleSheet.create({
  card:     { width:150, backgroundColor:C.bgCard, borderRadius:16, borderWidth:1, borderColor:C.bgBorder, padding:14, gap:8 },
  iconWrap: { width:46, height:46, borderRadius:12, alignItems:'center', justifyContent:'center' },
  yearBadge:{ alignSelf:'flex-start', borderRadius:6, paddingHorizontal:7, paddingVertical:3 },
  year:     { fontSize:9, fontWeight:'800', letterSpacing:0.8 },
  topic:    { fontSize:12, fontWeight:'700', color:C.textPrimary, lineHeight:17 },
  qCount:   { fontSize:10, color:C.textSecondary, fontWeight:'500' },
  btn:      { borderRadius:9, paddingVertical:9, alignItems:'center' },
  btnText:  { fontSize:11, fontWeight:'800', color:'#0D1117' },
});

// ─── Quick Practice ───────────────────────────────────────────────────────────
const QuickPractice = ({ items }: { items: QuickPracticeItem[] }) => (
  <View style={qss.row}>
    {items.map(ch => {
      const Icon = ICON_MAP[ch.iconType] ?? Zap;
      return (
        <TouchableOpacity key={ch.id} style={qss.chip} activeOpacity={0.8}>
          <Icon size={22} color={ch.color} />
          <Text style={qss.label}>{ch.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const qss = StyleSheet.create({
  row:   { flexDirection:'row', gap:10, marginBottom:20 },
  chip:  { flex:1, borderRadius:14, borderWidth:1, paddingVertical:16, alignItems:'center', gap:7, backgroundColor:C.bgCard, borderColor:`${C.gold}30` },
  label: { fontSize:11, fontWeight:'700', color:C.textPrimary, letterSpacing:0.2 },
});

// ─── Header ───────────────────────────────────────────────────────────────────
const HomeHeader = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={hs.wrap}>
      <View style={hs.left}>
        <View style={hs.avatar}>
          <Text style={hs.avatarText}>VK</Text>
          <View style={hs.online} />
        </View>
        <View>
          <Text style={hs.greeting}>Good Morning 👋</Text>
          <Text style={hs.name}>Vinit Karmkar</Text>
        </View>
      </View>
      <View style={hs.actions}>
        <TouchableOpacity style={hs.iconBtn} onPress={() => navigation.navigate('FirstAid')}>
          <HeartPulse size={18} color={C.success} />
        </TouchableOpacity>
        <TouchableOpacity style={hs.iconBtn} onPress={() => navigation.navigate('Announcements')}>
          <BellIcon size={18} color={C.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const hs = StyleSheet.create({
  wrap:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop: Platform.OS === 'ios' ? 56 : 10, paddingBottom:16 },
  left:       { flexDirection:'row', alignItems:'center', gap:12 },
  avatar:     { width:44, height:44, borderRadius:22, backgroundColor:C.gold, alignItems:'center', justifyContent:'center', position:'relative' },
  avatarText: { fontSize:15, fontWeight:'900', color:'#0D1117' },
  online:     { position:'absolute', bottom:1, right:1, width:11, height:11, borderRadius:6, backgroundColor:C.success, borderWidth:2, borderColor:C.bg },
  greeting:   { fontSize:11, color:C.textSecondary, fontWeight:'500' },
  name:       { fontSize:16, fontWeight:'800', color:C.textPrimary, letterSpacing:-0.3 },
  actions:    { flexDirection:'row', gap:8 },
  iconBtn:    { width:38, height:38, borderRadius:11, backgroundColor:C.bgCard, borderWidth:1, borderColor:C.bgBorder, alignItems:'center', justifyContent:'center' },
});

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ✅ Ek hi hook se saara data aata hai
  const { data, isLoading, isError, refetch } = useExamData();

  return (
    <View style={{ flex:1, backgroundColor:'#0F1923' }}>
      <StatusBar barStyle="light-content" backgroundColor='#0F1923' />
      <HomeHeader />

      {/* Loading State */}
      {isLoading && <HomeSkeleton />}

      {/* Error State */}
      {isError && <ErrorView onRetry={refetch} />}

      {/* Success State */}
      {data && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom:100 }}
        >
          {/* Banner Slider */}
          <View style={{ paddingHorizontal:16 }}>
            <BannerSlider slides={data.bannerSlides} />
          </View>

          {/* Stats Strip */}
          <View style={{ paddingHorizontal:16 }}>
            <StatsStrip data={data} />
          </View>

          {/* PYQ Section */}
          <View style={{ paddingHorizontal:16 }}>
            <SectionHeader title="Previous Year Questions" onSeeAll={() => {}} />
          </View>
          <View style={{ marginBottom:20 }}>
            <PYQCards pyqList={data.pyqList} navigation={navigation} />
          </View>

          {/* Quick Practice */}
          <View style={{ paddingHorizontal:16 }}>
            <SectionHeader title="Quick Practice" />
            <QuickPractice items={data.quickPractice} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
