/**
 * Invitation Service
 * 
 * Purpose: Handle family group invitation operations
 * - Create invitation tokens for new members
 */

import { createInvitationTokenAction } from '@familycalnderapp/sdk';
import { foundryClient } from './foundryConfig';

export interface CreateInvitationParams {
  familyGroupId: string;
  invitedEmail: string;
  suggestedRelationship: string;
  suggestedRole: string;
  userId: string;
}

export interface CreateInvitationResult {
  success: boolean;
  message: string;
  invitationToken?: string;
  error?: any;
}

/**
 * Create an invitation token for a user to join a family group
 * @param params Invitation parameters
 * @returns Result of the invitation creation
 */
export const createInvitationToken = async (
  params: CreateInvitationParams
): Promise<CreateInvitationResult> => {
  try {
    console.log('📧 Creating invitation token:', {
      familyGroupId: params.familyGroupId,
      invitedEmail: params.invitedEmail,
      role: params.suggestedRole,
      relationship: params.suggestedRelationship,
    });

    // Call the Foundry action
    const result = await foundryClient(createInvitationTokenAction).applyAction(
      {
        familyGroupId: params.familyGroupId,
        invitedEmail: params.invitedEmail,
        suggestedRelationship: params.suggestedRelationship,
        suggestedRole: params.suggestedRole,
        userId: params.userId,
      },
      {
        $returnEdits: true,
      }
    );

    // Extract invitation token from response
    let invitationToken: string | undefined;
    
    if (result.type === 'edits' && result.addedObjects && result.addedObjects.length > 0) {
      const invitationObject = result.addedObjects.find(
        (obj: any) => obj.objectType === 'InvitationToken'
      );
      
      if (invitationObject && invitationObject.primaryKey) {
        invitationToken = String(invitationObject.primaryKey);
        console.log('✅ Invitation token created:', invitationToken);
      }
    }

    if (!invitationToken) {
      console.warn('⚠️ Invitation created but token not found in response');
    }

    return {
      success: true,
      message: 'Invitation sent successfully!',
      invitationToken,
    };
  } catch (error: any) {
    console.error('❌ Error creating invitation token:', error);
    
    // Check if it's a duplicate invitation error
    if (error?.parameters?.message) {
      const errorMessage = error.parameters.message;
      
      // Extract existing token from duplicate invitation error
      const tokenMatch = errorMessage.match(/Token ID: (inv_[a-zA-Z0-9]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const existingToken = tokenMatch[1];
        console.log('ℹ️ Found existing invitation token:', existingToken);
        
        return {
          success: true,
          message: 'An invitation was already sent to this email. Here is the invitation code:',
          invitationToken: existingToken,
        };
      }
      
      // Check for invalid relationship error
      if (errorMessage.includes('Invalid relationship')) {
        return {
          success: false,
          message: 'Invalid relationship selected. Please choose: dad, mom, daughter, son, grandpa, grandma, relative, friend, or other.',
          error,
        };
      }
    }
    
    return {
      success: false,
      message: 'Failed to send invitation. Please try again.',
      error,
    };
  }
};

/**
 * Validate email format
 * @param email Email address to validate
 * @returns true if valid email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate if email is a Google account (gmail.com or Google Workspace)
 * @param email Email address to validate
 * @returns true if likely a Google account
 */
export const isGoogleEmail = (email: string): boolean => {
  // Accept gmail.com or any email (Google Workspace can use custom domains)
  return validateEmail(email);
};

export interface AcceptInvitationResult {
  success: boolean;
  message: string;
  familyGroupId?: string;
  familyGroupName?: string;
  error?: any;
}

/**
 * Accept an invitation to join a family group using an invite code
 * @param inviteCode The invitation token/code
 * @param userId The user ID accepting the invitation
 * @param userEmail The user's email address
 * @param selectedRelationship The relationship type chosen by user
 * @returns Result of the invitation acceptance
 */
export const acceptInvitation = async (
  inviteCode: string,
  userId: string,
  userEmail: string,
  selectedRelationship: string
): Promise<AcceptInvitationResult> => {
  try {
    console.log('🎫 Accepting invitation with code:', inviteCode);
    console.log('👤 User ID:', userId);
    console.log('📧 User Email:', userEmail);
    console.log('👨‍👩‍👧‍👦 Selected Relationship:', selectedRelationship);

    // Import the action from SDK
    const { acceptInviationJoinActioncall } = await import('@familycalnderapp/sdk');

    // Call the Foundry action to accept invitation
    const result = await foundryClient(acceptInviationJoinActioncall).applyAction(
      {
        invitationToken: inviteCode,
        userId: userId,
        userEmail: userEmail,
        selectedRelationship: selectedRelationship,
      },
      {
        $returnEdits: true,
      }
    );

    console.log('📦 Accept invitation result:', JSON.stringify(result, null, 2));

    // Extract family group information from response
    let familyGroupId: string | undefined;
    let familyGroupName: string | undefined;

    if (result.type === 'edits') {
      // Look for FamilyMembership object to get the family group ID
      if (result.addedObjects && result.addedObjects.length > 0) {
        const membershipObject: any = result.addedObjects.find(
          (obj: any) => obj.objectType === 'FamilyMembership'
        );
        
        if (membershipObject && membershipObject.familyGroupId) {
          familyGroupId = membershipObject.familyGroupId;
          console.log('✅ Joined family group ID:', familyGroupId);
        }
      }

      // Look for FamilyGroup object to get the group name
      if (result.modifiedObjects && result.modifiedObjects.length > 0) {
        const familyGroupObject: any = result.modifiedObjects.find(
          (obj: any) => obj.objectType === 'FamilyGroup'
        );
        
        if (familyGroupObject && familyGroupObject.groupName) {
          familyGroupName = familyGroupObject.groupName;
          console.log('✅ Family group name:', familyGroupName);
        }
      }
    }

    if (!familyGroupId) {
      console.warn('⚠️ Invitation accepted but family group ID not found in response');
    }

    return {
      success: true,
      message: familyGroupName 
        ? `Successfully joined ${familyGroupName}!` 
        : 'Successfully joined family group!',
      familyGroupId,
      familyGroupName,
    };
  } catch (error: any) {
    console.error('❌ Error accepting invitation:', error);
    
    // Check for specific error messages
    if (error?.parameters?.message) {
      const errorMessage = error.parameters.message;
      
      // Invalid or expired token
      if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
        return {
          success: false,
          message: 'Invalid or expired invite code. Please check the code and try again.',
          error,
        };
      }
      
      // Already a member
      if (errorMessage.includes('already a member')) {
        return {
          success: false,
          message: 'You are already a member of this family group.',
          error,
        };
      }
    }
    
    return {
      success: false,
      message: 'Failed to join family group. Please check the invite code and try again.',
      error,
    };
  }
};
