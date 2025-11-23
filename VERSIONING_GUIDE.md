# Harmoni App Versioning Guide

Complete guide for managing app versions and build numbers for iOS and Android.

## Overview

The Harmoni app uses a comprehensive versioning system that tracks:
- **Semantic Version** (e.g., 0.9.0) - User-facing version
- **iOS Build Number** (e.g., 1, 2, 3) - Internal iOS build tracking
- **Android Version Code** (e.g., 1, 2, 3) - Internal Android build tracking

## Version Display Locations

### 1. Splash Screen
- Shows: `v0.9.0` (short version)
- Location: Bottom of splash screen
- Visible for 2.5 seconds on app startup

### 2. Menu Footer
- Shows: `Version 0.9.0 (Build 1)` (full version with build number)
- Location: Bottom of side menu
- Always visible when menu is open

### 3. About Screen (Future)
- Will show: Complete version information
- Location: Menu → Settings → About
- Details: Version, build number, platform, bundle ID, build date

## Version Number Format

### Semantic Versioning (MAJOR.MINOR.PATCH)
```
0.9.0
│ │ │
│ │ └─ PATCH: Bug fixes (0.9.0 → 0.9.1)
│ └─── MINOR: New features (0.9.0 → 0.10.0)
└───── MAJOR: Breaking changes (0.9.0 → 1.0.0)
```

### Build Numbers
- **iOS buildNumber**: String (e.g., "1", "2", "3")
- **Android versionCode**: Integer (e.g., 1, 2, 3)
- Increments with every build
- Independent of semantic version

## Current Configuration

### app.json
```json
{
  "expo": {
    "version": "0.9.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

### package.json
```json
{
  "version": "0.8.0"
}
```

**Note:** package.json and app.json versions should be synced!

## Version Management Workflow

### Option 1: Manual Version Update

**Step 1: Update Semantic Version**
Edit `app.json`:
```json
{
  "expo": {
    "version": "0.10.0"  // Update this
  }
}
```

**Step 2: Increment Build Numbers**
```bash
npm run build:increment
```

This will:
- iOS buildNumber: 1 → 2
- Android versionCode: 1 → 2

**Step 3: Build**
```bash
eas build --platform all --profile preview
```

### Option 2: Automated Version Bump (Recommended)

**For Bug Fixes (Patch):**
```bash
npm run version:patch
# 0.9.0 → 0.9.1
```

**For New Features (Minor):**
```bash
npm run version:minor
# 0.9.0 → 0.10.0
```

**For Breaking Changes (Major):**
```bash
npm run version:major
# 0.9.0 → 1.0.0
```

**Then Increment Build Numbers:**
```bash
npm run build:increment
```

**Then Build:**
```bash
eas build --platform all --profile preview
```

## Complete Release Workflow

### 1. Make Code Changes
```bash
# Make your changes
git add .
git commit -m "feat: Add new feature"
```

### 2. Update Version
```bash
# For new features
npm run version:minor

# This updates:
# - package.json version
# - app.json version
```

### 3. Increment Build Numbers
```bash
npm run build:increment

# This increments:
# - iOS buildNumber
# - Android versionCode
```

### 4. Update Documentation
```bash
# Update CHANGELOG.md with changes
# Update WORKLOG.md with new version entry
```

### 5. Commit Version Changes
```bash
git add app.json package.json CHANGELOG.md WORKLOG.md
git commit -m "chore: Bump version to 0.10.0 (build 2)"
git push
```

### 6. Build and Deploy
```bash
# Build for both platforms
eas build --platform all --profile preview

# Or for production
eas build --platform all --profile production
```

## Version Tracking in Code

### Import Version Constants
```typescript
import { 
  APP_VERSION, 
  BUILD_NUMBER, 
  FULL_VERSION,
  getVersionString,
  getVersionInfo 
} from '../constants/AppVersion';
```

### Display Version
```typescript
// Short version (v0.9.0)
<Text>{getShortVersion()}</Text>

// Full version (Version 0.9.0 (Build 1))
<Text>{getVersionString()}</Text>

// Without build number (Version 0.9.0)
<Text>{getVersionString(false)}</Text>

