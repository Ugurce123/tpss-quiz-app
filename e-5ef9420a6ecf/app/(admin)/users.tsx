
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/quiz';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import AuthGuard from '@/components/AuthGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'blocked'>('all');
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'status'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // For now, load from mock storage
      const storedUsers = await AsyncStorage.getItem('demo_users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers);
      }
    } catch (error) {
      // console.log('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    if (Platform.OS === 'web') {
      const ok = confirm(`Bu kullanıcıyı ${newRole === 'admin' ? 'admin yapmak' : 'normal kullanıcı yapmak'} istediğinizden emin misiniz?`);
      if (!ok) return;
      try {
        const updatedUsers = users.map(user => user.id === userId ? { ...user, role: newRole } : user);
        setUsers(updatedUsers);
        await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
      } catch (error) {
        Alert.alert('Hata', 'Kullanıcı rolü güncellenemedi');
      }
      return;
    }
    
    Alert.alert(
      'Kullanıcı Rolünü Değiştir',
      `Bu kullanıcıyı ${newRole === 'admin' ? 'admin yapmak' : 'normal kullanıcı yapmak'} istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const updatedUsers = users.map(user => user.id === userId ? { ...user, role: newRole } : user);
              setUsers(updatedUsers);
              await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı rolü güncellenemedi');
            }
          },
        },
      ]
    );
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      Alert.alert('Hata', 'Kendi hesabınızı silemezsiniz');
      return;
    }

    if (Platform.OS === 'web') {
      const ok = confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`);
      if (!ok) return;
      try {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
      } catch (error) {
        Alert.alert('Hata', 'Kullanıcı silinemedi');
      }
      return;
    }

    Alert.alert(
      'Kullanıcıyı Sil',
      `${userName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              const updatedUsers = users.filter(user => user.id !== userId);
              setUsers(updatedUsers);
              await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı silinemedi');
            }
          },
        },
      ]
    );
  };

  const approveUser = async (userId: string, userName: string) => {
    if (Platform.OS === 'web') {
      const ok = confirm(`${userName} kullanıcısını onaylamak istediğinizden emin misiniz?`);
      if (!ok) return;
      try {
        const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'active' } : u);
        setUsers(updatedUsers);
        await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
        if (Platform.OS === 'web') { alert('Bildirim: Kullanıcıya e‑posta gönderildi (mock)'); } else { Alert.alert('Bildirim', 'Kullanıcıya e‑posta gönderildi (mock)'); }
      } catch (error) {
        Alert.alert('Hata', 'Kullanıcı onaylanamadı');
      }
      return;
    }

    Alert.alert(
      'Kullanıcıyı Onayla',
      `${userName} kullanıcısını onaylamak istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'active' } : u);
              setUsers(updatedUsers);
              await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
              Alert.alert('Bildirim', 'Kullanıcıya e‑posta gönderildi (mock)');
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı onaylanamadı');
            }
          },
        },
      ]
    );
  };

 const blockUser = async (userId: string, userName: string) => {
    if (Platform.OS === 'web') {
      const ok = confirm(`${userName} kullanıcısını bloke etmek istediğinizden emin misiniz?`);
      if (!ok) return;
      try {
        const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'blocked' } : u);
        setUsers(updatedUsers);
        await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
        // E-posta bildirim mock'u
        if (Platform.OS === 'web') { alert('Bildirim: Kullanıcıya e‑posta gönderildi (mock)'); } else { Alert.alert('Bildirim', 'Kullanıcıya e‑posta gönderildi (mock)'); }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        Alert.alert('Hata', 'Kullanıcı bloke edilemedi');
      }
      return;
    }
    Alert.alert(
      'Kullanıcıyı Bloke Et',
      `${userName} kullanıcısını bloke etmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Bloke Et',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'blocked' } : u);
              setUsers(updatedUsers);
              await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı bloke edilemedi');
            }
          },
        },
      ]
    );
 };

 const activateUser = async (userId: string, userName: string) => {
    if (Platform.OS === 'web') {
      const ok = confirm(`${userName} kullanıcısını aktifleştirmek istediğinizden emin misiniz?`);
      if (!ok) return;
      try {
        const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'active' } : u);
        setUsers(updatedUsers);
        await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
        // E-posta bildirim mock'u
        if (Platform.OS === 'web') { alert('Bildirim: Kullanıcıya e‑posta gönderildi (mock)'); } else { Alert.alert('Bildirim', 'Kullanıcıya e‑posta gönderildi (mock)'); }
      } catch (error) {
        Alert.alert('Hata', 'Kullanıcı aktifleştirilemedi');
      }
      return;
    }
    Alert.alert(
      'Kullanıcıyı Aktifleştir',
      `${userName} kullanıcısını aktifleştirmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Aktifleştir',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'active' } : u);
              setUsers(updatedUsers);
              await AsyncStorage.setItem('demo_users', JSON.stringify(updatedUsers));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı aktifleştirilemedi');
            }
          },
        },
      ]
    );
 };

  const renderUser = (user: User) => (
    <GlassView
      key={user.id}
      style={[
        styles.userCard,
        Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
      ]}
      glassEffectStyle="regular"
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <IconSymbol
            name={(user.role ?? 'user') === 'admin' ? 'crown.fill' : 'person.circle.fill'}
            size={40}
            color={(user.role ?? 'user') === 'admin' ? colors.warning : theme.colors.primary}
          />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.colors.text }]}
              onPress={() => router.push(`/(admin)/user/${user.id}`)}
            >
              {user.name}
            </Text>
            <Text style={[styles.userEmail, { color: theme.dark ? '#98989D' : '#666' }]}
              onPress={() => router.push(`/(admin)/user/${user.id}`)}
            >
              {user.email}
            </Text>
            <View style={styles.roleContainer}>
              <Text style={[
                styles.roleText,
                {
                  color: user.role === 'admin' ? colors.warning : colors.success,
                  backgroundColor: user.role === 'admin' ? `${colors.warning}20` : `${colors.success}20`,
                }
              ]}>
                {(user.role ?? 'user').toUpperCase()}
              </Text>
            </View>
            <View style={styles.roleContainer}>
              <Text style={[
                styles.roleText,
                {
                  color: (user.status ?? 'pending') === 'pending' ? colors.warning : ((user.status ?? 'pending') === 'active' ? colors.success : colors.error),
                  backgroundColor: ((user.status ?? 'pending') === 'pending' ? `${colors.warning}20` : ((user.status ?? 'pending') === 'active' ? `${colors.success}20` : `${colors.error}20`)),
                }
              ]}>
                {(user.status ?? 'pending').toUpperCase()}
              </Text>
            </View>
          </View>
          {multiSelect && (
            <Pressable onPress={() => toggleSelect(user.id)} style={[styles.actionButton, { backgroundColor: '#00000010' }]}> 
              <IconSymbol name={selectedIds.has(user.id) ? 'checkmark.square.fill' : 'square'} size={18} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>{selectedIds.has(user.id) ? 'Seçildi' : 'Seç'}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.userActions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: `${theme.colors.primary}20` }]}
            onPress={() => toggleUserRole(user.id, user.role)}
          >
            <IconSymbol
              name={(user.role ?? 'user') === 'admin' ? 'person.fill' : 'crown.fill'}
              size={16}
              color={theme.colors.primary}
            />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}> 
              {(user.role ?? 'user') === 'admin' ? 'Admin Kaldır' : 'Admin Yap'}
            </Text>
          </Pressable>
          
          {(user.status ?? 'pending') === 'pending' && (
            <Pressable
              style={[styles.actionButton, { backgroundColor: `${colors.success}20` }]}
              onPress={() => approveUser(user.id, user.name)}
            >
              <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.success }]}>Onayla</Text>
            </Pressable>
          )}
          {(user.status ?? 'pending') === 'pending' && (
            <Pressable
              style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}
              onPress={() => blockUser(user.id, user.name)}
            >
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Reddet</Text>
            </Pressable>
          )}
          {(user.status ?? 'pending') === 'active' && (
            <Pressable
              style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}
              onPress={() => blockUser(user.id, user.name)}
            >
              <IconSymbol name="hand.raised.fill" size={16} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Bloke Et</Text>
            </Pressable>
          )}
          {(user.status ?? 'pending') === 'blocked' && (
            <Pressable
              style={[styles.actionButton, { backgroundColor: `${colors.success}20` }]}
              onPress={() => activateUser(user.id, user.name)}
            >
              <IconSymbol name="arrow.uturn.left.circle.fill" size={16} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.success }]}>Aktifleştir</Text>
            </Pressable>
          )}
          
          {user.id !== currentUser?.id && (
            <Pressable
              style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}
              onPress={() => deleteUser(user.id, user.name)}
            >
              <IconSymbol name="trash.fill" size={16} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}> 
                Sil
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </GlassView>
  );

  return (
    <AuthGuard requireAdmin>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Kullanıcı Yönetimi</Text>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.filterBar}>
            <Pressable
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => { setFilter('all'); setPage(1); }}
            >
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Tümü</Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
              onPress={() => { setFilter('pending'); setPage(1); }}
            >
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Bekleyen</Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
              onPress={() => { setFilter('active'); setPage(1); }}
            >
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Aktif</Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filter === 'blocked' && styles.filterButtonActive]}
              onPress={() => { setFilter('blocked'); setPage(1); }}
            >
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Bloklu</Text>
            </Pressable>
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text, borderColor: theme.colors.primary }]}
              placeholder="Ara: isim veya e‑posta"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              value={query}
              onChangeText={(t) => { setQuery(t); setPage(1); }}
            />
            <Pressable style={[styles.filterButton]} onPress={() => setSortField(sortField === 'name' ? 'createdAt' : (sortField === 'createdAt' ? 'status' : 'name'))}>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Sırala: {sortField}</Text>
            </Pressable>
            <Pressable style={[styles.filterButton]} onPress={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Yön: {sortDir}</Text>
            </Pressable>
            <Pressable style={[styles.filterButton]} onPress={() => setMultiSelect(!multiSelect)}>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>{multiSelect ? 'Çoklu Seçim: Açık' : 'Çoklu Seçim: Kapalı'}</Text>
            </Pressable>
            <Pressable style={[styles.filterButton]} onPress={exportCsv}>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>CSV Dışa Aktar</Text>
            </Pressable>
          </View>
          {multiSelect && (
            <View style={styles.bulkBar}>
              <Pressable style={[styles.actionButton, { backgroundColor: `${colors.success}20` }]} onPress={bulkApprove}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
                <Text style={[styles.actionText, { color: colors.success }]}>Toplu Onayla</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]} onPress={bulkBlock}>
                <IconSymbol name="hand.raised.fill" size={16} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Toplu Bloke Et</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, { backgroundColor: `#00000010` }]} onPress={clearSelection}>
                <IconSymbol name="xmark.circle.fill" size={16} color={theme.colors.text} />
                <Text style={[styles.actionText, { color: theme.colors.text }]}>Seçimi Temizle ({selectedIds.size})</Text>
              </Pressable>
            </View>
          )}
          {loading ? (
            <View style={styles.loadingContainer}>
              <IconSymbol name="hourglass" size={48} color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}> 
                Kullanıcılar yükleniyor...
              </Text>
            </View>
          ) : users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="person.3.fill" size={48} color={theme.dark ? '#98989D' : '#666'} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}> 
                Kullanıcı bulunamadı
              </Text>
            </View>
          ) : (
            <View style={styles.usersList}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Toplam Kullanıcı: {users.length} • Gösterilen: {users.filter(u => filter === 'all' ? true : (u.status ?? 'pending') === filter).length}
              </Text>
              {users.filter(u => filter === 'all' ? true : (u.status ?? 'pending') === filter).map(renderUser)}
              {(() => {
                const filtered = users.filter(u => (filter === 'all' ? true : (u.status ?? 'pending') === filter));
                const searched = filtered.filter(u => {
                  const q = query.trim().toLowerCase();
                  if (!q) return true;
                  return (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q);
                });
                const sorted = [...searched].sort((a,b) => {
                  const dir = sortDir === 'asc' ? 1 : -1;
                  if (sortField === 'name') return (a.name ?? '').localeCompare(b.name ?? '') * dir;
                  if (sortField === 'status') return (a.status ?? '').localeCompare(b.status ?? '') * dir;
                  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return (aTime - bTime) * dir;
                });
                const total = sorted.length;
                const start = (page-1)*pageSize;
                const end = start + pageSize;
                const pageItems = sorted.slice(start, end);
                return (
                  <>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      Toplam Kullanıcı: {users.length} • Gösterilen: {total} • Sayfa: {page}
                    </Text>
                    {pageItems.map(renderUser)}
                    <View style={styles.paginationBar}>
                      <Pressable style={[styles.filterButton]} onPress={() => setPage(Math.max(1, page-1))}><Text style={[styles.actionText, { color: theme.colors.text }]}>Önceki</Text></Pressable>
                      <Pressable style={[styles.filterButton]} onPress={() => setPage(page + (end < total ? 1 : 0))} disabled={end >= total}><Text style={[styles.actionText, { color: theme.colors.text }]}>Sonraki</Text></Pressable>
                    </View>
                  </>
                );
              })()}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    ...commonStyles.text,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#00000010',
  },
  filterButtonActive: {
    backgroundColor: '#00000020',
    borderWidth: 1,
    borderColor: '#00000030',
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    ...commonStyles.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    ...commonStyles.text,
  },
  // Arama kutusu stili
  searchInput: {
    flex: 1,
    minWidth: 160,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    ...commonStyles.text,
  },
  // Toplu işlem barı
  bulkBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  // Sayfalama barı
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  usersList: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    ...commonStyles.text,
  },
  userCard: {
    borderRadius: 16,
    padding: 16,
  },
  userInfo: {
    gap: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    ...commonStyles.text,
  },
  userEmail: {
    fontSize: 14,
    ...commonStyles.text,
  },
  roleContainer: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    ...commonStyles.text,
  },
});

