import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Question } from '@/types/quiz';
import { getAllQuestions, addQuestion, updateQuestion, deleteQuestion, hideQuestion, unhideQuestion, isCustomQuestion } from '@/data/questions';

export default function AdminQuestionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(getAllQuestions());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No async storage fetch here, data source is synced via helper functions
    setQuestions(getAllQuestions());
  }, []);

  const refresh = () => setQuestions(getAllQuestions());

  const [form, setForm] = useState<Omit<Question, 'id'>>({
    question: '',
    options: ['', '', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: '',
    difficulty: 'easy',
    level: 1,
    image: undefined,
  });

  const resetForm = () => setForm({ question: '', options: ['', '', '', '', ''], correctAnswer: 0, explanation: '', category: '', difficulty: 'easy', level: 1, image: undefined });

  const handleAdd = async () => {
    if (!form.question.trim()) {
      Alert.alert('Hata', 'Soru metni boş olamaz');
      return;
    }
    try {
      setLoading(true);
      const created = await addQuestion(form);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
      refresh();
      Alert.alert('Başarılı', 'Soru eklendi');
    } catch (e) {
      // console.log('Add question error:', e);
      Alert.alert('Hata', 'Soru eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (q: Question) => {
    try {
      setLoading(true);
      await updateQuestion(q);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refresh();
      Alert.alert('Başarılı', 'Soru güncellendi');
    } catch (e) {
      // console.log('Update question error:', e);
      Alert.alert('Hata', 'Soru güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Soruyu Sil', 'Bu soruyu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          setLoading(true);
          await deleteQuestion(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          refresh();
          Alert.alert('Başarılı', 'Soru silindi');
        } catch (e) {
          // console.log('Delete question error:', e);
          Alert.alert('Hata', 'Soru silinemedi');
        } finally {
          setLoading(false);
        }
      }}
    ]);
  };

  const toggleHide = async (id: number, hidden: boolean) => {
    try {
      setLoading(true);
      if (hidden) await unhideQuestion(id); else await hideQuestion(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refresh();
    } catch (e) {
      // console.log('Hide/unhide question error:', e);
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const QuestionEditor = ({ q }: { q: Question }) => {
    const [local, setLocal] = useState<Question>(q);
    const isHidden = false; // derived via getAllQuestions; hidden questions are filtered

    return (
      <GlassView style={[styles.card, Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} glassEffectStyle="regular">
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{isCustomQuestion(q.id) ? 'Özel Soru' : 'Varsayılan Soru'} #{q.id}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={[styles.smallBtn, { backgroundColor: `${colors.warning}20` }]} onPress={() => toggleHide(q.id, false)}>
              <IconSymbol name="eye.slash.fill" size={16} color={colors.warning} />
            </Pressable>
            {isCustomQuestion(q.id) && (
              <Pressable style={[styles.smallBtn, { backgroundColor: `${colors.error}20` }]} onPress={() => handleDelete(q.id)}>
                <IconSymbol name="trash.fill" size={16} color={colors.error} />
              </Pressable>
            )}
            <Pressable style={[styles.smallBtn, { backgroundColor: `${colors.primary}20` }]} onPress={() => handleUpdate(local)}>
              <IconSymbol name="checkmark" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <TextInput value={local.question} onChangeText={(t) => setLocal({ ...local, question: t })} style={[styles.input, { color: theme.colors.text }]} placeholder="Soru" placeholderTextColor={theme.dark ? '#98989D' : '#666'} />
        <TextInput value={local.explanation || ''} onChangeText={(t) => setLocal({ ...local, explanation: t })} style={[styles.input, { color: theme.colors.text }]} placeholder="Açıklama" placeholderTextColor={theme.dark ? '#98989D' : '#666'} />
        <TextInput value={local.category || ''} onChangeText={(t) => setLocal({ ...local, category: t })} style={[styles.input, { color: theme.colors.text }]} placeholder="Kategori" placeholderTextColor={theme.dark ? '#98989D' : '#666'} />
        <TextInput value={String(local.level)} onChangeText={(t) => setLocal({ ...local, level: Number(t) || 1 })} style={[styles.input, { color: theme.colors.text }]} placeholder="Seviye" keyboardType="numeric" placeholderTextColor={theme.dark ? '#98989D' : '#666'} />

        <View style={styles.optionsRow}>
          {local.options.map((opt, idx) => (
            <TextInput
              key={idx}
              value={opt}
              onChangeText={(t) => setLocal({ ...local, options: local.options.map((o, i) => i === idx ? t : o) })}
              style={[styles.optionInput, { color: theme.colors.text }]}
              placeholder={`Seçenek ${idx + 1}`}
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
            />
          ))}
        </View>

        <View style={styles.correctRow}>
          <Text style={{ color: theme.colors.text }}>Doğru Cevap İndeksi:</Text>
          <TextInput value={String(local.correctAnswer)} onChangeText={(t) => setLocal({ ...local, correctAnswer: Number(t) || 0 })} style={[styles.correctInput, { color: theme.colors.text }]} keyboardType="numeric" />
        </View>
      </GlassView>
    );
  };

  return (
    <AuthGuard requireAdmin>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}> 
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Soru Yönetimi</Text>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <GlassView style={[styles.formCard, Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} glassEffectStyle="regular">
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Yeni Soru Ekle</Text>
            <TextInput value={form.question} onChangeText={(t) => setForm({ ...form, question: t })} style={[styles.input, { color: theme.colors.text }]} placeholder="Soru" placeholderTextColor={theme.dark ? '#98989D' : '#666'} />
            <TextInput value={form.explanation} onChangeText={(t) => setForm({ ...form, explanation: t })} style={[styles.input, { color: theme.colors.text }]} placeholder="Açıklama" placeholderTextColor={theme.dark ? '#98989D' : '#666'} />
            <TextInput value={form.category} onChangeText={(t) => setForm({ ...form, category: t })} style={[styles.input, { color: theme.colors.text }]} placeholder="Kategori" placeholderTextColor={theme.dark ? '#98989D' : '#666'} />
            <TextInput value={String(form.level)} onChangeText={(t) => setForm({ ...form, level: Number(t) || 1 })} style={[styles.input, { color: theme.colors.text }]} placeholder="Seviye" keyboardType="numeric" placeholderTextColor={theme.dark ? '#98989D' : '#666'} />
            <View style={styles.optionsRow}>
              {form.options.map((opt, idx) => (
                <TextInput
                  key={idx}
                  value={opt}
                  onChangeText={(t) => setForm({ ...form, options: form.options.map((o, i) => i === idx ? t : o) })}
                  style={[styles.optionInput, { color: theme.colors.text }]}
                  placeholder={`Seçenek ${idx + 1}`}
                  placeholderTextColor={theme.dark ? '#98989D' : '#666'}
                />
              ))}
            </View>
            <View style={styles.correctRow}>
              <Text style={{ color: theme.colors.text }}>Doğru Cevap İndeksi:</Text>
              <TextInput value={String(form.correctAnswer)} onChangeText={(t) => setForm({ ...form, correctAnswer: Number(t) || 0 })} style={[styles.correctInput, { color: theme.colors.text }]} keyboardType="numeric" />
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={[buttonStyles.primary, loading && buttonStyles.disabled]} onPress={handleAdd} disabled={loading}>
                <IconSymbol name="plus" size={16} color={'white'} />
                <Text style={buttonStyles.primaryText}>{loading ? 'Ekleniyor...' : 'Ekle'}</Text>
              </Pressable>
              <Pressable style={buttonStyles.secondary} onPress={resetForm}>
                <IconSymbol name="xmark" size={16} color={colors.error} />
                <Text style={[buttonStyles.secondaryText, { color: colors.error }]}>Temizle</Text>
              </Pressable>
            </View>
          </GlassView>

          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sorular ({questions.length})</Text>
          </View>

          {questions.map(q => (
            <QuestionEditor key={q.id} q={q} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  backButton: { padding: 8 },
  title: { fontSize: 24, fontWeight: 'bold', ...commonStyles.text },
  container: { flex: 1 },
  contentContainer: { padding: 20 },

  formCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, ...commonStyles.text },
  input: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8, marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionInput: { flexGrow: 1, flexBasis: '48%', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8 },
  correctRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  correctInput: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 4, minWidth: 60 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },

  listHeader: { marginTop: 16, marginBottom: 8 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '600', ...commonStyles.text },
  smallBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
});