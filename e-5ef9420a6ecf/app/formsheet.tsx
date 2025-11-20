
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function FormSheet() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.handle} />
        <Text style={styles.title}>Form Sheet</Text>
      </View>
      
      <View style={styles.body}>
        <IconSymbol name="doc.text.fill" color={colors.primary} size={48} />
        <Text style={styles.description}>
          Bu bir form sheet modalıdır. Aşağı kaydırarak kapatabilirsiniz.
        </Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" color={colors.success} size={20} />
            <Text style={styles.featureText}>Kaydırılabilir içerik</Text>
          </View>
          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" color={colors.success} size={20} />
            <Text style={styles.featureText}>Esnek yükseklik</Text>
          </View>
          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" color={colors.success} size={20} />
            <Text style={styles.featureText}>Modern tasarım</Text>
          </View>
        </View>
        
        <Pressable
          style={buttonStyles.primary}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.primaryText}>Kapat</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    width: '100%',
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
});
