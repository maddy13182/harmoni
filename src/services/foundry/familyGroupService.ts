// Family Group Service for Foundry
import { User } from "@familycalnderapp/sdk";
import { foundryClient } from "./foundryConfig";

/**
 * Get all family groups for a user using getUserFamilyGroups Foundry function
 * Replaced link traversal with direct function call
 */
export async function getFamilyGroupsForUser(userId: string): Promise<any[]> {
  try {
    console.log('🔍 Fetching family groups using getUserFamilyGroups function for userId:', userId);
    
    // Use Foundry function instead of link traversal
    const { fetchFamilyGroups } = await import('./calendarApi');
    const groups = await fetchFamilyGroups(userId);
    
    console.log('✅ Found', groups.length, 'family groups');
    
    return groups;
  } catch (error) {
    console.error('❌ Error fetching family groups:', error);
    throw error;
  }
}

/**
 * Create a new family group with membership using Foundry action
 */
export async function createFamilyGroupWithMembership(params: {
  userId: string;
  groupName: string;
  relationshipType: string;
  groupDescription?: string;
  groupColor?: string;
  memberDisplayColor?: string;
}): Promise<any> {
  try {
    console.log('🔨 Creating family group with membership:', params);
    
    // Import the action dynamically to avoid circular dependencies
    const { createFamilyGroupWithMembership: createAction } = await import('@familycalnderapp/sdk');
    
    const result = await foundryClient(createAction).applyAction(params, {
      $returnEdits: true
    });
    
    console.log('🎉 CREATE FAMILY GROUP API RESPONSE:', JSON.stringify(result, null, 2));
    
    if (result.type === "edits") {
      console.log('📋 Response Type: edits');
      console.log('📊 Edited Object Types Count:', result.editedObjectTypes?.length || 0);
      console.log('📝 Edited Object Types:', result.editedObjectTypes);
      console.log('🔍 Full result structure keys:', Object.keys(result));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error creating family group:', error);
    throw error;
  }
}

/**
 * Check if user has any family groups using Foundry function
 */
export async function checkUserFamilyGroups(userId: string): Promise<{
  hasGroups: boolean;
  groups?: any[];
  error?: any;
}> {
  try {
    console.log('🔍 Checking family groups using getUserFamilyGroups function for userId:', userId);
    
    // Use Foundry function instead of link traversal
    const groups = await fetchFamilyGroupsFromFoundry(userId);
    
    console.log('📋 getUserFamilyGroups returned:', groups.length, 'groups');
    
    return {
      hasGroups: groups.length > 0,
      groups: groups
    };
  } catch (error) {
    console.error('❌ Error checking user family groups:', error);
    return {
      hasGroups: false,
      error
    };
  }
}

/**
 * Fetch family groups directly from Foundry using getUserFamilyGroups function
 * Does NOT use cache
 */
async function fetchFamilyGroupsFromFoundry(userId: string): Promise<any[]> {
  const { fetchFamilyGroups } = await import('./calendarApi');
  return await fetchFamilyGroups(userId);
}
