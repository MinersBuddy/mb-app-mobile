/**
 * RegisterScreen.tsx
 * Flow: OtpVerify → Register → MainTabs
 *
 * Auto-fill:
 *   - email  → Firebase currentUser.email (Google login se)
 *   - phone  → route.params.phone (OTP verify se)
 *
 * Fields:
 *   1. Full Name
 *   2. Email (auto-filled, editable)
 *   3. Mobile (auto-filled, locked)
 *   4. Date of Birth (mandatory)
 *   5. State → City (dependent dropdowns)
 *   6. Course (dropdown)
 *   7. Certificate Type — Restricted / Unrestricted (dropdown)
 *
 * On submit:
 *   - Saves profile to Firestore
 *   - Sets AsyncStorage flag 'registered=true'
 *   - Navigates to MainTabs
 *
 * On next app open:
 *   - AppNavigator checks flag → skips auth flow → direct MainTabs
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore'; // uncomment when ready

import { RootStackParamList } from '../../navigation/AppNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const C = {
  navy:      '#0F1923',
  navyMid:   '#1A2B3C',
  navyLight: '#243447',
  navyCard:  '#162130',
  gold:      '#F59E0B',
  goldDim:   'rgba(245,158,11,0.10)',
  white:     '#FFFFFF',
  muted:     '#94A3B8',
  mutedDk:   '#4A5568',
  success:   '#10B981',
  error:     '#EF4444',
} as const;

// ─── India States & Cities ────────────────────────────────────────────────────

const STATE_CITY_MAP: Record<string, string[]> = {
  'Jharkhand':         ['Dhanbad', 'Ranchi', 'Jamshedpur', 'Bokaro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Deoghar', 'Dumka', 'Phusro'],
  'West Bengal':       ['Kolkata', 'Asansol', 'Durgapur', 'Siliguri', 'Bardhaman', 'Haldia', 'Raniganj', 'Purulia'],
  'Odisha':            ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Talcher', 'Angul', 'Jharsuguda', 'Sundargarh'],
  'Chhattisgarh':      ['Raipur', 'Bilaspur', 'Korba', 'Raigarh', 'Ambikapur', 'Durg', 'Bhilai'],
  'Madhya Pradesh':    ['Bhopal', 'Indore', 'Jabalpur', 'Singrauli', 'Satna', 'Katni', 'Umaria', 'Shahdol'],
  'Uttar Pradesh':     ['Lucknow', 'Kanpur', 'Allahabad', 'Varanasi', 'Sonbhadra', 'Mirzapur', 'Agra', 'Meerut'],
  'Bihar':             ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Nawada', 'Aurangabad', 'Jehanabad'],
  'Rajasthan':         ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Pali', 'Nagaur'],
  'Maharashtra':       ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Chandrapur', 'Yavatmal', 'Wardha'],
  'Andhra Pradesh':    ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Kurnool', 'Nellore', 'Tirupati'],
  'Telangana':         ['Hyderabad', 'Warangal', 'Khammam', 'Karimnagar', 'Mancherial', 'Adilabad'],
  'Karnataka':         ['Bangalore', 'Mysuru', 'Hubli', 'Bellary', 'Chitradurga', 'Tumkur'],
  'Tamil Nadu':        ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Vellore'],
  'Gujarat':           ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Anand'],
  'Assam':             ['Guwahati', 'Dibrugarh', 'Jorhat', 'Sibsagar', 'Tinsukia', 'Digboi'],
  'Meghalaya':         ['Shillong', 'Tura', 'Nongpoh', 'Jowai'],
  'Nagaland':          ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'],
  'Himachal Pradesh':  ['Shimla', 'Manali', 'Dharamshala', 'Bilaspur', 'Chamba'],
  'Uttarakhand':       ['Dehradun', 'Haridwar', 'Nainital', 'Roorkee', 'Almora'],
  'Punjab':            ['Amritsar', 'Ludhiana', 'Chandigarh', 'Jalandhar', 'Patiala'],
  'Haryana':           ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak'],
  'Delhi':             ['New Delhi', 'Dwarka', 'Rohini', 'Janakpuri', 'Laxmi Nagar'],
  'Goa':               ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  'Kerala':            ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
};

const STATES = Object.keys(STATE_CITY_MAP).sort();

// ─── Course options ───────────────────────────────────────────────────────────

const COURSES = [
  'Mining Mate',
  'Foreman',
  'Overman',
  'Blaster',
  'First Class (Coal)',
  'Second Class (Coal)',
  'First Class (Metal)',
  'Second Class (Metal)',
];

const CERT_TYPES = ['Restricted', 'Unrestricted'];

// ─── Reusable field row ───────────────────────────────────────────────────────

const FieldLabel = ({ text, required }: { text: string; required?: boolean }) => (
  <Text style={f.label}>
    {text}
    {required && <Text style={{ color: C.error }}> *</Text>}
  </Text>
);

const f = StyleSheet.create({
  label: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase',
  },
});

// ─── Dropdown Modal ───────────────────────────────────────────────────────────

type DropdownProps = {
  visible:   boolean;
  title:     string;
  options:   string[];
  onSelect:  (val: string) => void;
  onClose:   () => void;
};

const DropdownModal = ({ visible, title, options, onSelect, onClose }: DropdownProps) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={dm.overlay} activeOpacity={1} onPress={onClose} />
    <View style={dm.sheet}>
      <View style={dm.handle} />
      <Text style={dm.title}>{title}</Text>
      <FlatList
        data={options}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={dm.option} onPress={() => { onSelect(item); onClose(); }} activeOpacity={0.7}>
            <Text style={dm.optionText}>{item}</Text>
            <Text style={dm.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  </Modal>
);

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: C.navyMid, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '60%', paddingBottom: 32,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.navyLight, alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  title: {
    fontSize: 13, fontWeight: '800', color: C.muted,
    letterSpacing: 0.8, textTransform: 'uppercase',
    textAlign: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.navyLight, marginBottom: 4,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  optionText: { fontSize: 15, color: C.white, fontWeight: '500' },
  arrow:      { fontSize: 18, color: C.mutedDk },
});

// ─── Selector Button ──────────────────────────────────────────────────────────

const SelectorBtn = ({
  value, placeholder, onPress, error,
}: {
  value: string; placeholder: string; onPress: () => void; error?: string;
}) => (
  <View style={{ marginBottom: 14 }}>
    <TouchableOpacity
      style={[sel.btn, error ? sel.btnError : value ? sel.btnFilled : null]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[sel.txt, !value && sel.placeholder]}>
        {value || placeholder}
      </Text>
      <Text style={sel.chevron}>▾</Text>
    </TouchableOpacity>
    {error ? <Text style={sel.error}>{error}</Text> : null}
  </View>
);

const sel = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.navyMid, borderRadius: 12, borderWidth: 1.5,
    borderColor: C.navyLight, paddingHorizontal: 14, height: 50,
  },
  btnError:  { borderColor: C.error },
  btnFilled: { borderColor: 'rgba(245,158,11,0.35)' },
  txt:       { fontSize: 15, color: C.white, fontWeight: '500', flex: 1 },
  placeholder: { color: C.mutedDk, fontWeight: '400' },
  chevron:   { fontSize: 14, color: C.mutedDk, marginLeft: 8 },
  error:     { fontSize: 11, color: C.error, fontWeight: '600', marginTop: 5, marginLeft: 4 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RegisterScreen({ navigation, route }: Props) {
  const verifiedPhone = route?.params?.phone ?? '';

  // Auto-fill from Firebase Google user
  const firebaseUser = auth().currentUser;
  const googleEmail  = firebaseUser?.email ?? '';
  const googleName   = firebaseUser?.displayName ?? '';

  // ── Form state ────────────────────────────────────────────────────────────
  const [fullName,   setFullName]   = useState(googleName);
  const [email,      setEmail]      = useState(googleEmail);
  const [dob,        setDob]        = useState('');
  const [state,      setState]      = useState('');
  const [city,       setCity]       = useState('');
  const [course,     setCourse]     = useState('');
  const [certType,   setCertType]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  // ── Dropdown visibility ───────────────────────────────────────────────────
  const [showState,    setShowState]    = useState(false);
  const [showCity,     setShowCity]     = useState(false);
  const [showCourse,   setShowCourse]   = useState(false);
  const [showCertType, setShowCertType] = useState(false);

  // Reset city when state changes
  const handleStateSelect = (val: string) => {
    setState(val);
    setCity('');
  };

  // DOB formatter — auto inserts /
  const handleDobChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    }
    setDob(formatted);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim())                        e.fullName = 'Full name required';
    if (!email.trim())                           e.email    = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email))       e.email    = 'Invalid email';
    if (!dob || dob.length < 10)                 e.dob      = 'Valid date required (DD/MM/YYYY)';
    if (!state)                                  e.state    = 'Please select state';
    if (!city)                                   e.city     = 'Please select city';
    if (!course)                                 e.course   = 'Please select your course';
    if (!certType)                               e.certType = 'Please select certificate type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      /**
       * Firestore mein save karo — uncomment when ready:
       *
       * const uid = auth().currentUser?.uid;
       * await firestore().collection('users').doc(uid).set({
       *   fullName,
       *   email,
       *   phone:    `+91${verifiedPhone}`,
       *   dob,
       *   state,
       *   city,
       *   course,
       *   certType,
       *   createdAt: firestore.FieldValue.serverTimestamp(),
       * });
       */

      // Dev mock
      await new Promise(r => setTimeout(r, 1200));

      // Mark as registered — next app open pe direct home jaayega
      await AsyncStorage.setItem('registered', 'true');

      navigation.replace('MainTabs');

    } catch (err) {
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Page Title ── */}
          <Text style={s.pageTitle}>Create Account</Text>
          <Text style={s.pageStep}>Step 3 of 3</Text>

          {/* ══════════════════════════════════════════
              SECTION 1 — Personal Details
          ══════════════════════════════════════════ */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Personal Details</Text>

            {/* Full Name */}
            <FieldLabel text="Full Name" required />
            <View style={[s.inputRow, errors.fullName ? s.inputError : null]}>
              <TextInput
                style={s.input}
                placeholder="Enter your full name"
                placeholderTextColor={C.mutedDk}
                value={fullName}
                onChangeText={(t) => { setFullName(t); if (errors.fullName) setErrors(e => ({ ...e, fullName: '' })); }}
                autoCapitalize="words"
                selectionColor={C.gold}
              />
            </View>
            {errors.fullName ? <Text style={s.errTxt}>{errors.fullName}</Text> : null}

            {/* Email — auto-filled from Google */}
            <FieldLabel text="Email Address" required />
            <View style={[s.inputRow, errors.email ? s.inputError : googleEmail ? s.inputVerified : null]}>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={C.mutedDk}
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(e => ({ ...e, email: '' })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor={C.gold}
              />
              {googleEmail ? <Text style={s.verifiedCheck}>✓</Text> : null}
            </View>
            {errors.email ? <Text style={s.errTxt}>{errors.email}</Text> : null}

            {/* Phone — locked, from OTP */}
            <FieldLabel text="Mobile Number" required />
            <View style={[s.inputRow, s.inputVerified, s.inputLocked]}>
              <Text style={s.lockedText}>+91 {verifiedPhone}</Text>
              <Text style={s.verifiedCheck}>✓</Text>
            </View>

            {/* DOB */}
            <FieldLabel text="Date of Birth" required />
            <View style={[s.inputRow, errors.dob ? s.inputError : null]}>
              <TextInput
                style={s.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={C.mutedDk}
                value={dob}
                onChangeText={(t) => { handleDobChange(t); if (errors.dob) setErrors(e => ({ ...e, dob: '' })); }}
                keyboardType="number-pad"
                maxLength={10}
                selectionColor={C.gold}
              />
            </View>
            {errors.dob ? <Text style={s.errTxt}>{errors.dob}</Text> : null}
          </View>

          {/* ══════════════════════════════════════════
              SECTION 2 — Location
          ══════════════════════════════════════════ */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Location</Text>

            <FieldLabel text="State" required />
            <SelectorBtn
              value={state}
              placeholder="Select your state"
              onPress={() => setShowState(true)}
              error={errors.state}
            />

            <FieldLabel text="City" required />
            <SelectorBtn
              value={city}
              placeholder={state ? 'Select your city' : 'Select state first'}
              onPress={() => state ? setShowCity(true) : null}
              error={errors.city}
            />
          </View>

          {/* ══════════════════════════════════════════
              SECTION 3 — Course & Certificate
          ══════════════════════════════════════════ */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Exam Details</Text>

            <FieldLabel text="Course" required />
            <SelectorBtn
              value={course}
              placeholder="Select your course"
              onPress={() => setShowCourse(true)}
              error={errors.course}
            />

            <FieldLabel text="Certificate Type" required />
            <SelectorBtn
              value={certType}
              placeholder="Restricted or Unrestricted?"
              onPress={() => setShowCertType(true)}
              error={errors.certType}
            />
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[s.cta, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={C.navy} size="small" />
              : <Text style={s.ctaText}>Create Account →</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Dropdown Modals ── */}
      <DropdownModal
        visible={showState}
        title="Select State"
        options={STATES}
        onSelect={handleStateSelect}
        onClose={() => setShowState(false)}
      />
      <DropdownModal
        visible={showCity}
        title="Select City"
        options={state ? STATE_CITY_MAP[state] : []}
        onSelect={setCity}
        onClose={() => setShowCity(false)}
      />
      <DropdownModal
        visible={showCourse}
        title="Select Course"
        options={COURSES}
        onSelect={setCourse}
        onClose={() => setShowCourse(false)}
      />
      <DropdownModal
        visible={showCertType}
        title="Certificate Type"
        options={CERT_TYPES}
        onSelect={setCertType}
        onClose={() => setShowCertType(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.navy },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 64 : 52,
    paddingBottom: 48,
  },

  pageTitle: {
    fontSize: 28, fontWeight: '900', color: C.white,
    letterSpacing: -0.8, marginBottom: 4,
  },
  pageStep: {
    fontSize: 12, color: C.gold, fontWeight: '700',
    letterSpacing: 0.6, marginBottom: 28,
  },

  // Section
  section: {
    backgroundColor: C.navyCard,
    borderRadius: 16, borderWidth: 1, borderColor: C.navyLight,
    padding: 16, marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: C.white,
    letterSpacing: 0.2, marginBottom: 16,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.navyLight,
  },

  // Input row
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.navyMid, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.navyLight,
    paddingHorizontal: 14, height: 50, marginBottom: 14,
  },
  inputError:    { borderColor: C.error },
  inputVerified: { borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.05)' },
  inputLocked:   { opacity: 0.85 },
  input: {
    flex: 1, fontSize: 15, color: C.white,
    fontWeight: '500', padding: 0,
  },
  lockedText: {
    flex: 1, fontSize: 15, color: '#10B981', fontWeight: '600',
  },
  verifiedCheck: {
    fontSize: 14, color: '#10B981', fontWeight: '800', marginLeft: 8,
  },

  errTxt: {
    fontSize: 11, color: C.error, fontWeight: '600',
    marginTop: -10, marginBottom: 10, marginLeft: 4,
  },

  // CTA
  cta: {
    backgroundColor: C.gold, borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  ctaText: {
    color: C.navy, fontSize: 16, fontWeight: '900', letterSpacing: 0.3,
  },
});
