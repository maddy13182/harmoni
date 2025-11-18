// Family Calendar App Types

// ===== CALENDAR EVENT TYPES =====

export interface CalendarEvent {
  eventId: string;
  title: string;
  description?: string;
  location?: string;
  startsAtUtc: string;
  endsAtUtc: string;
  isAllDay: boolean;
  primaryFamilyGroupId: string;
  primaryFamilyGroupName: string;
  primaryFamilyGroupColor: string;
  visibilityLevel: 'full_details' | 'busy_only';
  attendees: Attendee[];
}

export interface Attendee {
  userId: string;
  displayName: string;
  color: string;
  relationshipType: string;
  familyGroupName: string;
  attendeeRole: string;
  responseStatus?: string;
}

export interface FamilyMemberCalendar {
  userId: string;
  displayName: string;
  color: string;
  relationshipType: string;
}

export interface FamilyGroupWithMembers {
  familyGroupId: string;
  familyGroupName: string;
  members: FamilyMemberCalendar[];
}

export interface CalendarViewResponse {
  events: CalendarEvent[];
  familyGroupsWithMembers: FamilyGroupWithMembers[];
  familyGroupInfo: FamilyGroupInfo[];
}

export interface FamilyGroupInfo {
  familyGroupId: string;
  groupName: string;
  groupColor: string;
  isDefault: boolean;
}

// ===== LEGACY TYPES (Keep for backward compatibility) =====

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  color: string; // For calendar event color coding
  role: 'parent' | 'child' | 'other';
  avatarUrl?: string;
}

export interface LegacyCalendarEvent {
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
