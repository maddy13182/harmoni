# Native Build Guide for Harmoni (No Apple Developer Account Needed!)

## What's Happening Now

The `expo prebuild` command is:
- ✅ Creating native iOS project in `./ios` folder
- ✅ Creating native Android project in `./android` folder
- ✅ Installing CocoaPods (iOS dependency manager)
- ✅ Configuring native projects with your app.json settings

This takes 3-5 minutes.

## Why This Approach Works

**No Apple Developer Account Required!**
- ✅ Builds locally on your Mac
- ✅ Runs in iOS Simulator (free)
- ✅ Supports OAuth with proper URL schemes
- ✅ Hot reload still works

## After Prebuild Completes

### Step 1: Build and Run on iOS Simulator

```bash
npx expo run:ios
```

This will:
- Compile the native iOS app
- Install it on your simulator
- Start the development server
- Open the app automatically

Takes 5-10 minutes first time, then much faster.

### Step 2: Configure Google OAuth Redirect URI

Add this to your **iOS OAuth client** in Google Console:
```
com.harmoni.familycalendar://redirect
```

Steps:
1. Go to Google Cloud Console
2. Find iOS client: `1029771347588-m61s1m0vpiv0lc8tsc1k1at1q4ermgtl...`
3. No redirect URI configuration needed for iOS clients!
   (Bundle ID handles it automatically)

### Step 3: Test OAuth

1. App opens in simulator
2. Tap "Sign in with Google"
3. Google OAuth page opens
4. Sign in
5. Redirects back to app with `com.harmoni.familycalendar://redirect`
6. Welcome screen with your real name!
7. Calendar screen

## Development Workflow

### Daily Development:
```bash
npx expo start --dev-client
```

Or:
```bash
npx expo run:ios
```

### Making Changes:
- Edit any file in `src/`
- Save
- App hot reloads automatically
- Just like Expo Go!

## Advantages

✅ **No Apple Developer Account**: Free to develop
✅ **OAuth Works**: Proper URL schemes
✅ **Hot Reload**: Fast development
✅ **Native Features**: Full iOS capabilities
✅ **Production-like**: Tests real app behavior

## Project Structure After Prebuild

```
family_calanderapp/
├── ios/              # Native iOS project (NEW)
├── android/          # Native Android project (NEW)
├── src/              # Your React Native code
├── app.json          # Expo configuration
└── package.json      # Dependencies
```

## Important Notes

### Don't Edit Native Folders Directly
- The `ios/` and `android/` folders are auto-generated
- Make changes in `app.json` and run `npx expo prebuild` again
- Or use Expo config plugins

### Gitignore
The native folders are typically gitignored since they're generated.

### Rebuilding
If you change `app.json`, run:
```bash
npx expo prebuild --clean
```

## Troubleshooting

### CocoaPods Installation Fails
```bash
sudo gem install cocoapods
```

### Build Fails
- Make sure Xcode is installed
- Try: `npx expo run:ios --clean`

### OAuth Still Doesn't Work
- Verify bundle ID: `com.harmoni.familycalendar`
- Check iOS client ID is correct
- Restart the app

## Next Steps

1. ✅ Wait for prebuild to complete (installing CocoaPods now)
2. ✅ Run `npx expo run:ios`
3. ✅ Test Google OAuth
4. ✅ Start building features!

This is the proper way to develop native features (like OAuth) with Expo!
