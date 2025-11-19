import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface UserReadyScreenProps {
  message: string;
  isNewUser: boolean;
  onContinue: () => void;
}

export default function UserReadyScreen({ message, isNewUser, onContinue }: UserReadyScreenProps) {
  // Auto-continue after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isNewUser ? "person-add" : "checkmark-circle"} 
            size={80} 
            color={Colors.semantic.success} 
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isNewUser ? "Welcome to Harmoni!" : "Welcome Back!"}
        </Text>

        {/* Success Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Status Badge */}
        <View style={[styles.badge, isNewUser ? styles.newUserBadge : styles.existingUserBadge]}>
          <Ionicons 
            name={isNewUser ? "sparkles" : "shield-checkmark"} 
            size={16} 
            color={Colors.text.inverse} 
          />
          <Text style={styles.badgeText}>
            {isNewUser ? "New Account Created" : "Account Verified"}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue to Calendar</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.text.inverse} />
        </TouchableOpacity>

        {/* Auto-continue notice */}
        <Text style={styles.autoText}>
          Continuing automatically in a few seconds...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: Layout.spacing.xl,
    padding: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.round,
    backgroundColor: Colors.background.secondary,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.xl,
    gap: Layout.spacing.xs,
  },
  newUserBadge: {
    backgroundColor: Colors.primary.cyan,
  },
  existingUserBadge: {
    backgroundColor: Colors.semantic.success,
  },
  badgeText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.cyan,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
    width: '100%',
    ...Layout.shadow.sm,
  },
  continueButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  autoText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
