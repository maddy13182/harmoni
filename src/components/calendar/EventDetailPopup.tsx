/**
 * EventDetailPopup Component
 * 
 * Apple-style translucent popup showing full event details
 * Appears on double-tap of calendar events
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import type { CalendarEvent } from '../../types';
import { formatTime } from '../../utils/calendarHelpers';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EventDetailPopupProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EventDetailPopup({
  visible,
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailPopupProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Fade + scale in (Apple-style)
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // Fade + scale out
      scale.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!event) return null;

  const isBusy = event.visibilityLevel === 'busy_only';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Blurred background */}
          <Animated.View style={[styles.blurOverlay, animatedOverlayStyle]}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>

          <TouchableWithoutFeedback>
            <Animated.View style={[styles.popupContainer, animatedModalStyle]}>
              {/* Translucent grey background */}
              <View style={styles.popupContent}>
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Event Title with Recurring Icon */}
                  <View style={styles.titleContainer}>
                    {event.isRecurring && (
                      <Ionicons
                        name="repeat"
                        size={20}
                        color="#000"
                        style={styles.recurringIcon}
                      />
                    )}
                    <Text style={styles.eventTitle}>{event.title}</Text>
                  </View>

                  {/* Time Details */}
                  <View style={styles.timeSection}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Start:</Text>
                      <Text style={styles.timeValue}>
                        {event.isAllDay ? 'All Day' : formatTime(event.startsAtUtc)}
                      </Text>
                    </View>
                    {!event.isAllDay && (
                      <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>End:</Text>
                        <Text style={styles.timeValue}>
                          {formatTime(event.endsAtUtc)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Location (if not busy) */}
                  {!isBusy && event.location && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Location:</Text>
                      <Text style={styles.sectionValue}>{event.location}</Text>
                    </View>
                  )}

                  {/* Description (if not busy) */}
                  {!isBusy && event.description && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Description:</Text>
                      <Text style={styles.sectionValue}>{event.description}</Text>
                    </View>
                  )}

                  {/* Attendees */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Attendees:</Text>
                    {event.attendees.map((attendee, index) => (
                      <View
                        key={`${event.eventId}-${attendee.userId}-${index}`}
                        style={styles.attendeeRow}
                      >
                        <View
                          style={[
                            styles.attendeeDot,
                            { backgroundColor: attendee.color },
                          ]}
                        />
                        <Text style={styles.attendeeName}>
                          {attendee.displayName}
                        </Text>
                        <Text style={styles.attendeeRole}>
                          ({attendee.relationshipType})
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Badge */}
                  <View style={styles.calendarBadge}>
                    <Text style={styles.calendarBadgeText}>
                      {event.primaryFamilyGroupName}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.pillButton}
                      onPress={onEdit}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil" size={16} color="#000" />
                      <Text style={styles.pillButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.pillButton, styles.deleteButton]}
                      onPress={onDelete}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash" size={16} color="#FF3B30" />
                      <Text style={[styles.pillButtonText, styles.deleteButtonText]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  popupContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  popupContent: {
    backgroundColor: 'rgba(200, 200, 200, 0.85)', // Translucent grey
    borderRadius: 20,
    padding: Layout.spacing.lg,
  },
  scrollView: {
    maxHeight: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  recurringIcon: {
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 22,
    fontFamily: 'AllianceNo2-Bold',
    color: '#000',
    flex: 1,
  },
  timeSection: {
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  timeLabel: {
    fontSize: 16,
    fontFamily: 'AllianceNo2-Medium',
    color: '#000',
    width: 60,
  },
  timeValue: {
    fontSize: 16,
    fontFamily: 'AllianceNo2-Regular',
    color: '#000',
    flex: 1,
  },
  section: {
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'AllianceNo2-Medium',
    color: '#000',
    marginBottom: Layout.spacing.xs,
  },
  sectionValue: {
    fontSize: 15,
    fontFamily: 'AllianceNo2-Regular',
    color: '#000',
    lineHeight: 22,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  attendeeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Layout.spacing.sm,
  },
  attendeeName: {
    fontSize: 15,
    fontFamily: 'AllianceNo2-Medium',
    color: '#000',
    flex: 1,
  },
  attendeeRole: {
    fontSize: 13,
    fontFamily: 'AllianceNo2-Regular',
    color: '#000',
    opacity: 0.7,
  },
  calendarBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
  },
  calendarBadgeText: {
    fontSize: 13,
    fontFamily: 'AllianceNo2-Medium',
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  pillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.round,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  pillButtonText: {
    fontSize: 15,
    fontFamily: 'AllianceNo2-Medium',
    color: '#000',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});
