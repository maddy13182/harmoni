/**
 * FamilyGroupCheckScreen
 * 
 * Purpose: Loading screen that checks if user has any family groups
 * Flow: After preferences setup, query family groups and route accordingly
 * 
 * Outcomes:
 * 1. Error → Show error message with retry option
 * 2. No groups → Navigate to FamilyGroupSetupScreen
 * 3. Has groups → Store in cache and navigate to CalendarScreen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getFamilyGroupsForUser,
  getCurrentUserId,
  getCurrentDisplayName,
} from '../services/foundryClient';
import { storeFamilyGroups } from '../services/familyGroupCache';
import { getUserPreferences, updateUserPreferences } from '../services/foundry/preferencesService';

interface FamilyGroupCheckScreenProps {
  onNoGroups: () => void;
  onHasGroups: () => void;
  onError: (error: any) => void;
}

export const FamilyGroupCheckScreen: React.FC<FamilyGroupCheckScreenProps> = ({
  onNoGroups,
  onHasGroups,
  onError,
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userName = getCurrentDisplayName() || 'there';

  useEffect(() => {
    checkFamilyGroups();
  }, []);

  const checkFamilyGroups = async () => {
    try {
      setIsChecking(true);
      setError(null);

      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User ID not found. Please sign in again.');
      }

      console.log('🔍 Checking family groups for user:', userId);

      // Query family groups from Foundry
      const groups = await getFamilyGroupsForUser(userId);

      console.log('📋 Family groups check result:', {
        count: groups.length,
        hasGroups: groups.length > 0,
      });

      if (groups.length === 0) {
        // No family groups - new user
        console.log('📭 No family groups found, navigating to setup');
        setTimeout(() => {
          onNoGroups();
        }, 500);
      } else {
        // Has family groups - store in cache and proceed
        console.log('✅ Found family groups, storing in cache for user:', userId);
        await storeFamilyGroups(userId, groups);
        
        // SAFETY NET: Auto-set defaultFamilyGroupId if not already set
        try {
          const preferences = await getUserPreferences(userId);
          if (preferences && !preferences.defaultFamilyGroupId) {
            console.log('🔧 No defaultFamilyGroupId set, auto-setting to first group:', groups[0].familyGroupId);
            await updateUserPreferences(preferences.userPreferenceId, {
              defaultFamilyGroupId: groups[0].familyGroupId,
            });
            console.log('✅ Auto-set defaultFamilyGroupId successfully');
          } else if (preferences?.defaultFamilyGroupId) {
            console.log('✅ defaultFamilyGroupId already set:', preferences.defaultFamilyGroupId);
          }
        } catch (prefError) {
          console.error('⚠️ Failed to auto-set defaultFamilyGroupId (non-critical):', prefError);
          // Don't block navigation - this is a safety net, not critical
        }
        
        setTimeout(() => {
          onHasGroups();
        }, 500);
      }
    } catch (err) {
      console.error('❌ Error checking family groups:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsChecking(false);
      
      // Also call onError callback
      onError(err);
    }
  };

  const handleRetry = () => {
    checkFamilyGroups();
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Please contact the system administrator for assistance with this issue.',
      [{ text: 'OK' }]
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          
          <Text style={styles.errorTitle}>Problem Getting Events</Text>
          
          <Text style={styles.errorMessage}>
            We encountered an issue while checking your family groups.
          </Text>
          
          <Text style={styles.errorDetails}>{error}</Text>
          
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
            activeOpacity={0.7}
          >
            <Text style={styles.supportButtonText}>
              Contact System Admin
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#007AFF" />
        
        <Text style={styles.title}>Hi {userName}!</Text>
        
        <Text style={styles.message}>
          Checking your family groups...
        </Text>
        
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotAnimated1]} />
          <View style={[styles.dot, styles.dotAnimated2]} />
          <View style={[styles.dot, styles.dotAnimated3]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
  dotAnimated1: {
    opacity: 0.3,
  },
  dotAnimated2: {
    opacity: 0.6,
  },
  dotAnimated3: {
    opacity: 1,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 400,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  supportButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  supportButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FamilyGroupCheckScreen;
