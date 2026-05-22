import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BarChart2, BookMarked, Home, Trophy, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen      from '../screens/Home/homescreen';
import AnalyticsScreen from '../screens/Home/Analyticsscreen';
import LeaderboardScreen from '../screens/Home/LeaderboardScreen';
import PremiumScreen   from '../screens/Home/PremiumScreen';
import CommunityScreen from '../screens/Home/Communityscreen';

const COLORS = {
  navy: '#0F1923',
  navyMid: '#1A2B3C',
  navyLight: '#243447',
  gold: '#F59E0B',
  mutedDark: '#64748B',
  white: '#FFFFFF',
};

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',        icon: Home,       label: 'Home'        },
  { name: 'Analytics',   icon: BarChart2,  label: 'Analytics'   },
  { name: 'Premium',     icon: BookMarked, label: 'Courses'     },
  { name: 'Community',   icon: Users,      label: 'Community'   },
  { name: 'Leaderboard', icon: Trophy, label: 'Leaderboard' },
];

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props:any) => {
        const currentRoute = props.state.routes[props.state.index].name;
        if (currentRoute === 'Community') return null;
        return <CustomTabBar {...props} />;
      }}
    >
      <Tab.Screen name="Home"        component={HomeScreen}        />
      <Tab.Screen name="Analytics"   component={AnalyticsScreen}   />
      <Tab.Screen name="Premium"     component={PremiumScreen}     />
      <Tab.Screen name="Community"   component={CommunityScreen}   />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Tab.Navigator>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.tabBar,
     { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }
     ]}>
      {TABS.map((tab, index) => {
        const IconComponent = tab.icon;
        const isActive = state.index === index;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(tab.name)}
          >
            <IconComponent size={20} color={isActive ? COLORS.gold : COLORS.mutedDark} />
            <Text style={[styles.tabLabel, isActive && { color: COLORS.gold }]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.navyMid,
    borderTopWidth: 1,
    borderTopColor: COLORS.navyLight,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.mutedDark,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    top: -10,
    width: 28,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gold,
  },
});