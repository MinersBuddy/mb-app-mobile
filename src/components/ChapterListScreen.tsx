import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight, ArrowLeft, BarChart2,
  SlidersHorizontal, ArrowUpDown,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/AppNavigator';
import { CourseConfig, Chapter } from '../data/courseConfig';
import { MINING_MATE } from '../data/courseConfig';
import { QuizQuestion } from './QuizScreen';
import { firstAidQuestions } from '../data/firstAidData';


const C = {
  bg:        '#0F1923',
  bgCard:    '#1E2F42',
  bgBorder:  '#243447',
  gold:      '#F59E0B',
  white:     '#F0F6FC',
  muted:     '#94A3B8',
  mutedDark: '#64748B',
  success:   '#10B981',
} as const;

type FilterTab = 'All' | 'Available';

const generateMockQuestions = (ch: Chapter): QuizQuestion[] => {
  // Baad mein backend se fetch karna — abhi placeholder
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${ch.id}_q${i}`,
    question: `Sample question ${i + 1} for ${ch.title}?`,
    options: [
      'Option A — First choice',
      'Option B — Second choice', 
      'Option C — Third choice',
      'Option D — Fourth choice',
    ],
    correctIndex: 0,
    chapterTitle: ch.title,
    explanation: `This is the explanation for question ${i + 1}.`,
  }));
};


// after bakend ready
// const handleChapterPress = async (ch: Chapter) => {
//   if ((ch.subChapters?.length ?? 0) > 0) {
//     navigation.push('ChapterList', { chapter: ch, courseColor: accentColor, courseName: ch.title });
//   } else {
//     // API call
//     const questions = await fetchQuestionsFromAPI(ch.id);
//     navigation.navigate('QuizScreen', {
//       quizTitle: ch.title,
//       courseColor: accentColor,
//       questions,
//     });
//   }
// };

// ─── Chapter Row (unchanged) ──────────────────────────────────────────────────

const ChapterRow = ({
  item,
  onPress,
}: {
  item: Chapter;
  onPress: (chapter: Chapter) => void;
}) => {
  const IconComp = item.icon;
  const hasNested = (item.subChapters?.length ?? 0) > 0;

  return (
    <TouchableOpacity
      style={s.chapterRow}
      activeOpacity={0.78}
      onPress={() => onPress(item)}
    >
      <View style={[s.iconBox, { backgroundColor: `${item.color}18` }]}>
        <IconComp size={22} color={item.color} />
      </View>
      <View style={s.chapterMeta}>
        <Text style={s.chapterTitle} numberOfLines={2}>{item.title}</Text>
        <View style={s.chapterSubRow}>
          <Text style={s.chapterQs}>{item.questions} Qs</Text>
          {item.available && (
            <View style={s.availableBadge}>
              <Text style={s.availableText}>Available</Text>
            </View>
          )}
          {hasNested && (
            <View style={[s.availableBadge, { backgroundColor: `${C.gold}15`, borderColor: `${C.gold}30` }]}>
              <Text style={[s.availableText, { color: C.gold }]}>
                {item.subChapters!.length} topics
              </Text>
            </View>
          )}
        </View>
      </View>
      <ChevronRight size={18} color={C.mutedDark} />
    </TouchableOpacity>
  );
};

const Separator = () => <View style={s.separator} />;

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChapterList'>;
  route: RouteProp<RootStackParamList, 'ChapterList'>;
};

export default function ChapterListScreen({ navigation, route }: Props) {
  const { course, chapter, courseColor, courseName } = route.params;

  // ✅ Dual mode detection
  const isSubMode = !!chapter;

  // Derived display values — sub mode ya course mode dono handle
  const accentColor  = isSubMode ? (courseColor ?? C.gold) : (course!.color);
  const displayName  = isSubMode ? (courseName ?? chapter!.title) : course!.name;
  const displayBadge = isSubMode ? 'TOPICS' : course!.badge;
  const displayIcon  = isSubMode ? '📂' : course!.icon;
  const regulation   = isSubMode ? '' : course!.regulation;
  const description  = isSubMode
    ? `${chapter!.subChapters?.length ?? 0} topics · ${chapter!.questions} Qs`
    : course!.description;

  // ✅ Chapters list — sub mode mein subChapters as Chapter[]
  const allChapters: Chapter[] = isSubMode
    ? (chapter!.subChapters as Chapter[]) ?? []
    : course!.chapters;

  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const filtered = useMemo(
    () => activeTab === 'Available'
      ? allChapters.filter(c => c.available)
      : allChapters,
    [activeTab, allChapters],
  );

  const totalQs = useMemo(
    () => allChapters.reduce((sum, c) => sum + c.questions, 0),
    [allChapters],
  );

  // ✅ Recursive navigation — same screen, different params
  const handleChapterPress = (ch: Chapter) => {
    console.log('chapter id:', ch.id);
    console.log('chapter title:', ch.title);

    if ((ch.subChapters?.length ?? 0) > 0) {
      // Nested — ChapterList ko phir se navigate karo
      navigation.push('ChapterList', {
        chapter: ch,
        courseColor: accentColor,
        courseName: ch.title,
      });
    } else {
      console.log('ch.id === mm08?', ch.id === 'mm08');

      const questions = ch.id === 'mm08'? firstAidQuestions: generateMockQuestions(ch);
      
      console.log('questions count:', questions.length);

      navigation.navigate('QuizScreen', {
        quizTitle:   ch.title,
        courseColor: accentColor,
        questions,
      });

    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={18} color={C.white} />
        </TouchableOpacity>

        {/* Analytics sirf top-level course mein dikhao */}
        {!isSubMode ? (
          <TouchableOpacity
            style={s.iconBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Analytics' } as any)}
          >
            <BarChart2 size={18} color={accentColor} />
          </TouchableOpacity>
        ) : (
          <View style={s.iconBtn} /> // placeholder to keep layout balanced
        )}
      </View>

      {/* ── Header ── */}
      <View style={s.courseHeader}>
        <View style={[s.courseIconBox, { borderColor: `${accentColor}40`, backgroundColor: `${accentColor}15` }]}>
          <Text style={{ fontSize: 32 }}>{displayIcon}</Text>
        </View>
        <View style={s.courseInfo}>
          <View style={s.titleRow}>
            <Text style={s.courseTitle}>{displayName}</Text>
            <View style={[s.badge, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` }]}>
              <Text style={[s.badgeText, { color: accentColor }]}>{displayBadge}</Text>
            </View>
          </View>
          <Text style={s.courseMeta}>
            {allChapters.length} {isSubMode ? 'Topics' : 'Chapters'} · {totalQs} Qs
            {regulation ? ` · ${regulation}` : ''}
          </Text>
          <Text style={s.courseDesc} numberOfLines={1}>{description}</Text>
        </View>
      </View>


      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChapterRow item={item} onPress={handleChapterPress} />
        )}
        ItemSeparatorComponent={Separator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        style={s.list}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyText}>No items available yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// styles unchanged — copy from original
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.bgBorder, alignItems: 'center', justifyContent: 'center' },
  courseHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  courseIconBox: { width: 60, height: 60, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  courseInfo: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  courseTitle: { fontSize: 20, fontWeight: '800', color: C.white, letterSpacing: -0.4, fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif-condensed' },
  badge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  courseMeta: { fontSize: 12, color: C.muted, fontWeight: '500' },
  courseDesc: { fontSize: 11, color: C.mutedDark, fontWeight: '400' },
  filterLabel: { paddingHorizontal: 16, marginBottom: 8 },
  filterLabelText: { fontSize: 12, color: C.mutedDark, fontWeight: '500' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 14 },
  tabPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, borderWidth: 1.5, borderColor: C.bgBorder },
  tabCheck: { fontSize: 12, color: C.bg, fontWeight: '800' },
  tabText: { fontSize: 13, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.bg, fontWeight: '800' },
  list: { flex: 1, marginHorizontal: 16 },
  listContent: { backgroundColor: C.bgCard, borderRadius: 18, borderWidth: 1, borderColor: C.bgBorder, overflow: 'hidden', marginBottom: 8 },
  chapterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 14, backgroundColor: C.bgCard },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chapterMeta: { flex: 1, gap: 5 },
  chapterTitle: { fontSize: 14, fontWeight: '700', color: C.white, lineHeight: 20 },
  chapterSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chapterQs: { fontSize: 12, color: C.mutedDark, fontWeight: '500' },
  availableBadge: { backgroundColor: `${C.success}18`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: `${C.success}35` },
  availableText: { fontSize: 10, color: C.success, fontWeight: '700', letterSpacing: 0.3 },
  separator: { height: 1, backgroundColor: C.bgBorder, marginHorizontal: 14 },
  emptyWrap: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: C.mutedDark, fontWeight: '500' },
  bottomBar: { flexDirection: 'row', backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.bgBorder, paddingVertical: 14, paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 20 : 14 },
  bottomBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bottomBtnText: { fontSize: 15, fontWeight: '700', color: C.mutedDark },
  bottomDivider: { width: 1, height: 22, backgroundColor: C.bgBorder, alignSelf: 'center' },
});