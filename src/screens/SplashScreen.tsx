import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to login after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.primary.main, Colors.primary.light]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo/Icon - Using emoji for now, can be replaced with custom icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Harmoni</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>A Family Calendar App</Text>
      </Animated.View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: Layout.borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
    ...Layout.shadow.lg,
  },
  logoEmoji: {
    fontSize: 64,
  },
  appName: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: Layout.fontWeight.bold,
    color: Colors.text.inverse,
    marginBottom: Layout.spacing.sm,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.regular,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: Layout.spacing.xxxl,
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Layout.borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: Colors.neutral.white,
    width: 24,
  },
});
