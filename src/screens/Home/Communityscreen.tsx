import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Send, Hash, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  navy:      '#0F1923',
  navyMid:   '#1A2B3C',
  navyLight: '#243447',
  navyCard:  '#1E2F42',
  gold:      '#F59E0B',
  white:     '#FFFFFF',
  offWhite:  '#F1F5F9',
  muted:     '#94A3B8',
  mutedDark: '#64748B',
  success:   '#10B981',
  purple:    '#8B5CF6',
  teal:      '#0D9488',
} as const;

type Message = {
  id: string;
  sender: string;
  avatar: string;
  avatarColor: string;
  time: string;
  text: string;
  isMe?: boolean;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Aarti', avatar: 'A', avatarColor: COLORS.gold,
    time: '9:00 AM',
    text: 'Good morning everyone! Anyone appearing for Mining Mate exam next month? 👋',
  },
  {
    id: '2',
    sender: 'Dr. Manju', avatar: 'D', avatarColor: COLORS.purple,
    time: '9:12 AM',
    text: 'Regulation 104 of CMR 2017 is super important. Memorize it word by word — it comes every year! 📚',
  },
  {
    id: '3',
    sender: 'Prishka', avatar: 'P', avatarColor: '#3B82F6',
    time: '9:18 AM',
    text: 'The mock tests on this app are really helpful. My score went from 65% to 84% in just 2 weeks! 🎉',
  },
  {
    id: '4',
    sender: 'Sharad', avatar: 'S', avatarColor: COLORS.teal,
    time: '9:22 AM',
    text: 'Can anyone explain Ventilation calculations? I keep getting confused with the formulas.',
  },
  {
    id: '5',
    sender: 'Aarush', avatar: 'AA', avatarColor: COLORS.success,
    time: '9:25 AM',
    text: 'Check the Formulas section in Quick Access — all ventilation formulas are there with examples 👍',
  },
  {
    id: '6',
    sender: 'You', avatar: 'VK', avatarColor: COLORS.gold,
    time: '9:30 AM', isMe: true,
    text: 'Thanks everyone! This community is so helpful 🙌',
  },
];

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ message }: { message: Message }) => {
  const isMe = message.isMe;

  if (isMe) {
    return (
      <View style={s.rowMe}>
        <View style={s.bubbleMe}>
          <Text style={s.textMe}>{message.text}</Text>
          <Text style={s.timeMe}>{message.time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.rowOther}>
      <View style={[s.avatar, { backgroundColor: `${message.avatarColor}22`, borderColor: message.avatarColor }]}>
        <Text style={[s.avatarText, { color: message.avatarColor }]}>{message.avatar}</Text>
      </View>
      <View style={s.bubbleOther}>
        <Text style={[s.senderName, { color: message.avatarColor }]}>{message.sender}</Text>
        <Text style={s.textOther}>{message.text}</Text>
        <Text style={s.timeOther}>{message.time}</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  rowOther: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    marginBottom: 6,
    maxWidth: '85%',
  },
  avatar: {
    width: 32, height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginTop: 2,
    flexShrink: 0,
  },
  avatarText: { fontSize: 10, fontWeight: '800' },
  bubbleOther: {
    backgroundColor: '#1E2F42',
    borderRadius: 8,
    borderTopLeftRadius: 2,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: COLORS.navyLight,
  },
  senderName: { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  textOther:  { fontSize: 14, color: COLORS.offWhite, lineHeight: 20, fontWeight: '400' },
  timeOther:  { fontSize: 10, color: COLORS.mutedDark, fontWeight: '500', textAlign: 'right', marginTop: 4 },

  // ── Sent — gold bubble, navy text ──
  rowMe: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 6,
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  bubbleMe: {
    backgroundColor: COLORS.gold,        // ✅ gold
    borderRadius: 8,
    borderTopRightRadius: 2,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 6,
  },
  textMe: {
    fontSize: 14,
    color: '#0D1117',                     // ✅ dark text on gold
    lineHeight: 20,
    fontWeight: '500',
  },
  timeMe: {
    fontSize: 10,
    color: '#7A5500',                     // ✅ dark muted on gold
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: Message = {
      id: String(Date.now()),
      sender: 'You', avatar: 'VK', avatarColor: COLORS.gold,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true, text,
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={main.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Header */}
      <View style={main.header}>
        <View style={main.headerLeft}>
          <View style={main.channelIcon}>
            <Hash size={16} color={COLORS.gold} />
          </View>
          <View>
            <Text style={main.headerTitle}>Community</Text>
            <Text style={main.headerSub}>Mining Mate</Text>
          </View>
        </View>
        <View style={main.headerRight}>
          <View style={main.memberRow}>
            <Users size={13} color={COLORS.muted} />
            <Text style={main.memberCount}>1,284</Text>
          </View>
          <View style={main.onlineRow}>
            <View style={main.onlineDot} />
            <Text style={main.onlineText}>128 online</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages — paddingBottom extra taaki input bar ke peeche content na chhuppe */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={main.list}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <View style={main.dateDivider}>
            <View style={main.dateLine} />
            <Text style={main.dateText}>Today</Text>
            <View style={main.dateLine} />
          </View>

          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </ScrollView>

        {/* ── Floating Input Bar — WhatsApp style ── */}
        <View style={main.inputOuter}>
          <View style={main.inputInner}>
            <TextInput
              style={main.input}
              placeholder="Message..."
              placeholderTextColor={COLORS.mutedDark}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={300}
            />
            <TouchableOpacity
              style={[main.sendBtn, !inputText.trim() && main.sendBtnOff]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={15} color={inputText.trim() ? '#0D1117' : COLORS.mutedDark} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const main = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navyLight,
  },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  channelIcon:  { width: 36, height: 36, borderRadius: 10, backgroundColor: `${COLORS.gold}18`, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: COLORS.white },
  headerSub:    { fontSize: 11, color: COLORS.muted, fontWeight: '500', marginTop: 1 },
  headerRight:  { alignItems: 'flex-end', gap: 3 },
  memberRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberCount:  { fontSize: 13, color: COLORS.white, fontWeight: '700' },
  onlineRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  onlineText:   { fontSize: 11, color: COLORS.success, fontWeight: '600' },

  list: { paddingTop: 10, paddingBottom: 80 }, // ✅ space for floating bar

  dateDivider:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  dateLine:     { flex: 1, height: 1, backgroundColor: COLORS.navyLight },
  dateText:     { fontSize: 11, color: COLORS.mutedDark, fontWeight: '600' },

  // ── Floating input bar ──
  inputOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: COLORS.navyCard,
    borderRadius: 28,                   // ✅ fully round pill shape
    borderWidth: 1,
    borderColor: COLORS.navyLight,
    paddingHorizontal: 6,
    paddingVertical: 6,
    // Shadow for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 14,
    color: COLORS.white,
    maxHeight: 100,
    fontWeight: '400',
  },
  sendBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnOff: { backgroundColor: COLORS.navyLight },
});