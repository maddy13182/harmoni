# Android OAuth Setup for Harmoni

## The Problem

Android is showing the same OAuth error as iOS did initially:
- "Custom scheme URIs are not allowed for 'WEB' client type"
- Error 400: invalid_request

## The Solution

You need to create an **Android OAuth client** in Google Cloud Console.

## Steps to Create Android OAuth Client

### Step 1: Get SHA-1 Certificate Fingerprint

First, we need your app's SHA-1 fingerprint:

```bash
cd android
./gradlew signingReport
```

Look for the SHA-1 fingerprint under "Variant: debug" - it looks like:
```
SHA1: A1:B2:C3:D4:E5:F6:...
```

### Step 2: Create Android OAuth Client

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Click**: "+ CREATE CREDENTIALS" → "OAuth client ID"
4. **Select**: **Android** (not Web!)
5. **Fill in**:
   - **Name**: Harmoni Android App
   - **Package name**: `com.harmoni.familycalendar`
   - **SHA-1 certificate fingerprint**: [paste the SHA-1 from step 1]
6. **Click**: "CREATE"
7. **Copy the Android Client ID**

### Step 3: Update App Configuration

Once you have the Android Client ID, I'll update the app to use it.

## Why This is Needed

**Different OAuth Clients for Different Platforms:**
- **Web Client**: For web browsers and Expo Go development
- **iOS Client**: For iOS apps (bundle ID based)
- **Android Client**: For Android apps (package name + SHA-1 based)

## Current OAuth Clients

You currently have:
- ✅ **Web Client**: `1029771347588-94gav3kiecrqlf6pkihne2vgeeet0a1d...`
- ✅ **iOS Client**: `1029771347588-m61s1m0vpiv0lc8tsc1k1at1q4ermgtl...`
- ❌ **Android Client**: Need to create

## After Creating Android Client

The app will use:
- **iOS**: iOS Client ID
- **Android**: Android Client ID  
- **Web/Expo Go**: Web Client ID

All automatically handled by Expo's Google provider!

## Next Steps

1. ✅ Get SHA-1 fingerprint with `cd android && ./gradlew signingReport`
2. ✅ Create Android OAuth client in Google Console
3. ✅ Update app with Android Client ID
4. ✅ Test OAuth on Android

Let me know the SHA-1 fingerprint and Android Client ID once you create it!
