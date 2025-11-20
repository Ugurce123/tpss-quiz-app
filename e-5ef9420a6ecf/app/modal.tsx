
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function Modal() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <IconSymbol name="info.circle.fill" color={colors.primary} size={48} />
        <Text style={styles.title}>Test Modal</Text>
        <Text style={styles.description}>
          Bu bir test modalıdır. Uygulama düzgün çalışıyor!
        </Text>
        
        <Pressable
          style={buttonStyles.primary}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.primaryText}>Kapat</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    maxWidth: 300,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
