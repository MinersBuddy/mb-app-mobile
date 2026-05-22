import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, {
  Polygon,
  Circle,
  Line,
  Text as SvgText,
  G,
} from 'react-native-svg';
import {
  TrendingUp,
  Flame,
  ChevronRight,
  BarChart2,
  BookOpen,
  Target,
  Zap,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react-native';

const { width: SW } = Dimensions.get('window');

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#0F1923',
  bgMid:     '#1A2B3C',
  bgLight:   '#243447',
  bgCard:    '#1E2F42',
  gold:      '#F59E0B',
  goldGlow:  '#F59E0B18',
  white:     '#FFFFFF',
  offWhite:  '#F1F5F9',
  muted:     '#94A3B8',
  mutedDark: '#64748B',
  success:   '#10B981',
  purple:    '#8B5CF6',
  teal:      '#0D9488',
  red:       '#EF4444',
  orange:    '#F97316',
} as const;

// ─── Data ──────────────────────────────────────────────────────────────────────
const WEEKLY_SCORES = [62, 75, 58, 88, 72, 91, 85];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STREAK_DAYS = [true, true, true, false, true, true, true];

const SUBJECTS = [
  {
    id: 1,
    name: 'CMR',
    fullName: 'CMR Regulations',
    score: 88,
    color: C.gold,
    icon: BookOpen,
    totalQs: 45,
    attempted: 40,
    strong: ['General Provisions Ch 1-3', 'Manager Duties', 'Survey Requirements'],
    weak:   ['Haulage Rules Ch 8', 'Timbering Regulations'],
  },
  {
    id: 2,
    name: 'MMR',
    fullName: 'MMR Regulations',
    score: 74,
    color: C.teal,
    icon: Target,
    totalQs: 38,
    attempted: 28,
    strong: ['Safety Officer Rules', 'Inspection Procedures'],
    weak:   ['Electricity Regulations', 'Winding Rules', 'Ch 5 Machinery'],
  },
  {
    id: 3,
    name: 'Safety',
    fullName: 'Mine Safety',
    score: 91,
    color: C.success,
    icon: BarChart2,
    totalQs: 52,
    attempted: 47,
    strong: ['First Aid Procedures', 'Accident Reporting', 'PPE Standards'],
    weak:   ['Rescue Operations Timeline'],
  },
  {
    id: 4,
    name: 'Vent.',
    fullName: 'Ventilation',
    score: 65,
    color: C.purple,
    icon: Zap,
    totalQs: 35,
    attempted: 23,
    strong: ['Natural Ventilation Basics', 'Air Volume Calc'],
    weak:   ['Auxiliary Fan Systems', 'Gas Detection', 'Recirculation Rules', 'Pressure Calc'],
  },
  {
    id: 5,
    name: 'Explos.',
    fullName: 'Explosives',
    score: 79,
    color: C.orange,
    icon: Flame,
    totalQs: 40,
    attempted: 32,
    strong: ['Shot Firing Procedures', 'Detonator Types', 'Storage Rules'],
    weak:   ['Misfire Handling', 'Electronic Detonators'],
  },
];



