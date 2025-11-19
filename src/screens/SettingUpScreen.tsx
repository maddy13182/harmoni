import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface SettingUpScreenProps {
  userName: string;
}

export default function SettingUpScreen({ userName }: SettingUpScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="settings-outline" size={60} color={Colors.primary.cyan} />
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator size="large" color={Colors.primary.cyan} style={styles.loader} />

        {/* Title */}
        <Text style={styles.title}>Hello {userName}!</Text>

        {/* Message */}
        <Text style={styles.message}>
          Please wait while we set things up for you...
        </Text>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={[styles.dot, styles.activeDot]} />
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
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.round,
    backgroundColor: Colors.background.secondary,
  },
  loader: {
    marginBottom: Layout.spacing.xl,
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
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.lightGray,
  },
  activeDot: {
    backgroundColor: Colors.primary.cyan,
  },
});
