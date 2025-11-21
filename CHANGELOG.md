# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2025-11-21 14:18:00

### Added
- **Persistent User Cache with Validation**: Revolutionary caching system that eliminates user disruption
  - `persistentUserCache.ts`: SecureStore-based persistent cache with validation logic
    - `cacheFoundryUser()`: Store user data persistently with Google ID as key
    - `getCachedFoundryUser()`: Retrieve cached user data (survives app restarts)
    - `validateCachedUser()`: Compare cached vs Foundry data to detect changes
    - `updateCachedUserFromFoundry()`: Sync non-critical field changes
    - `clearFoundryUserCache()`: Clear cache on logout or invalidation
  - **Validation System**: Smart comparison of cached vs Foundry data
    - Critical fields (userId, googleUserId, $primaryKey): Changes require re-login
    - Non-critical fields (email, displayName, accountStatus): Auto-update cache
    - Security-first approach: Force re-authentication if IDs change
  - **Cache Key Strategy**: Uses Google ID consistently for all operations
    - Key format: `harmoni_foundry_user_google_{googleId}`
    - Available at login time (before Foundry query)
    - Eliminates cache key mismatch issues

### Changed
- **userService.ts**: Enhanced with validation flow on app restart
  - Added `skipValidation` parameter to `verifyOrCreateUser()`
  - **App Restart Flow**: 
    1. Check persistent cache (SecureStore)
    2. If found, validate against Foundry
    3. If validation passes: Update cache if needed, continue
    4. If validation fails (IDs changed): Clear cache, force re-login
    5. If not cached: Query Foundry (lookup or create)
  - **First Login Flow**: Skip validation, use cached data directly
  - Imported validation functions: `validateCachedUser`, `updateCachedUserFromFoundry`, `clearFoundryUserCache`

- **userCache.ts**: Removed 30-minute expiration logic
  - Cache now persists until logout or app restart
  - No mid-session disruptions from cache expiration
  - Simplified `getCachedUser()` without expiration checks
  - Added note: "No expiration - persists until logout/restart"

- **authService.ts**: Enhanced logout to clear persistent cache
  - Gets Google user info before clearing (needed for cache key)
  - Clears persistent Foundry user cache using Google ID
  - Maintains backward compatibility with preferences cache clearing
  - Comprehensive logging for debugging

### Fixed
- **CRITICAL: Cache Key Mismatch**: Fixed "User not found" error on app restart
  - **Root Cause**: Cache stored with Foundry userId, retrieved with Google ID
  - **Solution**: Use Google ID consistently for all cache operations
  - **Impact**: Eliminated repeated "User not found" errors and forced re-logins
  - **Result**: Seamless app restart experience without re-authentication

### Technical Details
- **Two-Layer Caching**:
  - **Persistent Layer (SecureStore)**: Survives app restarts, keyed by Google ID
  - **In-Memory Layer**: Fast access during session, no expiration
- **Validation Logic**:
  - Critical fields: userId, googleUserId, $primaryKey (require re-login if changed)
  - Non-critical fields: email, displayName, accountStatus, $title, timestamps (auto-update)
- **Security Model**:
  - ID changes trigger cache invalidation and force re-login
  - Protects against account takeover or data corruption
  - Privacy-first: Cache cleared on logout
- **Performance**:
  - Zero Foundry queries on app restart (uses cached data)
  - Validation query only on app restart (not on first login)
  - Instant app loading for returning users

**Benefits:**
- ✅ No "User not found" errors on app restart
- ✅ No forced re-logins for returning users
- ✅ Automatic sync of non-critical field changes
- ✅ Security: Force re-login if IDs change
- ✅ Zero mid-session disruptions
- ✅ Instant app loading from cache

**Commit Hash:** `TBD`
**Files Created:**
- `src/services/persistentUserCache.ts` (persistent cache with validation)

