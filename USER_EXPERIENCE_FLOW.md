# Harmoni Family Calendar App - User Experience Flow Documentation

## Overview
This document outlines the complete user experience flow for the Harmoni Family Calendar app, from initial launch to all implemented features. The app uses React Native with Expo, Google OAuth authentication, and Palantir Foundry for backend data management.

---

## 📱 App Launch & Authentication Flow

### 1. App Launch
**Screen:** `SplashScreen`
- User launches the Harmoni app
- Displays app branding and loading animation
- **Duration:** Brief splash screen (2-3 seconds)
- **Next:** Automatically transitions to authentication check

### 2. Authentication Check
**State:** `checking` (Loading screen)
- App checks if user has valid authentication token stored in secure storage
- Uses `isAuthenticated()` from `authService.ts`
- **Login Persistence:** YES - App remembers previous login using SecureStore
  - Stores: Authentication token and user info
  - Secure storage keys: `harmoni_auth_token` and `harmoni_user_info`
  - **Expiry:** Tokens persist until manually signed out

**Decision Point:**
- ✅ **If authenticated:** Proceed to Foundry user verification
- ❌ **If not authenticated:** Go to Login Screen

---

## 🔐 Login Flow (New/Returning Users)

### 3A. Login Screen (Unauthenticated Users)
**Screen:** `LoginScreen`
- Clean, minimalist Google OAuth login interface
- Single "Sign in with Google" button
- **Authentication Method:** Google OAuth 2.0
  - iOS Client ID: `1029771347588-m61s1m0vpiv0lc8tsc1k1at1q4ermgtl.apps.googleusercontent.com`
  - Android Client ID: `1029771347588-qrpi0qt8uv85fg5rrnhksa820jo0runn.apps.googleusercontent.com`
  - Web Client ID: `1029771347588-94gav3kiecrqlf6pkihne2vgeeet0a1d.apps.googleusercontent.com`

**User Actions:**
1. Tap "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. Grant permissions (profile, email access)
4. Return to app with authentication token

**On Success:**
- Store authentication token and user info securely
- Proceed to Welcome Screen

**On Failure:**
- Display error message
- Allow retry

---

## 🎉 Welcome & Setup Flow

### 4. Welcome Screen (First-time after login)
**Screen:** `WelcomeScreen`
- Welcomes user to Harmoni Family Calendar
- Brief app introduction
- **User Action:** Tap "Continue" button
- **Next:** Foundry user setup process

### 5. User Setup in Foundry
**Screen:** `SettingUpScreen`
- Shows loading animation with user's name
- **Background Process:** 
  - Calls `verifyOrCreateUser()` from `foundryClient.ts`
  - Checks if user exists in Foundry backend
  - Creates new user record if doesn't exist
  - Uses Google user info (name, email, ID)

**Possible Outcomes:**

#### 5A. Setup Success
**Screen:** `UserReadyScreen`
- Displays success message
- Shows whether user was newly created or already existed
- **User Action:** Tap "Continue"
- **Next:** Check user preferences

#### 5B. Setup Failed
**Screen:** `SetupFailedScreen`
- Displays error message and details
- **User Options:**
  - "Retry Setup" - Attempts Foundry setup again
  - "Sign Out" - Returns to login screen

---

## ⚙️ User Preferences Flow

### 6. Preferences Check
**State:** `checking-preferences` (Loading screen)
- **Background Process:**
  - Calls `checkUserPreferences()` from `foundryClient.ts`
  - Uses link traversal: `user.pivotTo("userPreference")`
  - Checks if user has existing preferences

**Decision Point:**
- ✅ **Has Preferences:** Go to Main Calendar
- ❌ **No Preferences:** Go to Preferences Setup

### 7A. Preferences Setup (First-time users)
**Screen:** `PreferencesSetupScreen`
- Beautiful form with multiple preference options
- **Timezone Selection:** Rolodex-style picker with auto-detection
- **Calendar View:** Default view preference (month/week/day)
- **Notification Settings:** Email and push notification preferences
- **Theme:** Light/dark mode preference