// Get all version info
const versionInfo = getVersionInfo();
console.log(versionInfo);
// {
//   appName: "Harmoni",
//   version: "0.9.0",
//   buildNumber: "1",
//   fullVersion: "0.9.0 (1)",
//   platform: "ios",
//   bundleId: "com.harmoni.familycalendar",
//   environment: "Development",
//   buildDate: "2025-11-22"
// }
```

## Build Number Strategy

### When to Increment Build Numbers

**Always increment before:**
- Creating a new EAS build
- Submitting to App Store/Play Store
- Distributing to testers

**Don't increment for:**
- Local development
- Code changes without building
- OTA updates (JavaScript-only changes)

### Build Number Rules

**iOS:**
- Must be a string
- Must increment for each App Store submission
- Can be same as Android or different
- Format: "1", "2", "3", etc.

**Android:**
- Must be an integer
- Must increment for each Play Store submission
- Must be greater than previous version
- Format: 1, 2, 3, etc.

## Version History Tracking

### WORKLOG.md
Track major versions with commit hashes:
```markdown
| Version | Timestamp | Commit Hash | Change Summary | Status |
|---------|-----------|-------------|----------------|--------|
| 0.9.0 | 2025-11-22 16:30:00 | 49c8aea | Family Invitation System | ✅ Stable |
```

### CHANGELOG.md
Detailed changelog following Keep a Changelog format:
```markdown
## [0.9.0] - 2025-11-22 16:30:00

### Added
- Feature 1
- Feature 2

### Changed
- Change 1

### Fixed
- Bug fix 1
```

## Automation Scripts

### sync-version.js
Syncs version from package.json to app.json
```bash
npm run version:patch  # Runs sync-version.js automatically
```

### increment-build.js
Increments both iOS and Android build numbers
```bash
npm run build:increment
```

## Quick Reference Commands

### Version Management
```bash
# Patch version (0.9.0 → 0.9.1)
npm run version:patch

# Minor version (0.9.0 → 0.10.0)
npm run version:minor

# Major version (0.9.0 → 1.0.0)
npm run version:major

# Increment build numbers
npm run build:increment
```

### Build Commands
```bash
# Preview build (for testing)
eas build --platform all --profile preview

# Production build (for app stores)
eas build --platform all --profile production

# Check build status
eas build:list
```

## Example: Complete Release Process

```bash
# 1. Make changes and commit
git add .
git commit -m "feat: Add invitation system"

# 2. Bump version (for new feature)
npm run version:minor
# Output: 0.9.0 → 0.10.0

# 3. Increment build numbers
npm run build:increment
# Output: iOS 1 → 2, Android 1 → 2

# 4. Update documentation
# Edit CHANGELOG.md and WORKLOG.md

# 5. Commit version bump
git add app.json package.json CHANGELOG.md WORKLOG.md
git commit -m "chore: Bump version to 0.10.0 (build 2)"
git push

# 6. Build
eas build --platform all --profile preview

# 7. Test the build
# Download and install on devices

# 8. If approved, build for production
eas build --platform all --profile production

# 9. Submit to stores
eas submit --platform all
```

## Troubleshooting

### Version Mismatch Between package.json and app.json
```bash
# Manually sync
node scripts/sync-version.js
```

### Build Number Not Incrementing
```bash
# Manually run increment script
npm run build:increment
```

### Version Not Showing in App
```bash
# Clear cache and rebuild
npm start -- --clear

# Or rebuild native
npx expo prebuild --clean
```

### Check Current Version
```bash
# View app.json version
cat app.json | grep -A 10 '"version"'

# View package.json version
cat package.json | grep '"version"'
```

## Best Practices

### 1. Always Sync Versions
Keep package.json and app.json versions in sync using the scripts.

### 2. Increment Before Building
Always run `npm run build:increment` before creating a new build.

### 3. Document Changes
Update CHANGELOG.md and WORKLOG.md with every version bump.

### 4. Commit Version Changes
Commit version bumps separately from feature changes:
```bash
git commit -m "chore: Bump version to X.Y.Z (build N)"
```

### 5. Tag Releases
Tag production releases in git:
```bash
git tag -a v0.9.0 -m "Release version 0.9.0"
git push --tags
```

### 6. Test Before Incrementing
Test your changes thoroughly before bumping the version.

### 7. Use Semantic Versioning
Follow semantic versioning principles:
- PATCH: Bug fixes only
- MINOR: New features (backward compatible)
- MAJOR: Breaking changes

## Platform-Specific Notes

### iOS
- buildNumber must be a string
- Must increment for each App Store submission
- Can use same number for multiple TestFlight builds
- Format: "1", "2", "3", etc.

### Android
- versionCode must be an integer
- Must increment for each Play Store submission
- Must be greater than previous version
- Format: 1, 2, 3, etc.

### Both Platforms
- Version string (0.9.0) can be same for both
- Build numbers can be same or different
- Recommended: Keep build numbers in sync

## Future Enhancements

### Planned Features
1. **About Screen**: Full version info display
2. **Automatic Build Increment**: Increment on EAS build
3. **Git Tag Integration**: Auto-tag releases
4. **Build Date Display**: Show when app was built
5. **Update Checker**: Notify users of new versions

---

**Last Updated:** 2025-11-22  
**Current Version:** 0.9.0  
**Current Build:** 1 (iOS), 1 (Android)  
**Maintained By:** Development Team
