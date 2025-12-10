
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
import { useTheme } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingBanner, setPendingBanner] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      // console.log('Login - Attempting login for:', email);
      
      const { error } = await signIn(email.trim(), password);
      
      if (error) {
        if (error.includes('henüz onaylanmadı')) {
          setPendingBanner('Hesabınız henüz onaylanmadı. Yönetici onayı sonrası giriş yapabilirsiniz.');
        }
        Alert.alert('Giriş Hatası', error);
      } else {
        // console.log('Login - Success, navigating to tabs');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.replace('/(tabs)');
      }
    } catch (error) {
      // console.log('Login - Unexpected error:', error);
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // console.log('Login - Navigating to forgot password');
    router.push('/(auth)/forgot-password');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconSymbol name="person.circle.fill" size={80} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Giriş Yap</Text>
          <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}> 
            Hesabınıza giriş yapın
          </Text>
        </View>

        <GlassView style={[
          styles.form,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          {pendingBanner && (
            <View style={[styles.banner, { borderColor: colors.warning, backgroundColor: `${colors.warning}20` }]}> 
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <IconSymbol name="hourglass" size={18} color={colors.warning} />
                <Text style={[styles.bannerText, { color: theme.colors.text }]}>{pendingBanner}</Text>
              </View>
              <Pressable onPress={() => setPendingBanner(null)} style={[styles.bannerClose]}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.warning} />
              </Pressable>
            </View>
          )}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>E-posta</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderColor: theme.colors.border,
                }
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@email.com"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Şifre</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderColor: theme.colors.border,
                }
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Şifrenizi girin"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[buttonStyles.primary, loading && buttonStyles.disabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={buttonStyles.primaryText}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
              Şifremi Unuttum
            </Text>
          </Pressable>
        </GlassView>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Hesabınız yok mu?{' '}
          </Text>
          <Pressable onPress={() => {
            console.log('Login - Navigating to register');
            router.push('/(auth)/register');
          }}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              Kayıt Ol
            </Text>
          </Pressable>
        </View>

        {/* Demo hesap bilgileri kaldırıldı */}
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
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    borderRadius: 12,
    padding: 24,
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 16,
  },
  footerLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  demoCredentials: {
    alignItems: 'center',
    gap: 4,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  bannerText: {
    ...commonStyles.text,
  },
  bannerClose: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
