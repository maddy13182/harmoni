import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingActionButtonProps {
  onPress: () => void;
}

/**
 * FloatingActionButton - Silver + icon at bottom-right
 * 
 * Purpose: Trigger for event creation modal
 * 
 * @param {FloatingActionButtonProps} props - Component properties
 * @returns {JSX.Element} Rendered FAB
 * 
 * Features:
 * - Silver + icon
 * - Translucent blur background
 * - Positioned at bottom-right
 * - 60x60 point size
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel="Create new event"
      accessibilityHint="Opens event creation options"
      accessibilityRole="button"
    >
      <View style={styles.bubble}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ADD8E6', // Light blue
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingActionButton;
