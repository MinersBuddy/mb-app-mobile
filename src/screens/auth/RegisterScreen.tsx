/**
 * RegisterScreen.tsx
 * TEMP FIX: Firestore + auth removed — sirf AsyncStorage save
 * Google signin baad mein add karenge
 */

import React, { useState } from 'react';
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
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const C = {
  navy:      '#0F1923',
  navyMid:   '#1A2B3C',
  navyLight: '#243447',
  navyCard:  '#162130',
  gold:      '#F59E0B',
  white:     '#FFFFFF',
  muted:     '#94A3B8',
  mutedDk:   '#4A5568',
  success:   '#10B981',
  error:     '#EF4444',
} as const;

const STATE_CITY_MAP: Record<string, string[]> = {
  'Jharkhand':        ['Dhanbad', 'Ranchi', 'Jamshedpur', 'Bokaro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Deoghar', 'Dumka', 'Phusro'],
  'West Bengal':      ['Kolkata', 'Asansol', 'Durgapur', 'Siliguri', 'Bardhaman', 'Haldia', 'Raniganj', 'Purulia'],
  'Odisha':           ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Talcher', 'Angul', 'Jharsuguda', 'Sundargarh'],
  'Chhattisgarh':     ['Raipur', 'Bilaspur', 'Korba', 'Raigarh', 'Ambikapur', 'Durg', 'Bhilai'],
  'Madhya Pradesh':   ['Bhopal', 'Indore', 'Jabalpur', 'Singrauli', 'Satna', 'Katni', 'Umaria', 'Shahdol'],
  'Uttar Pradesh':    ['Lucknow', 'Kanpur', 'Allahabad', 'Varanasi', 'Sonbhadra', 'Mirzapur', 'Agra', 'Meerut'],
  'Bihar':            ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Nawada', 'Aurangabad', 'Jehanabad'],
  'Rajasthan':        ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Pali', 'Nagaur'],
  'Maharashtra':      ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Chandrapur', 'Yavatmal', 'Wardha'],
  'Andhra Pradesh':   ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Kurnool', 'Nellore', 'Tirupati'],
  'Telangana':        ['Hyderabad', 'Warangal', 'Khammam', 'Karimnagar', 'Mancherial', 'Adilabad'],
  'Karnataka':        ['Bangalore', 'Mysuru', 'Hubli', 'Bellary', 'Chitradurga', 'Tumkur'],
  'Tamil Nadu':       ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Vellore'],
  'Gujarat':          ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Anand'],
  'Assam':            ['Guwahati', 'Dibrugarh', 'Jorhat', 'Sibsagar', 'Tinsukia', 'Digboi'],
  'Meghalaya':        ['Shillong', 'Tura', 'Nongpoh', 'Jowai'],
  'Nagaland':         ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Bilaspur', 'Chamba'],
  'Uttarakhand':      ['Dehradun', 'Haridwar', 'Nainital', 'Roorkee', 'Almora'],
  'Punjab':           ['Amritsar', 'Ludhiana', 'Chandigarh', 'Jalandhar', 'Patiala'],
  'Haryana':          ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak'],
  'Delhi':            ['New Delhi', 'Dwarka', 'Rohini', 'Janakpuri', 'Laxmi Nagar'],
  'Goa':              ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  'Kerala':           ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
};

const STATES = Object.keys(STATE_CITY_MAP).sort();
const COURSES = ['Mining Mate', 'Foreman', 'Overman', 'Blaster', 'First Class (Coal)', 'Second Class (Coal)', 'First Class (Metal)', 'Second Class (Metal)'];
const CERT_TYPES = ['Restricted', 'Unrestricted'];

const FieldLabel = ({ text, required }: { text: string; required?: boolean }) => (
  <Text style={f.label}>
    {text}{required && <Text style={{ color: C.error }}> *</Text>}
  </Text>
);
const f = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' },
});

