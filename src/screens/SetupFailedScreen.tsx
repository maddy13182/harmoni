import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface SetupFailedScreenProps {
  onRetry: () => void;
  onSignOut: () => void;
}

export default function SetupFailedScreen({ onRetry, onSignOut }: SetupFailedScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="warning-outline" size={80} color={Colors.semantic.error} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Setup Failed</Text>

        {/* Error Message */}
        <Text style={styles.message}>
          We encountered a service issue while setting up your account. Please try again in a moment.
        </Text>

        {/* Error Details */}
        <View style={styles.errorBox}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.semantic.error} />
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>What happened?</Text>
            <Text style={styles.errorText}>
              • Service temporarily unavailable{'\n'}
              • Network connectivity issue{'\n'}
              • Please check your connection and try again
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh-outline" size={20} color={Colors.text.inverse} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.semantic.error} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <Text style={styles.helpText}>
          If the problem persists, please contact support or try again later.
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
  errorBox: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xl,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.semantic.error,
  },
  errorContent: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  errorTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  errorText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: #EF7674,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    gap: Layout.spacing.sm,
    ...Layout.shadow.sm,
  },
  retryButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.semantic.error,
    gap: Layout.spacing.sm,
  },
  signOutButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.semantic.error,
  },
  helpText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
