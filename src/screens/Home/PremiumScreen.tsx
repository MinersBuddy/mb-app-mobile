import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Platform,
  Dimensions,
} from 'react-native';
import {
  Crown, Lock, Unlock, ChevronRight,
  ChevronDown, ChevronUp, Check, X,
  BookOpen, FileText, Zap, Eye,
  ShieldCheck, Scale, AlertTriangle,
  Layers, Lightbulb, HeartPulse, Cross,
  Flame, Pickaxe, Cpu, Monitor,
} from 'lucide-react-native';

const { width: SW } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#0D1117',
  bgCard:    '#161B22',
  bgRaised:  '#1C2128',
  border:    '#30363D',
  gold:      '#F59E0B',
  goldGlow:  '#F59E0B18',
  goldDim:   '#92600A',
  white:     '#F0F6FC',
  whiteD:    '#C9D1D9',
  muted:     '#8B949E',
  mutedD:    '#484F58',
  success:   '#3FB950',
  teal:      '#0D9488',
  purple:    '#8B5CF6',
  red:       '#F85149',
  orange:    '#F0883E',
  navy:      '#0D1117',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type SubTopic = {
  id: string;
  title: string;
  qs: number;
  locked: boolean;
};

type ContentSection = {
  id: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  color: string;
  totalQs: number;
  locked: boolean;
  preview?: boolean; // free preview available
  subTopics: SubTopic[];
};

// ─── Content Data ─────────────────────────────────────────────────────────────
// isPurchased — baad mein AsyncStorage/Firebase se load karna
const IS_PURCHASED = false;

