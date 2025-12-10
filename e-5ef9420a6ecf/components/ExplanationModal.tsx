
import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface ExplanationModalProps {
  visible: boolean;
  isCorrect: boolean;
  explanation: string;
  correctAnswer: string;
  selectedAnswer?: string;
  onClose: () => void;
}

export default function ExplanationModal({
  visible,
  isCorrect,
  explanation,
  correctAnswer,
  selectedAnswer,
  onClose
}: ExplanationModalProps) {
  
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView intensity={50} style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: isCorrect ? colors.success : colors.error }
              ]}>
                <IconSymbol 
                  name={isCorrect ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                  color={colors.card}
                  size={40}
                />
              </View>
              
              <Text style={[
                styles.resultTitle,
                { color: isCorrect ? colors.success : colors.error }
              ]}>
                {isCorrect ? 'Doğru!' : 'Yanlış!'}
              </Text>
            </View>

            {!isCorrect && selectedAnswer && (
              <View style={styles.answerSection}>
                <Text style={styles.answerLabel}>Sizin Cevabınız:</Text>
                <Text style={[styles.answerText, { color: colors.error }]}>
                  {selectedAnswer}
                </Text>
              </View>
            )}

            <View style={styles.answerSection}>
              <Text style={styles.answerLabel}>Doğru Cevap:</Text>
              <Text style={[styles.answerText, { color: colors.success }]}>
                {correctAnswer}
              </Text>
            </View>

            <View style={styles.explanationSection}>
              <Text style={styles.explanationTitle}>Açıklama:</Text>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>

            <Pressable style={buttonStyles.primaryButton} onPress={handleClose}>
              <Text style={buttonStyles.primaryButtonText}>Devam Et</Text>
            </Pressable>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  answerSection: {
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  explanationSection: {
    marginBottom: 24,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
});