**Files Modified:**
- `src/services/foundry/userService.ts` (added validation flow)
- `src/services/userCache.ts` (removed 30-minute expiration)
- `src/services/authService.ts` (clear persistent cache on logout)

**Development Status:** ✅ Persistent cache with validation operational, seamless app restart experience achieved

## [0.7.0] - 2025-11-20 21:50:00

### Added
- **AI-Powered Event Creation**: Integrated Foundry AIP Agent for natural language event creation
  - `aipAgentService.ts`: Complete AIP Agent API integration
    - `createAgentSession()`: Creates new conversation sessions with the agent
    - `streamContinueSession()`: Real-time streaming responses for better UX
    - `blockingContinueSession()`: Alternative blocking API for simpler use cases
    - `getSessionContent()`: Retrieves conversation history
  - `ChatInterface.tsx`: Beautiful chat UI for conversing with AI agent
    - Real-time streaming responses with typing indicators
    - User messages (purple, right-aligned) and AI messages (black, left-aligned)
    - Auto-scrolling message list
    - Session management with automatic initialization
    - Error handling with user-friendly messages
  - **User Context Integration**: Automatically prepends user ID and timezone to every message
    - Agent receives user context without complex parameter structures
    - Format: `[User Context]\nUser ID: {id}\nTimezone: {tz}\n\n[User Message]\n{message}`
    - Simplified approach that's more reliable than API parameters

### Changed
- **CalendarScreen.tsx**: Integrated chat interface with event creation flow
  - Added `ChatInterface` component with user data props
  - Added 300ms delay between modal transitions for smooth UX
  - Loads user preferences on mount to pass timezone to chat
  - `handleChatCreate()` now opens functional AI chat instead of placeholder alert

- **Event Creation Flow**: Enhanced modal transition handling
  - EventCreationModal closes before ChatInterface opens
  - Prevents nested modal layout conflicts
  - Smooth animations between modals

- **ChatInterface UI**: Fixed layout overflow issues
  - Changed to solid white background for better visibility
  - Added `statusBarTranslucent={false}` to prevent status bar overlap
  - Improved header and input container padding
  - Added shadows for visual depth
  - Platform-specific keyboard handling

### Technical Details
- **AIP Agent Configuration**:
  - Agent RID: `ri.aip-agents..agent.4c393e4d-8297-40e1-a861-e2238fdb65c6`
  - API Endpoint: `/api/v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}/streamingContinue?preview=true`
  - Authentication: Bearer token from Foundry config
  - Response Format: Plain text (markdown formatted)

- **Streaming Implementation**:
  - React Native compatible (uses `response.text()` instead of `response.body.getReader()`)
  - Real-time UI updates as response chunks arrive
  - Proper error handling and timeout management
  - Session persistence across multiple messages

- **User Context Approach**:
  - Prepends user ID and timezone to every message
  - Agent can extract context from message text
  - More reliable than complex parameter structures
  - Simpler code and easier to debug

- **UI/UX Improvements**:
  - Modal transition delay prevents layout conflicts
  - Proper SafeAreaView integration
  - Platform-specific keyboard avoidance
  - Smooth animations and transitions

**Benefits:**
- ✅ Natural language event creation with AI
- ✅ Real-time streaming responses
- ✅ User context automatically included
- ✅ Beautiful, professional chat UI
- ✅ Smooth modal transitions
- ✅ No layout overflow issues

**Commit Hash:** `TBD`
**Files Created:**
- `src/services/foundry/aipAgentService.ts` (AIP Agent API integration)
- `src/components/event-creation/ChatInterface.tsx` (chat UI component)

**Files Modified:**
- `src/screens/CalendarScreen.tsx` (integrated chat, added modal transition delay, load user preferences)
- `src/components/event-creation/index.ts` (exported ChatInterface)
- `src/services/foundry/index.ts` (exported AIP Agent functions)

**Development Status:** ✅ AI chat integration complete, event creation via natural language operational

## [0.6.0] - 2025-11-20 02:35:00

