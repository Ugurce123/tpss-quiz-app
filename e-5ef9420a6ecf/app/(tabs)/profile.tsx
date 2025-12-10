
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { colors, commonStyles, buttonStyles } from "@/styles/commonStyles";
import AuthGuard from "@/components/AuthGuard";
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { user, isAdmin, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  
  const theme = useTheme();
  const router = useRouter();

  const handleSaveProfile = async () => {
    setLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      // console.log('Profile - Saving profile changes...');
      
      const { error } = await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      });

      if (error) {
        // console.log('Profile - Update error:', error);
        Alert.alert('Hata', error);
      } else {
        // console.log('Profile - Profile updated successfully');
        setEditing(false);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      // console.log('Profile - Update profile error:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    // Web için confirm fallback
    if (Platform.OS === 'web') {
      const confirmed = typeof (globalThis as any).confirm === 'function'
        ? (globalThis as any).confirm('Çıkış yapmak istediğinizden emin misiniz?')
        : true;
      if (!confirmed) return;
      (async () => {
        try {
          setSigningOut(true);
          await signOut();
          router.replace('/(auth)/login');
        } catch (error) {
          Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
        } finally {
          setSigningOut(false);
        }
      })();
      return;
    }

    // console.log('Profile - Sign out button pressed');
    
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { 
          text: 'İptal', 
          style: 'cancel',
          onPress: () => {},
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              // console.log('Profile - Starting sign out process...');
              setSigningOut(true);
              
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              
              // Sign out from auth context
              await signOut();
              
              // console.log('Profile - Sign out completed, navigating to login...');
              
              // Navigate to login screen
              router.replace('/(auth)/login');
              
            } catch (error) {
              // console.log('Profile - Sign out error:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const NotAuthenticatedView = () => (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        <GlassView style={[
          styles.profileHeader,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <IconSymbol name="person.circle" size={80} color={theme.dark ? '#98989D' : '#666'} />
          <Text style={[styles.name, { color: theme.colors.text }]}>Misafir Kullanıcı</Text>
          <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>
            Profilinize erişmek için giriş yapın
          </Text>
        </GlassView>

        <GlassView style={[
          styles.section,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <Pressable
            style={buttonStyles.primary}
            onPress={() => {
              console.log('Profile - Navigating to login from guest view');
              router.push('/(auth)/login');
            }}
          >
            <Text style={buttonStyles.primaryText}>Giriş Yap</Text>
          </Pressable>
          
          <Pressable
            style={buttonStyles.secondary}
            onPress={() => {
              console.log('Profile - Navigating to register from guest view');
              router.push('/(auth)/register');
            }}
          >
            <Text style={[buttonStyles.secondaryText, { color: theme.colors.primary }]}>
              Hesap Oluştur
            </Text>
          </Pressable>
        </GlassView>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <AuthGuard fallback={<NotAuthenticatedView />}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
        >
          <GlassView style={[
            styles.profileHeader,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]} glassEffectStyle="regular">
            <View style={styles.avatarContainer}>
              <IconSymbol
                name={isAdmin ? 'crown.fill' : 'person.circle.fill'}
                size={80}
                color={isAdmin ? colors.warning : theme.colors.primary}
              />
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMİN</Text>
                </View>
              )}
            </View>
            
            {editing ? (
              <TextInput
                style={[styles.nameInput, { color: theme.colors.text, borderColor: theme.colors.primary }]}
                value={name}
                onChangeText={setName}
                placeholder="Ad Soyad"
                placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              />
            ) : (
              <Text style={[styles.name, { color: theme.colors.text }]}>{user?.name}</Text>
            )}
            
            <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>
              {user?.email}
            </Text>
          </GlassView>

          <GlassView style={[
            styles.section,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]} glassEffectStyle="regular">
            <View style={styles.infoRow}>
              <IconSymbol name="phone.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
              {editing ? (
                <TextInput
                  style={[styles.infoInput, { color: theme.colors.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Telefon numarası"
                  placeholderTextColor={theme.dark ? '#98989D' : '#666'}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {user?.phone || 'Telefon numarası yok'}
                </Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <IconSymbol name="location.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
              {editing ? (
                <TextInput
                  style={[styles.infoInput, { color: theme.colors.text }]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Konum"
                  placeholderTextColor={theme.dark ? '#98989D' : '#666'}
                />
              ) : (
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {user?.location || 'Konum belirtilmemiş'}
                </Text>
              )}
            </View>
          </GlassView>

          <GlassView style={[
            styles.section,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]} glassEffectStyle="regular">
            {editing ? (
              <View style={styles.editActions}>
                <Pressable
                  style={[buttonStyles.primary, loading && buttonStyles.disabled]}
                  onPress={handleSaveProfile}
                  disabled={loading}
                >
                  <Text style={buttonStyles.primaryText}>
                    {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </Text>
                </Pressable>
                
                <Pressable
                  style={buttonStyles.secondary}
                  onPress={() => {
                    console.log('Profile - Cancelling edit mode');
                    setEditing(false);
                    setName(user?.name || '');
                    setPhone(user?.phone || '');
                    setLocation(user?.location || '');
                  }}
                >
                  <Text style={[buttonStyles.secondaryText, { color: theme.colors.text }]}>
                    İptal
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.actions}>
                <Pressable
                  style={buttonStyles.secondary}
                  onPress={() => {
                    console.log('Profile - Entering edit mode');
                    setEditing(true);
                  }}
                >
                  <IconSymbol name="pencil" size={16} color={theme.colors.primary} />
                  <Text style={[buttonStyles.secondaryText, { color: theme.colors.primary }]}>
                    Profili Düzenle
                  </Text>
                </Pressable>
                
                {isAdmin && (
                  <>
                    <Pressable
                      style={[buttonStyles.secondary, { backgroundColor: `${colors.warning}20` }]}
                      onPress={() => {
                        console.log('Profile - Navigating to admin panel (users)');
                        router.push('/(admin)/users');
                      }}
                    >
                      <IconSymbol name="person.3.fill" size={16} color={colors.warning} />
                      <Text style={[buttonStyles.secondaryText, { color: colors.warning }]}> Kullanıcıları Yönet </Text>
                    </Pressable>

                    <Pressable
                      style={[buttonStyles.secondary, { backgroundColor: `${colors.primary}20` }]}
                      onPress={() => {
                        console.log('Profile - Navigating to admin panel (questions)');
                        router.push('/(admin)/questions');
                      }}
                    >
                      <IconSymbol name="questionmark.circle.fill" size={16} color={colors.primary} />
                      <Text style={[buttonStyles.secondaryText, { color: colors.primary }]}> Soruları Yönet </Text>
                    </Pressable>
                  </>
                )}
                
                <Pressable
                  style={[
                    buttonStyles.secondary, 
                    { backgroundColor: `${colors.error}20` },
                    signingOut && buttonStyles.disabled
                  ]}
                  onPress={handleSignOut}
                  disabled={signingOut}
                >
                  <IconSymbol 
                    name="rectangle.portrait.and.arrow.right" 
                    size={16} 
                    color={colors.error} 
                  />
                  <Text style={[buttonStyles.secondaryText, { color: colors.error }]}>
                    {signingOut ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
                  </Text>
                </Pressable>
              </View>
            )}
          </GlassView>
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor handled dynamically
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  adminBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    // color handled dynamically
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 200,
  },
  email: {
    fontSize: 16,
    // color handled dynamically
  },
  section: {
    borderRadius: 12,
    padding: 20,
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
    // color handled dynamically
  },
  infoInput: {
    fontSize: 16,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
  },
  actions: {
    gap: 12,
  },
  editActions: {
    gap: 12,
  },
});
