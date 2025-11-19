// Harmoni Design System - Layout & Spacing

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  // Screen Dimensions
  window: {
    width,
    height,
  },
  
  // Spacing Scale (8pt grid system)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  
  // Typography Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  
  // Font Families (Alliance No 2)
  fontFamily: {
    light: 'AllianceNo2-Light',      // For footers, notes, secondary text
    regular: 'AllianceNo2-Regular',  // Fallback/default
    medium: 'AllianceNo2-Medium',    // For body text, labels, most UI text
    bold: 'AllianceNo2-Bold',        // For headings, titles, attention-grabbing text
  },
  
  // Font Weights (kept for compatibility, but use fontFamily instead)
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Icon Sizes
  iconSize: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  
  // Touch Target Sizes (minimum 44x44 for accessibility)
  touchTarget: {
    min: 44,
    comfortable: 56,
  },
  
  // Container Widths
  container: {
    sm: 320,
    md: 768,
    lg: 1024,
  },
  
  // Shadow Presets
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Animation Durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

export default Layout;