### Added
- **Universal MenuModal Template**: Transformed MenuModal into a self-contained, reusable navigation component
  - **Nested View Navigation**: Three-level navigation within modal (Main Menu → Settings → User Preferences)
  - **Settings View**: Complete settings menu with 4 options (User Preferences, Notifications, Privacy, About)
  - **User Preferences View**: Full preferences display with cached data from Foundry
    - Location & Time section (timezone, travel mode, week start, time/date format)
    - Calendar Preferences section (default view, event duration, privacy)
    - Appearance section (theme, locale)
    - Notifications section (email, push notifications)
  - **Self-Contained Logic**: All navigation handled internally within MenuModal
  - **Universal X Button**: Always closes modal and returns to calendar from any view
  - **Back Navigation**: Proper back button navigation between nested views
  - **Automatic Cache Loading**: Preferences loaded from cache when view is accessed

### Changed
- **MenuModal.tsx**: Complete redesign with nested navigation system
  - Removed `onSettings` prop (no longer needed)
  - Added internal state management: `currentView`, `preferences`, `loadingPrefs`
  - Added navigation functions: `navigateToSettings()`, `navigateToUserPreferences()`, `navigateBack()`
  - Added `handleClose()` to reset view state on modal close
  - Integrated `getCurrentUser()` and `getUserPreferences()` for data loading
  - Added `PreferenceItem` component for consistent preference display
  - Added three render functions: `renderMainMenu()`, `renderSettingsView()`, `renderUserPreferencesView()`

- **CalendarScreen.tsx**: Simplified MenuModal integration
  - Removed `onSettings` prop (no longer needed)
  - MenuModal now fully self-contained
  - Cleaner component interface

### Technical Details
- **Navigation Pattern**: Modal-based nested navigation (no app state changes)
- **View States**: 'main' | 'settings' | 'user-preferences'
- **Data Loading**: Preferences loaded on-demand when user navigates to preferences view
- **State Reset**: Modal resets to main view when closed or opened
- **Reusability**: Can be added to any screen with just 3 props: `visible`, `onClose`, `onSignOut`
- **Performance**: Lazy loading of preferences data (only when needed)
- **User Experience**: Smooth transitions, consistent back navigation, always-accessible close button

**Benefits:**
- ✅ Universal template usable across all screens
- ✅ No app state management needed for navigation
- ✅ Self-contained with all logic internal
- ✅ Consistent UX across entire app
- ✅ Easy to extend with new nested views
- ✅ Minimal integration code required

**Commit Hash:** `TBD`
**Files Modified:**
- `src/components/MenuModal.tsx` (complete redesign with nested navigation)
- `src/screens/CalendarScreen.tsx` (removed onSettings prop)

**Development Status:** ✅ Universal MenuModal template complete, ready for use across all screens

## [0.5.0] - 2025-11-18 22:03:00

### Added
- **Event Creation System - UI Foundation**: Multi-modal event creation interface with animated FAB
  - `FloatingActionButton.tsx`: Silver + icon button at bottom-right with blur effect
    - 60x60 point circular button with translucent background
    - Platform-specific shadows (iOS shadowOffset, Android elevation)
    - Positioned absolutely at bottom-right (30pt from bottom, 20pt from right)
    - Accessibility labels for screen readers
  - `EventCreationModal.tsx`: Animated modal with three creation options
    - Smooth 300ms spring animation (damping: 15, stiffness: 150)
    - Blur overlay background (intensity: 20, dark tint)
    - 85% screen width modal with rounded corners (20px radius)
    - Three option buttons with icons and descriptions:
      - 💬 Chat to Create (blue) - Natural language event creation
      - 📸 Snap or Upload Photo (green) - Image-based event extraction
      - 🎤 Record Voice Note (red) - Speech-to-text event creation
    - Close on outside tap or X button
    - Proper z-index layering and touch handling
  - Integrated into CalendarScreen with placeholder handlers
  - All three options show alerts (implementation coming next)

