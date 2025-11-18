// Family Group Service for Foundry
import { User } from "@familycalnderapp/sdk";
import { foundryClient } from "./foundryConfig";

/**
 * Get all family groups for a user using link traversal
 * User -> FamilyMembership -> FamilyGroup
 */
export async function getFamilyGroupsForUser(userId: string): Promise<any[]> {
  try {
    console.log('🔍 Fetching family groups for userId:', userId);
    
    // Step 1: Get all FamilyMemberships for the user using link traversal
    const memberships = await foundryClient(User)
      .where({ userId: { $eq: userId } })
      .pivotTo("membership")
      .fetchPage();
    
    console.log('📋 Found', memberships.data.length, 'family memberships');
    
    if (memberships.data.length === 0) {
      console.log('📭 No family memberships found for user');
      return [];
    }
    
    // Step 2: For each membership, get the linked FamilyGroups
    const familyGroupArrays = await Promise.all(
      memberships.data.map(async (membership: any) => {
        try {
          const groups = await foundryClient(membership.$objectType)
            .where({ membershipId: { $eq: membership.$primaryKey } })
            .pivotTo("familyGroup")
            .fetchPage();
          return groups.data;
        } catch (error) {
          console.error('❌ Error fetching family group for membership:', membership.$primaryKey, error);
          return [];
        }
      })
    );
    
    // Step 3: Flatten the array and deduplicate by FamilyGroup ID
    const allFamilyGroups = familyGroupArrays.flat();
    const uniqueFamilyGroupsMap: { [id: string]: any } = {};
    
    allFamilyGroups.forEach((group: any) => {
      const groupId = group.$primaryKey || group.familyGroupId;
      if (groupId && !uniqueFamilyGroupsMap[groupId]) {
        uniqueFamilyGroupsMap[groupId] = group;
      }
    });
    
    const uniqueGroups = Object.values(uniqueFamilyGroupsMap);
    console.log('✅ Found', uniqueGroups.length, 'unique family groups');
    
    return uniqueGroups;
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
