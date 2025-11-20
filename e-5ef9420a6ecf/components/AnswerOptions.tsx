
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, buttonStyles } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface AnswerOptionsProps {
  options: string[];
  selectedAnswer: number | null;
  correctAnswer?: number;
  showResult: boolean;
  onAnswerSelect: (index: number) => void;
  disabled?: boolean;
}

export default function AnswerOptions({
  options,
  selectedAnswer,
  correctAnswer,
  showResult,
  onAnswerSelect,
  disabled = false
}: AnswerOptionsProps) {
  
  // console.log('AnswerOptions - Rendering with options:', options.length);
  
  if (!options || options.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Seçenekler yüklenemedi</Text>
      </View>
    );
  }
  
  const handleAnswerPress = (index: number) => {
    if (disabled || showResult) return;
    
    // console.log('AnswerOptions - Answer pressed:', index);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAnswerSelect(index);
  };

  const getButtonStyle = (index: number) => {
    let style = [buttonStyles.answerButton];
    
    if (showResult && correctAnswer !== undefined) {
      if (index === correctAnswer) {
        style.push(buttonStyles.correctAnswer);
      } else if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
        style.push(buttonStyles.wrongAnswer);
      }
    } else if (selectedAnswer === index) {
      style.push(styles.selectedAnswer);
    }
    
    return style;
  };

  const getTextStyle = (index: number) => {
    let style = [buttonStyles.answerButtonText];
    
    if (showResult && correctAnswer !== undefined) {
      if (index === correctAnswer) {
        style.push(buttonStyles.correctAnswerText);
      } else if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
        style.push(buttonStyles.wrongAnswerText);
      }
    } else if (selectedAnswer === index) {
      style.push(styles.selectedAnswerText);
    }
    
    return style;
  };

  const getIcon = (index: number) => {
    if (!showResult || correctAnswer === undefined) {
      return selectedAnswer === index ? 'checkmark.circle.fill' : 'circle';
    }
    
    if (index === correctAnswer) {
      return 'checkmark.circle.fill';
    } else if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'xmark.circle.fill';
    }
    
    return 'circle';
  };

  const getIconColor = (index: number) => {
    if (!showResult || correctAnswer === undefined) {
      return selectedAnswer === index ? colors.primary : colors.textSecondary;
    }
    
    if (index === correctAnswer) {
      return colors.card;
    } else if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
      return colors.card;
    }
    
    return colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <Pressable
          key={`option-${index}`}
          style={getButtonStyle(index)}
          onPress={() => handleAnswerPress(index)}
          disabled={disabled || showResult}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + index)}
              </Text>
              <Text style={getTextStyle(index)}>{option}</Text>
            </View>
            <IconSymbol 
              name={getIcon(index)} 
              color={getIconColor(index)} 
              size={24} 
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 12,
    minWidth: 20,
  },
  selectedAnswer: {
    borderColor: colors.primary,
    borderWidth: 3,
    backgroundColor: colors.primary + '10',
  },
  selectedAnswerText: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
    textAlign: 'center',
    padding: 20,
  },
});
