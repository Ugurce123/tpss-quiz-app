
import React, { useState } from "react";
import { Stack } from "expo-router";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, buttonStyles } from "@/styles/commonStyles";
import { useQuizProgress } from "@/hooks/useQuizProgress";

export default function ResultsScreen() {
  const theme = useTheme();
  const { progress, levels, loading, resetProgress } = useQuizProgress();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'unlocked'>('all');

  const getFilteredLevels = () => {
    switch (selectedFilter) {
      case 'completed':
        return levels.filter(level => level.isCompleted);
      case 'unlocked':
        return levels.filter(level => level.isUnlocked && !level.isCompleted);
      default:
        return levels;
    }
  };

  const getOverallStats = () => {
    const completedLevels = levels.filter(level => level.isCompleted).length;
    const unlockedLevels = levels.filter(level => level.isUnlocked).length;
    const totalLevels = levels.length;
    const progressPercentage = Math.round((completedLevels / totalLevels) * 100);
    
    return {
      completedLevels,
      unlockedLevels,
      totalLevels,
      progressPercentage,
      currentLevel: progress.currentLevel,
      totalQuizzes: progress.totalQuizzes,
      averageScore: progress.averageScore,
      bestScore: progress.bestScore
    };
  };

  const handleResetProgress = () => {
    resetProgress();
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => {
        // console.log("Reset progress");
        handleResetProgress();
      }}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="arrow.clockwise" color={colors.text} />
    </Pressable>
  );

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.text}>Yükleniyor...</Text>
      </View>
    );
  }

  const stats = getOverallStats();
  const filteredLevels = getFilteredLevels();

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "İlerleme",
            headerRight: renderHeaderRight,
          }}
        />
      )}
      <View style={commonStyles.wrapper}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContainer,
            Platform.OS !== 'ios' && styles.scrollContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {progress.totalQuizzes === 0 ? (
            // Empty State
            <View style={commonStyles.content}>
              <View style={styles.emptyIcon}>
                <IconSymbol name="chart.bar" color={colors.textSecondary} size={80} />
              </View>
              <Text style={commonStyles.title}>Henüz TPSS Hazırlık Sınavı Sonucunuz Yok</Text>
              <Text style={commonStyles.text}>
                İlk TPSS Hazırlık Sınavınızı tamamladığınızda ilerlemeniz burada görünecek.
              </Text>
            </View>
          ) : (
            <>
              {/* Overall Progress */}
              <View style={commonStyles.section}>
                <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>Genel İlerleme</Text>
                
                <View style={commonStyles.scoreCard}>
                  <View style={styles.mainStatContainer}>
                    <Text style={styles.mainStatNumber}>{stats.progressPercentage}%</Text>
                    <Text style={commonStyles.textSecondary}>Tamamlanan Seviyeler</Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={commonStyles.progressBar}>
                      <View style={[
                        commonStyles.progressFill, 
                        { width: `${stats.progressPercentage}%` }
                      ]} />
                    </View>
                    <Text style={styles.progressText}>
                      {stats.completedLevels} / {stats.totalLevels} seviye
                    </Text>
                  </View>
                  
                  <View style={styles.statsGrid}>
                    <View style={styles.statGridItem}>
                      <Text style={styles.statGridNumber}>{stats.currentLevel}</Text>
                      <Text style={styles.statGridLabel}>Mevcut Seviye</Text>
                    </View>
                    <View style={styles.statGridItem}>
                      <Text style={styles.statGridNumber}>{stats.unlockedLevels}</Text>
                      <Text style={styles.statGridLabel}>Açık Seviye</Text>
                    </View>
                    <View style={styles.statGridItem}>
                      <Text style={styles.statGridNumber}>{stats.averageScore}%</Text>
                      <Text style={styles.statGridLabel}>Ortalama Skor</Text>
                    </View>
                    <View style={styles.statGridItem}>
                      <Text style={styles.statGridNumber}>{stats.bestScore}%</Text>
                      <Text style={styles.statGridLabel}>En Yüksek Skor</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Filter Buttons */}
              <View style={styles.filterContainer}>
                <Pressable
                  style={[
                    styles.filterButton,
                    selectedFilter === 'all' && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedFilter('all')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedFilter === 'all' && styles.filterButtonTextActive
                  ]}>
                    Tümü
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterButton,
                    selectedFilter === 'completed' && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedFilter('completed')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedFilter === 'completed' && styles.filterButtonTextActive
                  ]}>
                    Tamamlanan
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterButton,
                    selectedFilter === 'unlocked' && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedFilter('unlocked')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedFilter === 'unlocked' && styles.filterButtonTextActive
                  ]}>
                    Açık
                  </Text>
                </Pressable>
              </View>

              {/* Levels Grid */}
              <View style={commonStyles.section}>
                <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Seviyeler</Text>
                
                <View style={styles.levelsGrid}>
                  {filteredLevels.map((level) => (
                    <View key={level.id} style={[
                      styles.levelCard,
                      level.isCompleted && styles.levelCardCompleted,
                      level.isUnlocked && !level.isCompleted && styles.levelCardUnlocked
                    ]}>
                      <View style={styles.levelHeader}>
                        <IconSymbol 
                          name={level.isCompleted ? "checkmark.circle.fill" : 
                                level.isUnlocked ? "play.circle.fill" : "lock.circle.fill"}
                          color={level.isCompleted ? colors.success : 
                                 level.isUnlocked ? colors.primary : colors.textSecondary}
                          size={20}
                        />
                        <Text style={[
                          styles.levelNumber,
                          { color: level.isUnlocked ? colors.text : colors.textSecondary }
                        ]}>
                          {level.id}
                        </Text>
                      </View>
                      
                      <Text style={[
                        styles.levelName,
                        { color: level.isUnlocked ? colors.text : colors.textSecondary }
                      ]}>
                        {level.name}
                      </Text>
                      
                      <Text style={styles.levelDescription}>
                        {level.description}
                      </Text>
                      
                      {level.bestScore && (
                        <View style={styles.scoreContainer}>
                          <Text style={styles.bestScore}>%{level.bestScore}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Achievement Section */}
              <View style={commonStyles.section}>
                <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Başarılar</Text>
                
                <View style={styles.achievementsContainer}>
                  {stats.completedLevels >= 1 && (
                    <View style={styles.achievementItem}>
                      <IconSymbol name="star.fill" color={colors.highlight} size={24} />
                      <Text style={styles.achievementText}>İlk Seviye Tamamlandı</Text>
                    </View>
                  )}
                  
                  {stats.completedLevels >= 5 && (
                    <View style={styles.achievementItem}>
                      <IconSymbol name="flame.fill" color={colors.error} size={24} />
                      <Text style={styles.achievementText}>5 Seviye Tamamlandı</Text>
                    </View>
                  )}
                  
                  {stats.completedLevels >= 10 && (
                    <View style={styles.achievementItem}>
                      <IconSymbol name="trophy.fill" color={colors.success} size={24} />
                      <Text style={styles.achievementText}>10 Seviye Tamamlandı</Text>
                    </View>
                  )}
                  
                  {stats.bestScore >= 90 && (
                    <View style={styles.achievementItem}>
                      <IconSymbol name="crown.fill" color={colors.primary} size={24} />
                      <Text style={styles.achievementText}>Mükemmel Skor (%90+)</Text>
                    </View>
                  )}
                  
                  {stats.totalQuizzes >= 20 && (
                    <View style={styles.achievementItem}>
                      <IconSymbol name="medal.fill" color={colors.accent} size={24} />
                      <Text style={styles.achievementText}>20 Quiz Tamamlandı</Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  scrollContainerWithTabBar: {
    paddingBottom: 100,
  },
  headerButtonContainer: {
    padding: 6,
  },
  emptyIcon: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainStatContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainStatNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  statGridItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statGridNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statGridLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.card,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelCardCompleted: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  levelCardUnlocked: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreContainer: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bestScore: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  achievementsContainer: {
    width: '100%',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
});
