import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
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

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const shape1Anim = React.useRef(new Animated.Value(0)).current;
  const shape2Anim = React.useRef(new Animated.Value(0)).current;
  const shape3Anim = React.useRef(new Animated.Value(0)).current;

  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating shape animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(shape1Anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shape1Anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shape2Anim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(shape2Anim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shape3Anim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(shape3Anim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleAuthSuccess(authentication.accessToken);
      } else {
        setError('No access token received');
        setIsLoading(false);
      }
    } else if (response?.type === 'error') {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  }, [response]);

  const handleAuthSuccess = async (accessToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const userInfo = await fetchGoogleUserInfo(accessToken);
      await storeAuthToken(accessToken);
      await storeUserInfo(userInfo);
      onLoginSuccess();
    } catch (err) {
      setError('Failed to complete sign in. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await promptAsync();
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setError('Sign in timed out. Please try again.');
        }
      }, 30000);
    } catch (err) {
      setError('Failed to initiate sign in. Please try again.');
      setIsLoading(false);
    }
  };

  // Animated shape transforms
  const shape1Transform = shape1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const shape2Transform = shape2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const shape3Transform = shape3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  return (
    <View style={styles.container}>
      {/* Subtle gradient background */}
      <LinearGradient
        colors={['#FAFAFA', '#FFFFFF', '#F8F9FA']}
        style={styles.background}
      />

      {/* Abstract floating shapes */}
      <Animated.View
        style={[
          styles.shape1,
          {
            transform: [
              { translateY: shape1Transform },
              { rotate: '15deg' },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shape2,
          {
            transform: [
              { translateY: shape2Transform },
              { rotate: '-20deg' },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shape3,
          {
            transform: [
              { translateY: shape3Transform },
              { rotate: '25deg' },
            ],
          },
        ]}
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* App Name */}
          <Text style={styles.appName}>Harmoni</Text>
          
          {/* Hero Message */}
          <Text style={styles.heroTitle}>
            Finally, one app that{'\n'}keeps life in sync
          </Text>
          
          <Text style={styles.heroSubtitle}>
            AI-powered calendar that works the way you do.{'\n'}
            Voice, chat, email—create events in seconds,{'\n'}
            not minutes.
          </Text>
        </View>

        {/* Key Features - Minimalist Pills */}
        <View style={styles.featuresContainer}>
          <View style={styles.featurePill}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="mic" size={16} color={Colors.primary.cyan} />
            </View>
            <Text style={styles.featurePillText}>Voice commands</Text>
          </View>
          
          <View style={styles.featurePill}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="chat-bubble-outline" size={16} color={Colors.primary.cyan} />
            </View>
            <Text style={styles.featurePillText}>AI chat</Text>
          </View>
          
          <View style={styles.featurePill}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="forward-to-inbox" size={16} color={Colors.primary.cyan} />
            </View>
            <Text style={styles.featurePillText}>Email forwarding</Text>
          </View>
        </View>

        {/* Sign In Section */}
        <View style={styles.signInSection}>
          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={18} color={Colors.semantic.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading || !request}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialIcons name="login" size={20} color="#FFFFFF" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.privacyText}>
            By continuing, you agree to our{' '}
            <Text style={styles.privacyLink}>Terms</Text>
            {' & '}
            <Text style={styles.privacyLink}>Privacy Policy</Text>
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Abstract shapes
  shape1: {
    position: 'absolute',
    top: 100,
    right: 30,
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: Colors.primary.cyan,
    opacity: 0.06,
  },
  shape2: {
    position: 'absolute',
    top: 200,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.mint,
    opacity: 0.08,
  },
  shape3: {
    position: 'absolute',
    bottom: 200,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 35,
    backgroundColor: Colors.primary.coral,
    opacity: 0.05,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.cyan,
    letterSpacing: 0.5,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  
  // Features Pills
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.cyan + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featurePillText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    letterSpacing: -0.1,
  },
  
  // Sign In Section
  signInSection: {
    gap: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.semantic.error + '10',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  errorText: {
    fontSize: 14,
    color: Colors.semantic.error,
    flex: 1,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.text.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  privacyText: {
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  privacyLink: {
    color: Colors.primary.cyan,
    fontWeight: '500',
  },
});