type DropdownProps = {
  visible: boolean; title: string; options: string[];
  onSelect: (val: string) => void; onClose: () => void;
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
  sheet: { backgroundColor: C.navyMid, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 32 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.navyLight, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  title: { fontSize: 13, fontWeight: '800', color: C.muted, letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.navyLight, marginBottom: 4 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  optionText: { fontSize: 15, color: C.white, fontWeight: '500' },
  arrow: { fontSize: 18, color: C.mutedDk },
});

const SelectorBtn = ({ value, placeholder, onPress, error }: { value: string; placeholder: string; onPress: () => void; error?: string }) => (
  <View style={{ marginBottom: 14 }}>
    <TouchableOpacity style={[sel.btn, error ? sel.btnError : value ? sel.btnFilled : null]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[sel.txt, !value && sel.placeholder]}>{value || placeholder}</Text>
      <Text style={sel.chevron}>▾</Text>
    </TouchableOpacity>
    {error ? <Text style={sel.error}>{error}</Text> : null}
  </View>
);

const sel = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyMid, borderRadius: 12, borderWidth: 1.5, borderColor: C.navyLight, paddingHorizontal: 14, height: 50 },
  btnError: { borderColor: C.error },
  btnFilled: { borderColor: 'rgba(245,158,11,0.35)' },
  txt: { fontSize: 15, color: C.white, fontWeight: '500', flex: 1 },
  placeholder: { color: C.mutedDk, fontWeight: '400' },
  chevron: { fontSize: 14, color: C.mutedDk, marginLeft: 8 },
  error: { fontSize: 11, color: C.error, fontWeight: '600', marginTop: 5, marginLeft: 4 },
});

