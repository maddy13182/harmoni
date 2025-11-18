# EAS Development Build Guide for Harmoni

## What is a Development Build?

A Development Build is a native iOS app that:
- ✅ Works like Expo Go (hot reload, debugging)
- ✅ Supports OAuth with proper URL schemes
- ✅ Installs directly on your simulator/device
- ✅ Is the official way to develop OAuth apps with Expo

## Prerequisites

✅ EAS CLI installed (installing now)
✅ Expo account: mramamurthy1982
✅ Xcode installed on your Mac
✅ iOS Simulator available

## Step-by-Step Process

### Step 1: Login to Expo (After EAS CLI installs)

```bash
eas login
```

Enter your credentials:
- Username: mramamurthy1982
- Password: [your password]

### Step 2: Configure EAS

```bash
eas build:configure
```

This will:
- Create `eas.json` configuration file
- Set up build profiles
- Configure for your project

### Step 3: Create Development Build

```bash
eas build --profile development --platform ios
```

**Options:**
- This builds in the cloud (free for limited builds)
- Takes 10-15 minutes first time
- You'll get a download link when done

**Alternative (Local Build - Faster):**
```bash
eas build --profile development --platform ios --local
```
- Builds on your Mac (faster)
- Requires more setup

### Step 4: Install the Build

After build completes, you'll get a `.tar.gz` file or download link.

**Install on Simulator:**
```bash
eas build:run -p ios
```

Or manually:
1. Download the build
2. Drag the `.app` file to your simulator

### Step 5: Start Development Server

```bash
npx expo start --dev-client
```

This starts the server for development builds (not Expo Go).

### Step 6: Test OAuth

1. Open the development build on your simulator
2. Tap "Sign in with Google"
3. OAuth should work with proper redirect: `com.harmoni.familycalendar://redirect`

## What Changes with Development Builds

### Redirect URI
**Before (Expo Go):** `exp://192.168.1.141:8081` ❌
**After (Dev Build):** `com.harmoni.familycalendar://redirect` ✅

### Google Console Configuration
Add this redirect URI to your **iOS OAuth client**:
```
com.harmoni.familycalendar://redirect
```

No need to add to Web client anymore!

## Development Workflow

### Daily Development:
1. Start dev server: `npx expo start --dev-client`
2. App opens automatically in your development build
3. Make code changes
4. Hot reload works just like Expo Go!

### When to Rebuild:
- Added new native dependencies
- Changed app.json configuration
- Updated native code

## Advantages of Development Builds

✅ **OAuth Works**: Proper URL schemes
✅ **Hot Reload**: Fast development cycle
✅ **Debugging**: Full dev tools available
✅ **Production-like**: Tests real app behavior
✅ **Custom Native Code**: Can add native modules

## Cost

- **Free tier**: Limited builds per month
- **Paid plans**: Unlimited builds
- **Local builds**: Always free (builds on your Mac)

## Troubleshooting

### Build Fails
- Check Xcode is installed
- Verify bundle identifier is unique
- Check EAS CLI is logged in

### Can't Install on Simulator
- Make sure simulator is running
- Try: `xcrun simctl install booted path/to/app.tar.gz`

### OAuth Still Doesn't Work
- Verify redirect URI in Google Console
- Check bundle identifier matches
- Restart development server

## Next Steps

1. ✅ Wait for EAS CLI to finish installing
2. ✅ Login with `eas login`
3. ✅ Configure with `eas build:configure`
4. ✅ Create build with `eas build --profile development --platform ios`
5. ✅ Install and test!

This is the professional way to develop Expo apps with OAuth!
