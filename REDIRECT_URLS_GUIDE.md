# Redirect URLs Configuration Guide

## Understanding Redirect URLs

You have TWO different applications that need different redirect URLs:

### 1. Foundry Web App (Already Configured)
- **URL**: `https://newageplatform.usw-16.palantirfoundry.com/workspace/slate/app/ri.slate.main.document.d13eb860-01f5-4ed1-a191-a73579c9cd2a/home`
- **Purpose**: For your Foundry web application
- **Status**: ✅ Already configured

### 2. Harmoni Mobile App (Need to Add)
- **Purpose**: For your React Native/Expo mobile app
- **Status**: ⚠️ Need to add these URLs

## Redirect URLs to Add for Harmoni Mobile App

Go to your Google Cloud Console OAuth client and ADD these redirect URLs:

### For Development (iOS Simulator)
```
exp://127.0.0.1:8081/--/redirect
exp://localhost:8081/--/redirect
```

### For Development (Android Emulator)
```
exp://10.0.2.2:8081/--/redirect
```

### For Development (Physical Devices via Expo Go)
```
exp://192.168.1.141:8081/--/redirect
```
*Note: Replace `192.168.1.141` with your actual computer's IP address*

### For Production (Standalone Apps)
```
com.harmoni.familycalendar:/redirect
```

### For Web Version
```
http://localhost:19006
https://localhost:19006
```

## How to Add These URLs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Add each URL listed above (one at a time)
6. Click **Save**

## Important Notes

### Keep Your Foundry URL
✅ **DO NOT REMOVE** your existing Foundry redirect URL:
```
https://newageplatform.usw-16.palantirfoundry.com/workspace/slate/app/...
```

This is needed for your Foundry web app to work.

### Add Mobile URLs
✅ **ADD** the mobile app redirect URLs listed above.

You can have MULTIPLE redirect URLs in the same OAuth client - they all work together!

## Finding Your Computer's IP Address

To find your IP address for physical device testing:

### On Mac:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### On Windows:
```bash
ipconfig
```

Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)

## Testing Different Platforms

### iOS Simulator
Uses: `exp://127.0.0.1:8081/--/redirect`

### Android Emulator  
Uses: `exp://10.0.2.2:8081/--/redirect`

### Physical iPhone/Android (Expo Go)
Uses: `exp://YOUR_IP:8081/--/redirect`

### Web Browser
Uses: `http://localhost:19006`

### Production App
Uses: `com.harmoni.familycalendar:/redirect`

## Complete OAuth Client Configuration

Your OAuth client should have ALL these redirect URIs:

```
✅ https://newageplatform.usw-16.palantirfoundry.com/workspace/slate/app/... (Foundry)
✅ exp://127.0.0.1:8081/--/redirect (iOS Simulator)
✅ exp://localhost:8081/--/redirect (iOS Simulator alt)
✅ exp://10.0.2.2:8081/--/redirect (Android Emulator)
✅ exp://192.168.1.141:8081/--/redirect (Physical devices - use your IP)
✅ com.harmoni.familycalendar:/redirect (Production)
✅ http://localhost:19006 (Web dev)
```

## Expo Account Setup

Since you have an Expo account, you can also use Expo's authentication proxy:

### Expo Proxy URL (Alternative)
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/family_calanderapp
```

Replace `YOUR_EXPO_USERNAME` with your actual Expo username.

This is useful if you have network issues with local redirect URLs.

## Next Steps

1. ✅ Add all the mobile redirect URLs to your Google OAuth client
2. ✅ Keep your existing Foundry URL
3. ✅ Test the Harmoni app in iOS Simulator
4. ✅ Once Google auth works, we'll integrate Foundry SDK

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check the error message for the exact URI being used
- Add that exact URI to Google Console
- Make sure there are no typos or extra spaces

### Error: "invalid_client"
- Verify your Client ID is correct in `src/services/authService.ts`
- Make sure the OAuth client is enabled

### Login button doesn't work
- Check the Expo terminal for error messages
- Verify redirect URIs are saved in Google Console
- Try restarting the Expo server

## Summary

You need to ADD the mobile app redirect URLs to your EXISTING OAuth client. Don't remove the Foundry URL - you can have multiple redirect URLs in the same client. They all work together for different parts of your application ecosystem!
