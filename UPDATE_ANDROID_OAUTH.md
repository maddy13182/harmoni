# Update Android OAuth Client with SHA-1 Fingerprint

## Your SHA-1 Fingerprint

```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

## Steps to Update Your Android OAuth Client

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/

### 2. Navigate to Credentials
- Click: **APIs & Services** → **Credentials**

### 3. Find Your Android OAuth Client
- Look for: `1029771347588-c5he766asb3dtg1oo8ncvauj3eopm832.apps.googleusercontent.com`
- Click on it to edit

### 4. Add SHA-1 Fingerprint
- Under **SHA-1 certificate fingerprints**
- Click **+ ADD FINGERPRINT**
- Paste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Click **Save**

### 5. Verify Configuration

Your Android OAuth client should have:
- ✅ **Name**: Harmoni Android App
- ✅ **Package name**: `com.harmoni.familycalendar`
- ✅ **SHA-1 fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

## After Adding SHA-1 Fingerprint

1. **Wait 5-10 seconds** for Google to update
2. **Go back to Android emulator**
3. **Tap "Sign in with Google"** again
4. **Should work now!**

## Why This is Needed

Android OAuth clients require:
- Package name (already configured)
- SHA-1 certificate fingerprint (just added)

This ensures only your app can use the OAuth client.

## Test Again

After adding the SHA-1 fingerprint:
1. Try signing in on Android emulator
2. Should redirect properly to your app
3. Welcome screen should appear
4. Then calendar screen

Let me know once you've added the SHA-1 fingerprint!
