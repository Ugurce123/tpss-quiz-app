
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, requireAdmin = false, fallback }: AuthGuardProps) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const theme = useTheme();

  // console.log('AuthGuard - State:', { isAuthenticated, isAdmin, loading, user: user?.name });

  if (loading) {
    // console.log('AuthGuard - Showing loading state');
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <IconSymbol name="hourglass" size={48} color={theme.colors.primary} />
        <Text style={[styles.text, { color: theme.colors.text }]}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    // console.log('AuthGuard - User not authenticated, showing fallback or default');
    return fallback || (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <IconSymbol name="lock.fill" size={48} color={colors.error} />
        <Text style={[styles.text, { color: theme.colors.text }]}>
          Bu özelliğe erişmek için giriş yapın
        </Text>
      </View>
    );
  }

  if (requireAdmin && !isAdmin) {
    // console.log('AuthGuard - Admin access required but user is not admin');
    return fallback || (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <IconSymbol name="exclamationmark.shield.fill" size={48} color={colors.warning} />
        <Text style={[styles.text, { color: theme.colors.text }]}>
          Admin erişimi gerekli
        </Text>
      </View>
    );
  }

  // console.log('AuthGuard - Authentication passed, rendering children');
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    ...commonStyles.text,
  },
});
