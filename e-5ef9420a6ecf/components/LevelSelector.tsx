
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { Level } from '@/types/quiz';
import React from 'react';
import { colors, commonStyles } from '@/styles/commonStyles';

interface LevelSelectorProps {
  levels: Level[];
  onLevelSelect: (level: Level) => void;
}

export default function LevelSelector({ levels, onLevelSelect }: LevelSelectorProps) {
  const handleLevelPress = (level: Level) => {
    if (!level.isUnlocked) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLevelSelect(level);
  };

  const getLevelIcon = (level: Level) => {
    if (level.isCompleted) return 'checkmark.circle.fill';
    if (level.isUnlocked) return 'play.circle.fill';
    return 'lock.circle.fill';
  };

  const getLevelIconColor = (level: Level) => {
    if (level.isCompleted) return colors.success;
    if (level.isUnlocked) return colors.primary;
    return colors.textSecondary;
  };

  const getLevelStyle = (level: Level) => {
    let style = [styles.levelButton];
    
    if (!level.isUnlocked) {
      style.push(styles.lockedLevel);
    } else if (level.isCompleted) {
      style.push(styles.completedLevel);
    }
    
    return style;
  };

  if (levels.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noLevelsText}>Seviye yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {levels.map((level) => (
          <Pressable
            key={level.id}
            style={getLevelStyle(level)}
            onPress={() => handleLevelPress(level)}
            disabled={!level.isUnlocked}
          >
            <View style={styles.levelContent}>
              <IconSymbol
                name={getLevelIcon(level)}
                color={getLevelIconColor(level)}
                size={32}
              />
              
              <Text style={[
                styles.levelNumber,
                { color: level.isUnlocked ? colors.text : colors.textSecondary }
              ]}>
                {level.id}
              </Text>
              
              <Text style={[
                styles.levelName,
                { color: level.isUnlocked ? colors.text : colors.textSecondary }
              ]}>
                {level.name}
              </Text>
              
              <Text style={[
                styles.levelDescription,
                { color: level.isUnlocked ? colors.textSecondary : colors.textSecondary }
              ]}>
                {level.description}
              </Text>
              
              {level.questionsCount > 0 && (
                <Text style={styles.questionCount}>
                  {level.questionsCount} soru
                </Text>
              )}
              
              {level.isCompleted && level.bestScore && (
                <Text style={styles.bestScore}>
                  En iyi: %{level.bestScore}
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  levelButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lockedLevel: {
    opacity: 0.6,
    backgroundColor: colors.border,
  },
  completedLevel: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  levelContent: {
    alignItems: 'center',
    gap: 8,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  levelDescription: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  questionCount: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bestScore: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  noLevelsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
