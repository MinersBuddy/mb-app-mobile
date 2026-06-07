import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// ─── Screen imports ────────────────────────────────────────────────────────────
import OnboardingScreen    from '../screens/auth/OnboardingScreen';
import LoginScreen         from '../screens/auth/LoginScreen';
import RegisterScreen      from '../screens/auth/RegisterScreen';
import MobileVerifyScreen  from '../screens/auth/MobileVerifyScreen';
import OtpVerifyScreen     from '../screens/auth/Otpverifyscreen';
import FirstAidCenter      from '../screens/Home/FirstAidCenter';
import ChapterListScreen   from '../components/ChapterListScreen';
import QuizScreen, { QuizQuestion } from '../components/QuizScreen';
import MainTabNavigator    from './MainTabNavigator';
import AnnouncementScreen  from '../screens/Home/AnnouncementScreen';

// ─── Data type imports ─────────────────────────────────────────────────────────
import { CourseConfig, Chapter } from '../data/courseConfig';

// ─── Route param list ──────────────────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding:    undefined;
  Login:         undefined;
  MobileVerify:  undefined;
  OtpVerify:     { phone: string };
  Register:      { phone: string };
  MainTabs:      undefined;
  FirstAid:      undefined;
  Courses:       undefined;
  Tests:         undefined;
  Announcements: undefined;
  ChapterList: {
    course?:      CourseConfig;
    chapter?:     Chapter;
    courseColor?: string;
    courseName?:  string;
  };
  QuizScreen: {
    quizTitle:   string;
    courseColor: string;
    courseIcon?: string;
    questions:   QuizQuestion[];
  };
};

export type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const CoursesScreen = () => null;
const TestsScreen   = () => null;

// ─── Navigator ─────────────────────────────────────────────────────────────────
export default function AppNavigator() {

  // Firebase confirmation result — MobileVerify set karta hai, OtpVerify use karta hai
  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  // ── Firebase helpers ─────────────────────────────────────────────────────

  const sendOtp = async (phoneE164: string): Promise<void> => {
    const result = await auth().signInWithPhoneNumber(phoneE164);
    setConfirmation(result);
  };

  const verifyOtp = async (_phone: string, otp: string): Promise<void> => {
    if (!confirmation) throw new Error('No confirmation. Please resend OTP.');
    await confirmation.confirm(otp);
  };

  const resendOtp = async (phoneE164: string): Promise<void> => {
    const result = await auth().signInWithPhoneNumber(phoneE164);
    setConfirmation(result);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0F1923' },
        }}
      >
        {/* Auth */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login"      component={LoginScreen}      />

        {/* MobileVerify — sendOtp inject */}
        <Stack.Screen name="MobileVerify">
          {(props) => (
            <MobileVerifyScreen
              {...props}
              onSendOtp={sendOtp}
            />
          )}
        </Stack.Screen>

        {/* OtpVerify — verifyOtp + resendOtp inject */}
        <Stack.Screen name="OtpVerify">
          {(props) => (
            <OtpVerifyScreen
              {...props}
              onVerifyOtp={verifyOtp}
              onResendOtp={resendOtp}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Main app */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ animation: 'fade' }}
        />

        {/* Course screens */}
        <Stack.Screen name="ChapterList"   component={ChapterListScreen}  />
        <Stack.Screen name="QuizScreen"    component={QuizScreen}         />
        <Stack.Screen name="Announcements" component={AnnouncementScreen} />

        {/* Other */}
        <Stack.Screen name="FirstAid" component={FirstAidCenter} />
        <Stack.Screen name="Courses"  component={CoursesScreen}  />
        <Stack.Screen name="Tests"    component={TestsScreen}    />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
