import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import {
  useGoogleAuth,
  fetchGoogleUserInfo,
  storeAuthToken,
  storeUserInfo,
} from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const { request, response, promptAsync } = useGoogleAuth();

  console.log('LoginScreen rendered, request:', request ? 'exists' : 'null');

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('Google auth success!', response);
      const { authentication } = response;
      
      if (authentication?.accessToken) {
        handleAuthSuccess(authentication.accessToken);
      } else {
        setError('No access token received');
        setIsLoading(false);
      }
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  }, [response]);

  const handleAuthSuccess = async (accessToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user info from Google
      const userInfo = await fetchGoogleUserInfo(accessToken);

      // Store auth data securely
      await storeAuthToken(accessToken);
      await storeUserInfo(userInfo);

      // Navigate to main app
      onLoginSuccess();
    } catch (err) {
      console.error('Auth error:', err);
      setError('Failed to complete sign in. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting Google sign in...');
      const result = await promptAsync();
      console.log('Google sign in result:', result);
      
      // Add timeout to reset loading state if no response
      setTimeout(() => {
        if (isLoading) {
          console.log('Sign in timeout - resetting loading state');
          setIsLoading(false);
          setError('Sign in timed out. Please try again.');
        }
      }, 30000); // 30 second timeout
      
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to initiate sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.secondary]}
        style={styles.background}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.appName}>Harmoni</Text>
          <Text style={styles.tagline}>Keep your family in sync</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="event"
            text="Shared family calendar"
          />
          <FeatureItem
            icon="people"
            text="Coordinate with everyone"
          />
          <FeatureItem
            icon="notifications"
            text="Never miss important events"
          />
        </View>

        {/* Sign In Section */}
        <View style={styles.signInSection}>
          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={20} color={Colors.semantic.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading || !request}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text.primary} />
            ) : (
              <>
                <MaterialIcons name="login" size={24} color={Colors.text.primary} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {isLoading && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsLoading(false);
                setError('Sign in cancelled. Please try again.');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.privacyText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

interface FeatureItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <MaterialIcons name={icon} size={24} color={Colors.primary.main} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.xl,
    paddingTop: Layout.spacing.xxxl * 2,
    paddingBottom: Layout.spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xxxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: Layout.borderRadius.xl,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    ...Layout.shadow.lg,
  },
  logoEmoji: {
    fontSize: 56,
  },
  appName: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: Layout.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  tagline: {
    fontSize: Layout.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: Layout.spacing.xxxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  featureText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    fontWeight: Layout.fontWeight.medium,
    flex: 1,
  },
  signInSection: {
    marginTop: 'auto',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.semantic.error + '15',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
  },
  errorText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.semantic.error,
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.white,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadow.md,
    gap: Layout.spacing.sm,
    minHeight: Layout.touchTarget.comfortable,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.primary,
  },
  privacyText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Layout.spacing.lg,
    lineHeight: 18,
  },
  cancelButton: {
    marginTop: Layout.spacing.md,
    padding: Layout.spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    textDecorationLine: 'underline',
  },
});
