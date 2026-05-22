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
import {
  Bell,
  Megaphone,
  Pin,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Calendar,
  Trophy,
  Zap,
  FileText,
  Star,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  navy: '#0F1923',
  navyMid: '#1A2B3C',
  navyLight: '#243447',
  navyCard: '#1E2F42',
  gold: '#F59E0B',
  goldLight: '#FCD34D',
  goldDark: '#D97706',
  white: '#FFFFFF',
  offWhite: '#F1F5F9',
  muted: '#94A3B8',
  mutedDark: '#64748B',
  success: '#10B981',
  purple: '#8B5CF6',
  teal: '#0D9488',
  red: '#EF4444',
  orange: '#F97316',
} as const;

// ─── Data ─────────────────────────────────────────────────────────────────────

type AnnouncementCategory = 'exam' | 'update' | 'result' | 'tip' | 'event';

type Announcement = {
  id: string;
  category: AnnouncementCategory;
  title: string;
  body: string;
  date: string;
  pinned?: boolean;
  isNew?: boolean;
};

const CATEGORY_CONFIG: Record<AnnouncementCategory, { label: string; color: string; icon: any }> = {
  exam:   { label: 'EXAM ALERT',  color: COLORS.red,     icon: AlertCircle },
  update: { label: 'APP UPDATE',  color: COLORS.teal,    icon: Zap         },
  result: { label: 'RESULTS',     color: COLORS.gold,    icon: Trophy      },
  tip:    { label: 'PRO TIP',     color: COLORS.purple,  icon: Star        },
  event:  { label: 'EVENT',       color: COLORS.orange,  icon: Calendar    },
};

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    category: 'exam',
    title: 'DGMS Mining Mate Exam 2026 — Date Announced',
    body: 'The DGMS has officially announced the Mining Mate 2nd Class Certificate exam scheduled for 10 June 2026. Registration closes on 25 May. Check official DGMS portal for details.',
    date: 'Today, 9:00 AM',
    pinned: true,
    isNew: true,
  },
  {
    id: '2',
    category: 'update',
    title: 'New PYQ 2025 Papers Added — 350+ Questions',
    body: 'We have added complete Previous Year Question papers for 2025 with detailed explanations. Covers all 4 certificate levels — Mining Mate, Overman, Sirdar, and Manager.',
    date: 'Yesterday',
    isNew: true,
  },
  {
    id: '3',
    category: 'result',
    title: 'Leaderboard Reset — New Season Started',
    body: 'The weekly leaderboard has been reset. A fresh season begins today. Top 10 scorers from last week have been awarded 500 bonus diamonds each. Congratulations to all winners!',
    date: '18 May',
    isNew: false,
  },
  {
    id: '4',
    category: 'tip',
    title: 'CMR Regulation 104 — Most Asked in Exams',
    body: 'Regulation 104 of CMR 2017 regarding duties of Manager has appeared in 80% of past exams. Make sure you know it word-by-word. Check the Regulations section for a detailed breakdown.',
    date: '17 May',
    isNew: false,
  },
  {
    id: '5',
    category: 'event',
    title: 'Free Live Doubt Session — 22 May, 7 PM',
    body: 'Join our free live doubt-clearing session on Ventilation and Explosives — the two most challenging topics for Mining Mate & Overman exams. Register via the link in the app.',
    date: '16 May',
    isNew: false,
  },
  {
    id: '6',
    category: 'update',
    title: 'Formula Calculator Updated — 12 New Formulas',
    body: 'The Formula Calculator now includes 12 new mining engineering formulas including airflow, methane dilution, and blast radius calculations. Available in Quick Access → Formulas.',
    date: '14 May',
    isNew: false,
  },
  {
    id: '7',
    category: 'tip',
    title: 'Study Strategy: 30 Questions/Day Target',
    body: 'Data from top scorers shows that consistent practice of 30 questions/day for 30 days leads to 85%+ scores. Use the Daily Goal feature in the home screen to track your progress.',
    date: '12 May',
    isNew: false,
  },
  {
    id: '8',
    category: 'result',
    title: 'May Mock Test Results — Top Scorers',
    body: 'The May Full Mock Test results are out! Average score was 73%. Top scorers: Aarti (94%), NoProcastination (91%), Dr. Manju Rani (89%). Well done to everyone who participated.',
    date: '10 May',
    isNew: false,
  },
];

