
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
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const { error } = await signUp(email.trim(), password, name.trim());
      
      if (error) {
        Alert.alert('Registration Failed', error);
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (Platform.OS === 'web') {
          Alert.alert('Kayıt Başarılı', 'Hesabınız oluşturuldu. Yönetici onayı sonrasında giriş yapabilirsiniz.');
          router.replace('/(tabs)/(home)');
        } else {
          Alert.alert(
            'Kayıt Başarılı',
            'Hesabınız oluşturuldu. Yönetici onayı sonrasında giriş yapabilirsiniz.',
            [
              {
                text: 'Tamam',
                onPress: () => router.replace('/(tabs)/(home)'),
              },
            ]
          );
        }
      }
    } catch (error) {
      // console.log('Registration error:', error);
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
        <View style={styles.header}>
          <IconSymbol name="person.badge.plus.fill" size={80} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Join us and start your quiz adventure
          </Text>
        </View>

        <GlassView style={[
          styles.form,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <View style={styles.inputContainer}>
            <IconSymbol name="person.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

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

          <View style={styles.inputContainer}>
            <IconSymbol name="lock.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Password"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <IconSymbol
                name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                size={20}
                color={theme.dark ? '#98989D' : '#666'}
              />
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <IconSymbol name="lock.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <IconSymbol
                name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                size={20}
                color={theme.dark ? '#98989D' : '#666'}
              />
            </Pressable>
          </View>

          <Pressable
            style={[buttonStyles.primary, loading && buttonStyles.disabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={buttonStyles.primaryText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>
        </GlassView>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Already have an account?
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
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
  eyeButton: {
    padding: 4,
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
