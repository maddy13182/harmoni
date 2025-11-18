# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-11-18 00:29:00

### Changed
- **🎨 Complete UI/UX Overhaul**: Transformed Create Family Group screen into modern, professional interface
  - **RelationshipPicker Redesign**: Eliminated ugly bordered container, replaced with sleek button-style picker
  - **Enhanced Visual Hierarchy**: Improved typography, spacing, and layout for better user experience
  - **Modern Card Design**: Redesigned option cards with proper shadows, rounded corners, and visual depth
  - **Professional Color Integration**: Full integration with Harmoni design system colors
  - **Improved Accessibility**: Comprehensive accessibility labels and screen reader support

- **Main Screen Improvements**:
  - **Enhanced Header**: Added subtitle "Choose how you'd like to get started" for better guidance
  - **Card Layout Redesign**: 
    - Horizontal layout with icons and content side-by-side
    - Larger, more prominent icons (56x56px containers)
    - Better visual separation between join and create options
    - Subtle colored borders matching each option's theme
  - **Input Enhancements**:
    - Dynamic border colors (changes when filled)
    - Clear button for invite code input
    - Better placeholder text and validation feedback
    - Improved touch targets and interaction states
  - **Modern Divider**: Circular "OR" element with proper visual weight
  - **Help Integration**: Added "What's an invite code?" help text

- **RelationshipPicker Transformation**:
  - **Removed Heavy Border**: Eliminated prominent, ugly rectangular border
  - **Modern Button Design**: Clean, tappable interface with chevron indicator
  - **Platform-Native Selection**: iOS ActionSheet, Android bottom modal
  - **Enhanced Icons**: Meaningful icons for each relationship type
  - **Visual Consistency**: Matches other form elements perfectly
  - **Accessibility**: Full VoiceOver and TalkBack support

- **Form Screen Enhancements**:
  - **Improved Input Styling**: Larger padding, better border radius, consistent colors
  - **Enhanced Button Design**: More prominent create button with proper spacing
  - **Better Error States**: Improved error messaging and visual feedback
  - **Refined Typography**: Better font weights and hierarchy throughout

- **Technical Improvements**:
  - **Design System Integration**: Full use of Colors constants for consistency
  - **Platform-Specific Styling**: iOS shadows vs Android elevation
  - **Responsive Design**: Proper touch targets (44pt minimum)
  - **Performance**: Optimized re-renders and state management
  - **Cross-Platform**: Consistent experience across iOS and Android

### Visual Design Enhancements
- **Typography**: Upgraded to modern font weights (700 for titles, 600 for labels)
- **Spacing**: Improved margins and padding for better visual breathing room
- **Colors**: Semantic color usage (primary for join, success for create)
- **Shadows**: Subtle depth with platform-appropriate shadow/elevation
- **Border Radius**: Consistent 12-16px radius for modern appearance
- **Interactive States**: Proper hover, pressed, and disabled states

### Accessibility Improvements
- **Screen Reader Support**: Comprehensive accessibility labels and hints
- **Touch Targets**: All interactive elements meet 44pt minimum requirement
- **Color Contrast**: Proper contrast ratios for text and backgrounds
- **Dynamic Text**: Support for system font size preferences
- **Keyboard Navigation**: Proper tab order and focus management

**Before**: Basic, inconsistent interface with ugly bordered elements
**After**: Professional, modern mobile app interface following design best practices

**Commit Hash:** `TBD`
**Files Modified:** 
- `src/screens/FamilyGroupSetupScreen.tsx` (complete redesign)
- `src/components/RelationshipPicker.tsx` (modern button-style picker)

**Development Status:** ✅ Professional-grade UI achieved, ready for production

## [0.2.0] - 2025-11-17 23:06:00

### Added
- **Family Group Management System**: Complete family group setup and management
  - `FamilyGroupCheckScreen.tsx`: Loading screen that checks user's family group memberships
  - `FamilyGroupSetupScreen.tsx`: Comprehensive setup screen with two options:
    - Join existing group with invite code (placeholder for future implementation)
    - Create new family group with detailed form
  - `ColorPicker.tsx`: Reusable color picker component with predefined palette
  - `RelationshipPicker.tsx`: Platform-appropriate picker for relationship selection
  - Form validation for group name (required, max 100 characters) and relationship type
  - Optional fields: group description, group color, member display color

- **Family Group Backend Integration**: Foundry OSDK integration for family groups
  - `familyGroupCache.ts`: In-memory caching system for family groups (30-minute expiry)
  - `getFamilyGroupsForUser()`: Query family groups using link traversal (User → FamilyMembership → FamilyGroup)
  - `createFamilyGroupWithMembership()`: Create new family group with user as first member
  - `checkUserFamilyGroups()`: Check if user has any family groups
  - Cache management functions: `storeFamilyGroups()`, `getSelectedGroup()`, `addFamilyGroup()`

