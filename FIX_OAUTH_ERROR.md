# Fix OAuth "invalid_request" Error

## The Problem

Google is rejecting the OAuth request because the redirect URI `exp://192.168.1.141:8081/--/redirect` is not in your authorized redirect URIs list.

## The Solution

Add this EXACT redirect URI to your Google Cloud Console:

```
exp://192.168.1.141:8081/--/redirect
```

## Steps to Fix

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Navigate to Credentials**
   - Click on **APIs & Services** → **Credentials**

3. **Edit Your OAuth Client**
   - Find your OAuth 2.0 Client ID: `1029771347588-94gav3kiecrqlf6pkihne2vgeeet0a1d.apps.googleusercontent.com`
   - Click on it to edit

4. **Add the Redirect URI**
   - Under **Authorized redirect URIs**, click **+ ADD URI**
   - Paste EXACTLY: `exp://192.168.1.141:8081/--/redirect`
   - Click **Save**

5. **Wait a Moment**
   - Google may take 5-10 seconds to update

6. **Try Again**
   - Go back to your iOS Simulator
   - Tap "Sign in with Google" again
   - It should work now!

## Important Notes

- ✅ **Keep** your existing Foundry redirect URL
- ✅ **Add** this new mobile redirect URL
- ✅ The URI must match EXACTLY (including the `--`)
- ✅ You can have multiple redirect URIs in the same OAuth client

## If Your IP Address Changes

If you restart your computer or change networks, your IP address might change from `192.168.1.141` to something else. If that happens:

1. Check the terminal for the new redirect URI
2. Add the new URI to Google Console
3. You can keep the old one too - it won't hurt

## Alternative: Use Expo's Proxy

If you keep having IP address issues, you can use Expo's authentication proxy instead. This gives you a stable redirect URI that doesn't change.

Let me know once you've added the redirect URI and we'll test again!
