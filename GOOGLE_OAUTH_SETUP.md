# Google OAuth Setup Guide for Harmoni

This guide will help you configure Google OAuth for the Harmoni family calendar app.

## Prerequisites

- Google Cloud Console account
- Your Google Client ID: `1029771347588-94gav3kiecrqlf6pkihne2vgeeet0a1d.apps.googleusercontent.com`
- Your Google Client Secret: `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`

## Step 1: Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Configure the consent screen:
   - **App name**: Harmoni
   - **User support email**: Your email
   - **App logo**: (Optional) Upload Harmoni logo
   - **Application home page**: (Optional)
   - **Authorized domains**: Add your domain if you have one
   - **Developer contact information**: Your email

5. Click **Save and Continue**

## Step 2: Configure Scopes

1. Click **Add or Remove Scopes**
2. Add these scopes:
   - `openid`
   - `profile`
   - `email`
3. Click **Update** and **Save and Continue**

## Step 3: Add Test Users (for Development)

1. Click **Add Users**
2. Add email addresses of people who will test the app
3. Click **Save and Continue**

## Step 4: Configure Authorized Redirect URIs

This is the **most important step** for the app to work!

1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add these URLs:

### For Development (Expo Go):
```
exp://localhost:8081/--/redirect
exp://192.168.1.141:8081/--/redirect  (replace with your actual IP)
```

### For iOS Simulator:
```
exp://127.0.0.1:8081/--/redirect
```

### For Production (when you build standalone app):
```
com.harmoni.familycalendar:/redirect
```

### For Web:
```
http://localhost:19006
https://your-domain.com  (if you have a web deployment)
```

4. Click **Save**

## Step 5: Verify Configuration

Your OAuth client should now have:
- ✅ Client ID configured
- ✅ Client Secret (keep this secure!)
- ✅ Redirect URIs added
- ✅ Scopes configured (openid, profile, email)
- ✅ Test users added (for development)

## Testing the Setup

1. **Start the Expo server:**
   ```bash
   npm start
   ```

2. **Open in iOS Simulator:**
   - Press `i` in the terminal
   - Or scan QR code with Expo Go app

3. **Test the login flow:**
   - App shows splash screen → "Harmoni"
   - Transitions to login screen
   - Click "Sign in with Google"
   - Google OAuth page opens
   - Sign in with your Google account
   - Redirects back to app
   - Shows welcome screen with your name
   - Transitions to calendar

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch" Error

**Solution:** The redirect URI in Google Console doesn't match what the app is using.

1. Check the error message for the actual redirect URI being used
2. Add that exact URI to Google Console
3. Common formats:
   - `exp://192.168.x.x:8081/--/redirect`
   - `exp://localhost:8081/--/redirect`

### Issue: "Access blocked: This app's request is invalid"

**Solution:** OAuth consent screen not configured properly.

1. Go to OAuth consent screen
2. Make sure app name is set
3. Add your email as a test user
4. Verify scopes are added

### Issue: Login button doesn't work

**Solution:** Check the console logs in your terminal.

1. Look for errors in the Expo terminal
2. Common causes:
   - Network connectivity issues
   - Incorrect Client ID
   - Missing redirect URIs

### Issue: "Invalid client" error

**Solution:** Client ID is incorrect or not properly configured.

1. Verify the Client ID in `src/services/authService.ts` matches Google Console
2. Make sure the OAuth client is enabled in Google Console

## Security Best Practices

### ✅ DO:
- Keep your Client Secret secure (never commit to git)
- Use environment variables for sensitive data
- Only add necessary scopes
- Regularly review authorized users

### ❌ DON'T:
- Share your Client Secret publicly
- Add unnecessary redirect URIs
- Grant more scopes than needed
- Leave test mode enabled in production

## Moving to Production

When you're ready to publish your app:

1. **Submit for OAuth Verification:**
   - Go to OAuth consent screen
   - Click "Publish App"
   - Submit for verification (required for >100 users)

2. **Update Redirect URIs:**
   - Add production redirect URIs
   - Remove development URIs

3. **Build Standalone App:**
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

4. **Test thoroughly** before releasing to users

## Getting Help

If you encounter issues:

1. Check the [Expo AuthSession docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
2. Review [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the app logs in Expo terminal
4. Verify all redirect URIs are correctly configured

## Current Configuration Summary

**App Name:** Harmoni
**Client ID:** `1029771347588-94gav3kiecrqlf6pkihne2vgeeet0a1d.apps.googleusercontent.com`
**Bundle ID (iOS):** `com.harmoni.familycalendar`
**Package Name (Android):** `com.harmoni.familycalendar`
**Scheme:** `family_calanderapp`

**Required Redirect URIs:**
- Development: `exp://localhost:8081/--/redirect`
- Production: `com.harmoni.familycalendar:/redirect`
