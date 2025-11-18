# Setting Up iOS OAuth Client for Harmoni

## The Problem

Your current OAuth client is a **Web application** type, which doesn't accept custom URI schemes like `exp://` or `com.harmoni.familycalendar://`.

For mobile apps, you need an **iOS** OAuth client.

## Solution: Create an iOS OAuth Client

### Step 1: Create iOS OAuth Client

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Click**: "+ CREATE CREDENTIALS" → "OAuth client ID"
4. **Select Application type**: **iOS**
5. **Fill in**:
   - **Name**: Harmoni iOS App
   - **Bundle ID**: `com.harmoni.familycalendar`
6. **Click**: "CREATE"
7. **Copy the new iOS Client ID** (it will be different from your web client ID)

### Step 2: Update Your App with iOS Client ID

Once you have the iOS Client ID, we'll update the app to use it.

### Step 3: No Redirect URI Needed!

Good news: iOS OAuth clients don't need redirect URIs configured in Google Console. The bundle ID handles the redirect automatically.

## Alternative: Use Expo's Built-in Google Sign-In

An easier approach is to use `expo-auth-session/providers/google` which handles all the OAuth complexity for you.

Would you like me to:
1. **Create the iOS OAuth client** (you'll need to do this in Google Console)
2. **Switch to Expo's Google provider** (I can do this now - easier!)

## Recommended: Use Expo's Google Provider

This is the easiest and most reliable approach. Let me know and I'll update the code to use it!

## Current Status

Your app is trying to use:
- **Client ID**: `1029771347588-94gav3kiecrqlf6pkihne2vgeeet0a1d.apps.googleusercontent.com` (Web client)
- **Redirect URI**: `exp://192.168.1.141:8081` (Not accepted by web clients)

We need to either:
- Create an iOS client and use its Client ID
- OR use Expo's Google provider (recommended - easier!)
