
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Question } from '@/types/quiz';
import { colors, commonStyles } from '@/styles/commonStyles';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  // console.log('QuestionCard - Rendering question:', question.id);
  
  if (!question) {
    // console.log('QuestionCard - No question provided');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Soru yüklenemedi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionNumber}>
          Soru {questionNumber}/{totalQuestions}
        </Text>
        <Text style={styles.category}>{question.category || 'Genel'}</Text>
      </View>
      
      {question.image && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: question.image }} 
            style={styles.image}
            resizeMode="cover"
            onError={(error) => {
              // console.log('QuestionCard - Image load error:', error.nativeEvent.error);
            }}
            onLoad={() => {
              // console.log('QuestionCard - Image loaded successfully');
            }}
          />
        </View>
      )}
      
      <Text style={styles.questionText}>{question.question}</Text>
      
      <View style={styles.difficultyContainer}>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(question.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>
            {getDifficultyText(question.difficulty)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return colors.success;
    case 'medium': return colors.highlight;
    case 'hard': return colors.error;
    default: return colors.secondary;
  }
};

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'Kolay';
    case 'medium': return 'Orta';
    case 'hard': return 'Zor';
    default: return 'Bilinmiyor';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  difficultyContainer: {
    alignItems: 'flex-start',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
    textAlign: 'center',
  },
});
