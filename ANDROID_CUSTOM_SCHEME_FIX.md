# Fix Android Custom URI Scheme Error

## The Error

"Custom URI scheme is not enabled for your Android client"

## The Problem

Your Android OAuth client was created as a standard Android client, but it needs to support custom URI schemes for React Native apps.

## The Solution

You need to **recreate** the Android OAuth client with the correct configuration.

## Steps to Fix

### Step 1: Delete Current Android Client (Optional)

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to: APIs & Services → Credentials
3. Find: `1029771347588-c5he766asb3dtg1oo8ncvauj3eopm832...`
4. Click the trash icon to delete it

### Step 2: Create New Android Client with Custom Scheme Support

1. **Click**: "+ CREATE CREDENTIALS" → "OAuth client ID"
2. **Select**: **Android**
3. **Fill in**:
   - **Name**: Harmoni Android App
   - **Package name**: `com.harmoni.familycalendar`
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

4. **IMPORTANT**: Look for an option like:
   - "Enable custom URI schemes" ✅
   - "Support deep linking" ✅
   - "Allow custom schemes" ✅

5. **Click**: "CREATE"
6. **Copy the new Android Client ID**

### Alternative: Check Advanced Settings

If you don't want to recreate:

1. **Edit your existing Android client**
2. **Look for "Advanced settings" or "Additional settings"**
3. **Enable**: "Custom URI schemes" or "Deep linking"
4. **Save**

## Update App with New Client ID

Once you get the new Android Client ID, let me know and I'll update the app.

## Why This Happens

Standard Android OAuth clients are designed for:
- Web redirects (https://)
- Intent filters

React Native apps need:
- Custom URI schemes (com.harmoni.familycalendar://)
- Deep linking support

## Expected Result

After fixing this, Android OAuth should work with:
- Redirect URI: `com.harmoni.familycalendar://redirect`
- No more "Custom URI scheme" errors

Let me know the new Android Client ID once you create it!