const FILTER_TABS: { key: AnnouncementCategory | 'all'; label: string }[] = [
  { key: 'all',    label: 'All'      },
  { key: 'exam',   label: '🚨 Exam'  },
  { key: 'update', label: '⚡ Update' },
  { key: 'result', label: '🏆 Result' },
  { key: 'tip',    label: '💡 Tips'  },
  { key: 'event',  label: '📅 Events' },
];

// ─── Pinned Banner ────────────────────────────────────────────────────────────
const PinnedBanner = ({ item }: { item: Announcement }) => {
  const cfg = CATEGORY_CONFIG[item.category];
  const Icon = cfg.icon;

  return (
    <TouchableOpacity style={pinnedStyles.wrap} activeOpacity={0.85}>
      <View style={pinnedStyles.topRow}>
        <Pin size={12} color={COLORS.gold} fill={COLORS.gold} />
        <Text style={pinnedStyles.pinnedLabel}>PINNED</Text>
        <View style={[pinnedStyles.catBadge, { backgroundColor: `${cfg.color}20`, borderColor: `${cfg.color}40` }]}>
          <Icon size={10} color={cfg.color} />
          <Text style={[pinnedStyles.catText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <View style={pinnedStyles.newBadge}>
          <Text style={pinnedStyles.newText}>NEW</Text>
        </View>
      </View>

      <Text style={pinnedStyles.title}>{item.title}</Text>
      <Text style={pinnedStyles.body} numberOfLines={2}>{item.body}</Text>

      <View style={pinnedStyles.footer}>
        <Text style={pinnedStyles.date}>{item.date}</Text>
        <View style={pinnedStyles.readMore}>
          <Text style={pinnedStyles.readMoreText}>Read more</Text>
          <ChevronRight size={12} color={COLORS.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const pinnedStyles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.navyCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}40`,
    padding: 16,
    marginBottom: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinnedLabel: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: '800',
    letterSpacing: 0.8,
    flex: 1,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  catText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  newBadge: {
    backgroundColor: COLORS.red,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newText: { fontSize: 9, color: COLORS.white, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontSize: 14, fontWeight: '800', color: COLORS.white, lineHeight: 20 },
  body: { fontSize: 12, color: COLORS.muted, lineHeight: 18, fontWeight: '400' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  date: { fontSize: 11, color: COLORS.mutedDark, fontWeight: '500' },
  readMore: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  readMoreText: { fontSize: 12, color: COLORS.gold, fontWeight: '700' },
});

// ─── Announcement Card ────────────────────────────────────────────────────────
const AnnouncementCard = ({ item }: { item: Announcement }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = CATEGORY_CONFIG[item.category];
  const Icon = cfg.icon;

  return (
    <TouchableOpacity
      style={cardStyles.wrap}
      activeOpacity={0.85}
      onPress={() => setExpanded(p => !p)}
    >
      {/* Left accent */}
      <View style={[cardStyles.accent, { backgroundColor: cfg.color }]} />

      <View style={cardStyles.content}>
        {/* Top row */}
        <View style={cardStyles.topRow}>
          <View style={[cardStyles.iconBox, { backgroundColor: `${cfg.color}18` }]}>
            <Icon size={14} color={cfg.color} />
          </View>
          <View style={[cardStyles.catChip, { borderColor: `${cfg.color}40` }]}>
            <Text style={[cardStyles.catText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {item.isNew && (
            <View style={cardStyles.newDot} />
          )}
          <Text style={cardStyles.date}>{item.date}</Text>
        </View>

        {/* Title */}
        <Text style={cardStyles.title} numberOfLines={expanded ? undefined : 2}>
          {item.title}
        </Text>

        {/* Body — shown when expanded */}
        {expanded && (
          <Text style={cardStyles.body}>{item.body}</Text>
        )}

        {/* Footer */}
        <TouchableOpacity
          style={cardStyles.footer}
          onPress={() => setExpanded(p => !p)}
        >
          <Text style={cardStyles.readText}>
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.navyCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accent: { width: 4 },
  content: { flex: 1, padding: 14, gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBox: {
    width: 26, height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  catText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  newDot: {
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  date: { flex: 1, textAlign: 'right', fontSize: 10, color: COLORS.mutedDark, fontWeight: '500' },
  title: { fontSize: 13, fontWeight: '700', color: COLORS.white, lineHeight: 19 },
  body: { fontSize: 12, color: COLORS.muted, lineHeight: 18, fontWeight: '400' },
  footer: { alignSelf: 'flex-start' },
  readText: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },
});

// ─── Stats Strip ──────────────────────────────────────────────────────────────
const StatsStrip = () => (
  <View style={stripStyles.wrap}>
    {[
      { val: '8',    lbl: 'Announcements', color: COLORS.gold   },
      { val: '2',    lbl: 'Unread',        color: COLORS.red    },
      { val: '1',    lbl: 'Pinned',        color: COLORS.teal   },
    ].map((s, i, arr) => (
      <React.Fragment key={s.lbl}>
        <View style={stripStyles.item}>
          <Text style={[stripStyles.val, { color: s.color }]}>{s.val}</Text>
          <Text style={stripStyles.lbl}>{s.lbl}</Text>
        </View>
        {i < arr.length - 1 && <View style={stripStyles.div} />}
      </React.Fragment>
    ))}
  </View>
);

const stripStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.navyCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
    paddingVertical: 12,
    marginBottom: 14,
  },
  item: { flex: 1, alignItems: 'center' },
  val: { fontSize: 20, fontWeight: '800' },
  lbl: { fontSize: 10, color: COLORS.mutedDark, fontWeight: '600', marginTop: 1 },
  div: { width: 1, backgroundColor: COLORS.navyLight, marginVertical: 4 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AnnouncementScreen() {
  const [activeFilter, setActiveFilter] = useState<AnnouncementCategory | 'all'>('all');

  const pinnedItems = ANNOUNCEMENTS.filter(a => a.pinned);
  const filtered = ANNOUNCEMENTS.filter(a =>
    !a.pinned && (activeFilter === 'all' || a.category === activeFilter)
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerSub}>Updates & Announcements</Text>
        </View>
        <View style={styles.bellWrap}>
          <Bell size={20} color={COLORS.muted} />
          <View style={styles.bellDot} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterChip,
                activeFilter === tab.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === tab.key && styles.filterChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pinned */}
        {pinnedItems.map(item => (
          <PinnedBanner key={item.id} item={item} />
        ))}

        {/* Feed */}
        <View style={styles.feedHeader}>
          <Megaphone size={14} color={COLORS.muted} />
          <Text style={styles.feedLabel}>
            {filtered.length} announcement{filtered.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {filtered.map(item => (
          <AnnouncementCard key={item.id} item={item} />
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 15,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: COLORS.muted, fontWeight: '500', marginTop: 2 },
  bellWrap: { position: 'relative' },
  bellDot: {
    position: 'absolute',
    top: -2, right: -2,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  filterRow: { gap: 8, marginBottom: 16, paddingBottom: 2 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.navyLight,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
  },
  filterChipActive: {
    backgroundColor: `${COLORS.gold}20`,
    borderColor: `${COLORS.gold}60`,
  },
  filterChipText: { fontSize: 12, color: COLORS.mutedDark, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.gold },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  feedLabel: { fontSize: 12, color: COLORS.mutedDark, fontWeight: '600' },
});