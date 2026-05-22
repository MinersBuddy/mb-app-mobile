import React, { useState, useRef, useCallback } from 'react';
import Sound from 'react-native-sound';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  BookOpen,
  Flag,
  RotateCcw,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: SW } = Dimensions.get('window');

Sound.setCategory('Playback', true);

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#0F1923',
  bgCard:    '#1E2F42',
  bgBorder:  '#243447',
  bgRaised:  '#162130',
  gold:      '#F59E0B',
  white:     '#F0F6FC',
  muted:     '#94A3B8',
  mutedDark: '#64748B',
  success:   '#10B981',
  red:       '#EF4444',
  successBg: '#10B98118',
  redBg:     '#EF444418',
};

// ─── Types ────────────────────────────────────────────────────────────────────

// ✅ Backend se yahi shape return karo — sab kuch yahi hai
export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];          // exactly 4 options
  correctIndex: number;       // 0-based correct answer index
  explanation?: string;       // optional — answer ke baad dikhega
  chapterTitle?: string;      // optional — "Mine Legislation"
  topicTag?: string;          // optional — "CMR Regulation 104"
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  year?: string;              // PYQ ke liye — "2024"
};

// Route params — ChapterList ya kisi bhi screen se pass karo
export type QuizScreenParams = {
  // Quiz identity
  quizTitle:   string;        // "Mine Legislation · Chapter 3"
  courseColor: string;        // accent color — course ka brand color
  courseIcon?: string;        // emoji

  // Questions — backend se fetch karke pass karo
  questions: QuizQuestion[];

  // Optional config
  showTimer?:   boolean;      // default false
  shuffleOpts?: boolean;      // options shuffle karna hai?
};

// Internal state per question
type AnswerState = {
  selectedIndex: number | null;
  isCorrect: boolean | null;
  flagged: boolean;
};

// ─── Option Button ────────────────────────────────────────────────────────────

type OptionProps = {
  label: string;
  index: number;
  answerState: AnswerState;
  correctIndex: number;
  accentColor: string;
  onSelect: (i: number) => void;
};

