import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Info, Trophy, Gem } from 'lucide-react-native';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#0D1117',
  bgCard:      '#161B22',
  bgRaised:    '#1C2128',
  border:      '#30363D',
  gold:        '#F59E0B',
  goldDim:     '#92600A',
  goldGlow:    '#F59E0B18',
  silver:      '#94A3B8',
  bronze:      '#CD7C2F',
  diamond:     '#60A5FA',
  diamondBg:   '#1E3A5F',
  white:       '#F0F6FC',
  whiteD:      '#C9D1D9',
  muted:       '#8B949E',
  mutedD:      '#484F58',
  success:     '#3FB950',
  navy:        '#0F1923',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type LeagueTab = 'Today' | 'This Week';
type Player = {
  rank: number;
  name: string;
  diamonds: number;
  avatar: string;
  avatarColor: string;
  examLabel?: string;
  isCurrentUser?: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const PLAYERS: Player[] = [
  { rank:1,  name:'Aarti',            diamonds:2105, avatar:'A',  avatarColor:'#F59E0B', examLabel:'Mining Mate' },
  { rank:2,  name:'Raju',             diamonds:1975, avatar:'N',  avatarColor:'#94A3B8', examLabel:'Mining Mate' },
  { rank:3,  name:'Manju Rani',       diamonds:1280, avatar:'D',  avatarColor:'#CD7C2F', examLabel:'Mining Mate' },
  { rank:4,  name:'Prishka',          diamonds:1270, avatar:'P',  avatarColor:'#3B82F6', examLabel:'Mining Mate' },
  { rank:5,  name:'Rubina',           diamonds:1225, avatar:'R',  avatarColor:'#10B981', examLabel:'Mining Mate' },
  { rank:6,  name:'Aarush',           diamonds:1220, avatar:'A',  avatarColor:'#8B5CF6', examLabel:'Mining Mate' },
  { rank:7,  name:'Sharad',           diamonds:1195, avatar:'S',  avatarColor:'#06B6D4', examLabel:'Mining Mate' },
  { rank:8,  name:'Micko',            diamonds:1150, avatar:'M',  avatarColor:'#6B7280', examLabel:'Mining Mate' },
  { rank:9,  name:'Subhankar Pal',    diamonds:1100, avatar:'S',  avatarColor:'#10B981', examLabel:'Mining Mate' },
  { rank:10, name:'Shivani',          diamonds:1055, avatar:'S',  avatarColor:'#F59E0B', examLabel:'Mining Mate' },
];

const ME: Player = {
  rank: 47, name: 'Vinit Kumar',
  diamonds: 1240, avatar: 'VK',
  avatarColor: '#F59E0B',
  examLabel: 'Mining Mate',
  isCurrentUser: true,
};

// ─── Top 3 Podium ─────────────────────────────────────────────────────────────
const PODIUM_CONFIG = [
  { place: 2, heightFactor: 0.75, labelColor: C.silver,  crownColor: C.silver,  badge:'🥈' },
  { place: 1, heightFactor: 1.0,  labelColor: C.gold,    crownColor: C.gold,    badge:'👑' },
  { place: 3, heightFactor: 0.6,  labelColor: C.bronze,  crownColor: C.bronze,  badge:'🥉' },
];

const Podium = ({ players }: { players: Player[] }) => {
  const getPlayer = (rank: number) => players.find(p => p.rank === rank);

  return (
    <View style={pod.wrap}>
      {PODIUM_CONFIG.map(cfg => {
        const p = getPlayer(cfg.place);
        if (!p) return null;
        const isFirst = cfg.place === 1;
        return (
          <View key={cfg.place} style={[pod.col, isFirst && pod.colCenter]}>
            {/* Crown / badge */}
            <Text style={pod.crown}>{cfg.badge}</Text>

            {/* Avatar */}
            <View style={[
              pod.avatarOuter,
              { borderColor: cfg.labelColor, shadowColor: cfg.labelColor },
              isFirst && pod.avatarFirst,
            ]}>
              <View style={[pod.avatarInner, { backgroundColor: `${p.avatarColor}22` }]}>
                <Text style={[pod.avatarText, { color: p.avatarColor, fontSize: isFirst ? 20 : 16 }]}>
                  {p.avatar}
                </Text>
              </View>
              {isFirst && <View style={[pod.glow, { borderColor: `${cfg.labelColor}40` }]} />}
            </View>

            {/* Name */}
            <Text style={[pod.name, { color: isFirst ? C.white : C.whiteD }]} numberOfLines={1}>
              {p.name.split(' ')[0]}
            </Text>

            {/* Score */}
            <View style={[pod.scorePill, { backgroundColor: `${cfg.labelColor}18`, borderColor: `${cfg.labelColor}40` }]}>
              <Text style={{ fontSize: 11 }}>💎</Text>
              <Text style={[pod.scoreNum, { color: cfg.labelColor }]}>
                {p.diamonds.toLocaleString()}
              </Text>
            </View>

            {/* Podium block */}
            <View style={[
              pod.block,
              {
                backgroundColor: `${cfg.labelColor}12`,
                borderColor: `${cfg.labelColor}30`,
                height: isFirst ? 70 : cfg.place === 2 ? 52 : 40,
              },
            ]}>
              <Text style={[pod.rankNum, { color: cfg.labelColor }]}>#{cfg.place}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const pod = StyleSheet.create({
  wrap:        { flexDirection:'row', alignItems:'flex-end', justifyContent:'center', paddingHorizontal:16, marginBottom:20, gap:8 },
  col:         { flex:1, alignItems:'center', gap:6 },
  colCenter:   { marginBottom:0 },
  crown:       { fontSize:22 },
  avatarOuter: {
    width:56, height:56, borderRadius:28,
    borderWidth:2, alignItems:'center', justifyContent:'center',
    shadowOffset:{ width:0, height:4 }, shadowOpacity:0.5, shadowRadius:8, elevation:8,
    position:'relative',
  },
  avatarFirst: { width:68, height:68, borderRadius:34 },
  avatarInner: { width:'90%', height:'90%', borderRadius:100, alignItems:'center', justifyContent:'center' },
  avatarText:  { fontWeight:'900' },
  glow:        { position:'absolute', width:'130%', height:'130%', borderRadius:100, borderWidth:1.5 },
  name:        { fontSize:12, fontWeight:'700', textAlign:'center', letterSpacing:0.2 },
  scorePill:   { flexDirection:'row', alignItems:'center', gap:3, borderRadius:10, paddingHorizontal:8, paddingVertical:3, borderWidth:1 },
  scoreNum:    { fontSize:11, fontWeight:'800' },
  block:       { width:'100%', borderRadius:10, borderWidth:1, alignItems:'center', justifyContent:'center' },
  rankNum:     { fontSize:16, fontWeight:'900', letterSpacing:0.5 },
});

// ─── Player Row (rank 4+) ─────────────────────────────────────────────────────
const MEDAL: Record<number, { border: string; bg: string }> = {
  1: { border: C.gold,   bg: `${C.gold}15`   },
  2: { border: C.silver, bg: `${C.silver}15` },
  3: { border: C.bronze, bg: `${C.bronze}15` },
};

const PlayerRow = ({ item, isMe }: { item: Player; isMe?: boolean }) => {
  const medal = MEDAL[item.rank];

  return (
    <View style={[
      row.wrap,
      isMe && row.wrapMe,
      item.rank <= 3 && { backgroundColor: `${Object.values(MEDAL)[item.rank - 1]?.bg ?? 'transparent'}` },
    ]}>
      {/* Rank */}
      <View style={row.rankCol}>
        {medal && !isMe ? (
          <View style={[row.medalCircle, { borderColor: medal.border, backgroundColor: medal.bg }]}>
            <Text style={{ fontSize: 14 }}>
              {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
            </Text>
          </View>
        ) : (
          <Text style={[row.rankTxt, isMe && { color: C.gold }]}>
            #{item.rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[row.avatar, { backgroundColor:`${item.avatarColor}18`, borderColor: isMe ? C.gold : item.avatarColor }]}>
        <Text style={[row.avatarTxt, { color: item.avatarColor }]}>{item.avatar}</Text>
      </View>

      {/* Name + exam */}
      <View style={{ flex:1 }}>
        <Text style={[row.name, isMe && { color: C.gold }]} numberOfLines={1}>{item.name}</Text>
        {item.examLabel && (
          <Text style={row.exam}>{item.examLabel}</Text>
        )}
      </View>

      {/* Score */}
      <View style={row.scoreWrap}>
        <Text style={row.gemoji}>💎</Text>
        <Text style={[row.score, isMe && { color: C.gold }]}>
          {item.diamonds.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const row = StyleSheet.create({
  wrap:        { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, paddingHorizontal:12, borderRadius:12 },
  wrapMe:      { backgroundColor:`${C.gold}10`, borderWidth:1, borderColor:`${C.gold}30` },
  rankCol:     { width:42, alignItems:'center' },
  rankTxt:     { fontSize:14, fontWeight:'700', color:C.muted },
  medalCircle: { width:32, height:32, borderRadius:16, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
  avatar:      { width:42, height:42, borderRadius:21, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
  avatarTxt:   { fontSize:13, fontWeight:'800' },
  name:        { fontSize:14, fontWeight:'600', color:C.white, marginBottom:1 },
  exam:        { fontSize:10, color:C.muted, fontWeight:'500' },
  scoreWrap:   { flexDirection:'row', alignItems:'center', gap:4 },
  gemoji:      { fontSize:12 },
  score:       { fontSize:14, fontWeight:'800', color:C.white },
});

// ─── Tab Toggle ───────────────────────────────────────────────────────────────
const TabToggle = ({ active, onSelect }: { active: LeagueTab; onSelect: (t: LeagueTab) => void }) => (
  <View style={tab.wrap}>
    {(['Today', 'This Week'] as LeagueTab[]).map(t => {
      const on = t === active;
      return (
        <TouchableOpacity key={t} style={[tab.btn, on && tab.btnOn]} onPress={() => onSelect(t)} activeOpacity={0.8}>
          <Text style={[tab.txt, on && tab.txtOn]}>{t}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const tab = StyleSheet.create({
  wrap:  { flexDirection:'row', marginHorizontal:16, marginBottom:16, backgroundColor:C.bgCard, borderRadius:14, borderWidth:1, borderColor:C.border, padding:4 },
  btn:   { flex:1, paddingVertical:10, borderRadius:10, alignItems:'center' },
  btnOn: { backgroundColor:C.bg, borderWidth:1, borderColor:C.border },
  txt:   { fontSize:13, fontWeight:'600', color:C.muted },
  txtOn: { color:C.white, fontWeight:'700' },
});

// ─── My Rank Strip ────────────────────────────────────────────────────────────
const MyRankStrip = ({ insetBottom }: { insetBottom: number }) => (
  <View style={[mrs.wrap, { paddingBottom: insetBottom > 0 ? insetBottom : 12 }]}>
    <View style={mrs.left}>
      <View style={mrs.rankBox}>
        <Text style={mrs.rankLabel}>YOUR RANK</Text>
        <Text style={mrs.rankNum}>#{ME.rank}</Text>
      </View>
      <View style={mrs.divider} />
      <View style={[mrs.avatar, { backgroundColor:`${ME.avatarColor}20`, borderColor:C.gold }]}>
        <Text style={[mrs.avatarTxt, { color:C.gold }]}>{ME.avatar}</Text>
      </View>
      <View>
        <Text style={mrs.name}>{ME.name}</Text>
        <Text style={mrs.exam}>{ME.examLabel}</Text>
      </View>
    </View>
    <View style={mrs.scoreWrap}>
      <Text style={{ fontSize:14 }}>💎</Text>
      <Text style={mrs.score}>{ME.diamonds.toLocaleString()}</Text>
    </View>
  </View>
);

const mrs = StyleSheet.create({
  wrap:      { backgroundColor:C.bgCard, borderTopWidth:1, borderTopColor:`${C.gold}30`, paddingHorizontal:16, paddingTop:12, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  left:      { flexDirection:'row', alignItems:'center', gap:10 },
  rankBox:   { alignItems:'center' },
  rankLabel: { fontSize:8, color:C.muted, fontWeight:'700', letterSpacing:1 },
  rankNum:   { fontSize:18, fontWeight:'900', color:C.gold },
  divider:   { width:1, height:32, backgroundColor:C.border, marginHorizontal:4 },
  avatar:    { width:38, height:38, borderRadius:19, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
  avatarTxt: { fontSize:12, fontWeight:'800' },
  name:      { fontSize:13, fontWeight:'700', color:C.white },
  exam:      { fontSize:10, color:C.muted, fontWeight:'500' },
  scoreWrap: { flexDirection:'row', alignItems:'center', gap:5 },
  score:     { fontSize:18, fontWeight:'900', color:C.gold },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
type Props = { navigation?: { goBack: () => void } };

export default function LeaderboardScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<LeagueTab>('Today');
  const insets = useSafeAreaInsets();

  // Rank 4+ list
  const listPlayers = PLAYERS.filter(p => p.rank > 3);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Top bar ── */}
      <View style={[main.topBar, { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }]}>
        <TouchableOpacity style={main.iconBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={C.white} />
        </TouchableOpacity>

        <View style={main.titleWrap}>
          <Trophy size={16} color={C.gold} />
          <Text style={main.title}>Leaderboard</Text>
        </View>

        <TouchableOpacity style={main.iconBtn} activeOpacity={0.7}>
          <Info size={18} color={C.muted} />
        </TouchableOpacity>
      </View>

      {/* ── Tab ── */}
      <TabToggle active={activeTab} onSelect={setActiveTab} />

      <FlatList
        data={listPlayers}
        keyExtractor={item => String(item.rank)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal:12, paddingBottom:16 }}
        ListHeaderComponent={
          <>
            {/* Podium — top 3 */}
            <Podium players={PLAYERS} />
            {/* Divider */}
            <View style={main.sectionLabel}>
              <View style={main.sectionLine} />
              <Text style={main.sectionText}>Ranking</Text>
              <View style={main.sectionLine} />
            </View>
          </>
        }
        ItemSeparatorComponent={() => <View style={{ height:1, backgroundColor:`${C.border}60`, marginHorizontal:8 }} />}
        renderItem={({ item }) => <PlayerRow item={item} />}
        ListFooterComponent={
          <Text style={main.endText}>— End of Leaderboard —</Text>
        }
      />

      {/* ── My rank sticky bar ── */}
      <MyRankStrip insetBottom={insets.bottom} />
    </View>
  );
}

const main = StyleSheet.create({
  topBar:     { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingBottom:12 },
  iconBtn:    { width:38, height:38, borderRadius:12, backgroundColor:C.bgCard, borderWidth:1, borderColor:C.border, alignItems:'center', justifyContent:'center' },
  titleWrap:  { flexDirection:'row', alignItems:'center', gap:8 },
  title:      { fontSize:17, fontWeight:'800', color:C.white, letterSpacing:-0.3 },

  leagueBadge:   { flexDirection:'row', alignItems:'center', gap:14, marginHorizontal:16, marginBottom:20, backgroundColor:C.bgCard, borderRadius:16, borderWidth:1, borderColor:`${C.diamond}30`, padding:14 },
  leagueIconWrap:{ width:52, height:52, borderRadius:26, backgroundColor:C.diamondBg, borderWidth:2, borderColor:C.diamond, alignItems:'center', justifyContent:'center', position:'relative' },
  pickaxeChip:   { position:'absolute', bottom:-2, right:-2, width:20, height:20, borderRadius:10, backgroundColor:C.bgCard, borderWidth:1, borderColor:C.border, alignItems:'center', justifyContent:'center' },
  leagueName:    { fontSize:14, fontWeight:'800', color:C.white, letterSpacing:1 },
  leagueSub:     { fontSize:11, color:C.muted, marginTop:2, fontWeight:'500' },

  sectionLabel:  { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10, marginHorizontal:4 },
  sectionLine:   { flex:1, height:1, backgroundColor:C.border },
  sectionText:   { fontSize:11, color:C.muted, fontWeight:'700', letterSpacing:0.8 },

  endText:       { textAlign:'center', fontSize:11, color:C.mutedD, paddingVertical:20 },
});