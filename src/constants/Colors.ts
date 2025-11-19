// Harmoni Design System - Colors
// Modern, colorful, gradient-based brand identity

export const Colors = {
  // Primary Brand Colors - Multicolor Gradient System
  primary: {
    coral: '#EF7674',      // Warm coral salmon - MAIN brand color
    peach: '#FFB088',      // Warm peach orange
    yellow: '#FFD93D',     // Bright sunny yellow
    lime: '#D4E157',       // Fresh lime green
    cyan: '#4DD0E1',       // Cool cyan blue
    mint: '#4ECDC4',       // Fresh mint turquoise
    blue: '#5B9FED',       // Soft sky blue
    lavender: '#9B8FED',   // Gentle lavender
    
    // Gradient arrays for backgrounds
    sunrise: ['#FF6B9D', '#FFB088', '#FFD93D'],        // Coral → Peach → Yellow
    ocean: ['#4DD0E1', '#4ECDC4', '#5B9FED'],          // Cyan → Mint → Blue
    rainbow: ['#FF6B9D', '#FFD93D', '#4DD0E1', '#4ECDC4'], // Full spectrum
    sunset: ['#FFB088', '#FF6B9D', '#9B8FED'],         // Warm to cool
  },
  
  // Feature-Specific Colors (colorful approach)
  features: {
    voice: '#FF6B9D',      // Coral for voice commands
    chat: '#4DD0E1',       // Cyan for AI chat
    email: '#FFB088',      // Peach for email
    calendar: '#4ECDC4',   // Mint for calendar
    family: '#FFD93D',     // Yellow for family
    events: '#9B8FED',     // Lavender for events
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    offWhite: '#F8F9FA',
    lightGray: '#E9ECEF',
    gray: '#ADB5BD',
    darkGray: '#495057',
    charcoal: '#2D3436',
    black: '#1A1A1A',
  },
  
  // Semantic Colors
  semantic: {
    success: '#4ECDC4',    // Mint green
    warning: '#FFD93D',    // Bright yellow
    error: '#FF6B9D',      // Coral pink
    info: '#4DD0E1',       // Cyan blue
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#E9ECEF',
    gradient: ['#FAFAFA', '#FFFFFF', '#F8F9FA'], // Subtle gradient
  },
  
  // Text Colors
  text: {
    primary: '#2D3436',
    secondary: '#495057',
    tertiary: '#ADB5BD',
    inverse: '#FFFFFF',
  },
  
  // Calendar Specific
  calendar: {
    today: '#4DD0E1',      // Cyan
    selected: '#4ECDC4',   // Mint
    event: '#FF6B9D',      // Coral
    weekend: '#FFD93D',    // Yellow
    freeDay: '#D4AF37',    // Matte gold for free days
    freeDayLight: '#FFF9E6', // Light gold background
    busyBadge: '#EF7674',  // Badge for multiple busy members
  },
  
  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
};

export default Colors;
