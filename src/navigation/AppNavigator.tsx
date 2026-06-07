import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

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
  // Auth flow
  Onboarding:   undefined;
  Login:        undefined;
  MobileVerify: undefined;

  // phone string — OTP verify ke baad Register mein auto-fill hoga
  OtpVerify:    { phone: string };
  Register:     { phone: string };

  MainTabs:  undefined;
  FirstAid:  undefined;
  Courses:   undefined;
  Tests:     undefined;
  Announcements: undefined;

  // Course screens
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

// ─── Typed navigation prop ─────────────────────────────────────────────────────
export type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Stack instance ────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator<RootStackParamList>();

const CoursesScreen = () => null;
const TestsScreen   = () => null;

// ─── Navigator ─────────────────────────────────────────────────────────────────
export default function AppNavigator() {
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
        <Stack.Screen name="Onboarding"   component={OnboardingScreen}   />
        <Stack.Screen name="Login"        component={LoginScreen}        />
        <Stack.Screen name="MobileVerify" component={MobileVerifyScreen} />
        <Stack.Screen name="OtpVerify"    component={OtpVerifyScreen}    />
        <Stack.Screen name="Register"     component={RegisterScreen}     />

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

        {/* Other screens */}
        <Stack.Screen name="FirstAid" component={FirstAidCenter} />
        <Stack.Screen name="Courses"  component={CoursesScreen}  />
        <Stack.Screen name="Tests"    component={TestsScreen}    />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
