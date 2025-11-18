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
import { RelationshipType } from '../types';
import {
  createFamilyGroupWithMembership,
  getCurrentUserId,
} from '../services/foundryClient';
import { addFamilyGroup } from '../services/familyGroupCache';

interface FamilyGroupSetupScreenProps {
  onGroupCreated: (groupName: string) => void;
  onCancel?: () => void;
}

interface FormErrors {
  groupName?: string;
  relationshipType?: string;
}

export const FamilyGroupSetupScreen: React.FC<FamilyGroupSetupScreenProps> = ({
  onGroupCreated,
  onCancel,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

      // Add to cache (the API should return the created group)
      // For now, we'll create a basic group object
      const createdGroup = {
        familyGroupId: result.familyGroupId || 'temp-id',
        groupName: groupName.trim(),
        groupColor: groupColor,
        groupDescription: groupDescription.trim() || undefined,
      };
      
      addFamilyGroup(createdGroup);

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

  const handleJoinWithCode = () => {
    Alert.alert(
      'Coming Soon',
      'The ability to join a family group with an invite code will be available soon!',
      [{ text: 'OK' }]
    );
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
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Let's help you setup your family calendar</Text>
          <Text style={styles.subtitle}>Choose how you'd like to get started</Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Option 1: Join with Invite Code */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.joinCard]}
            activeOpacity={0.95}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Join existing family group with invite code"
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.joinIconContainer]}>
                <Ionicons name="key" size={28} color={Colors.primary.main} />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.optionTitle}>Join Existing Group</Text>
                <Text style={styles.optionDescription}>
                  Have an invite code? Join your family's group
                </Text>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.inviteInput, inviteCode.length > 0 && styles.inviteInputFilled]}
                placeholder="Enter invite code"
                placeholderTextColor={Colors.text.tertiary}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
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
                >
                  <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.optionButton,
                styles.joinButton,
                !inviteCode.trim() && styles.optionButtonDisabled,
              ]}
              onPress={handleJoinWithCode}
              disabled={!inviteCode.trim()}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Join with invite code"
              accessibilityState={{ disabled: !inviteCode.trim() }}
            >
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
              <Text style={styles.optionButtonText}>Join with Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.helpButton}>
              <Text style={styles.helpText}>What's an invite code?</Text>
            </TouchableOpacity>
          </TouchableOpacity>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
    borderColor: Colors.primary.light + '40',
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
    backgroundColor: Colors.primary.main + '15',
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
    borderColor: Colors.primary.main,
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
    backgroundColor: Colors.primary.main,
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
    color: Colors.primary.main,
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
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FamilyGroupSetupScreen;