const OptionButton = ({
  label,
  index,
  answerState,
  correctIndex,
  accentColor,
  onSelect,
}: OptionProps) => {
  const { selectedIndex, isCorrect } = answerState;
  const isAnswered  = selectedIndex !== null;
  const isSelected  = selectedIndex === index;
  const isCorrectOpt = index === correctIndex;

  // Colors
  let borderColor = C.bgBorder;
  let bgColor     = C.bgCard;
  let textColor   = C.white;
  let iconEl: React.ReactNode = null;

  if (isAnswered) {
    if (isCorrectOpt) {
      borderColor = C.success;
      bgColor     = C.successBg;
      textColor   = C.success;
      iconEl      = <CheckCircle size={18} color={C.success} />;
    } else if (isSelected && !isCorrect) {
      borderColor = C.red;
      bgColor     = C.redBg;
      textColor   = C.red;
      iconEl      = <XCircle size={18} color={C.red} />;
    }
  } else {
    // not answered — highlight on hover effect via activeOpacity
    borderColor = C.bgBorder;
  }

  const LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <TouchableOpacity
      style={[s.option, { borderColor, backgroundColor: bgColor }]}
      onPress={() => !isAnswered && onSelect(index)}
      activeOpacity={isAnswered ? 1 : 0.75}
    >
      {/* Letter badge */}
      <View style={[s.optLetter, {
        backgroundColor: isAnswered && isCorrectOpt
          ? `${C.success}30`
          : isAnswered && isSelected && !isCorrect
          ? `${C.red}30`
          : `${accentColor}18`,
        borderColor: isAnswered && isCorrectOpt
          ? `${C.success}60`
          : isAnswered && isSelected && !isCorrect
          ? `${C.red}60`
          : `${accentColor}35`,
      }]}>
        <Text style={[s.optLetterText, {
          color: isAnswered && isCorrectOpt
            ? C.success
            : isAnswered && isSelected && !isCorrect
            ? C.red
            : accentColor,
        }]}>{LETTERS[index]}</Text>
      </View>

      {/* Option text */}
      <Text style={[s.optText, { color: textColor, flex: 1 }]}>{label}</Text>

      {/* Icon */}
      {iconEl}
    </TouchableOpacity>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({
  current,
  total,
  answered,
  color,
}: {
  current: number;
  total: number;
  answered: number;
  color: string;
}) => (
  <View style={s.progressWrap}>
    <View style={s.progressTrack}>
      <View style={[s.progressFill, {
        width: `${(answered / total) * 100}%`,
        backgroundColor: color,
      }]} />
    </View>
    <Text style={s.progressText}>{current}/{total}</Text>
  </View>
);

// ─── Result Screen ────────────────────────────────────────────────────────────

const ResultScreen = ({
  questions,
  answers,
  courseColor,
  quizTitle,
  onRetry,
  onBack,
}: {
  questions: QuizQuestion[];
  answers: AnswerState[];
  courseColor: string;
  quizTitle: string;
  onRetry: () => void;
  onBack: () => void;
}) => {
  const correct   = answers.filter(a => a.isCorrect).length;
  const total     = questions.length;
  const score     = Math.round((correct / total) * 100);
  const scoreColor = score >= 75 ? C.success : score >= 50 ? C.gold : C.red;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={s.resultContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Score card */}
      <View style={[s.scoreCard, { borderColor: `${scoreColor}40` }]}>
        <Text style={s.scoreLabelText}>Your Score</Text>
        <Text style={[s.scoreNum, { color: scoreColor }]}>{score}%</Text>
        <Text style={s.scoreDetail}>{correct} correct out of {total} questions</Text>

        {/* Grade message */}
        <View style={[s.gradeBadge, { backgroundColor: `${scoreColor}18`, borderColor: `${scoreColor}35` }]}>
          <Text style={[s.gradeText, { color: scoreColor }]}>
            {score >= 85 ? '🏆 Excellent!' : score >= 70 ? '✅ Good Job!' : score >= 50 ? '📚 Keep Practicing' : '💪 Need More Practice'}
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        {[
          { label: 'Correct',   val: correct,        color: C.success },
          { label: 'Wrong',     val: total - correct, color: C.red    },
          { label: 'Flagged',   val: answers.filter(a => a.flagged).length, color: C.gold },
        ].map((stat, i) => (
          <View key={i} style={[s.statBox, { borderColor: `${stat.color}30` }]}>
            <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
            <Text style={s.statLbl}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Answer review */}
      <Text style={s.reviewTitle}>Answer Review</Text>
      {questions.map((q, i) => {
        const ans = answers[i];
        const isCorrect = ans.isCorrect;
        const dotColor = isCorrect ? C.success : C.red;
        return (
          <View key={q.id} style={[s.reviewItem, { borderColor: `${dotColor}25` }]}>
            <View style={[s.reviewDot, { backgroundColor: dotColor }]} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.reviewQ} numberOfLines={2}>{i + 1}. {q.question}</Text>
              <Text style={[s.reviewAns, { color: dotColor }]}>
                {isCorrect ? '✓ Correct' : `✗ Your answer: ${q.options[ans.selectedIndex ?? 0]}`}
              </Text>
              {!isCorrect && (
                <Text style={[s.reviewAns, { color: C.success }]}>
                  ✓ Correct: {q.options[q.correctIndex]}
                </Text>
              )}
              {q.explanation && (
                <View style={s.explanationBox}>
                  <Text style={s.explanationText}>{q.explanation}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Action buttons */}
      <View style={s.resultActions}>
        <TouchableOpacity style={[s.resultBtn, { backgroundColor: C.bgCard, borderColor: C.bgBorder }]} onPress={onRetry}>
          <RotateCcw size={16} color={C.muted} />
          <Text style={[s.resultBtnText, { color: C.muted }]}>Retry Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.resultBtn, { backgroundColor: courseColor }]} onPress={onBack}>
          <ArrowLeft size={16} color={C.bg} />
          <Text style={[s.resultBtnText, { color: C.bg }]}>Back to Chapters</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ─── Main QuizScreen ──────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuizScreen'>;
  route: RouteProp<RootStackParamList, 'QuizScreen'>;
};

export default function QuizScreen({ navigation, route }: Props) {
  const { quizTitle, courseColor, courseIcon, questions } =
    route.params as unknown as QuizScreenParams;

  const accentColor = courseColor ?? C.gold;

  // ── State ──
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(
    () => questions.map(() => ({ selectedIndex: null, isCorrect: null, flagged: false })),
  );
  const [showResult, setShowResult] = useState(false);

  // Shake animation for wrong answer
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const currentQ   = questions[currentIdx];
  const currentAns = answers[currentIdx];
  const isAnswered = currentAns.selectedIndex !== null;
  const answeredCount = answers.filter(a => a.selectedIndex !== null).length;

  // ── Select answer ──
  const handleSelect = useCallback((index: number) => {
    const isCorrect = index === currentQ.correctIndex;

    setAnswers(prev => {
        const updated = [...prev];
        updated[currentIdx] = { ...updated[currentIdx], selectedIndex: index, isCorrect };
        return updated;
    });

    if (isCorrect) {
        // ✅ Correct — audio play karo
        const sound = new Sound('Correct.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (!error) sound.play(() => sound.release());
        });
    } else {
        // ❌ Wrong — audio + haptic
        shake();

        const sound = new Sound('Incorrect.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (!error) sound.play(() => sound.release());
        });

        ReactNativeHapticFeedback.trigger('notificationError', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
        });
    }
    }, [currentIdx, currentQ]);

  // ── Flag question ──
  const handleFlag = () => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentIdx] = { ...updated[currentIdx], flagged: !updated[currentIdx].flagged };
      return updated;
    });
  };

  // ── Navigate ──
  const goNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
    else setShowResult(true);
  };
  const goPrev = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1); };

  // ── Retry ──
  const handleRetry = () => {
    setAnswers(questions.map(() => ({ selectedIndex: null, isCorrect: null, flagged: false })));
    setCurrentIdx(0);
    setShowResult(false);
  };

  // ─── Result screen ─────────────────────────────────────────────────────────
  if (showResult) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        {/* Result header */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={18} color={C.white} />
          </TouchableOpacity>
          <Text style={s.topBarTitle} numberOfLines={1}>Results</Text>
          <View style={s.iconBtn} />
        </View>
        <ResultScreen
          questions={questions}
          answers={answers}
          courseColor={accentColor}
          quizTitle={quizTitle}
          onRetry={handleRetry}
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  // ─── Quiz screen ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={C.white} />
        </TouchableOpacity>
        <Text style={s.topBarTitle} numberOfLines={1}>{quizTitle}</Text>
        <TouchableOpacity style={s.iconBtn} onPress={handleFlag}>
          <Flag
            size={18}
            color={currentAns.flagged ? C.gold : C.mutedDark}
            fill={currentAns.flagged ? C.gold : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* ── Progress bar ── */}
      <ProgressBar
        current={currentIdx + 1}
        total={questions.length}
        answered={answeredCount}
        color={accentColor}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── Chapter / topic tag ── */}
        {(currentQ.chapterTitle || currentQ.topicTag) && (
          <View style={s.tagRow}>
            {currentQ.chapterTitle && (
              <View style={[s.tag, { backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30` }]}>
                <BookOpen size={10} color={accentColor} />
                <Text style={[s.tagText, { color: accentColor }]}>{currentQ.chapterTitle}</Text>
              </View>
            )}
            {currentQ.topicTag && (
              <View style={[s.tag, { backgroundColor: `${C.muted}12`, borderColor: `${C.muted}25` }]}>
                <Text style={[s.tagText, { color: C.muted }]}>{currentQ.topicTag}</Text>
              </View>
            )}
            {currentQ.year && (
              <View style={[s.tag, { backgroundColor: `${C.gold}15`, borderColor: `${C.gold}30` }]}>
                <Text style={[s.tagText, { color: C.gold }]}>PYQ {currentQ.year}</Text>
              </View>
            )}
            {currentQ.difficultyLevel && (
              <View style={[s.tag, {
                backgroundColor: currentQ.difficultyLevel === 'easy' ? `${C.success}15` : currentQ.difficultyLevel === 'medium' ? `${C.gold}15` : `${C.red}15`,
                borderColor: currentQ.difficultyLevel === 'easy' ? `${C.success}30` : currentQ.difficultyLevel === 'medium' ? `${C.gold}30` : `${C.red}30`,
              }]}>
                <Text style={[s.tagText, {
                  color: currentQ.difficultyLevel === 'easy' ? C.success : currentQ.difficultyLevel === 'medium' ? C.gold : C.red,
                  textTransform: 'capitalize',
                }]}>{currentQ.difficultyLevel}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Question number ── */}
        <Text style={[s.qNum, { color: accentColor }]}>Q{currentIdx + 1}</Text>

        {/* ── Question text ── */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <Text style={s.questionText}>{currentQ.question}</Text>
        </Animated.View>

        {/* ── Options ── */}
        <View style={s.optionsWrap}>
          {currentQ.options.map((opt, i) => (
            <OptionButton
              key={i}
              label={opt}
              index={i}
              answerState={currentAns}
              correctIndex={currentQ.correctIndex}
              accentColor={accentColor}
              onSelect={handleSelect}
            />
          ))}
        </View>

        {/* ── Explanation (after answer) ── */}
        {isAnswered && currentQ.explanation && (
          <View style={s.explanation}>
            <Text style={s.explanationLabel}>📖 Explanation</Text>
            <Text style={s.explanationBody}>{currentQ.explanation}</Text>
          </View>
        )}

        {/* ── Bottom nav ── */}
        <View style={s.navRow}>
          <TouchableOpacity
            style={[s.navBtn, currentIdx === 0 && s.navBtnDisabled]}
            onPress={goPrev}
            disabled={currentIdx === 0}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color={currentIdx === 0 ? C.mutedDark : C.white} />
            <Text style={[s.navBtnText, currentIdx === 0 && { color: C.mutedDark }]}>Prev</Text>
          </TouchableOpacity>

          {/* Dot indicators — max 7 visible */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dotsScroll}>
            <View style={s.dotsWrap}>
              {questions.slice(
                Math.max(0, currentIdx - 3),
                Math.min(questions.length, currentIdx + 4),
              ).map((_, i) => {
                const realIdx = Math.max(0, currentIdx - 3) + i;
                const ans = answers[realIdx];
                const dotColor = ans.selectedIndex === null
                  ? C.bgBorder
                  : ans.isCorrect ? C.success : C.red;
                return (
                  <TouchableOpacity
                    key={realIdx}
                    onPress={() => setCurrentIdx(realIdx)}
                    style={[
                      s.dot,
                      { backgroundColor: dotColor },
                      realIdx === currentIdx && { width: 20, borderColor: accentColor, borderWidth: 1.5 },
                    ]}
                  />
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[s.navBtn, s.navBtnNext, { backgroundColor: isAnswered ? accentColor : C.bgCard, borderColor: isAnswered ? accentColor : C.bgBorder }]}
            onPress={goNext}
            activeOpacity={0.8}
          >
            <Text style={[s.navBtnText, { color: isAnswered ? C.bg : C.mutedDark, fontWeight: '700' }]}>
              {currentIdx === questions.length - 1 ? 'Finish' : 'Next'}
            </Text>
            <ArrowRight size={18} color={isAnswered ? C.bg : C.mutedDark} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.bgBorder, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: C.white, textAlign: 'center' },

  progressWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  progressTrack: { flex: 1, height: 4, backgroundColor: C.bgCard, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 11, fontWeight: '700', color: C.muted, minWidth: 36, textAlign: 'right' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16, marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  tagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  qNum: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  questionText: { fontSize: 17, fontWeight: '700', color: C.white, lineHeight: 26, marginBottom: 24, letterSpacing: -0.2, fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif-condensed' },

  optionsWrap: { gap: 10, marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  optLetter: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLetterText: { fontSize: 13, fontWeight: '800' },
  optText: { fontSize: 14, fontWeight: '500', lineHeight: 20, color: C.white },

  explanation: { backgroundColor: `${C.gold}10`, borderRadius: 14, borderWidth: 1, borderColor: `${C.gold}25`, padding: 14, marginBottom: 20, gap: 6 },
  explanationLabel: { fontSize: 12, fontWeight: '700', color: C.gold },
  explanationBody: { fontSize: 13, color: C.muted, lineHeight: 20, fontWeight: '400' },

  navRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.bgBorder, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  navBtnNext: { paddingHorizontal: 20 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 13, fontWeight: '600', color: C.white },

  dotsScroll: { flex: 1 },
  dotsWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Result screen
  resultContent: { paddingHorizontal: 16, paddingBottom: 40 },
  scoreCard: { backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 16, marginTop: 8, gap: 8 },
  scoreLabelText: { fontSize: 13, color: C.muted, fontWeight: '600' },
  scoreNum: { fontSize: 56, fontWeight: '900', letterSpacing: -2, lineHeight: 64 },
  scoreDetail: { fontSize: 13, color: C.muted, fontWeight: '500' },
  gradeBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  gradeText: { fontSize: 14, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 11, color: C.muted, fontWeight: '600' },

  reviewTitle: { fontSize: 16, fontWeight: '800', color: C.white, marginBottom: 12 },
  reviewItem: { flexDirection: 'row', gap: 12, backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  reviewDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  reviewQ: { fontSize: 13, color: C.white, fontWeight: '600', lineHeight: 18 },
  reviewAns: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  explanationBox: { backgroundColor: `${C.gold}10`, borderRadius: 8, borderWidth: 1, borderColor: `${C.gold}20`, padding: 8, marginTop: 4 },
  explanationText: { fontSize: 11, color: C.muted, lineHeight: 16 },

  resultActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  resultBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1 },
  resultBtnText: { fontSize: 14, fontWeight: '700' },
});