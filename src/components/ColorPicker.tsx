/**
 * ColorPicker Component
 * 
 * Purpose: Allow users to select a color from a predefined palette
 * Used in: Family Group creation form
 * 
 * Features:
 * - Predefined color palette
 * - Visual selection feedback
 * - Returns hex color value
 * - Optional label
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ColorPickerProps {
  label?: string;
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  colors?: string[];
  showLabel?: boolean;
}

// Beautiful color palette matching the screenshot
const DEFAULT_COLORS = [
  '#FF5722', // Red-Orange
  '#FF9800', // Orange  
  '#FFEB3B', // Yellow
  '#8BC34A', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  selectedColor,
  onColorSelect,
  colors = DEFAULT_COLORS,
  showLabel = true,
}) => {
  return (
    <View style={styles.container}>
      {showLabel && label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={styles.colorGrid}>
        {colors.map((color) => {
          const isSelected = selectedColor === color;
          
          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSquare,
                { backgroundColor: color },
                isSelected && styles.selectedColorSquare,
              ]}
              onPress={() => onColorSelect(color)}
              activeOpacity={0.8}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {selectedColor && (
        <View style={styles.selectedColorInfo}>
          <View
            style={[
              styles.selectedColorPreview,
              { backgroundColor: selectedColor },
            ]}
          />
          <Text style={styles.selectedColorText}>
            Selected color
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  colorSquare: {
    width: 45,
    height: 45,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColorSquare: {
    borderColor: '#333',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  selectedColorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
  },
  selectedColorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  selectedColorText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ColorPicker;
