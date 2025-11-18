# Final Solution: Add Redirect URI to Web Client

## The Situation

Expo's Google provider is working correctly and using your **Web Client ID** for development (as designed).

However, your **Web OAuth client** in Google Console doesn't have the redirect URI that Expo is generating.

## The Solution

Add this redirect URI to your **WEB OAuth client** (not iOS client):

```
exp://192.168.1.141:8081
```

## Steps

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Find your WEB OAuth client**: `1029771347588-94gav3kiecrqlf6pkihne2vgeeet0a1d...`
4. **Click to edit it**
5. **Under "Authorized redirect URIs"**, click **+ ADD URI**
6. **Add**: `exp://192.168.1.141:8081`
7. **Click Save**
8. **Wait 5-10 seconds** for Google to update
9. **Try signing in again**

## Why This Works

- Expo Go (development) uses the **Web Client ID**
- Web clients CAN accept custom redirect URIs (including exp://)
- You just need to add the specific URI to the authorized list

## Important

- ✅ Add to **WEB client** (the one ending in ...0a1d.apps.googleusercontent.com)
- ✅ NOT the iOS client
- ✅ The exact URI: `exp://192.168.1.141:8081`

This should work! The Web client accepts custom URIs once you add them to the authorized list.
