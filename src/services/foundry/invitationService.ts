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
