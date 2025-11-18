// Family Calendar App Types

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  color: string; // For calendar event color coding
  role: 'parent' | 'child' | 'other';
  avatarUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees: string[]; // Array of FamilyMember IDs
  createdBy: string; // FamilyMember ID
  category: EventCategory;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  reminders?: Reminder[];
}

export type EventCategory = 
  | 'appointment'
  | 'school'
  | 'work'
  | 'sports'
  | 'social'
  | 'holiday'
  | 'birthday'
  | 'other';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
}

export interface Reminder {
  id: string;
  minutesBefore: number;
  method: 'notification' | 'email';
}

export interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  createdAt: Date;
  updatedAt: Date;
}

// Foundry Family Group Types
export interface FamilyGroup {
  familyGroupId: string;
  groupName: string;
  groupColor?: string;
  groupDescription?: string;
  createdAt?: string;
}

export interface FamilyMembership {
  membershipId: string;
  familyGroupId: string;
  userId: string;
  role: string;
  relationshipType: string;
  displayColor?: string;
  membershipStatus: string;
}

export interface CreateFamilyGroupParams {
  userId: string;
  groupName: string;
  relationshipType: string;
  groupDescription?: string;
  groupColor?: string;
  memberDisplayColor?: string;
}

export type RelationshipType = 
  | 'dad'
  | 'mom'
  | 'son'
  | 'daughter'
  | 'grandparent'
  | 'relative'
  | 'friend'
  | 'other';

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
  EventDetails: { eventId: string };
  AddEvent: undefined;
  FamilyMembers: undefined;
  Settings: undefined;
};