**Form Fields:**
- Full Name (pre-filled from Google)
- Email (pre-filled from Google)
- Timezone (auto-detected, user can change)
- Default Calendar View
- Email Notifications (toggle)
- Push Notifications (toggle)
- Theme Preference

**User Actions:**
1. Review/modify pre-filled information
2. Select timezone from rolodex picker
3. Configure notification preferences
4. Tap "Save Preferences"

**On Success:**
- Calls `createUserPreferences()` to save to Foundry
- Proceeds to Main Calendar

**On Error:**
- Shows error message
- Allows user to proceed to main app anyway

---

## 📅 Main Calendar Experience

### 8. Calendar Screen (Main App)
**Screen:** `CalendarScreen`
- **Primary Interface:** Monthly calendar view
- **Features:**
  - Date selection with visual feedback
  - Event display for selected date
  - "Add Event" button (placeholder)
  - Side menu access via hamburger icon

**User Interface Elements:**
- **Header:** "Family Calendar" title + Menu button
- **Calendar:** Interactive monthly calendar
- **Events Section:** Shows events for selected date
- **Add Button:** "+ Add Event" (future functionality)

---

## 🍔 Side Menu Navigation

### 9. Menu Modal
**Component:** `MenuModal`
- **Trigger:** Tap hamburger menu icon in calendar header
- **Animation:** Slides in from right side
- **Width:** 85% of screen width

**Menu Structure:**
```
👤 User Profile Section
   - Avatar (first letter of name)
   - Full name
   - Email address

📋 Navigation Options
   📅 Calendar (current screen)
   👥 Family Members (placeholder)
   🔔 Notifications (placeholder)
   ⚙️ Settings → Settings Screen

ℹ️ Information Section
   ❓ Help & Support (placeholder)
   ℹ️ About (placeholder)

🚪 Account Actions
   🚪 Sign Out
```

---

## ⚙️ Settings Navigation Flow

### 10. Settings Screen
**Screen:** `SettingsScreen`
- **Access:** Via side menu → Settings
- **Navigation:** Back button returns to calendar

**Settings Options:**
```
App Settings:
├── 👤 User Preferences → User Preferences View
├── 🔔 Notification Settings (placeholder)
├── 🛡️ Privacy & Security (placeholder)
└── ℹ️ About (placeholder)

App Information:
├── Version: 1.0.0
├── Build: Production
└── Platform: React Native + Expo
```

### 11. User Preferences View
**Screen:** `UserPreferencesViewScreen`
- **Access:** Settings → User Preferences
- **Purpose:** Display current user preferences
- **Data Source:** Calls `getUserPreferences()` using link traversal

**Display Format:**
```
👤 Personal Information
   Name: [User's full name]
   Email: [User's email]

🌍 Regional Settings
   Timezone: [User's timezone]

📅 Calendar Preferences
   Default View: [Month/Week/Day]

🔔 Notification Settings
   Email Notifications: [Enabled/Disabled]
   Push Notifications: [Enabled/Disabled]

🎨 Appearance
   Theme: [Light/Dark]
```

**User Actions:**
- **View Only:** Current implementation displays preferences
- **Edit Button:** Available for future preference editing
- **Back Button:** Returns to Settings screen

### 12. Edit Preferences (Future Enhancement)
**Screen:** `PreferencesSetupScreen` (reused)
- **Access:** User Preferences View → Edit button
- **Purpose:** Modify existing preferences
- **Functionality:** Same form as initial setup, pre-filled with current values

---

## 🔄 Navigation Flow Summary

```
App Launch
    ↓
Splash Screen (2-3s)
    ↓
Authentication Check
    ├── Not Authenticated → Login Screen
    │                           ↓
    │                      Welcome Screen
    │                           ↓
    └── Authenticated ──────────┘
                                ↓
                        Foundry User Setup
                        ├── Success → User Ready Screen
                        └── Failed → Setup Failed Screen
                                ↓
                        Preferences Check
                        ├── Has Preferences ────┐
                        └── No Preferences      │
                                ↓               │
                        Preferences Setup       │
                                ↓               │
                        Main Calendar ←─────────┘
                                ↓
                        Side Menu Options:
                        ├── Calendar (stay)
                        ├── Settings
                        │    └── User Preferences
                        │         └── Edit Preferences
                        └── Sign Out → Login Screen
```