- **New Dependencies**: Installed packages for event creation features
  - `expo-blur`: Translucent blur effects for FAB and modal
  - `expo-image-picker`: Camera and photo gallery access
  - `expo-av`: Audio recording for voice notes

### Changed
- **CalendarScreen.tsx**: Integrated event creation UI
  - Added FloatingActionButton overlay on calendar
  - Added EventCreationModal with state management
  - Added placeholder handlers: `handleChatCreate()`, `handlePhotoCreate()`, `handleVoiceCreate()`
  - Modal visibility controlled by `eventCreationModalVisible` state
  - FAB positioned to not interfere with calendar content

### Technical Details
- **Animation**: React Native Reanimated with spring physics
  - Scale animation: 0 → 1 with spring (smooth, natural feel)
  - Opacity animation: 0 → 1 with timing (300ms duration)
  - Synchronized animations for modal and overlay
- **Blur Effects**: 
  - FAB: intensity 80, light tint, semi-transparent white background
  - Modal overlay: intensity 20, dark tint for dimming
  - Modal content: intensity 90, light tint for frosted glass effect
- **Component Structure**:
  ```
  src/components/event-creation/
  ├── FloatingActionButton.tsx
  ├── EventCreationModal.tsx
  └── index.ts
  ```
- **Platform Support**: iOS and Android with platform-specific styling
- **Accessibility**: Full VoiceOver and TalkBack support with labels and hints

**Next Steps**: Implement actual event creation logic for each option
- Chat: Natural language processing with AI
- Photo: OCR/Vision AI for event extraction
- Voice: Speech-to-text with event parsing

**Commit Hash:** `TBD`
**Files Created:**
- `src/components/event-creation/FloatingActionButton.tsx`
- `src/components/event-creation/EventCreationModal.tsx`
- `src/components/event-creation/index.ts`

**Files Modified:**
- `src/screens/CalendarScreen.tsx` (integrated FAB and modal)
- `package.json` (added expo-blur, expo-image-picker, expo-av)

**Development Status:** ✅ Event creation UI complete, ready for AI integration

## [0.4.2] - 2025-11-18 19:25:00

### Fixed
- **CRITICAL: JSX Syntax Errors**: Fixed app-breaking syntax errors from color replacement
  - Added quotes around hex color values in JSX props: `color="#EF7674"` instead of `color={#EF7674}`
  - Fixed StyleSheet property values: `backgroundColor: "#EF7674"` instead of `backgroundColor: #EF7674`
  - Fixed string concatenation for opacity: `"#EF767419"` instead of `"#EF7674" + '10'`
  - Fixed all 35+ instances across 10 files
  - App now launches successfully without syntax errors

### Technical Details
- **Root Cause**: Previous sed replacement changed `Colors.primary.cyan` to `#EF7674` without adding quotes
- **Impact**: App crashed with "Private names are only allowed in property accesses" error
- **Solution**: Three sed commands to fix:
  1. JSX props: `color={#EF7674}` → `color="#EF7674"`
  2. StyleSheet values: `: #EF7674` → `: "#EF7674"`
  3. Opacity concatenation: `"#EF7674" + '10'` → `"#EF767419"`

**Commit Hash:** `1ba1a80` (initial fix), `8b63c4b` (CalendarScreen), `c54d6e5` (arrays), `1978564` (ternary)
**Files Modified:**
- `src/screens/SettingUpScreen.tsx`
- `src/screens/LoginScreen.tsx`
- `src/screens/FamilyGroupSetupScreen.tsx`
- `src/screens/UserReadyScreen.tsx`
- `src/screens/SetupFailedScreen.tsx`
- `src/screens/CalendarScreen.tsx` (3 additional fixes)
- `src/screens/SplashScreen.tsx` (array syntax)
- `src/screens/WelcomeScreen.tsx` (array syntax)
- `src/screens/AccountNotFoundScreen.tsx`
- `src/screens/PreferencesSetupScreen.tsx`
- `src/screens/UserPreferencesViewScreen.tsx`
- `src/components/MenuModal.tsx`
- `src/components/RelationshipPicker.tsx` (ternary operator)

