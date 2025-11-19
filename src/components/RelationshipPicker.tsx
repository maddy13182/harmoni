/**
 * RelationshipPicker Component
 * 
 * Purpose: Allow users to select their relationship type in a family group
 * Used in: Family Group creation form
 * 
 * Features:
 * - Modern button-style interface (no ugly borders!)
 * - Platform-appropriate selection (iOS ActionSheet, Android Modal)
 * - Clean, consistent styling with other form elements
 * - Clear visual feedback and accessibility
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RelationshipType } from '../types';
import { Colors } from '../constants/Colors';

interface RelationshipPickerProps {
  label: string;
  selectedRelationship?: RelationshipType;
  onRelationshipSelect: (relationship: RelationshipType) => void;
  error?: string;
}

// Relationship options with display labels and icons
const RELATIONSHIP_OPTIONS: { 
  value: RelationshipType; 
  label: string; 
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'dad', label: 'Dad', icon: 'man' },
  { value: 'mom', label: 'Mom', icon: 'woman' },
  { value: 'son', label: 'Son', icon: 'male' },
  { value: 'daughter', label: 'Daughter', icon: 'female' },
  { value: 'grandparent', label: 'Grandparent', icon: 'people-circle' },
  { value: 'relative', label: 'Relative', icon: 'people' },
  { value: 'friend', label: 'Friend', icon: 'heart' },
  { value: 'other', label: 'Other', icon: 'person' },
];

export const RelationshipPicker: React.FC<RelationshipPickerProps> = ({
  label,
  selectedRelationship,
  onRelationshipSelect,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = RELATIONSHIP_OPTIONS.find(
    option => option.value === selectedRelationship
  );

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      // Use iOS ActionSheet for native feel
      const options = ['Cancel', ...RELATIONSHIP_OPTIONS.map(option => option.label)];
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          title: 'Select your relationship',
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            const selectedOption = RELATIONSHIP_OPTIONS[buttonIndex - 1];
            onRelationshipSelect(selectedOption.value);
          }
        }
      );
    } else {
      // Use Modal for Android
      setModalVisible(true);
    }
  };

  const handleOptionSelect = (relationship: RelationshipType) => {
    onRelationshipSelect(relationship);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      
      <TouchableOpacity
        style={[
          styles.button,
          error && styles.buttonError,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={selectedOption ? `Selected relationship: ${selectedOption.label}` : 'Select your relationship'}
        accessibilityHint="Tap to choose your relationship in the family group"
      >
        <View style={styles.buttonContent}>
          {selectedOption ? (
            <>
              <Ionicons 
                name={selectedOption.icon} 
                size={20} 
                color={Colors.text.primary} 
                style={styles.icon}
              />
              <Text style={styles.selectedText}>{selectedOption.label}</Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>Select your relationship</Text>
          )}
        </View>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={Colors.text.tertiary} 
        />
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {selectedRelationship && !error && (
        <Text style={styles.helperText}>
          You'll be listed as "{selectedOption?.label}" in this family group
        </Text>
      )}

      {/* Android Modal */}
      {Platform.OS === 'android' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select your relationship</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close relationship selection"
                >
                  <Ionicons name="close" size={24} color={Colors.text.secondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.optionsList}>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && styles.optionPressed,
                      selectedRelationship === option.value && styles.optionSelected,
                    ]}
                    onPress={() => handleOptionSelect(option.value)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${option.label} as your relationship`}
                    accessibilityState={{ selected: selectedRelationship === option.value }}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={selectedRelationship === option.value ? Colors.primary.cyan : Colors.text.primary}
                      style={styles.optionIcon}
                    />
                    <Text style={[
                      styles.optionText,
                      selectedRelationship === option.value && styles.optionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {selectedRelationship === option.value && (
                      <Ionicons 
                        name="checkmark" 
                        size={20} 
                        color={Colors.primary.cyan} 
                      />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: Colors.semantic.error,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  buttonError: {
    borderColor: Colors.semantic.error,
    borderWidth: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  selectedText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.text.tertiary,
  },
  errorText: {
    color: Colors.semantic.error,
    fontSize: 14,
    marginTop: 8,
  },
  helperText: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  // Android Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  optionPressed: {
    backgroundColor: Colors.background.secondary,
  },
  optionSelected: {
    backgroundColor: Colors.primary.cyan + '10', // 10% opacity
  },
  optionIcon: {
    marginRight: 16,
    width: 24,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary.cyan,
    fontWeight: '600',
  },
});

export default RelationshipPicker;
