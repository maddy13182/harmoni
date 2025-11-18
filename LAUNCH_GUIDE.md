# 🚀 Harmoni App Launch Guide

Complete instructions for running your Harmoni family calendar app on iOS and Android.

## Prerequisites

✅ Node.js v22.18.0 (with nvm)
✅ Xcode installed (for iOS)
✅ Android Studio installed (for Android)
✅ Java 17 configured
✅ Android SDK configured

## 📱 Launch on iOS Simulator

### Step 1: Start iOS Simulator
```bash
# Option 1: Let Expo handle it
npx expo run:ios

# Option 2: Open simulator manually first
open -a Simulator
# Then run: npx expo run:ios
```

### Step 2: What Happens
- Compiles iOS app with Xcode
- Installs on iOS Simulator
- Starts development server
- Opens Harmoni app automatically
- Takes 5-10 minutes first time, then much faster

### Step 3: Test Authentication
1. Beautiful splash screen appears
2. Login screen with Google Sign-In
3. Tap "Sign in with Google"
4. Google OAuth page opens
5. Sign in with your account
6. Welcome screen with your name
7. Calendar screen

## 🤖 Launch on Android Emulator

### Step 1: Start Android Emulator
```bash
# Option 1: Open Android Studio
# - Open Android Studio
# - Click "AVD Manager"
# - Start an emulator

# Option 2: Command line (if configured)
emulator -avd <your_avd_name>
```

### Step 2: Run Harmoni App
```bash
# Make sure environment is set up
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.18.0
source ~/.zshrc

# Build and run Android app
npx expo run:android
```

### Step 3: What Happens
- Compiles Android app with Gradle
- Installs APK on Android Emulator
- Starts development server
- Opens Harmoni app automatically
- Takes 5-10 minutes first time

### Step 4: Test Authentication
1. Splash screen appears
2. Login screen
3. Tap "Sign in with Google"
4. Google OAuth page opens
5. Sign in with your account
6. **Should redirect back to app** (fixed with intent filter)
7. Welcome screen and calendar

## 🌐 Launch on Web Browser

### Quick Web Testing
```bash
npm run web
```

- Opens in browser automatically
- Same features as mobile
- Instant startup
- Great for quick testing

## 🔧 Development Commands

### Daily Development Workflow

**For iOS:**
```bash
npx expo run:ios
```

**For Android:**
```bash
npx expo run:android
```

**For Web:**
```bash
npm run web
```

**For Development Server Only:**
```bash
npx expo start --dev-client
```
(Use this if apps are already installed)

## 🎯 Environment Setup Commands

### Complete Environment Setup
```bash
# Set up Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.18.0

# Set up Android
source ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Set up Java
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

### Add to ~/.zshrc (One-time setup)
```bash
# Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Android
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Java
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

## 🔄 Hot Reload

After launching on any platform:
- Edit any file in `src/`
- Save the file
- App reloads automatically
- See changes instantly!

## 📊 Platform Status

### ✅ iOS Simulator
- **Status**: ✅ Working perfectly
- **OAuth**: ✅ Google Sign-In working
- **Command**: `npx expo run:ios`

### ✅ Android Emulator
- **Status**: ✅ Working (OAuth redirect fixed)
- **OAuth**: ✅ Google Sign-In should work now
- **Command**: `npx expo run:android`

### ✅ Web Browser
- **Status**: ✅ Always available
- **OAuth**: ✅ Works with web client
- **Command**: `npm run web`

## 🛠️ Troubleshooting

### iOS Issues
```bash
# Clean build
npx expo run:ios --clean

# Reset simulator
xcrun simctl erase all
```

### Android Issues
```bash
# Clean build
npx expo run:android --clean

# Reset emulator
# Wipe data in Android Studio AVD Manager
```

### Environment Issues
```bash
# Check versions
node --version    # Should be 22.18.0
java -version     # Should be 17.x.x
echo $ANDROID_HOME # Should show Android SDK path
```

## 🎉 Success Indicators

### App Launched Successfully When:
- ✅ Splash screen appears with "Harmoni" branding
- ✅ Login screen shows with Google Sign-In button
- ✅ OAuth works (redirects back to app)
- ✅ Welcome screen shows your name
- ✅ Calendar screen displays

### Development Server Working When:
- ✅ Terminal shows "Logs for your project will appear below"
- ✅ Hot reload works (save file → app updates)
- ✅ Console logs appear in terminal

## 📱 Quick Start Commands

**Most Common Commands:**

```bash
# iOS (most reliable)
npx expo run:ios

# Android (after emulator is running)
npx expo run:android

# Web (instant)
npm run web
```

## 🎯 Next Steps

After both platforms are working:
1. ✅ Implement event creation
2. ✅ Connect to Foundry backend
3. ✅ Add family member management
4. ✅ Build production apps

Your Harmoni app now runs on iOS, Android, and Web with a single codebase! 🎉
