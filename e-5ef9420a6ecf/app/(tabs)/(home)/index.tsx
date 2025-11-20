
import React from "react";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform } from "react-native";
import { colors, commonStyles, buttonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { Stack, Link, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    ...buttonStyles.primary,
    width: '100%',
  },
  buttonText: {
    ...buttonStyles.primaryText,
  },
  debugInfo: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});

export default function HomeScreen() {
  const theme = useTheme();
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // console.log('HomeScreen - Rendering with user:', user?.name, 'authenticated:', isAuthenticated);

  const renderHeaderRight = () => (
    <Link href="/modal" asChild>
      <Pressable style={{ marginRight: 16 }}>
        <IconSymbol name="info.circle" size={24} color={colors.primary} />
      </Pressable>
    </Link>
  );

  const renderHeaderLeft = () => (
    <View style={{ marginLeft: 16 }}>
      <IconSymbol name="house.fill" size={24} color={colors.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "TPSS Sınavına Hazırlık Modülü",
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerRight: renderHeaderRight,
          headerLeft: renderHeaderLeft,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcomeCard}>
          <IconSymbol name="questionmark.circle.fill" size={64} color={colors.primary} />
          <Text style={styles.title}>TPSS Sınavına Hazırlık Modülü</Text>
          <Text style={styles.subtitle}>
            {isAuthenticated 
              ? `Merhaba ${user?.name}! TPSS Hazırlık Sınavına hazır mısın?`
              : 'Bilginizi test etmek için giriş yapın veya kayıt olun.'
            }
          </Text>
          
          <View style={styles.buttonContainer}>
            {isAuthenticated ? (
              <>
                <Pressable 
                  style={styles.button}
                  onPress={() => router.push('/(tabs)/quiz')}
                >
                  <IconSymbol name="play.fill" size={20} color={colors.card} />
                  <Text style={styles.buttonText}>TPSS Hazırlık Sınavını Başlat</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.button, { backgroundColor: colors.secondary }]}
                  onPress={() => router.push('/(tabs)/results')}
                >
                  <IconSymbol name="chart.bar.fill" size={20} color={colors.card} />
                  <Text style={styles.buttonText}>Sonuçlarım</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable 
                  style={styles.button}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <IconSymbol name="person.fill" size={20} color={colors.card} />
                  <Text style={styles.buttonText}>Giriş Yap</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.button, { backgroundColor: colors.secondary }]}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <IconSymbol name="person.badge.plus" size={20} color={colors.card} />
                  <Text style={styles.buttonText}>Kayıt Ol</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Debug panel removed as requested */}
      </ScrollView>
    </View>
  );
}
