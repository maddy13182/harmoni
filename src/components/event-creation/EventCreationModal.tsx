import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EventCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onChatCreate: () => void;
  onPhotoCreate: () => void;
  onVoiceCreate: () => void;
}

/**
 * EventCreationModal - Animated modal with event creation options
 * 
 * Purpose: Provides three methods to create calendar events
 * 
 * @param {EventCreationModalProps} props - Component properties
 * @returns {JSX.Element} Rendered modal
 * 
 * Features:
 * - Smooth 300ms animation from FAB to modal
 * - Blur background overlay
 * - Three creation options (chat, photo, voice)
 * - Close on outside tap
 */
export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  visible,
  onClose,
  onChatCreate,
  onPhotoCreate,
  onVoiceCreate,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Animate in
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // Animate out
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
          <Animated.View style={[styles.overlayBackground, animatedOverlayStyle]} />

          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
              <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>Create New Event</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    accessibilityLabel="Close"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Options */}
                <View style={styles.optionsContainer}>
                  {/* Chat Option */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={onChatCreate}
                    activeOpacity={0.7}
                    accessibilityLabel="Chat to create event"
                    accessibilityRole="button"
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons name="chatbubble-outline" size={32} color="#007AFF" />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Chat to Create</Text>
                      <Text style={styles.optionDescription}>
                        Type naturally to create an event
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>

                  {/* Photo Option */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={onPhotoCreate}
                    activeOpacity={0.7}
                    accessibilityLabel="Snap or upload photo"
                    accessibilityRole="button"
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons name="camera-outline" size={32} color="#34C759" />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Snap or Upload Photo</Text>
                      <Text style={styles.optionDescription}>
                        Extract event from image
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>

                  {/* Voice Option */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={onVoiceCreate}
                    activeOpacity={0.7}
                    accessibilityLabel="Record voice note"
                    accessibilityRole="button"
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons name="mic-outline" size={32} color="#FF3B30" />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Record Voice Note</Text>
                      <Text style={styles.optionDescription}>
                        Speak your event details
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(200, 200, 200, 0.5)', // Light grey semi-transparent
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white to show calendar
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'AllianceNo2-Bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 25,
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'AllianceNo2-Bold',
    color: '#000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'AllianceNo2-Regular',
    color: '#666',
  },
});

export default EventCreationModal;