**Development Status:** ✅ All syntax errors fixed, app launches successfully

## [0.3.4] - 2025-11-18 18:14:00

### Fixed
- **CalendarScreen UI Issues**: Fixed three critical bugs in calendar interface
  - **Menu Button**: Added missing MenuModal component integration
    - Imported MenuModal component
    - Added menu visibility state management
    - Integrated user info from cache for menu display
    - Added onSettings handler (placeholder for future implementation)
  - **Duplicate Key Error**: Fixed React key collision in event attendees
    - Changed attendee key from `${attendee.userId}-${index}` to `${event.eventId}-${attendee.userId}-${index}`
    - Prevents duplicate keys when same user appears in multiple events
    - Resolves "Encountered two children with the same key" error
  - **View Type Buttons**: Fixed day/week/month toggle functionality
    - Added conditional check to prevent unnecessary state updates
    - useEffect properly triggers event reload when viewType changes
    - Buttons now correctly switch between day, week, and month views

### Added
- **Universal Menu Access**: Added menu button to all main screens
  - **FamilyGroupSetupScreen**: Added top header with menu button
    - Displays "Family Calendar Setup" title
    - Menu button in top-right corner
    - Integrated MenuModal with user info and sign-out functionality
  - **AppNavigator**: Updated to pass onSignOut handler to FamilyGroupSetupScreen
  - Consistent menu experience across entire app

### Changed
- **CalendarScreen.tsx**: Enhanced with proper menu integration
  - Added `getCurrentUser()` import from cache service
  - Created `userInfo` object from cached user data
  - MenuModal now displays user name and email
  - Settings button functional (logs to console, ready for navigation)

- **FamilyGroupSetupScreen.tsx**: Added menu integration
  - New top header component with title and menu button
  - Imported MenuModal and getCurrentUser
  - Added menuVisible state management
  - Menu displays user info and provides sign-out option

- **AppNavigator.tsx**: Extended FamilyGroupSetupScreen props
  - Added onSignOut prop to FamilyGroupSetupScreen
  - Ensures consistent sign-out functionality across all screens

### Technical Details
- **Key Generation**: Event-specific keys prevent collisions across multiple events
- **State Management**: Proper conditional updates prevent infinite loops
- **User Context**: Menu displays current user information from cache
- **Error Prevention**: Eliminated React warnings about duplicate keys
- **Consistent UX**: Menu accessible from all major screens in the app

**Commit Hash:** `TBD`
**Files Modified:**
- `src/screens/CalendarScreen.tsx` (fixed menu, keys, and view toggle)
- `src/screens/FamilyGroupSetupScreen.tsx` (added menu button and integration)
- `src/navigation/AppNavigator.tsx` (added onSignOut prop)

**Development Status:** ✅ All UI issues resolved, menu accessible from all screens, consistent UX achieved

## [0.3.0] - 2025-11-18 16:45:00

### Added
- **User Preferences Persistent Cache System**: Secure, persistent caching for user preferences
  - `preferencesCache.ts`: Persistent cache using Expo SecureStore (encrypted storage)
  - Stores all 18 preference properties including new `defaultFamilyGroupId` and `travelModeEnabledAt`
  - Survives app restarts with multi-user support (keyed by userId)
  - Cache cleared on logout for security and privacy
  - Functions: `cacheUserPreferences()`, `getCachedPreferences()`, `clearPreferencesCache()`, `updateCachedPreferences()`