const SECTIONS: ContentSection[] = [
  {
    id: 's1', icon: Monitor, title: 'Basic of Computer',
    color: '#F0883E', totalQs: 30, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's1a', title: 'Introduction to Computers', qs: 10, locked: !IS_PURCHASED },
      { id: 's1b', title: 'Hardware & Software',       qs: 10, locked: !IS_PURCHASED },
      { id: 's1c', title: 'MS Office Basics',          qs: 10, locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's2', icon: ShieldCheck, title: 'Mine Working & General Safety',
    color: '#3FB950', totalQs: 150, locked: false, preview: true,
    subTopics: [
      { id: 's2a', title: 'General Safety Rules',   qs: 50, locked: false },
      { id: 's2b', title: 'Accident Prevention',    qs: 60, locked: !IS_PURCHASED },
      { id: 's2c', title: 'Emergency Procedures',   qs: 40, locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's3', icon: Scale, title: 'Mine Legislation',
    color: '#3B82F6', totalQs: 155, locked: !IS_PURCHASED, preview: true,
    subTopics: [
      { id: 's3a', title: 'CMR 2017 — Part I',      qs: 50, locked: !IS_PURCHASED },
      { id: 's3b', title: 'CMR 2017 — Part II',     qs: 55, locked: !IS_PURCHASED },
      { id: 's3c', title: 'MMR 1961',                qs: 50, locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's4', icon: AlertTriangle, title: 'Traffic Rules',
    color: '#8B5CF6', totalQs: 12, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's4a', title: 'Road Safety Regulations', qs: 6,  locked: !IS_PURCHASED },
      { id: 's4b', title: 'Mine Traffic Management', qs: 6,  locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's5', icon: Layers, title: 'Plans & Section',
    color: '#F0883E', totalQs: 17, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's5a', title: 'Mine Survey Plans',       qs: 9,  locked: !IS_PURCHASED },
      { id: 's5b', title: 'Section Drawing',         qs: 8,  locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's6', icon: Lightbulb, title: 'Lighting',
    color: '#06B6D4', totalQs: 6, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's6a', title: 'Lighting Standards',      qs: 6,  locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's7', icon: HeartPulse, title: 'Mining Diseases',
    color: '#F85149', totalQs: 8, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's7a', title: 'Occupational Diseases',   qs: 8,  locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's8', icon: Cross, title: 'First Aid',
    color: '#92400E', totalQs: 26, locked: false, preview: true,
    subTopics: [
      { id: 's8a', title: 'Basic First Aid',         qs: 13, locked: false },
      { id: 's8b', title: 'Mine Emergency Aid',      qs: 13, locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's9', icon: Flame, title: 'Explosive & Shot Firing',
    color: '#6366F1', totalQs: 50, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's9a', title: 'Types of Explosives',     qs: 20, locked: !IS_PURCHASED },
      { id: 's9b', title: 'Shot Firing Rules',        qs: 30, locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's10', icon: Pickaxe, title: 'Method of Working',
    color: '#EA580C', totalQs: 21, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's10a', title: 'Opencast Methods',       qs: 11, locked: !IS_PURCHASED },
      { id: 's10b', title: 'Underground Methods',    qs: 10, locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's11', icon: Cpu, title: 'Element of Mining Machinery',
    color: '#0D9488', totalQs: 40, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's11a', title: 'Excavation Equipment',   qs: 20, locked: !IS_PURCHASED },
      { id: 's11b', title: 'Transport Machinery',    qs: 20, locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's12', icon: AlertTriangle, title: 'Precautions — Fire, Explosion & Inundation',
    color: '#F85149', totalQs: 16, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's12a', title: 'Fire Prevention',        qs: 6,  locked: !IS_PURCHASED },
      { id: 's12b', title: 'Explosion Safety',       qs: 5,  locked: !IS_PURCHASED },
      { id: 's12c', title: 'Inundation Control',     qs: 5,  locked: !IS_PURCHASED },
    ],
  },
  {
    id: 's13', icon: BookOpen, title: 'Abbreviation used in Mining',
    color: '#8B5CF6', totalQs: 181, locked: !IS_PURCHASED, preview: false,
    subTopics: [
      { id: 's13a', title: 'Common Abbreviations',   qs: 90, locked: !IS_PURCHASED },
      { id: 's13b', title: 'Technical Terms',        qs: 91, locked: !IS_PURCHASED },
    ],
  },
];

const FAQS = [
  { q: 'Can I cancel my subscription?',                  a: 'Yes, you can cancel anytime from your profile settings. No questions asked.' },
  { q: 'What is the validity of MinersBuddy Premium?',   a: 'Premium access is valid for 365 days from the date of purchase.' },
  { q: 'Will I get access to both CMR & MMR content?',   a: 'Yes, premium includes complete CMR 2017 and MMR 1961 content with explanations.' },
  { q: 'Can I share my account with someone?',            a: 'No, each account is personal. Sharing accounts violates our Terms of Service.' },
  { q: 'Is there any refund policy?',                    a: 'We offer a 7-day refund if you are not satisfied. Contact support@minersbuddy.com.' },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity style={faq.wrap} onPress={() => setOpen(p => !p)} activeOpacity={0.8}>
      <View style={faq.row}>
        <Text style={faq.q}>{q}</Text>
        {open ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
      </View>
      {open && <Text style={faq.a}>{a}</Text>}
    </TouchableOpacity>
  );
};

const faq = StyleSheet.create({
  wrap: { paddingHorizontal:16, paddingVertical:14 },
  row:  { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  q:    { flex:1, fontSize:13, fontWeight:'600', color:C.white, paddingRight:10, lineHeight:19 },
  a:    { fontSize:12, color:C.muted, marginTop:8, lineHeight:18, fontWeight:'400' },
});

// ─── Content Section Card ─────────────────────────────────────────────────────
const SectionCard = ({
  section,
  onPreview,
  onUnlock,
}: {
  section: ContentSection;
  onPreview: (s: ContentSection) => void;
  onUnlock: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = section.icon;
  const freeCount = section.subTopics.filter(t => !t.locked).length;

  return (
    <View style={sc.wrap}>
      {/* Section header */}
      <TouchableOpacity
        style={sc.header}
        onPress={() => setExpanded(p => !p)}
        activeOpacity={0.8}
      >
        <View style={[sc.iconBox, { backgroundColor: `${section.color}18` }]}>
          <Icon size={20} color={section.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={sc.title}>{section.title}</Text>
          <Text style={sc.meta}>
            {section.subTopics.length} topics · {section.totalQs} Qs
            {freeCount > 0 && !IS_PURCHASED
              ? ` · ${freeCount} free`
              : ''}
          </Text>
        </View>

        <View style={sc.rightRow}>
          {/* Preview button — only if preview available and not purchased */}
          {section.preview && !IS_PURCHASED && (
            <TouchableOpacity
              style={sc.previewBtn}
              onPress={() => onPreview(section)}
              activeOpacity={0.8}
            >
              <Eye size={13} color={C.teal} />
              <Text style={sc.previewText}>Preview</Text>
            </TouchableOpacity>
          )}

          {section.locked
            ? <Lock size={16} color={C.mutedD} />
            : <Unlock size={16} color={C.success} />
          }
          {expanded
            ? <ChevronUp size={16} color={C.muted} />
            : <ChevronDown size={16} color={C.muted} />
          }
        </View>
      </TouchableOpacity>

      {/* Sub-topics */}
      {expanded && (
        <View style={sc.subList}>
          {section.subTopics.map((sub, i) => (
            <TouchableOpacity
              key={sub.id}
              style={[sc.subRow, i < section.subTopics.length - 1 && sc.subBorder]}
              activeOpacity={sub.locked ? 1 : 0.75}
              onPress={sub.locked ? onUnlock : undefined}
            >
              <View style={[sc.subDot, { backgroundColor: sub.locked ? C.mutedD : section.color }]} />
              <Text style={[sc.subTitle, sub.locked && { color: C.mutedD }]} numberOfLines={1}>
                {sub.title}
              </Text>
              <Text style={sc.subQs}>{sub.qs} Qs</Text>
              {sub.locked
                ? <Lock size={13} color={C.mutedD} />
                : <ChevronRight size={13} color={section.color} />
              }
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const sc = StyleSheet.create({
  wrap:       { backgroundColor:C.bgCard, borderRadius:16, borderWidth:1, borderColor:C.border, marginBottom:10, overflow:'hidden' },
  header:     { flexDirection:'row', alignItems:'center', padding:14, gap:12 },
  iconBox:    { width:42, height:42, borderRadius:12, alignItems:'center', justifyContent:'center', flexShrink:0 },
  title:      { fontSize:13, fontWeight:'700', color:C.white, marginBottom:2 },
  meta:       { fontSize:11, color:C.muted, fontWeight:'500' },
  rightRow:   { flexDirection:'row', alignItems:'center', gap:8 },
  previewBtn: { flexDirection:'row', alignItems:'center', gap:3, backgroundColor:`${C.teal}18`, borderRadius:8, paddingHorizontal:8, paddingVertical:4, borderWidth:1, borderColor:`${C.teal}35` },
  previewText:{ fontSize:10, fontWeight:'700', color:C.teal },
  subList:    { borderTopWidth:1, borderTopColor:C.border },
  subRow:     { flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:16, paddingVertical:12 },
  subBorder:  { borderBottomWidth:1, borderBottomColor:`${C.border}60` },
  subDot:     { width:6, height:6, borderRadius:3, flexShrink:0 },
  subTitle:   { flex:1, fontSize:12, fontWeight:'600', color:C.white },
  subQs:      { fontSize:11, color:C.muted, fontWeight:'500' },
});

// ─── Preview Modal Banner ─────────────────────────────────────────────────────
const PreviewBanner = ({
  section,
  onClose,
  onUnlock,
}: {
  section: ContentSection | null;
  onClose: () => void;
  onUnlock: () => void;
}) => {
  if (!section) return null;
  const Icon = section.icon;
  const freeSubs = section.subTopics.filter(t => !t.locked);

  return (
    <View style={pb.overlay}>
      <View style={pb.sheet}>
        {/* Handle */}
        <View style={pb.handle} />

        {/* Header */}
        <View style={pb.header}>
          <View style={[pb.iconBox, { backgroundColor: `${section.color}20` }]}>
            <Icon size={22} color={section.color} />
          </View>
          <View style={{ flex:1 }}>
            <Text style={pb.title}>{section.title}</Text>
            <Text style={pb.sub}>Free Preview — {freeSubs.length} topic{freeSubs.length > 1 ? 's' : ''} available</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={pb.closeBtn}>
            <X size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* Locked hint */}
        <View style={pb.lockedHint}>
          <Lock size={14} color={C.mutedD} />
          <Text style={pb.lockedText}>
            {section.subTopics.length - freeSubs.length} more topics locked — unlock with Premium
          </Text>
        </View>

        {/* Unlock CTA */}
        <TouchableOpacity style={pb.unlockBtn} onPress={onUnlock} activeOpacity={0.85}>
          <Crown size={16} color={C.navy} />
          <Text style={pb.unlockText}>Unlock All for ₹1,999 →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const pb = StyleSheet.create({
  overlay:    { position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'#00000080', justifyContent:'flex-end' },
  sheet:      { backgroundColor:C.bgCard, borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom: Platform.OS === 'ios' ? 36 : 20 },
  handle:     { width:40, height:4, borderRadius:2, backgroundColor:C.border, alignSelf:'center', marginBottom:16 },
  header:     { flexDirection:'row', alignItems:'center', gap:12, marginBottom:16 },
  iconBox:    { width:46, height:46, borderRadius:12, alignItems:'center', justifyContent:'center' },
  title:      { fontSize:15, fontWeight:'800', color:C.white },
  sub:        { fontSize:11, color:C.muted, marginTop:2 },
  closeBtn:   { width:32, height:32, borderRadius:8, backgroundColor:C.bgRaised, alignItems:'center', justifyContent:'center' },
  topicRow:   { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:12 },
  topicBorder:{ borderBottomWidth:1, borderBottomColor:C.border },
  dot:        { width:7, height:7, borderRadius:4, flexShrink:0 },
  topicTitle: { flex:1, fontSize:13, fontWeight:'600', color:C.white },
  topicQs:    { fontSize:11, color:C.muted },
  lockedHint: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:C.bgRaised, borderRadius:10, padding:10, marginTop:12, marginBottom:16 },
  lockedText: { fontSize:11, color:C.mutedD, fontWeight:'500', flex:1 },
  unlockBtn:  { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:C.gold, borderRadius:14, paddingVertical:14 },
  unlockText: { fontSize:14, fontWeight:'800', color:C.navy },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PremiumScreen() {
  const [previewSection, setPreviewSection] = useState<ContentSection | null>(null);
  const totalQs = SECTIONS.reduce((s, c) => s + c.totalQs, 0);

  return (
    <View style={main.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={main.scroll}>

        {/* ── Hero ── */}
        <View style={main.hero}>
          <View style={main.heroBadge}>
            <Crown size={14} color={C.gold} />
            <Text style={main.heroBadgeText}>MinersBuddy Premium</Text>
          </View>
          <Text style={main.heroTitle}>Mining Mate{'\n'}Complete Course</Text>
          <Text style={main.heroSub}>CMR 2017 • 13 Chapters • {totalQs}+ Questions</Text>
        </View>

        {/* ── Stats Strip ── */}
        <View style={main.statsRow}>
          {[
            { val:'712+', lbl:'Questions',  color:C.gold    },
            { val:'13',   lbl:'Chapters',   color:C.teal    },
            { val:'PYQ',  lbl:'Included',   color:C.purple  },
            { val:'Hindi',lbl:'Language',   color:C.orange  },
          ].map((s, i) => (
            <View key={i} style={main.statItem}>
              <Text style={[main.statVal, { color:s.color }]}>{s.val}</Text>
              <Text style={main.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>


        {/* ── Content Sections ── */}
        <View style={main.sectionHeader}>
          <View style={main.sectionAccent} />
          <Text style={main.sectionTitle}>Course Content</Text>
        </View>

        {/* Preview button — corner */}
        {SECTIONS.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            onPreview={setPreviewSection}
            onUnlock={() => {}}
          />
        ))}

        {/* ── FAQs ── */}
        <View style={[main.sectionHeader, { marginTop:24 }]}>
          <View style={main.sectionAccent} />
          <Text style={main.sectionTitle}>Frequently Asked Questions</Text>
        </View>

        <View style={main.faqCard}>
          {FAQS.map((f, i) => (
            <View key={i}>
              <FaqItem q={f.q} a={f.a} />
              {i < FAQS.length - 1 && <View style={main.faqDivider} />}
            </View>
          ))}
        </View>

        <View style={{ height: IS_PURCHASED ? 24 : 100 }} />
      </ScrollView>

      {/* ── Sticky CTA (only if not purchased) ── */}
      {!IS_PURCHASED && (
        <View style={main.ctaBar}>
          <View>
            <Text style={main.ctaOrig}>₹5,000</Text>
            <Text style={main.ctaPrice}>₹1,999</Text>
          </View>
          <TouchableOpacity style={main.ctaBtn} activeOpacity={0.85}>
            <Crown size={15} color={C.navy} />
            <Text style={main.ctaBtnText}>Get MinersBuddy Premium →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Preview Bottom Sheet ── */}
      {previewSection && (
        <PreviewBanner
          section={previewSection}
          onClose={() => setPreviewSection(null)}
          onUnlock={() => setPreviewSection(null)}
        />
      )}
    </View>
  );
}

const main = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  scroll:    { paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingHorizontal:16 },

  // Hero
  hero:          { marginBottom:20, paddingTop:4 },
  heroBadge:     { flexDirection:'row', alignItems:'center', gap:6, marginBottom:10 },
  heroBadgeText: { fontSize:11, fontWeight:'800', color:C.gold, letterSpacing:1 },
  heroTitle:     { fontSize:28, fontWeight:'900', color:C.white, lineHeight:34, letterSpacing:-0.5, marginBottom:6 },
  heroSub:       { fontSize:13, color:C.muted, fontWeight:'500' },

  // Stats
  statsRow:  { flexDirection:'row', backgroundColor:C.bgCard, borderRadius:14, borderWidth:1, borderColor:C.border, paddingVertical:14, marginBottom:20 },
  statItem:  { flex:1, alignItems:'center', gap:3 },
  statVal:   { fontSize:18, fontWeight:'900', letterSpacing:-0.5 },
  statLbl:   { fontSize:10, color:C.muted, fontWeight:'600' },

  // Purchase card
  purchaseCard: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:`${C.gold}12`, borderRadius:16, borderWidth:1, borderColor:`${C.gold}35`, padding:16, marginBottom:24 },
  purchaseLeft: { gap:2 },
  origPrice:    { fontSize:12, color:C.mutedD, textDecorationLine:'line-through' },
  salePrice:    { fontSize:26, fontWeight:'900', color:C.white, letterSpacing:-0.5 },
  saveBadge:    { fontSize:11, color:C.gold, fontWeight:'700' },
  purchaseBtn:  { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:C.gold, borderRadius:12, paddingHorizontal:16, paddingVertical:12 },
  purchaseBtnText:{ fontSize:14, fontWeight:'800', color:C.navy },

  // Section header
  sectionHeader: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:14 },
  sectionAccent: { width:3, height:18, borderRadius:2, backgroundColor:C.gold },
  sectionTitle:  { fontSize:16, fontWeight:'800', color:C.white },

  // Preview hint
  previewHint:     { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:`${C.teal}12`, borderRadius:8, padding:10, marginBottom:12, borderWidth:1, borderColor:`${C.teal}25` },
  previewHintText: { fontSize:11, color:C.teal, fontWeight:'500', flex:1 },

  // FAQ
  faqCard:    { backgroundColor:C.bgCard, borderRadius:16, borderWidth:1, borderColor:C.border, overflow:'hidden', marginBottom:8 },
  faqDivider: { height:1, backgroundColor:C.border, marginHorizontal:16 },

  // CTA bar
  ctaBar:     { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:C.bgCard, borderTopWidth:1, borderTopColor:`${C.gold}30`, paddingHorizontal:20, paddingTop:12, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  ctaOrig:    { fontSize:11, color:C.mutedD, textDecorationLine:'line-through' },
  ctaPrice:   { fontSize:22, fontWeight:'900', color:C.white },
  ctaBtn:     { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:C.gold, borderRadius:12, paddingHorizontal:14, paddingVertical:12 },
  ctaBtnText: { fontSize:12, fontWeight:'800', color:C.navy },
});