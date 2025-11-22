/**
 * InviteMemberScreen
 * 
 * Purpose: Allow owners/admins to invite new members to their family calendar
 * Features:
 * - Email input for invitee
 * - Role selection (owner, admin, member, readonly)
 * - Relationship selection (dad, mom, son, daughter, etc.)
 * - Send invitation via Foundry action
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { RolePicker } from '../components/RolePicker';
import { createInvitationToken, validateEmail } from '../services/foundry/invitationService';
import { getCurrentUserId } from '../services/foundryClient';
import type { RelationshipType } from '../types';

interface InviteMemberScreenProps {
  route: {
    params: {
      familyGroupId: string;
      familyGroupName: string;
    };
  };
  navigation: any;
}

export const InviteMemberScreen: React.FC<InviteMemberScreenProps> = ({
  route,
  navigation,
}) => {
  const { familyGroupId, familyGroupName } = route.params;

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType | ''>('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [relationshipModalVisible, setRelationshipModalVisible] = useState(false);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError('');
  };

  const handleShareInvitation = async (invitationToken: string) => {
    try {
      const message = `Hello! Use this invite code ${invitationToken} to join the family group "${familyGroupName}" in the Harmoni app.`;
      
      await Share.share({
        message: message,
        title: 'Join My Family Calendar',
      });
      
      console.log('✅ Share dialog opened successfully');
    } catch (error) {
      console.error('❌ Error sharing invitation:', error);
      Alert.alert(
        'Share Failed',
        'Unable to open share dialog. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const validateForm = (): boolean => {
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Validate role
    if (!role) {
      Alert.alert('Missing Information', 'Please select a role for the invitee');
      return false;
    }

    // Validate relationship
    if (!relationship) {
      Alert.alert('Missing Information', 'Please select a relationship');
      return false;
    }

    return true;
  };

  const handleSendInvitation = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      console.log('📧 Sending invitation:', {
        familyGroupId,
        email,
        role,
        relationship,
      });

      const result = await createInvitationToken({
        familyGroupId,
        invitedEmail: email.trim().toLowerCase(),
        suggestedRole: role,
        suggestedRelationship: relationship,
        userId,
      });

      if (result.success) {
        const invitationMessage = result.invitationToken
          ? `Invitation Code: ${result.invitationToken}\n\nShare this code with ${email} so they can join your family calendar.`
          : `An invitation has been sent to ${email}. They will receive an email with instructions to join your family calendar.`;

        Alert.alert(
          'Invitation Sent! 🎉',
          invitationMessage,
          [
            {
              text: 'Share Invitation',
              onPress: () => {
                if (result.invitationToken) {
                  handleShareInvitation(result.invitationToken);
                }
              },
              style: result.invitationToken ? 'default' : 'cancel',
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
              style: 'default',
            },
          ]
        );
      } else {
        Alert.alert(
          'Failed to Send Invitation',
          result.message || 'Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error sending invitation:', error);
      Alert.alert(
        'Error',
        'Failed to send invitation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Member</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Calendar Info */}
          <View style={styles.calendarInfo}>
            <Ionicons name="calendar" size={24} color="#EF7674" />
            <Text style={styles.calendarName}>{familyGroupName}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={20} color={Colors.primary.mint} />
            <Text style={styles.instructionsText}>
              Invite someone to join your family calendar. They'll receive an email with instructions.
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Email Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="email@example.com"
              placeholderTextColor={Colors.text.secondary}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Role Picker */}
          <RolePicker
            selectedRole={role}
            onSelectRole={setRole}
            label="Role"
            required
          />

          {/* Relationship Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Relationship <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setRelationshipModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={relationship ? styles.selectedText : styles.placeholderText}>
                {relationship ? relationship.charAt(0).toUpperCase() + relationship.slice(1) : 'Select relationship'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Relationship Modal */}
          <Modal
            visible={relationshipModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setRelationshipModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setRelationshipModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Relationship</Text>
                  <TouchableOpacity onPress={() => setRelationshipModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.relationshipList}>
                  {(['dad', 'mom', 'daughter', 'son', 'grandpa', 'grandma', 'relative', 'friend', 'other'] as const).map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.relationshipItem,
                        relationship === rel && styles.relationshipItemSelected,
                      ]}
                      onPress={() => {
                        setRelationship(rel);
                        setRelationshipModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.relationshipLabel,
                        relationship === rel && styles.relationshipLabelSelected,
                      ]}>
                        {rel.charAt(0).toUpperCase() + rel.slice(1)}
                      </Text>
                      {relationship === rel && (
                        <Ionicons name="checkmark-circle" size={24} color="#EF7674" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendInvitation}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>Send Invitation</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 16,
    paddingBottom: Layout.spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF767410',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.lg,
  },
  calendarName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: Layout.spacing.sm,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.mint + '10',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.xl,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: Layout.spacing.sm,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  required: {
    color: Colors.semantic.error,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  inputError: {
    borderColor: Colors.semantic.error,
  },
  errorText: {
    fontSize: 13,
    color: Colors.semantic.error,
    marginTop: Layout.spacing.xs,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF7674',
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginTop: Layout.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: Layout.spacing.sm,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  selectedText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  relationshipList: {
    padding: Layout.spacing.md,
  },
  relationshipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  relationshipItemSelected: {
    borderColor: '#EF7674',
    backgroundColor: '#EF767410',
  },
  relationshipLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  relationshipLabelSelected: {
    color: '#EF7674',
  },
});

export default InviteMemberScreen;
