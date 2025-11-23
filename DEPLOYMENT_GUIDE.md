# Harmoni App Deployment Guide

Complete guide for building and distributing the Harmoni Family Calendar app to users.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [EAS Build Setup](#eas-build-setup)
3. [Building for iOS](#building-for-ios)
4. [Building for Android](#building-for-android)
5. [Internal Testing](#internal-testing)
6. [App Store Submission](#app-store-submission)
7. [Over-the-Air Updates](#over-the-air-updates)

---

## Prerequisites

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS Project
```bash
eas build:configure
```

This will create/update `eas.json` with build profiles.

---

## EAS Build Setup

### Current `eas.json` Configuration
Your project already has `eas.json` configured. Verify it looks like this:

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Update app.json for Production
Ensure your `app.json` has proper configuration:

```json
{
  "expo": {
    "name": "Harmoni",
    "slug": "harmoni",
    "version": "0.9.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#4ECDC4"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.harmoni.familycalendar",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4ECDC4"
      },
      "package": "com.harmoni.familycalendar",
      "versionCode": 1
    }
  }
}
```

---

## Building for iOS

### Option 1: Internal Distribution (TestFlight)

**Step 1: Build for iOS**
```bash
eas build --platform ios --profile preview
```

**Step 2: Download and Install**
- EAS will provide a download link
- Install on your device via TestFlight or direct installation
- Share link with testers

### Option 2: App Store Production Build

**Step 1: Enroll in Apple Developer Program**
- Cost: $99/year
- Sign up at: https://developer.apple.com/programs/

**Step 2: Create App Store Connect App**
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - Platform: iOS
   - Name: Harmoni
   - Primary Language: English
   - Bundle ID: com.harmoni.familycalendar
   - SKU: harmoni-family-calendar

**Step 3: Build for Production**
```bash
eas build --platform ios --profile production
```

**Step 4: Submit to App Store**
```bash
eas submit --platform ios
```

Follow prompts to:
- Select the build
- Provide Apple ID credentials
- Submit for review

---

## Building for Android

### Option 1: Internal Testing (APK)

**Step 1: Build APK**
```bash
eas build --platform android --profile preview
```

**Step 2: Download and Share**
- EAS provides download link
- Share APK file with testers
- Users can install directly (may need to enable "Install from Unknown Sources")

### Option 2: Google Play Store

**Step 1: Create Google Play Developer Account**
- Cost: $25 one-time fee
- Sign up at: https://play.google.com/console

**Step 2: Create App in Play Console**
1. Go to Google Play Console
2. Click "Create app"
3. Fill in details:
   - App name: Harmoni
   - Default language: English
   - App or game: App
   - Free or paid: Free

**Step 3: Build AAB (Android App Bundle)**
```bash
eas build --platform android --profile production
```

**Step 4: Submit to Play Store**
```bash
eas submit --platform android
```

Or manually:
1. Download the `.aab` file from EAS
2. Upload to Play Console → Production → Create new release
3. Fill in release notes
4. Submit for review

---

## Internal Testing (Fastest Way to Share)

### For Quick Testing Without App Stores:

**iOS - Ad Hoc Distribution:**
```bash
# Build with ad hoc profile
eas build --platform ios --profile preview

# Share the download link with testers
# They can install via TestFlight or direct installation
```

**Android - APK Distribution:**
```bash
# Build APK
eas build --platform android --profile preview

# Share the APK download link
# Users install directly on their devices
```

### Using Expo Go (Development Only)
```bash
# Start development server
npx expo start

# Scan QR code with Expo Go app
# Note: Limited functionality, OAuth won't work properly
```

---

## Build Commands Quick Reference

### Development Builds (for testing with native features)
```bash
# iOS development build
eas build --platform ios --profile development

# Android development build
eas build --platform android --profile development
```

### Preview Builds (internal testing)
```bash
# iOS preview (TestFlight compatible)
eas build --platform ios --profile preview

# Android preview (APK for direct install)
eas build --platform android --profile preview

# Both platforms
eas build --platform all --profile preview
```

### Production Builds (for app stores)
```bash
# iOS production
eas build --platform ios --profile production

# Android production
eas build --platform android --profile production

# Both platforms
eas build --platform all --profile production
```

---

## Over-the-Air (OTA) Updates

After your app is published, you can push updates without rebuilding:

### Publish Update
```bash
# Publish to production channel
eas update --branch production --message "Bug fixes and improvements"

# Publish to preview channel
eas update --branch preview --message "Testing new features"
```

### Configure Updates in app.json
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[your-project-id]"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

**Note:** OTA updates work for JavaScript changes only. Native code changes require new builds.

---

## Environment Variables for Production

### Create Production .env
```bash
# .env.production
EXPO_PUBLIC_FOUNDRY_URL=https://your-foundry-instance.palantirfoundry.com
EXPO_PUBLIC_FOUNDRY_TOKEN=your-production-token
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
```

### Use in Build
```bash
# Load production environment
eas build --platform all --profile production --non-interactive
```

---

## Recommended Workflow

### For Initial Testing (Fastest)
1. Build preview for Android: `eas build --platform android --profile preview`
2. Share APK link with testers
3. Gather feedback

### For Beta Testing
1. Build preview for both platforms: `eas build --platform all --profile preview`
2. iOS: Distribute via TestFlight
3. Android: Share APK or use Google Play Internal Testing
4. Collect feedback and iterate

### For Public Release
1. Build production: `eas build --platform all --profile production`
2. Submit to both stores: `eas submit --platform all`
3. Wait for review (1-7 days typically)
4. Release to users

### For Updates After Release
1. Make code changes
2. Test locally
3. Push OTA update: `eas update --branch production`
4. Users get update automatically (for JS changes)
5. For native changes: Build and submit new version

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and retry
eas build --platform [ios|android] --profile [profile] --clear-cache
```

### Check Build Status
```bash
# View all builds
eas build:list

# View specific build
eas build:view [build-id]
```

### View Build Logs
```bash
# Download logs
eas build:view [build-id] --logs
```

---

## Cost Considerations

### Free Tier (Expo)
- Unlimited builds
- 1 concurrent build at a time
- Slower build times

### Paid Plans
- **Production Plan ($29/month):**
  - Priority builds
  - 15 concurrent builds
  - Faster build times
  
- **Enterprise Plan (Custom pricing):**
  - Dedicated infrastructure
  - SLA guarantees
  - Custom support

### App Store Fees
- **Apple:** $99/year (required for App Store)
- **Google:** $25 one-time (required for Play Store)

---

## Next Steps

1. **Choose Distribution Method:**
   - Internal testing: Use preview builds
   - Public release: Use production builds + app stores

2. **Build Your First Version:**
   ```bash
   eas build --platform all --profile preview
   ```

3. **Test Thoroughly:**
   - Install on multiple devices
   - Test all features (OAuth, invitations, calendar)
   - Gather feedback

4. **Prepare for Stores:**
   - Create app store listings
   - Prepare screenshots
   - Write app descriptions
   - Set up privacy policy

5. **Submit and Launch:**
   ```bash
   eas build --platform all --profile production
   eas submit --platform all
   ```

---

## Additional Resources

- **EAS Build Documentation:** https://docs.expo.dev/build/introduction/
- **EAS Submit Documentation:** https://docs.expo.dev/submit/introduction/
- **EAS Update Documentation:** https://docs.expo.dev/eas-update/introduction/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store Guidelines:** https://play.google.com/about/developer-content-policy/

---

**Last Updated:** 2025-11-22  
**App Version:** 0.9.0  
**Maintained By:** Development Team