// ─── Radar Chart ──────────────────────────────────────────────────────────────
const RadarChart = ({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (id: number) => void;
}) => {
  const size   = SW - 64;
  const cx     = size / 2;
  const cy     = size / 2;
  const R      = size / 2 - 44;
  const n      = SUBJECTS.length;

  const getPoint = (i: number, radius: number) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const levels   = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = SUBJECTS.map((s, i) => getPoint(i, (s.score / 100) * R));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={rss.wrap}>
      {/* Title */}
      <View style={rss.titleRow}>
        <View>
          <Text style={rss.title}>Subject Radar</Text>
          <Text style={rss.sub}>Tap a point to see breakdown</Text>
        </View>
        <View style={rss.avgBadge}>
          <Text style={rss.avgText}>Avg {Math.round(SUBJECTS.reduce((a,s)=>a+s.score,0)/SUBJECTS.length)}%</Text>
        </View>
      </View>

      {/* SVG Radar */}
      <Svg width={size} height={size} style={{ alignSelf: 'center' }}>
        {/* Grid rings */}
        {levels.map((lvl, li) => {
          const pts = SUBJECTS.map((_, i) => {
            const p = getPoint(i, lvl * R);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <Polygon
              key={`grid-${li}`}
              points={pts}
              fill="none"
              stroke={li === 3 ? C.bgLight : C.bgMid}
              strokeWidth={li === 3 ? 1.5 : 1}
            />
          );
        })}

        {/* Axis lines */}
        {SUBJECTS.map((_, i) => {
          const p = getPoint(i, R);
          return (
            <Line key={`ax-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke={C.bgLight} strokeWidth={1} />
          );
        })}

        {/* % labels on 50% ring */}
        {[25, 50, 75, 100].map((pct, li) => {
          const p = getPoint(0, (pct / 100) * R);
          return (
            <SvgText key={`ring-lbl-${li}`} x={p.x + 4} y={p.y - 3}
              fontSize={7} fill={C.mutedDark} fontWeight="600">
              {pct}
            </SvgText>
          );
        })}

        {/* Data polygon fill */}
        <Polygon
          points={dataPolygon}
          fill={`${C.gold}20`}
          stroke={C.gold}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points (tappable) */}
        {dataPoints.map((p, i) => {
          const s = SUBJECTS[i];
          const isSel = selectedId === s.id;
          return (
            <G key={`pt-${i}`} onPress={() => onSelect(s.id)}>
              <Circle cx={p.x} cy={p.y} r={isSel ? 10 : 6}
                fill={s.color} stroke={C.bg} strokeWidth={2} />
              {isSel && (
                <Circle cx={p.x} cy={p.y} r={14}
                  fill="none" stroke={`${s.color}50`} strokeWidth={1.5} />
              )}
            </G>
          );
        })}

        {/* Axis labels */}
        {SUBJECTS.map((s, i) => {
          const p = getPoint(i, R + 22);
          const isSel = selectedId === s.id;
          return (
            <G key={`lbl-${i}`} onPress={() => onSelect(s.id)}>
              <SvgText x={p.x} y={p.y + 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight="800"
                fill={isSel ? s.color : C.muted}>
                {s.name}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

const rss = StyleSheet.create({
  wrap: {
    backgroundColor: C.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.bgLight,
    padding: 18,
    marginBottom: 14,
  },
  titleRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title:     { fontSize: 15, fontWeight: '800', color: C.white },
  sub:       { fontSize: 11, color: C.mutedDark, marginTop: 2 },
  avgBadge:  { backgroundColor: `${C.gold}18`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: `${C.gold}30` },
  avgText:   { fontSize: 11, color: C.gold, fontWeight: '800' },
  legend:    { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 10 },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText:  { fontSize: 10, fontWeight: '700', color: C.mutedDark },
});

// ─── Subject Detail Panel ─────────────────────────────────────────────────────
const SubjectDetail = ({
  subject,
  onClose,
}: {
  subject: typeof SUBJECTS[0];
  onClose: () => void;
}) => {
  const Icon = subject.icon;
  const scoreColor = subject.score >= 80 ? C.success : subject.score >= 65 ? C.orange : C.red;

  return (
    <View style={[sdss.wrap, { borderColor: `${subject.color}35` }]}>
      {/* Header */}
      <View style={sdss.header}>
        <View style={[sdss.iconBox, { backgroundColor: `${subject.color}18` }]}>
          <Icon size={18} color={subject.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={sdss.name}>{subject.fullName}</Text>
          <Text style={sdss.meta}>{subject.attempted}/{subject.totalQs} questions attempted</Text>
        </View>
        <Text style={[sdss.scoreNum, { color: scoreColor }]}>{subject.score}%</Text>
        <TouchableOpacity onPress={onClose} style={sdss.closeBtn}>
          <X size={14} color={C.mutedDark} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={sdss.track}>
        <View style={[sdss.fill, { width: `${subject.score}%`, backgroundColor: subject.color }]} />
      </View>

      {/* Strong areas */}
      <View style={sdss.section}>
        <View style={sdss.sectionHead}>
          <CheckCircle size={12} color={C.success} />
          <Text style={[sdss.sectionTitle, { color: C.success }]}>Strong Areas</Text>
        </View>
        {subject.strong.map((area, i) => (
          <View key={i} style={sdss.areaRow}>
            <View style={[sdss.dot, { backgroundColor: C.success }]} />
            <Text style={sdss.areaText}>{area}</Text>
          </View>
        ))}
      </View>

      {/* Weak areas */}
      <View style={sdss.section}>
        <View style={sdss.sectionHead}>
          <AlertCircle size={12} color={C.red} />
          <Text style={[sdss.sectionTitle, { color: C.red }]}>Needs Work</Text>
        </View>
        {subject.weak.map((area, i) => (
          <View key={i} style={sdss.areaRow}>
            <View style={[sdss.dot, { backgroundColor: C.red }]} />
            <Text style={sdss.areaText}>{area}</Text>
            <TouchableOpacity style={sdss.practiceBtn} activeOpacity={0.8}>
              <Text style={sdss.practiceTxt}>Practice →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const sdss = StyleSheet.create({
  wrap: {
    backgroundColor: C.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox:      { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name:         { fontSize: 14, fontWeight: '800', color: C.white },
  meta:         { fontSize: 10, color: C.mutedDark, marginTop: 2 },
  scoreNum:     { fontSize: 22, fontWeight: '800' },
  closeBtn:     { width: 28, height: 28, borderRadius: 14, backgroundColor: C.bgLight, alignItems: 'center', justifyContent: 'center' },
  track:        { height: 6, backgroundColor: C.bgLight, borderRadius: 3, overflow: 'hidden' },
  fill:         { height: '100%', borderRadius: 3 },
  section:      { gap: 8 },
  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  areaRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4 },
  dot:          { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  areaText:     { flex: 1, fontSize: 12, color: C.offWhite, fontWeight: '500', lineHeight: 18 },
  practiceBtn:  { backgroundColor: `${C.red}20`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  practiceTxt:  { fontSize: 9, color: C.red, fontWeight: '700' },
});

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, sub, color,
}: { label: string; value: string; sub: string; color: string }) => (
  <View style={[scss.card, { borderColor: `${color}30` }]}>
    <Text style={[scss.value, { color }]}>{value}</Text>
    <Text style={scss.label}>{label}</Text>
    <Text style={scss.sub}>{sub}</Text>
  </View>
);

const scss = StyleSheet.create({
  card:    { flex: 1, backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', gap: 4 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  value:   { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  label:   { fontSize: 11, color: C.white, fontWeight: '700', textAlign: 'center' },
  sub:     { fontSize: 10, color: C.mutedDark, fontWeight: '500', textAlign: 'center' },
});

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────
const WeeklyBarChart = () => {
  const max = Math.max(...WEEKLY_SCORES);
  return (
    <View style={wcss.wrap}>
      <View style={wcss.header}>
        <Text style={wcss.title}>Weekly Score Trend</Text>
        <View style={wcss.badge}>
          <TrendingUp size={11} color={C.success} />
          <Text style={wcss.badgeText}>+12% this week</Text>
        </View>
      </View>
      <View style={wcss.bars}>
        {WEEKLY_SCORES.map((score, i) => {
          const pct = (score / max) * 100;
          const isToday = i === 6;
          return (
            <View key={i} style={wcss.barCol}>
              <Text style={wcss.scoreLabel}>{isToday ? score : ''}</Text>
              <View style={wcss.barTrack}>
                <View style={[wcss.barFill, {
                  height: `${pct}%`,
                  backgroundColor: isToday ? C.gold : `${C.gold}35`,
                }]} />
              </View>
              <Text style={[wcss.dayLabel, isToday && { color: C.gold }]}>{DAYS[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const wcss = StyleSheet.create({
  wrap:       { backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, borderColor: C.bgLight, padding: 18, marginBottom: 14 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title:      { fontSize: 15, fontWeight: '800', color: C.white },
  badge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${C.success}18`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: `${C.success}30` },
  badgeText:  { fontSize: 10, color: C.success, fontWeight: '700' },
  bars:       { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6 },
  barCol:     { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 },
  scoreLabel: { fontSize: 9, color: C.gold, fontWeight: '700', height: 14 },
  barTrack:   { flex: 1, width: '70%', backgroundColor: C.bgLight, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill:    { width: '100%', borderRadius: 4 },
  dayLabel:   { fontSize: 10, color: C.mutedDark, fontWeight: '600' },
});

// ─── Streak Card ──────────────────────────────────────────────────────────────
const StreakCard = () => (
  <View style={stss.wrap}>
    <View style={stss.left}>
      <View style={stss.flameRow}>
        <Flame size={22} color={C.orange} fill={C.orange} />
        <Text style={stss.num}>6</Text>
      </View>
      <Text style={stss.label}>Day Streak 🔥</Text>
      <Text style={stss.sub}>Keep it going, don't break it!</Text>
    </View>
    <View style={stss.dots}>
      {STREAK_DAYS.map((active, i) => (
        <View key={i} style={[stss.dot,
          active
            ? { backgroundColor: C.orange, borderColor: C.orange }
            : { backgroundColor: C.bgLight, borderColor: C.bgLight }
        ]}>
          <Text style={{ fontSize: 8, color: active ? C.white : C.mutedDark }}>{DAYS[i]}</Text>
        </View>
      ))}
    </View>
  </View>
);

const stss = StyleSheet.create({
  wrap:     { backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, borderColor: `${C.orange}30`, padding: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left:     { gap: 4 },
  flameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  num:      { fontSize: 28, fontWeight: '800', color: C.orange },
  label:    { fontSize: 14, fontWeight: '800', color: C.white },
  sub:      { fontSize: 11, color: C.mutedDark, fontWeight: '500' },
  dots:     { flexDirection: 'row', gap: 6 },
  dot:      { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const selectedSubject = SUBJECTS.find(s => s.id === selectedSubjectId) ?? null;

  const handleSubjectSelect = (id: number) => {
    // Toggle: same id → deselect
    setSelectedSubjectId(prev => prev === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Top Stats */}
        <View style={styles.statsRow}>
          <StatCard  label="Avg Score"  value="81%"  sub="Last 10 tests"   color={C.gold}    />
          <StatCard  label="Accuracy"   value="78%"  sub="All questions"   color={C.teal}    />
          <StatCard  label="Questions"  value="1.2K" sub="Total solved"    color={C.purple}  />
        </View>

        {/* ── Radar Chart ── */}
        <RadarChart
          selectedId={selectedSubjectId}
          onSelect={handleSubjectSelect}
        />

        {/* ── Subject Detail Panel — shows when a subject is tapped ── */}
        {selectedSubject && (
          <SubjectDetail
            subject={selectedSubject}
            onClose={() => setSelectedSubjectId(null)}
          />
        )}

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 16,
  },
  title:      { fontSize: 24, fontWeight: '800', color: C.white, letterSpacing: -0.5 },
  sub:        { fontSize: 13, color: C.muted, fontWeight: '500', marginTop: 2 },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.bg, fontWeight: '800', fontSize: 14 },
  scroll:     { paddingHorizontal: 16, paddingTop: 4 },
  statsRow:   { flexDirection: 'row', gap: 10, marginBottom: 14 , marginTop: 44},
});