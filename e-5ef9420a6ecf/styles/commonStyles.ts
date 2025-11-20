
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  background: '#F5F5DC',      // Beige
  text: '#333333',            // Dark Gray
  textSecondary: '#777777',   // Medium Gray
  primary: '#007BFF',         // Blue
  secondary: '#6C757D',       // Gray
  accent: '#28A745',          // Green
  card: '#FFFFFF',            // White
  highlight: '#FFC107',       // Yellow
  error: '#DC3545',           // Red for wrong answers
  success: '#28A745',         // Green for correct answers
  warning: '#FFC107',         // Yellow for warnings/admin
  border: '#E0E0E0',          // Light gray for borders
  inputBackground: '#F8F9FA', // Light gray for input backgrounds
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  answerButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  correctAnswer: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  wrongAnswer: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  correctAnswerText: {
    color: colors.card,
  },
  wrongAnswerText: {
    color: colors.card,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.secondary + '40',
    borderRadius: 4,
    marginVertical: 16,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.primary,
  },
});
