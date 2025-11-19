import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { getUserInfo, UserInfo } from '../services/authService';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    loadUserInfo();
    
    // Animate entrance
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

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const loadUserInfo = async () => {
    const info = await getUserInfo();
    setUserInfo(info);
  };

  const firstName = userInfo?.givenName || userInfo?.name?.split(' ')[0] || 'there';

  return (
    <LinearGradient
      colors={["#EF7674", Colors.primary.mint]}
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
        {/* Profile Picture or Avatar */}
        <View style={styles.avatarContainer}>
          {userInfo?.picture ? (
            <Image
              source={{ uri: userInfo.picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={64} color="#EF7674" />
            </View>
          )}
          <View style={styles.checkmarkContainer}>
            <MaterialIcons name="check-circle" size={32} color={Colors.semantic.success} />
          </View>
        </View>

        {/* Welcome Message */}
        <Text style={styles.welcomeText}>Welcome, {firstName}! 👋</Text>
        <Text style={styles.subtitle}>
          You're all set to start organizing your family's schedule
        </Text>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="event" size={32} color={Colors.text.inverse} />
            <Text style={styles.statLabel}>Calendar Ready</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="people" size={32} color={Colors.text.inverse} />
            <Text style={styles.statLabel}>Add Family</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="notifications-active" size={32} color={Colors.text.inverse} />
            <Text style={styles.statLabel}>Stay Synced</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue to Calendar</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#EF7674" />
        </TouchableOpacity>

        {/* Auto-continue indicator */}
        <Text style={styles.autoText}>Continuing automatically in a moment...</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.neutral.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.neutral.white,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 2,
  },
  welcomeText: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: Layout.fontWeight.bold,
    color: Colors.text.inverse,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: Layout.spacing.xxxl,
    paddingHorizontal: Layout.spacing.lg,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Layout.spacing.xxxl,
    paddingHorizontal: Layout.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.inverse,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
    opacity: 0.9,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadow.lg,
    gap: Layout.spacing.sm,
    minHeight: Layout.touchTarget.comfortable,
  },
  continueButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    color: "#EF7674",
  },
  autoText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.inverse,
    opacity: 0.7,
    marginTop: Layout.spacing.lg,
    textAlign: 'center',
  },
});