---

## 🔧 Technical Implementation Details

### Authentication Persistence
- **Storage Method:** Expo SecureStore
- **Data Stored:** 
  - Authentication token (`harmoni_auth_token`)
  - User info JSON (`harmoni_user_info`)
- **Persistence:** Until manual sign out
- **Security:** Encrypted storage on device

### User Caching System
- **Implementation:** In-memory cache with 30-minute expiry
- **Purpose:** Reduce Foundry API calls
- **Cache Keys:** User ID based
- **Invalidation:** On sign out or cache expiry

### Foundry Integration
- **User Management:** `User` object type
- **Preferences:** `UserPreference` object type
- **Link Traversal:** `user.pivotTo("userPreference")`
- **Operations:**
  - `verifyOrCreateUser()` - User creation/verification
  - `checkUserPreferences()` - Preference existence check
  - `getUserPreferences()` - Preference retrieval
  - `createUserPreferences()` - Preference creation

### Screen State Management
- **Calendar Screen States:** `'calendar' | 'settings' | 'user-preferences' | 'edit-preferences'`
- **Navigation:** Internal state-based navigation within CalendarScreen
- **Back Navigation:** Proper back button handling for each screen

---

## 🎯 User Experience Highlights

### Seamless Authentication
- **One-tap Google login**
- **Persistent sessions** - users stay logged in
- **Automatic user setup** in backend systems

### Intuitive Navigation
- **Clear visual hierarchy** with proper back buttons
- **Consistent iconography** using Ionicons
- **Smooth animations** for menu transitions

### Preference Management
- **Auto-detection** of user timezone
- **Rolodex-style picker** for timezone selection
- **Comprehensive preferences** covering all user needs
- **Easy viewing and editing** of saved preferences

### Error Handling
- **Graceful failure handling** with retry options
- **User-friendly error messages**
- **Fallback options** when services fail

### Performance Optimization
- **User caching** to reduce API calls
- **Efficient state management**
- **Proper loading states** for all async operations

---

## 📋 Current Feature Status

### ✅ Implemented Features
- [x] Google OAuth authentication with persistence
- [x] Foundry user management and caching
- [x] Complete preferences setup and viewing
- [x] Settings navigation with user preferences
- [x] Side menu with user profile display
- [x] Calendar interface (basic)
- [x] Proper error handling and loading states
- [x] Cross-platform compatibility (iOS/Android)

### 🚧 Placeholder Features (Future Development)
- [ ] Event creation and management
- [ ] Family member management
- [ ] Notification system implementation
- [ ] Help & support system
- [ ] Privacy & security settings
- [ ] Calendar synchronization
- [ ] Real-time updates

---

## 🔍 Decision Points & Logic Paths

### Authentication Decision Tree
```
App Launch
├── Has Valid Token?
│   ├── YES → Verify Foundry User
│   └── NO → Show Login Screen
│
Foundry Verification
├── User Exists?
│   ├── YES → Check Preferences
│   └── NO → Create User → Check Preferences
│
Preferences Check
├── Has Preferences?
│   ├── YES → Main Calendar
│   └── NO → Preferences Setup → Main Calendar
```

### Navigation Decision Tree
```
Main Calendar
├── Menu Button → Side Menu
│   ├── Settings → Settings Screen
│   │   └── User Preferences → View Preferences
│   │       └── Edit → Preferences Setup
│   └── Sign Out → Clear Data → Login Screen
│
Settings Screen
├── Back Button → Main Calendar
└── User Preferences → View Preferences
    ├── Back Button → Settings Screen
    └── Edit Button → Preferences Setup
```

---

**Document Version:** 1.0.0  
**Last Updated:** November 17, 2025  
**App Version:** 1.0.0  
**Platform:** React Native + Expo  
**Backend:** Palantir Foundry OSDK
