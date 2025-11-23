/**
 * Calendar Screen - Main Calendar View
 * 
 * Displays family calendar with Month/Week/Day views
 * Mobile-optimized with free day detection and multi-person event handling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { initializeCalendarAfterGroupCreation, loadCalendarEvents } from '../services/calendarService';
import { getCurrentUserId, getCurrentUser } from '../services/foundry/cacheService';
import { getUserPreferences } from '../services/foundry';
import { getSelectedGroup } from '../services/familyGroupCache';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import MenuModal from '../components/MenuModal';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';
import { FloatingActionButton, EventCreationModal, ChatInterface } from '../components/event-creation';
import FamilyGroupSetupScreen from './FamilyGroupSetupScreen';
import type { CalendarEvent, FamilyGroup, CalendarViewResponse, FamilyMemberCalendar } from '../types';
import { extractDate } from '../utils/calendarHelpers';

interface CalendarScreenProps {
  onSignOut: () => void;
  familyGroupName?: string;
}

export default function CalendarScreen({ onSignOut, familyGroupName }: CalendarScreenProps) {
  // ============================================
  // STATE
  // ============================================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<string[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarViewResponse | null>(null);
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Use local date, not UTC
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [whosWhoExpanded, setWhosWhoExpanded] = useState(false);
  const [eventCreationModalVisible, setEventCreationModalVisible] = useState(false);
  const [chatInterfaceVisible, setChatInterfaceVisible] = useState(false);
  const [familyGroupSetupVisible, setFamilyGroupSetupVisible] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [displayGroupName, setDisplayGroupName] = useState<string | undefined>(familyGroupName);

  // Get current user info for menu
  const currentUser = getCurrentUser();
  const userId = getCurrentUserId() || '';
  const userInfo = currentUser ? {
    name: currentUser.displayName,
    email: currentUser.email || '',
  } : undefined;

  // Get all family members from calendar data
  const allFamilyMembers: FamilyMemberCalendar[] = calendarData?.familyGroupsWithMembers
    .flatMap(group => group.members) || [];

  // ============================================
  // LOAD CALENDAR ON MOUNT
  // ============================================
  useEffect(() => {
    loadCalendar();
    loadUserPreferences();
    loadGroupName();
  }, []);

  // ============================================
  // LOAD GROUP NAME FROM CACHE
  // ============================================
  async function loadGroupName() {
    try {
      if (!userId) return;
      const selectedGroup = await getSelectedGroup(userId);
      if (selectedGroup) {
        setDisplayGroupName(selectedGroup.groupName);
        console.log('[CalendarScreen] Loaded group name from cache:', selectedGroup.groupName);
      }
    } catch (error) {
      console.error('[CalendarScreen] Error loading group name:', error);
    }
  }

  // ============================================
  // LOAD USER PREFERENCES
  // ============================================
  async function loadUserPreferences() {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const prefs = await getUserPreferences(userId);
      setUserPreferences(prefs);
    } catch (error) {
      console.error('[CalendarScreen] Failed to load user preferences:', error);
    }
  }

  // ============================================
  // RELOAD EVENTS WHEN SELECTION CHANGES
  // ============================================
  useEffect(() => {
    if (selectedFamilyIds.length > 0 && !loading) {
      reloadEvents();
    }
  }, [selectedFamilyIds, viewType, selectedDate]);

  // ============================================
  // INITIAL LOAD
  // ============================================
  async function loadCalendar() {
    try {
      setLoading(true);

      const userId = getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      // Initialize calendar (loads families + default events)
      const data = await initializeCalendarAfterGroupCreation(userId);

      setFamilyGroups(data.familyGroups);
      setSelectedFamilyIds(data.defaultFamilyIds);
      setCalendarData(data.calendarData);
      setViewType(data.viewType);

    } catch (error: any) {
      console.error('[CalendarScreen] Failed to load calendar:', error);
      
      // Handle specific error for missing default calendar
      if (error.message === 'NO_DEFAULT_CALENDAR') {
        Alert.alert(
          'No Default Calendar',
          'You need to set a default family calendar in your preferences to view the calendar.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to load calendar');
      }
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // RELOAD EVENTS (when families/view changes)
  // ============================================
  async function reloadEvents() {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const data = await loadCalendarEvents(
        userId,
        selectedFamilyIds,
        viewType,
        selectedDate  // Pass selected date for accurate date range
      );

      setCalendarData(data);
    } catch (error: any) {
      console.error('[CalendarScreen] Failed to reload events:', error);
      Alert.alert('Error', 'Failed to reload events');
    }
  }

  // ============================================
  // PULL TO REFRESH
  // ============================================
  async function onRefresh() {
    setRefreshing(true);
    try {
      await reloadEvents();
    } finally {
      setRefreshing(false);
    }
  }

  // ============================================
  // TOGGLE FAMILY SELECTION
  // ============================================
  function toggleFamilySelection(familyId: string) {
    setSelectedFamilyIds(prev => {
      // Must have at least one family selected
      if (prev.includes(familyId) && prev.length === 1) {
        Alert.alert('Notice', 'You must have at least one calendar selected');
        return prev;
      }

      if (prev.includes(familyId)) {
        return prev.filter(id => id !== familyId);
      } else {
        return [...prev, familyId];
      }
    });
  }

  // ============================================
  // CHANGE VIEW TYPE
  // ============================================
  function changeViewType(newViewType: 'day' | 'week' | 'month') {
    if (newViewType !== viewType) {
      setViewType(newViewType);
    }
  }

  // ============================================
  // HANDLE DATE SELECTION
  // ============================================
  function handleDateSelect(date: string) {
    setSelectedDate(date);
  }

  // ============================================
  // HANDLE TODAY BUTTON
  // ============================================
  function handleTodayPress() {
    const now = new Date();
    // Use local date, not UTC
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    console.log('[CalendarScreen] Today button pressed:', {
      timestamp: now.toISOString(),
      localDate: now.toLocaleDateString(),
      localTime: now.toLocaleTimeString(),
      extractedDate: today,
      currentSelectedDate: selectedDate,
    });
    
    setSelectedDate(today);
  }

  // ============================================
  // HANDLE EVENT TAP - Switch to Day View
  // ============================================
  function handleEventTap(event: CalendarEvent) {
    const eventDate = extractDate(event.startsAtUtc);
    setSelectedDate(eventDate);
    setViewType('day');
  }

  // ============================================
  // EVENT CREATION HANDLERS
  // ============================================
  function handleChatCreate() {
    setEventCreationModalVisible(false);
    // Small delay to ensure first modal closes before opening chat
    setTimeout(() => {
      setChatInterfaceVisible(true);
    }, 300);
  }

  function handlePhotoCreate() {
    setEventCreationModalVisible(false);
    Alert.alert('Photo Upload', 'This feature will be implemented next!');
  }

  function handleVoiceCreate() {
    setEventCreationModalVisible(false);
    Alert.alert('Voice Recording', 'This feature will be implemented next!');
  }

  // ============================================
  // CALENDAR CHANGE HANDLERS
  // ============================================
  function handleCalendarChanged() {
    console.log('📅 Calendar changed, reloading calendar...');
    // Reload the entire calendar to get new default calendar
    loadCalendar();
    loadGroupName();
  }

  function handleCreateNewCalendar() {
    console.log('➕ Create new calendar requested');
    setFamilyGroupSetupVisible(true);
  }

  function handleGroupCreatedFromModal(groupName: string) {
    console.log('✅ Group created/joined from modal:', groupName);
    setFamilyGroupSetupVisible(false);
    // Reload calendar to show new group
    setTimeout(() => {
      loadCalendar();
      loadGroupName();
    }, 300);
  }

  // ============================================
  // RENDER LOADING STATE
  // ============================================
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary.coral} />
        <Text style={styles.loadingText}>Loading your calendar...</Text>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER NO FAMILIES STATE
  // ============================================
  if (familyGroups.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={['top']}>
        <Text style={styles.emptyTitle}>No Family Calendars</Text>
        <Text style={styles.emptyText}>
          Create your first family calendar to get started!
        </Text>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER MAIN UI
  // ============================================
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Header Section - Does not scroll */}
      <View style={styles.fixedHeaderSection}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar-outline" size={28} color={Colors.text.primary} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>My Calendar</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.todayButton}
              onPress={handleTodayPress}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="menu" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAMILY SELECTOR */}
        <View style={styles.familySelector}>
          <View style={styles.familySelectorHeader}>
            <Text style={styles.sectionTitle}>Calendars</Text>
            
            {/* WHO'S WHO BUTTON - Inline with Calendars */}
            {calendarData?.familyGroupsWithMembers && calendarData.familyGroupsWithMembers.length > 0 && (
              <View>
                <TouchableOpacity 
                  style={styles.inlinePillButton}
                  onPress={() => setWhosWhoExpanded(!whosWhoExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.inlinePillButtonText}>Who's Who</Text>
                  <Ionicons 
                    name={whosWhoExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={Colors.primary.coral} 
                  />
                </TouchableOpacity>
                
                {/* WHO'S WHO EXPANDED CONTENT - Absolute positioned */}
                {whosWhoExpanded && (
                  <View style={styles.absoluteExpandedContent}>
                    {calendarData.familyGroupsWithMembers.map((family) => (
                      <View key={family.familyGroupId} style={styles.legendFamily}>
                        <Text style={styles.legendFamilyName}>{family.familyGroupName}</Text>
                        {family.members.map((member) => (
                          <View key={member.userId} style={styles.legendMember}>
                            <View style={[styles.legendColorDot, { backgroundColor: member.color }]} />
                            <Text style={styles.legendMemberName}>{member.displayName}</Text>
                            <Text style={styles.legendMemberRole}>({member.relationshipType})</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {familyGroups.map(family => (
              <TouchableOpacity
                key={family.familyGroupId}
                style={[
                  styles.familyChip,
                  selectedFamilyIds.includes(family.familyGroupId) && styles.familyChipSelected,
                  { borderColor: family.groupColor || Colors.primary.coral },
                ]}
                onPress={() => toggleFamilySelection(family.familyGroupId)}
              >
                <View style={[
                  styles.familyColorDot, 
                  { backgroundColor: family.groupColor || Colors.primary.coral }
                ]} />
                <Text
                  style={[
                    styles.familyChipText,
                    selectedFamilyIds.includes(family.familyGroupId) && styles.familyChipTextSelected,
                  ]}
                >
                  {family.groupName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* VIEW TOGGLE */}
        <View style={styles.viewToggle}>
          {(['day', 'week', 'month'] as const).map(view => (
            <TouchableOpacity
              key={view}
              style={[styles.viewButton, viewType === view && styles.viewButtonActive]}
              onPress={() => changeViewType(view)}
            >
              <Text style={[
                styles.viewButtonText, 
                viewType === view && styles.viewButtonTextActive
              ]}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scrollable Calendar Views Section - Week/Day need flex, Month doesn't */}
      <View style={[styles.calendarContainer, (viewType === 'week' || viewType === 'day') && styles.calendarContainerScrollable]}>
        {viewType === 'month' && (
          <MonthView
            selectedDate={selectedDate}
            events={calendarData?.events || []}
            familyMembers={allFamilyMembers}
            onDateSelect={handleDateSelect}
            onEventTap={handleEventTap}
          />
        )}

        {viewType === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            events={calendarData?.events || []}
            familyMembers={allFamilyMembers}
            onDateSelect={handleDateSelect}
            onEventTap={handleEventTap}
          />
        )}

        {viewType === 'day' && (
          <DayView
            selectedDate={selectedDate}
            events={calendarData?.events || []}
            familyMembers={allFamilyMembers}
            onDateSelect={handleDateSelect}
            onEventTap={handleEventTap}
          />
        )}
      </View>

      {/* LEGEND - Collapsible for month view only - Positioned after calendar */}
      {viewType === 'month' && (
        <View style={styles.legendSection}>
          <TouchableOpacity 
            style={styles.legendButton}
            onPress={() => setLegendExpanded(!legendExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.legendButtonText}>Legend</Text>
            <Ionicons 
              name={legendExpanded ? "chevron-up" : "chevron-down"} 
              size={18} 
              color={Colors.text.inverse} 
            />
          </TouchableOpacity>
          
          {legendExpanded && (
            <View style={styles.legendContent}>
              <View style={styles.legendBlock}>
                <View style={[styles.legendColorBar, { backgroundColor: Colors.calendar.freeDay }]} />
                <Text style={styles.legendBlockText}>Free day (no events)</Text>
              </View>
              <View style={styles.legendBlock}>
                <View style={[styles.legendColorBar, { backgroundColor: Colors.primary.coral }]} />
                <Text style={styles.legendBlockText}>Someone has events (see color below)</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* FLOATING ACTION BUTTON */}
      <FloatingActionButton onPress={() => setEventCreationModalVisible(true)} />

      {/* EVENT CREATION MODAL */}
      <EventCreationModal
        visible={eventCreationModalVisible}
        onClose={() => setEventCreationModalVisible(false)}
        onChatCreate={handleChatCreate}
        onPhotoCreate={handlePhotoCreate}
        onVoiceCreate={handleVoiceCreate}
      />

      {/* CHAT INTERFACE */}
      <ChatInterface
        visible={chatInterfaceVisible}
        onClose={() => setChatInterfaceVisible(false)}
        onEventCreated={(eventData) => {
          console.log('Event created:', eventData);
          setChatInterfaceVisible(false);
          // TODO: Refresh calendar events
        }}
        userId={userId}
        userTimezone={userPreferences?.homeTimezone || 'UTC'}
      />

      {/* MENU MODAL */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSignOut={onSignOut}
        onCreateNewCalendar={handleCreateNewCalendar}
        onCalendarChanged={handleCalendarChanged}
        userInfo={userInfo}
      />

      {/* FAMILY GROUP SETUP MODAL */}
      {familyGroupSetupVisible && (
        <Modal
          visible={familyGroupSetupVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setFamilyGroupSetupVisible(false)}
        >
          <FamilyGroupSetupScreen
            isAddingCalendar={true}
            onGroupCreated={handleGroupCreatedFromModal}
            onCancel={() => setFamilyGroupSetupVisible(false)}
            onSignOut={onSignOut}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  fixedHeaderSection: {
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: Colors.background.primary,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  headerIcon: {
    marginRight: Layout.spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  todayButton: {
    backgroundColor: Colors.primary.coral,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.md,
  },
  todayButtonText: {
    color: Colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  menuButton: {
    padding: Layout.spacing.xs,
  },
  familySelector: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  familySelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  inlinePillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.round,
    borderWidth: 1,
    borderColor: Colors.primary.coral,
  },
  inlinePillButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary.coral,
    marginRight: Layout.spacing.xs,
  },
  absoluteExpandedContent: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: Colors.background.primary,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    minWidth: 200,
  },
  familyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    marginRight: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.round,
    borderWidth: 2,
    backgroundColor: Colors.background.secondary,
  },
  familyChipSelected: {
    backgroundColor: Colors.primary.mint,
  },
  familyColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Layout.spacing.xs,
  },
  familyChipText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  familyChipTextSelected: {
    color: Colors.primary.coral,
    fontWeight: '700',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  viewButton: {
    flex: 1,
    paddingVertical: Layout.spacing.xs,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Layout.spacing.xs / 2,
    backgroundColor: Colors.background.primary,
  },
  viewButtonActive: {
    backgroundColor: Colors.primary.coral,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  viewButtonTextActive: {
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  calendarContainer: {
    // Base style for all views
  },
  calendarContainerScrollable: {
    // Add flex: 1 for Week and Day views that need scrolling
    flex: 1,
  },
  collapsibleSection: {
    marginTop: Layout.spacing.xs,
    marginHorizontal: Layout.spacing.md,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.round,
    borderWidth: 1,
    borderColor: Colors.primary.lavender,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary.lavender,
  },
  expandedContent: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  legendFamily: {
    marginBottom: Layout.spacing.sm,
  },
  legendFamilyName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  legendMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs / 2,
    marginLeft: Layout.spacing.xs,
  },
  legendColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Layout.spacing.xs,
  },
  legendMemberName: {
    fontSize: 14,
    color: Colors.text.primary,
    marginRight: Layout.spacing.xs / 2,
  },
  legendMemberRole: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  dotLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Layout.spacing.sm,
  },
  dotLegendText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  legendSection: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
  },
  legendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary.coral,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  legendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  legendContent: {
    marginTop: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  legendBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary.coral,
  },
  legendColorBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: Layout.spacing.sm,
  },
  legendBlockText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
});
