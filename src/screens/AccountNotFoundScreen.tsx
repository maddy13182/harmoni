import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface AccountNotFoundScreenProps {
  onSignOut: () => void;
  userEmail?: string;
}

export default function AccountNotFoundScreen({ onSignOut, userEmail }: AccountNotFoundScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="person-remove-outline" size={80} color={Colors.semantic.warning} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Account Not Found</Text>

        {/* Message */}
        <Text style={styles.message}>
          Your Google account ({userEmail}) is not authorized to access this family calendar.
        </Text>

        <Text style={styles.submessage}>
          Please contact your family administrator to add your account to the system.
        </Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary.main} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What to do next:</Text>
            <Text style={styles.infoText}>
              • Contact your family admin{'\n'}
              • Provide your email: {userEmail}{'\n'}
              • Wait for account activation{'\n'}
              • Try signing in again
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.text.inverse} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retryButton} onPress={onSignOut}>
            <Ionicons name="refresh-outline" size={20} color={Colors.primary.main} />
            <Text style={styles.retryButtonText}>Try Different Account</Text>
          </TouchableOpacity>
        </View>
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
    padding: Layout.spacing.lg,
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
    marginBottom: Layout.spacing.sm,
    lineHeight: 24,
  },
  submessage: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xl,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  infoContent: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  infoTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  infoText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: Layout.spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.semantic.error,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    gap: Layout.spacing.sm,
    ...Layout.shadow.sm,
  },
  signOutButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    gap: Layout.spacing.sm,
  },
  retryButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.primary.main,
  },
});
