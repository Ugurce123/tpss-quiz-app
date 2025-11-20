import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';
import { Question, QuizResult } from '@/types/quiz';

interface QuizSummaryModalProps {
  visible: boolean;
  questions: Question[];
  results: QuizResult[];
  score: number;
  onRetry: () => void;
  onClose: () => void;
}

export default function QuizSummaryModal({
  visible,
  questions,
  results,
  score,
  onRetry,
  onClose,
}: QuizSummaryModalProps) {
  const correctCount = results.filter(r => r.isCorrect).length;
  const totalTime = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRetry();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const getQuestionText = (id: number) => {
    const q = questions.find(q => q.id === id);
    return q ? q.question : `Soru #${id}`;
  };

  const getSelectedText = (res: QuizResult) => {
    const q = questions.find(q => q.id === res.questionId);
    if (q && Array.isArray(q.options) && typeof res.selectedAnswer === 'number') {
      return q.options[res.selectedAnswer] ?? `Seçenek ${res.selectedAnswer + 1}`;
    }
    return `Seçenek ${typeof res.selectedAnswer === 'number' ? res.selectedAnswer + 1 : '?'}`;
  };

  const getCorrectText = (res: QuizResult) => {
    const q = questions.find(q => q.id === res.questionId);
    if (q && Array.isArray(q.options) && typeof q.correctAnswer === 'number') {
      return q.options[q.correctAnswer] ?? `Seçenek ${q.correctAnswer + 1}`;
    }
    return `Seçenek ${typeof (questions.find(q2 => q2.id === res.questionId)?.correctAnswer) === 'number' ? ((questions.find(q2 => q2.id === res.questionId)!.correctAnswer) + 1) : '?'}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <BlurView intensity={50} style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: score >= 70 ? colors.success : colors.warning }]}>
                <IconSymbol name={score >= 70 ? 'checkmark.seal.fill' : 'exclamationmark.triangle.fill'} color={colors.card} size={40} />
              </View>
              <Text style={styles.title}>Sınav Özeti</Text>
              <Text style={styles.subtitle}>Skor: %{score} • Doğru: {correctCount}/{results.length} • Süre: {Math.round(totalTime)}sn</Text>
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>Soru Bazlı Sonuçlar</Text>
            </View>

            <View style={styles.listContainer}>
              {results.map((res, idx) => (
                <View key={`res-${idx}`} style={[styles.itemRow, { backgroundColor: res.isCorrect ? colors.success + '15' : colors.error + '15' }] }>
                  <View style={styles.itemLeft}>
                    <IconSymbol name={res.isCorrect ? 'checkmark.circle.fill' : 'xmark.circle.fill'} color={res.isCorrect ? colors.success : colors.error} size={22} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemQuestion} numberOfLines={2}>
                        {idx + 1}. {getQuestionText(res.questionId)}
                      </Text>
                      <View style={styles.answersRow}>
                        <Text style={styles.answerLabel}>Seçilen:</Text>
                        <Text style={[styles.answerText, { color: res.isCorrect ? colors.success : colors.error }]} numberOfLines={2}>
                          {getSelectedText(res)}
                        </Text>
                      </View>
                      <View style={styles.answersRow}>
                        <Text style={styles.answerLabel}>Doğru:</Text>
                        <Text style={[styles.answerText, { color: colors.success }]} numberOfLines={2}>
                          {getCorrectText(res)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>Süre: {Math.round(res.timeSpent || 0)}sn</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <Pressable style={buttonStyles.primaryButton} onPress={handleRetry}>
                <Text style={buttonStyles.primaryButtonText}>Tekrar Dene</Text>
              </Pressable>
              <Pressable style={[buttonStyles.secondaryButton, { marginTop: 12 }]} onPress={handleClose}>
                <Text style={[buttonStyles.secondaryButtonText, { color: colors.primary }]}>Ana Menü</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { backgroundColor: colors.card, borderRadius: 20, maxWidth: 520, width: '100%', maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  content: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
  listHeader: { marginTop: 8, marginBottom: 8, alignItems: 'flex-start' },
  listHeaderText: { fontSize: 16, fontWeight: '700', color: colors.text },
  listContainer: { gap: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  itemLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  itemContent: { flex: 1 },
  itemQuestion: { fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1 },
  itemRight: { alignItems: 'flex-end' },
  itemMeta: { fontSize: 12, fontWeight: '600' },
  answersRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  answerLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  answerText: { fontSize: 12, fontWeight: '600', color: colors.text, flexShrink: 1 },
  actions: { marginTop: 16 },
});