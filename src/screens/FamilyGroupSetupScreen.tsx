/**
 * FamilyGroupSetupScreen
 * 
 * Purpose: Allow new users to either join an existing family group or create a new one
 * 
 * Features:
 * - Option 1: Enter invite code to join existing group (placeholder)
 * - Option 2: Create new family group with form
 * - Form validation
 * - Color pickers for group and member colors
 * - Relationship type selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import ColorPicker from '../components/ColorPicker';
import RelationshipPicker from '../components/RelationshipPicker';
import MenuModal from '../components/MenuModal';
import { RelationshipType } from '../types';
import {
  createFamilyGroupWithMembership,
  getCurrentUserId,
  getCurrentUser,
} from '../services/foundryClient';
import { addFamilyGroup } from '../services/familyGroupCache';
import { acceptInvitation } from '../services/foundry/invitationService';
import { getUserPreferences, updateUserPreferences } from '../services/foundry/preferencesService';

interface FamilyGroupSetupScreenProps {
  onGroupCreated: (groupName: string) => void;
  onCancel?: () => void;
  onSignOut: () => void;
  isAddingCalendar?: boolean; // Flag to indicate if user is adding a calendar vs onboarding
}

interface FormErrors {
  groupName?: string;
  relationshipType?: string;
}

export const FamilyGroupSetupScreen: React.FC<FamilyGroupSetupScreenProps> = ({
  onGroupCreated,
  onCancel,
  onSignOut,
  isAddingCalendar = false,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [selectedJoinRelationship, setSelectedJoinRelationship] = useState<RelationshipType | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Conditional text based on context
  const headerText = isAddingCalendar ? "Add Calendar" : "Family Calendar Setup";
  const titleText = isAddingCalendar
    ? "Add a Family Calendar"
    : "Let's help you setup your family calendar";
  const subtitleText = isAddingCalendar
    ? "Join an existing group or create a new one"
    : "Choose how you'd like to get started";

  // Get current user info for menu
  const currentUser = getCurrentUser();
  const userInfo = currentUser ? {
    name: currentUser.displayName,
    email: currentUser.email || '',
  } : undefined;

  // Form state
  const [groupName, setGroupName] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType | undefined>();
  const [groupDescription, setGroupDescription] = useState('');
  const [groupColor, setGroupColor] = useState<string | undefined>();
  const [memberDisplayColor, setMemberDisplayColor] = useState<string | undefined>();
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate group name
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    } else if (groupName.length > 100) {
      newErrors.groupName = 'Group name must be 100 characters or less';
    }

    // Validate relationship type
    if (!relationshipType) {
      newErrors.relationshipType = 'Please select your relationship';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsCreating(true);

      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User ID not found. Please sign in again.');
      }

      console.log('🔨 Creating family group with data:', {
        userId,
        groupName: groupName.trim(),
        relationshipType,
        groupDescription: groupDescription.trim() || undefined,
        groupColor: groupColor || undefined,
        memberDisplayColor: memberDisplayColor || undefined,
      });

      const result = await createFamilyGroupWithMembership({
        userId,
        groupName: groupName.trim(),
        relationshipType: relationshipType!,
        groupDescription: groupDescription.trim() || undefined,
        groupColor: groupColor || undefined,
        memberDisplayColor: memberDisplayColor || undefined,
      });

      console.log('✅ Family group created successfully:', result);
      console.log('📋 Created group details:', {
        addedObjects: result.addedObjects,
        modifiedObjects: result.modifiedObjects,
      });

      // DO NOT cache - let calendar service handle fresh data loading
      // Navigate to calendar with group name
      onGroupCreated(groupName.trim());
    } catch (error) {
      console.error('❌ Error creating family group:', error);
      Alert.alert(
        'Error Creating Group',
        error instanceof Error ? error.message : 'Failed to create family group. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Missing Information', 'Please enter an invite code.');
      return;
    }

    if (!selectedJoinRelationship) {
      Alert.alert('Missing Information', 'Please select your relationship to this family group.');
      return;
    }

    try {
      setIsJoining(true);

      const userId = getCurrentUserId();
      const userEmail = currentUser?.email;

      if (!userId || !userEmail) {
        throw new Error('User information not found. Please sign in again.');
      }

      console.log('🎫 Joining family group with invite code:', inviteCode.trim());

      const result = await acceptInvitation(
        inviteCode.trim(), 
        userId, 
        userEmail,
        selectedJoinRelationship
      );

      if (result.success) {
        console.log('✅ Successfully joined family group:', result.familyGroupName);

        // If this is adding a calendar (not onboarding), update default family group
        if (isAddingCalendar && result.familyGroupId) {
          try {
            const preferences = await getUserPreferences(userId);
            if (preferences) {
              await updateUserPreferences(preferences.userPreferenceId, {
                defaultFamilyGroupId: result.familyGroupId,
              });
              console.log('✅ Updated default family group to:', result.familyGroupId);
            }
          } catch (prefError) {
            console.warn('⚠️ Could not update default family group:', prefError);
            // Continue anyway - user can change it later
          }
        }

        Alert.alert(
          'Success!',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to calendar with group name
                onGroupCreated(result.familyGroupName || 'Family Group');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('❌ Error joining with invite code:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to join family group. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = () => {
    if (showCreateForm) {
      setShowCreateForm(false);
      // Reset form
      setGroupName('');
      setRelationshipType(undefined);
      setGroupDescription('');
      setGroupColor(undefined);
      setMemberDisplayColor(undefined);
      setErrors({});
    } else if (onCancel) {
      onCancel();
    }
  };

  if (showCreateForm) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCancel}
              disabled={isCreating}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Family Group</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.formContainer}>
            {/* Group Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Group Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.groupName && styles.inputError,
                ]}
                placeholder="e.g., Smith Family, Work Friends"
                value={groupName}
                onChangeText={(text) => {
                  setGroupName(text);
                  if (errors.groupName) {
                    setErrors({ ...errors, groupName: undefined });
                  }
                }}
                maxLength={100}
                editable={!isCreating}
              />
              {errors.groupName && (
                <Text style={styles.errorText}>{errors.groupName}</Text>
              )}
              <Text style={styles.helperText}>
                {groupName.length}/100 characters
              </Text>
            </View>

            {/* Relationship Type */}
            <RelationshipPicker
              label="Your Relationship"
              selectedRelationship={relationshipType}
              onRelationshipSelect={(relationship) => {
                setRelationshipType(relationship);
                if (errors.relationshipType) {
                  setErrors({ ...errors, relationshipType: undefined });
                }
              }}
              error={errors.relationshipType}
            />

            {/* Group Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Group Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textAreaSmall]}
                placeholder="Describe your family group..."
                value={groupDescription}
                onChangeText={setGroupDescription}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                editable={!isCreating}
              />
            </View>

            {/* Group Color */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Group Color (Optional)</Text>
              <Text style={styles.helperText}>Select a color for the group</Text>
              <ColorPicker
                selectedColor={groupColor}
                onColorSelect={setGroupColor}
                showLabel={false}
              />
            </View>

            {/* Member Display Color */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Display Color (Optional)</Text>
              <Text style={styles.helperText}>Select your personal color in this group</Text>
              <ColorPicker
                selectedColor={memberDisplayColor}
                onColorSelect={setMemberDisplayColor}
                showLabel={false}
              />
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.createButton,
                isCreating && styles.createButtonDisabled,
              ]}
              onPress={handleCreateGroup}
              disabled={isCreating}
              activeOpacity={0.7}
            >
              {isCreating ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.createButtonText}>Creating...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#FFF" />
                  <Text style={styles.createButtonText}>Create Group</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isCreating}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Close and Menu Buttons */}
      <View style={styles.topHeader}>
        {onCancel ? (
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onCancel}
            accessible={true}
            accessibilityLabel="Close"
            accessibilityHint="Return to calendar"
          >
            <Ionicons name="close" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.closeButton} />
        )}
        <Text style={styles.topHeaderTitle}>{headerText}</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.subtitle}>{subtitleText}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Option 1: Join with Invite Code - Compact Design */}
          <View style={[styles.optionCard, styles.joinCard]}>
            <Text style={styles.compactTitle}>Join Existing Group</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.inviteInput, inviteCode.length > 0 && styles.inviteInputFilled]}
                placeholder="Enter invite code"
                placeholderTextColor={Colors.text.tertiary}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                editable={!isJoining}
                accessible={true}
                accessibilityLabel="Invite code input"
                accessibilityHint="Enter the invite code shared by your family"
              />
              {inviteCode.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setInviteCode('')}
                  accessible={true}
                  accessibilityLabel="Clear invite code"
                  disabled={isJoining}
                >
                  <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Relationship Picker for Join */}
            <View style={styles.relationshipSection}>
              <RelationshipPicker
                label="Your Relationship"
                selectedRelationship={selectedJoinRelationship}
                onRelationshipSelect={setSelectedJoinRelationship}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.compactJoinButton,
                (!inviteCode.trim() || !selectedJoinRelationship) && styles.compactJoinButtonDisabled,
              ]}
              onPress={handleJoinWithCode}
              disabled={!inviteCode.trim() || !selectedJoinRelationship || isJoining}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Join with invite code"
              accessibilityState={{ disabled: !inviteCode.trim() || !selectedJoinRelationship || isJoining }}
            >
              {isJoining ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.compactJoinButtonText}>Joining...</Text>
                </>
              ) : (
                <Text style={styles.compactJoinButtonText}>Join</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerCircle}>
              <Text style={styles.dividerText}>OR</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Option 2: Create New Group */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.createCard]}
            onPress={() => setShowCreateForm(true)}
            activeOpacity={0.95}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create new family group"
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.createIconContainer]}>
                <Ionicons name="people" size={28} color={Colors.semantic.success} />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.optionTitle}>Create New Group</Text>
                <Text style={styles.optionDescription}>
                  Start fresh and invite your family to join
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.optionButton, styles.createGroupButton]}
              onPress={() => setShowCreateForm(true)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Create family group"
            >
              <Ionicons name="add-circle" size={18} color="#FFF" />
              <Text style={styles.optionButtonText}>Create Family Group</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSignOut={onSignOut}
        userInfo={userInfo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  menuButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  optionCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  joinCard: {
    borderColor: Colors.primary.mint + '40',
    padding: 16,
  },
  createCard: {
    borderColor: Colors.semantic.success + '40',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  joinIconContainer: {
    backgroundColor: "#EF767426",
  },
  createIconContainer: {
    backgroundColor: Colors.semantic.success + '15',
  },
  cardTitleContainer: {
    flex: 1,
    paddingTop: 4,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'left',
  },
  optionDescription: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: 'left',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  inviteInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.background.secondary,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  inviteInputFilled: {
    borderColor: "#EF7674",
    backgroundColor: Colors.background.primary,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  joinButton: {
    backgroundColor: "#EF7674",
  },
  optionButtonDisabled: {
    backgroundColor: Colors.neutral.gray,
  },
  optionButtonText: {
    color: Colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpButton: {
    marginTop: 12,
    padding: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#EF7674",
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  createGroupButton: {
    backgroundColor: Colors.semantic.success,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  dividerCircle: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  formContainer: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: Colors.semantic.error,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.background.primary,
    color: Colors.text.primary,
  },
  inputError: {
    borderColor: Colors.semantic.error,
    borderWidth: 2,
  },
  textAreaSmall: {
    height: 80,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.semantic.error,
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  helperText: {
    color: Colors.text.tertiary,
    fontSize: 12,
    marginTop: 6,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.semantic.success,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  createButtonDisabled: {
    backgroundColor: Colors.neutral.gray,
  },
  createButtonText: {
    color: Colors.background.primary,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#EF7674",
    fontSize: 16,
    fontWeight: '500',
  },
  relationshipSection: {
    marginBottom: 16,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 16,
  },
  compactJoinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  compactJoinButtonDisabled: {
    backgroundColor: Colors.neutral.gray,
  },
  compactJoinButtonText: {
    color: Colors.background.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default FamilyGroupSetupScreen;
