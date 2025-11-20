
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  // console.log('TabLayout - Rendering tab layout');
  const { isAuthenticated } = useAuth();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 90 : 70,
          display: isAuthenticated ? 'flex' : 'none',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="house.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'TPSS Hazırlık Sınavı',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="questionmark.circle.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Sonuçlar',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="chart.bar.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="person.fill" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