export default function RegisterScreen({ navigation }: Props) {
  const [fullName,  setFullName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [dob,       setDob]       = useState('');
  const [state,     setState]     = useState('');
  const [city,      setCity]      = useState('');
  const [course,    setCourse]    = useState('');
  const [certType,  setCertType]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const [showState,    setShowState]    = useState(false);
  const [showCity,     setShowCity]     = useState(false);
  const [showCourse,   setShowCourse]   = useState(false);
  const [showCertType, setShowCertType] = useState(false);

  const handleStateSelect = (val: string) => { setState(val); setCity(''); };

  const handleDobChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length >= 3 && cleaned.length <= 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    else if (cleaned.length > 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    setDob(formatted);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (errors.phone) setErrors(e => ({ ...e, phone: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim())                  e.fullName = 'Full name required';
    if (!email.trim())                     e.email    = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Invalid email format';
    if (!phone || phone.length < 10)       e.phone    = 'Valid 10-digit number required';
    else if (!/^[6-9]\d{9}$/.test(phone)) e.phone    = 'Enter valid Indian mobile number';
    if (!dob || dob.length < 10)          e.dob      = 'Valid date required (DD/MM/YYYY)';
    if (!state)                            e.state    = 'Please select state';
    if (!city)                             e.city     = 'Please select city';
    if (!course)                           e.course   = 'Please select your course';
    if (!certType)                         e.certType = 'Please select certificate type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // TEMP: Sirf AsyncStorage mein save karo
      await AsyncStorage.multiSet([
        ['registered', 'true'],
        ['userName',   fullName],
        ['userEmail',  email],
        ['userPhone',  `+91${phone}`],
        ['userState',  state],
        ['userCity',   city],
        ['userCourse', course],
      ]);
      navigation.replace('MainTabs');
    } catch (err: any) {
      console.error('Register error:', err);
      setErrors(e => ({ ...e, submit: 'Something went wrong. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />
      <View style={s.ring1} />
      <View style={s.ring2} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.headerRow}>
            <View>
              <Text style={s.pageStep}>STEP 2 OF 2</Text>
              <Text style={s.pageTitle}>Create Account</Text>
              <Text style={s.pageSubtitle}>Fill in your details to get started</Text>
            </View>
            <View style={s.iconWrap}>
              <Text style={s.iconEmoji}>⛏️</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>👤  Personal Details</Text>

            <FieldLabel text="Full Name" required />
            <View style={[s.inputRow, errors.fullName ? s.inputError : null]}>
              <TextInput style={s.input} placeholder="Enter your full name" placeholderTextColor={C.mutedDk} value={fullName} onChangeText={(t) => { setFullName(t); if (errors.fullName) setErrors(e => ({ ...e, fullName: '' })); }} autoCapitalize="words" selectionColor={C.gold} />
            </View>
            {errors.fullName ? <Text style={s.errTxt}>{errors.fullName}</Text> : null}

            <FieldLabel text="Email Address" required />
            <View style={[s.inputRow, errors.email ? s.inputError : null]}>
              <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={C.mutedDk} value={email} onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(e => ({ ...e, email: '' })); }} keyboardType="email-address" autoCapitalize="none" selectionColor={C.gold} />
            </View>
            {errors.email ? <Text style={s.errTxt}>{errors.email}</Text> : null}

            <FieldLabel text="Mobile Number" required />
            <View style={[s.inputRow, errors.phone ? s.inputError : phone.length === 10 ? s.inputVerified : null]}>
              <Text style={s.phonePrefix}>+91</Text>
              <View style={s.phoneDivider} />
              <TextInput style={s.input} placeholder="10-digit mobile number" placeholderTextColor={C.mutedDk} value={phone} onChangeText={handlePhoneChange} keyboardType="number-pad" maxLength={10} selectionColor={C.gold} />
              {phone.length === 10 && <Text style={s.verifiedCheck}>✓</Text>}
            </View>
            {errors.phone ? <Text style={s.errTxt}>{errors.phone}</Text> : null}

            <FieldLabel text="Date of Birth" required />
            <View style={[s.inputRow, errors.dob ? s.inputError : null]}>
              <TextInput style={s.input} placeholder="DD/MM/YYYY" placeholderTextColor={C.mutedDk} value={dob} onChangeText={(t) => { handleDobChange(t); if (errors.dob) setErrors(e => ({ ...e, dob: '' })); }} keyboardType="number-pad" maxLength={10} selectionColor={C.gold} />
            </View>
            {errors.dob ? <Text style={s.errTxt}>{errors.dob}</Text> : null}
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>📍  Location</Text>
            <FieldLabel text="State" required />
            <SelectorBtn value={state} placeholder="Select your state" onPress={() => setShowState(true)} error={errors.state} />
            <FieldLabel text="City" required />
            <SelectorBtn value={city} placeholder={state ? 'Select your city' : 'Select state first'} onPress={() => { if (state) setShowCity(true); }} error={errors.city} />
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>📋  Exam Details</Text>
            <FieldLabel text="Course" required />
            <SelectorBtn value={course} placeholder="Select your course" onPress={() => setShowCourse(true)} error={errors.course} />
            <FieldLabel text="Certificate Type" required />
            <SelectorBtn value={certType} placeholder="Restricted or Unrestricted?" onPress={() => setShowCertType(true)} error={errors.certType} />
          </View>

          {errors.submit ? <Text style={s.submitError}>{errors.submit}</Text> : null}

          <TouchableOpacity style={[s.cta, loading && { opacity: 0.7 }]} onPress={handleRegister} activeOpacity={0.85} disabled={loading}>
            {loading ? <ActivityIndicator color={C.navy} size="small" /> : <Text style={s.ctaText}>Create Account  →</Text>}
          </TouchableOpacity>

          <Text style={s.disclaimer}>Your data is saved securely and used only for exam preparation purposes.</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <DropdownModal visible={showState} title="Select State" options={STATES} onSelect={handleStateSelect} onClose={() => setShowState(false)} />
      <DropdownModal visible={showCity} title="Select City" options={state ? STATE_CITY_MAP[state] : []} onSelect={setCity} onClose={() => setShowCity(false)} />
      <DropdownModal visible={showCourse} title="Select Course" options={COURSES} onSelect={setCourse} onClose={() => setShowCourse(false)} />
      <DropdownModal visible={showCertType} title="Certificate Type" options={CERT_TYPES} onSelect={setCertType} onClose={() => setShowCertType(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.navy },
  ring1: { position: 'absolute', width: 350, height: 350, borderRadius: 175, borderWidth: 1, borderColor: 'rgba(245,158,11,0.06)', top: -150, right: -120 },
  ring2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, borderWidth: 1, borderColor: 'rgba(16,185,129,0.05)', bottom: 60, left: -100 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 64 : 52, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  pageStep: { fontSize: 11, fontWeight: '700', color: C.gold, letterSpacing: 1.2, marginBottom: 6 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: C.white, letterSpacing: -0.8, marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: C.muted, fontWeight: '400' },
  iconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(245,158,11,0.10)', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.25)', alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 24 },
  section: { backgroundColor: C.navyCard, borderRadius: 16, borderWidth: 1, borderColor: C.navyLight, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.white, letterSpacing: 0.2, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.navyLight },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.navyMid, borderRadius: 12, borderWidth: 1.5, borderColor: C.navyLight, paddingHorizontal: 14, height: 50, marginBottom: 14 },
  inputError: { borderColor: C.error },
  inputVerified: { borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.05)' },
  input: { flex: 1, fontSize: 15, color: C.white, fontWeight: '500', padding: 0 },
  phonePrefix: { fontSize: 15, fontWeight: '700', color: C.white, marginRight: 8 },
  phoneDivider: { width: 1, height: 22, backgroundColor: C.navyLight, marginRight: 12 },
  verifiedCheck: { fontSize: 14, color: C.success, fontWeight: '800', marginLeft: 8 },
  errTxt: { fontSize: 11, color: C.error, fontWeight: '600', marginTop: -10, marginBottom: 10, marginLeft: 4 },
  submitError: { fontSize: 13, color: C.error, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  cta: { backgroundColor: C.gold, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  ctaText: { color: C.navy, fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  disclaimer: { textAlign: 'center', fontSize: 11.5, color: C.mutedDk, lineHeight: 17, marginTop: 16 },
});