// Helper functions for multi-select and CSV export
const toggleSelect = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
};

const clearSelection = () => {
  setSelectedIds(new Set());
};

const exportCsv = () => {
  if (Platform.OS === 'web') {
    const headers = ['id','name','email','role','status','createdAt'];
    const rows = users.map(u => [u.id, u.name, u.email, u.role, u.status, u.createdAt]);
    const escape = (v: any) => String(v).replace(/"/g, '""');
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${escape(v)}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    Alert.alert('CSV', 'Dışa aktarma şimdilik sadece web üzerinde destekleniyor');
  }
};

const bulkApprove = async () => {
  try {
    const updated = users.map(u => selectedIds.has(u.id) && u.status !== 'active' ? { ...u, status: 'active' } : u);
    setUsers(updated);
    await AsyncStorage.setItem('demo_users', JSON.stringify(updated));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    Alert.alert('Hata', 'Toplu onay başarısız');
  }
};

const bulkBlock = async () => {
  try {
    const updated = users.map(u => selectedIds.has(u.id) && u.status !== 'blocked' ? { ...u, status: 'blocked' } : u);
    setUsers(updated);
    await AsyncStorage.setItem('demo_users', JSON.stringify(updated));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    Alert.alert('Hata', 'Toplu bloke başarısız');
  }
};