- **Enhanced Navigation Flow**: Extended app state management for family groups
  - Added `'checking-family-groups'` and `'family-group-setup'` states to App.tsx
  - Automatic family group checking after preferences setup
  - Seamless transition: Preferences → Family Group Check → Setup/Calendar
  - Error handling with retry options for family group operations

- **TypeScript Type Definitions**: Comprehensive types for family group system
  - `FamilyGroup`: Interface for family group objects
  - `FamilyMembership`: Interface for membership relationships
  - `CreateFamilyGroupParams`: Parameters for group creation
  - `RelationshipType`: Union type for relationship options (dad, mom, son, daughter, grandparent, relative, friend, other)

- **Calendar Screen Enhancement**: Dynamic header with family group name
  - Displays "{GroupName} Calendar" when family group is selected
  - Falls back to "Family Calendar" when no group is selected
  - Accepts optional `familyGroupName` prop from App.tsx

### Changed
- **App.tsx**: Extended state management for family group flow
  - Added handlers: `handleNoFamilyGroups()`, `handleHasFamilyGroups()`, `handleFamilyGroupError()`, `handleGroupCreated()`
  - Modified `handlePreferencesCreated()` to transition to family group checking
  - Updated `renderScreen()` to include new family group screens
  - Integrated `getSelectedGroup()` to pass family group name to CalendarScreen

- **CalendarScreen.tsx**: Updated to display family group name
  - Added `familyGroupName` optional prop to `CalendarScreenProps`
  - Dynamic header title based on selected family group
  - Maintains backward compatibility with undefined family group name

- **foundryClient.ts**: Extended with family group operations
  - Added family group query and creation functions
  - Integrated family group cache management
  - Added `clearAllCaches()` function to clear both user and family group caches
  - Imported `createFamilyGroupWithMembership` action from Foundry SDK

### Technical Details
- **Link Traversal Pattern**: User → FamilyMembership → FamilyGroup
- **Caching Strategy**: 30-minute in-memory cache for family groups (consistent with user cache)
- **Form Validation**: Client-side validation for required fields and character limits
- **Color Palette**: 12 predefined family-friendly colors for group and member customization
- **Platform Support**: iOS wheel picker and Android dropdown for relationship selection
- **Error Handling**: Comprehensive error handling with user-friendly messages and retry options

**Commit Hash:** `e358b48`
**Files Modified:**
- Core: `App.tsx` (added family group states and handlers)
- Services: `src/services/foundryClient.ts` (added family group functions), `src/services/familyGroupCache.ts` (new)
- Screens: `src/screens/FamilyGroupCheckScreen.tsx` (new), `src/screens/FamilyGroupSetupScreen.tsx` (new), `src/screens/CalendarScreen.tsx` (updated header)
- Components: `src/components/ColorPicker.tsx` (new), `src/components/RelationshipPicker.tsx` (new)
- Types: `src/types/index.ts` (added family group types)

**Development Status:** ✅ Family group system fully implemented, ready for testing with Foundry backend

## [0.1.0] - 2025-11-17 13:40:00

### Added
- **User Preferences System**: Complete user preferences management with Foundry integration
  - `PreferencesSetupScreen.tsx`: Beautiful form with rolodex-style timezone picker
  - `SettingsScreen.tsx`: Settings navigation with user preferences access
  - `UserPreferencesViewScreen.tsx`: Display current user preferences
  - Added timezone auto-detection and comprehensive preference options
  - Integrated preferences checking and creation using Foundry SDK link traversal

- **User Caching System**: Performance optimization with in-memory caching
  - `userCache.ts`: 30-minute cache system for user data
  - Reduces Foundry API calls and improves app performance
  - Cache invalidation on sign out and automatic expiry

- **Enhanced Navigation**: Complete settings and preferences navigation flow
  - Settings accessible via side menu
  - User preferences viewing and editing capabilities
  - Proper back navigation between screens

- **Documentation**: Comprehensive user experience documentation
  - `USER_EXPERIENCE_FLOW.md`: Complete user journey documentation
  - `LOADING_SCREEN_EXPLANATION.md`: Technical explanation of loading screens
  - `USER_CACHING_GUIDE.md`: Caching system documentation

### Changed
- **🎉 PURPLE SCREENS ELIMINATED**: Major UX improvement removing all purple loading screens
  - Removed ugly `'checking'` state purple loading screen
  - Removed `'checking-preferences'` state purple loading screen  
  - Skipped purple gradient `WelcomeScreen` for direct login → gear loading transition
  - Moved authentication and preferences checking to background operations
  - Streamlined user flow: Login → Beautiful Gear Loading → Welcome Back → Calendar

- **App.tsx**: Complete state management overhaul for improved UX
  - Eliminated multiple purple loading states
  - Added comprehensive logging for debugging screen transitions
  - Background processing for authentication and preferences checking
  - Optimized state transitions for seamless user experience

- **Enhanced Foundry Integration**: Extended backend operations
  - Added `getUserPreferences()` and `createUserPreferences()` functions
  - Implemented link traversal: `user.pivotTo("userPreference")`
  - Added `checkUserPreferences()` for preference existence checking
  - Integrated user preferences into main app flow

