
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState((params.email as string) || '');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await resetPassword(email.trim());
      
      if (error) {
        Alert.alert('Reset Failed', error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Reset Email Sent',
          'Check your email for password reset instructions.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      // console.log('Reset password error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
        </Pressable>

        <View style={styles.header}>
          <IconSymbol name="key.fill" size={80} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Enter your email address and we'll send you instructions to reset your password
          </Text>
        </View>

        <GlassView style={[
          styles.form,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <View style={styles.inputContainer}>
            <IconSymbol name="envelope.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Email"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable
            style={[buttonStyles.primary, loading && buttonStyles.disabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={buttonStyles.primaryText}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Text>
          </Pressable>
        </GlassView>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Remember your password?
          </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              Sign In
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    ...commonStyles.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    ...commonStyles.text,
  },
  form: {
    borderRadius: 16,
    padding: 24,
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    ...commonStyles.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 16,
    ...commonStyles.text,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    ...commonStyles.text,
  },
});
