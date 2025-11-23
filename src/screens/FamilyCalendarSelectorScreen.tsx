/**
 * FamilyCalendarSelectorScreen
 * 
 * Purpose: Display all family calendars and allow switching between them
 * Features:
 * - List all family groups with color indicators
 * - Show which calendar is currently selected
 * - Allow switching to different calendar
 * - Create new family calendar button at bottom
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUserId } from '../services/foundryClient';
import { getFamilyGroups } from '../services/familyGroupCache';
import { getUserPreferences, updateUserPreferences, refreshUserPreferences } from '../services/foundry/preferencesService';
import InviteMemberScreen from './InviteMemberScreen';
import type { FamilyGroup } from '../types';

interface FamilyCalendarSelectorScreenProps {
  onClose: () => void;
  onCreateNew: () => void;
  onCalendarChanged?: () => void;
  navigation?: any;
}

export const FamilyCalendarSelectorScreen: React.FC<FamilyCalendarSelectorScreenProps> = ({
  onClose,
  onCreateNew,
  onCalendarChanged,
  navigation,
}) => {
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadFamilyCalendars();
  }, []);

  const loadFamilyCalendars = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Load family groups from cache
      const groups = await getFamilyGroups(userId);
      console.log('📋 Loaded family groups for selector:', groups.length);
      setFamilyGroups(groups);

      // Get current default family group from preferences
      const preferences = await getUserPreferences(userId);
      if (preferences?.defaultFamilyGroupId) {
        setSelectedGroupId(preferences.defaultFamilyGroupId);
        console.log('✅ Current default calendar:', preferences.defaultFamilyGroupId);
      } else if (groups.length > 0) {
        // If no default set, use first group
        setSelectedGroupId(groups[0].familyGroupId);
      }
    } catch (error) {
      console.error('❌ Error loading family calendars:', error);
      Alert.alert('Error', 'Failed to load family calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCalendar = async (groupId: string) => {
    if (groupId === selectedGroupId) {
      // Already selected, just close
      onClose();
      return;
    }

    try {
      setSwitching(true);
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      console.log('🔄 Switching to calendar:', groupId);

      // Get current preferences
      const preferences = await getUserPreferences(userId);
      if (!preferences) {
        throw new Error('User preferences not found');
      }

      // Update default family group
      await updateUserPreferences(preferences.userPreferenceId, {
        defaultFamilyGroupId: groupId,
      });

      // Refresh preferences to get updated data
      await refreshUserPreferences(userId);

      console.log('✅ Successfully switched to calendar:', groupId);
      setSelectedGroupId(groupId);

      // Notify parent that calendar changed
      if (onCalendarChanged) {
        onCalendarChanged();
      }

      // Close the selector
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('❌ Error switching calendar:', error);
      Alert.alert('Error', 'Failed to switch calendar');
    } finally {
      setSwitching(false);
    }
  };

  const handleCreateNew = () => {
    onClose();
    setTimeout(() => {
      onCreateNew();
    }, 300);
  };

  const handleInviteMember = (familyGroupId: string, familyGroupName: string) => {
    console.log('📧 Opening invite screen for:', familyGroupName);
    setSelectedGroupForInvite({ id: familyGroupId, name: familyGroupName });
    setInviteModalVisible(true);
  };

  const handleCloseInviteModal = () => {
    setInviteModalVisible(false);
    setSelectedGroupForInvite(null);
  };

  const canInviteMembers = (role?: string): boolean => {
    return role === 'owner' || role === 'admin';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Family Calendars</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF7674" />
          <Text style={styles.loadingText}>Loading calendars...</Text>
        </View>
      ) : (

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {familyGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Family Calendars</Text>
            <Text style={styles.emptyMessage}>
              Create your first family calendar to get started
            </Text>
          </View>
        ) : (
          <View style={styles.calendarList}>
            {familyGroups.map((group) => {
              const isSelected = group.familyGroupId === selectedGroupId;
              const canInvite = canInviteMembers(group.role);
              
              return (
                <View key={group.familyGroupId} style={styles.calendarItemWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.calendarItem,
                      isSelected && styles.calendarItemSelected,
                      canInvite && styles.calendarItemWithInvite,
                    ]}
                    onPress={() => handleSelectCalendar(group.familyGroupId)}
                    disabled={switching}
                    activeOpacity={0.7}
                  >
                    <View style={styles.calendarItemLeft}>
                      <View
                        style={[
                          styles.colorCircle,
                          { backgroundColor: group.groupColor || '#2196F3' },
                        ]}
                      />
                      <View style={styles.calendarInfo}>
                        <Text style={styles.calendarName}>{group.groupName}</Text>
                        {group.groupDescription && (
                          <Text style={styles.calendarDescription} numberOfLines={1}>
                            {group.groupDescription}
                          </Text>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#EF7674" />
                    )}
                  </TouchableOpacity>
                  
                  {/* Invite Button - Only for owners/admins */}
                  {canInvite && (
                    <TouchableOpacity
                      style={styles.inviteButton}
                      onPress={() => handleInviteMember(group.familyGroupId, group.groupName)}
                      disabled={switching}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="person-add" size={18} color="#EF7674" />
                      <Text style={styles.inviteButtonText}>Invite</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNew}
          disabled={switching}
          activeOpacity={0.7}
        >
          <Ionicons name="people" size={24} color="#EF7674" />
          <Text style={styles.createButtonText}>Create New / Join with Invite Code</Text>
        </TouchableOpacity>
        </ScrollView>
      )}

      {switching && (
        <View style={styles.switchingOverlay}>
          <View style={styles.switchingContainer}>
            <ActivityIndicator size="large" color="#EF7674" />
            <Text style={styles.switchingText}>Switching calendar...</Text>
          </View>
        </View>
      )}

      {/* Invite Member Modal */}
      {inviteModalVisible && selectedGroupForInvite && (
        <Modal
          visible={inviteModalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={handleCloseInviteModal}
        >
          <InviteMemberScreen
            route={{
              params: {
                familyGroupId: selectedGroupForInvite.id,
                familyGroupName: selectedGroupForInvite.name,
              },
            }}
            navigation={{
              goBack: handleCloseInviteModal,
            }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 16,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  calendarList: {
    marginBottom: 20,
  },
  calendarItemWrapper: {
    marginBottom: 12,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarItemWithInvite: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  calendarItemSelected: {
    borderWidth: 2,
    borderColor: '#EF7674',
  },
  calendarItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calendarDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF7674',
    marginLeft: 8,
  },
  switchingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchingContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  switchingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF7674',
    marginLeft: 6,
  },
});

export default FamilyCalendarSelectorScreen;