- **Calendar Integration - Complete Implementation**: Full calendar functionality with Foundry integration
  - `calendarApi.ts`: Foundry API integration for calendar functions
    - `fetchFamilyGroups()`: Calls `getUserFamilyGroups` Foundry function
    - `fetchCalendarEvents()`: Calls `getUserCalendarEvents` Foundry function
  - `calendarService.ts`: Business logic layer with caching
    - `initializeCalendar()`: Initializes calendar with user preferences
    - `loadFamilyGroups()`: Loads groups with cache-first strategy
    - `loadCalendarEvents()`: Loads events with date range calculation
    - Date range calculation for day/week/month views
  - `CalendarScreen.tsx`: Complete redesign with modern UI
    - Family calendar selector with color-coded chips
    - View type toggle (day/week/month)
    - Pull-to-refresh functionality
    - Event cards with attendee information
    - "Who's Who" legend showing family members
    - Multi-dot calendar marking for events
    - Empty states and loading indicators

- **Calendar Type Definitions**: Comprehensive TypeScript types
  - `CalendarEvent`: Event details with visibility levels
  - `Attendee`: Attendee information with colors and relationships
  - `FamilyGroupWithMembers`: Family group structure with member details
  - `CalendarViewResponse`: Complete calendar data response
  - `FamilyGroupInfo`: Family group metadata

### Changed
- **Preferences Service**: Enhanced with automatic caching
  - `getUserPreferences()`: Now checks cache first before querying Foundry
  - `createUserPreferences()`: Automatically queries back and caches created preferences
  - Significant performance improvement with instant preference loading

- **Cache Service**: Extended to include preferences cache management
  - Added preferences cache exports: `cacheUserPreferences`, `getCachedPreferences`, etc.
  - Updated `clearAllCaches()` to optionally clear preferences cache
  - Integrated preferences cache with existing user and family group caches

- **Auth Service**: Enhanced logout to clear preferences cache
  - `signOut()` now clears preferences cache for security
  - Prevents data leakage between users on shared devices
  - Graceful error handling if cache clear fails

- **Foundry Index**: Exported calendar API functions
  - Added `fetchFamilyGroups` and `fetchCalendarEvents` exports
  - Removed duplicate placeholder functions
  - Clean module structure for calendar operations

- **Type Definitions**: Fixed duplicate CalendarEvent interface
  - Renamed legacy `CalendarEvent` to `LegacyCalendarEvent`
  - New `CalendarEvent` interface for Foundry calendar events
  - Proper type safety across calendar components

### Technical Details
- **Caching Strategy**: 
  - Preferences: Persistent SecureStore (survives logout for same user)
  - Family Groups: In-memory cache (30-minute expiry)
  - Calendar Events: No caching (always fresh from Foundry)
- **Date Range Calculation**: Intelligent date ranges based on view type
  - Day view: Loads 3 days (yesterday, today, tomorrow)
  - Week view: Loads 3 weeks (last, current, next)
  - Month view: Loads 3 months (last, current, next)
- **Security**: Preferences cache cleared on logout to protect user privacy
- **Performance**: Cache-first strategy reduces Foundry API calls significantly
- **UI/UX**: Modern calendar interface with pull-to-refresh and responsive design

**Commit Hash:** `TBD`
**Files Created:**
- `src/services/preferencesCache.ts` (persistent cache with SecureStore)
- `src/services/foundry/calendarApi.ts` (Foundry calendar API integration)
- `src/services/calendarService.ts` (calendar business logic with caching)

**Files Modified:**
- `src/services/foundry/preferencesService.ts` (added automatic caching)
- `src/services/foundry/cacheService.ts` (added preferences cache exports)
- `src/services/foundry/index.ts` (exported calendar functions)
- `src/services/authService.ts` (clear preferences cache on logout)
- `src/screens/CalendarScreen.tsx` (complete redesign with calendar functionality)
- `src/types/index.ts` (added calendar types, fixed duplicates)
- `package.json` (react-native-calendars already installed)

**Development Status:** ✅ Preferences caching operational, calendar UI complete, ready for Foundry SDK integration

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
