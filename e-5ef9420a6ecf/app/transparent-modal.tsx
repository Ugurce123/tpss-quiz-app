
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function TransparentModal() {
  const router = useRouter();

  return (
    <BlurView intensity={50} style={styles.container}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={styles.content}>
        <IconSymbol name="sparkles" color={colors.highlight} size={48} />
        <Text style={styles.title}>Transparent Modal</Text>
        <Text style={styles.description}>
          Bu modal arka planı bulanıklaştırır ve şeffaf bir görünüm sağlar.
        </Text>
        
        <Pressable
          style={buttonStyles.primary}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.primaryText}>Kapat</Text>
        </Pressable>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    backgroundColor: colors.card + 'F0',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    maxWidth: 300,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