### Fixed
- **Loading Screen UX**: Eliminated all purple/ugly loading screens
  - No more jarring purple gradient backgrounds
  - Smooth transitions between screens
  - Professional, branded loading experience only
  - Background operations prevent UI interruptions

### Technical Details
- **User Preferences**: `UserPreference` object type with comprehensive settings
- **Caching Strategy**: 30-minute in-memory cache with automatic expiry
- **State Management**: Reduced from 9 to 6 app states for cleaner flow
- **Background Processing**: Authentication and preferences checking without UI blocking
- **Link Traversal**: Efficient Foundry queries using object relationships

**Commit Hash:** `a529693`
**Files Modified:**
- Core: `App.tsx` (major state management refactor)
- Services: `src/services/foundryClient.ts`, `src/services/userCache.ts`
- Screens: `src/screens/PreferencesSetupScreen.tsx`, `src/screens/SettingsScreen.tsx`, `src/screens/UserPreferencesViewScreen.tsx`
- Components: `src/components/MenuModal.tsx`
- Documentation: `USER_EXPERIENCE_FLOW.md`, `LOADING_SCREEN_EXPLANATION.md`, `USER_CACHING_GUIDE.md`

**Development Status:** ✅ Purple screens eliminated, seamless UX achieved, preferences system fully operational

## [0.0.1] - 2025-11-17 10:20:00

### Added
- **Foundry Integration**: Complete Palantir Foundry OSDK integration for backend data operations
  - Added `@familycalnderapp/sdk` and `@osdk/client` dependencies
  - Implemented user auto-provisioning system with Google OAuth integration
  - Added `foundryClient.ts` service with user verification and creation functions
  - Added `foundryDebug.ts` utility for SDK debugging and inspection

- **New User Flow Screens**: Enhanced authentication and onboarding experience
  - `SettingUpScreen.tsx`: Loading screen during user provisioning
  - `UserReadyScreen.tsx`: Success confirmation screen
  - `SetupFailedScreen.tsx`: Error handling screen with retry functionality
  - `AccountNotFoundScreen.tsx`: Fallback screen for authentication issues

- **Enhanced UI Components**: 
  - `MenuModal.tsx`: Slide-out navigation menu with sign-out functionality
  - Updated `CalendarScreen.tsx` with improved styling using design system constants

- **Configuration Management**:
  - `.npmrc`: Foundry registry configuration for SDK packages
  - Updated `.env.example` with comprehensive Foundry configuration template
  - Added `.env` to `.gitignore` for security (prevents token exposure)

- **Documentation**: 
  - `CACHE_CLEARING_GUIDE.md`: Comprehensive guide for development troubleshooting
  - `.clinerules/`: Project-specific development rules and best practices

### Changed
- **App.tsx**: Complete refactor of application state management
  - Added auto-provisioning workflow states: 'setting-up', 'user-ready', 'setup-failed'
  - Integrated Foundry user verification on authentication
  - Enhanced error handling and user feedback

- **Authentication Service**: Extended `authService.ts` with user info retrieval
  - Added `getUserInfo()` function for profile data access

- **Design System Integration**: Updated CalendarScreen styling
  - Migrated from hardcoded styles to `Colors` and `Layout` constants
  - Improved visual consistency and maintainability

- **Platform Configuration**:
  - Updated iOS project configuration (`project.pbxproj`)
  - Cleaned up Android manifest OAuth redirect configurations
  - Updated package dependencies for Foundry SDK support

### Security
- **Environment Variable Protection**: Added `.env` to `.gitignore`
  - Prevents accidental commit of sensitive Foundry tokens and API keys
  - Updated `.env.example` with secure configuration template

### Technical Details
- **Foundry SDK Version**: `@familycalnderapp/sdk@^0.2.0`
- **OSDK Client Version**: `@osdk/client@^0.2.0`
- **Ontology RID**: `ri.ontology.main.ontology.999b797d-0f22-4d1a-9127-a804ab27568a`
- **Auto-provisioning**: Users are automatically created in Foundry if not found
- **Property-based filtering**: Uses `googleUserId` field for user lookup

**Commit Hash:** `25d8297`
**Files Modified:** 
- Core: `App.tsx`, `package.json`, `package-lock.json`
- Services: `src/services/foundryClient.ts`, `src/services/authService.ts`
- Screens: `src/screens/CalendarScreen.tsx` + 4 new screen files
- Config: `.env.example`, `.gitignore`, `.npmrc`
- Platform: `android/app/src/main/AndroidManifest.xml`, `ios/Harmoni.xcodeproj/project.pbxproj`
- Documentation: `CACHE_CLEARING_GUIDE.md`
- Utils: `src/utils/foundryDebug.ts`
- Components: `src/components/MenuModal.tsx`

**Development Status:** ✅ Foundry integration fully operational, auto-provisioning working end-to-end
