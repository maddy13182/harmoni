# Quick Start Guide

## Your Family Calendar App is Ready! 🎉

## Starting the Development Server

If the server is not running, start it with:

```bash
npm start
```

Or if you're using nvm (Node Version Manager):

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 22.18.0 && npm start
```

Once running, you'll see a QR code and menu options in your terminal.

## Testing Your App

## Testing on Your Phone (Recommended for First Test)

### iOS (iPhone/iPad)
1. **Download Expo Go** from the App Store (free)
2. **Open your Camera app**
3. **Scan the QR code** shown in your terminal
4. The app will open in Expo Go automatically

### Android
1. **Download Expo Go** from Google Play Store (free)
2. **Open Expo Go app**
3. **Tap "Scan QR Code"**
4. **Scan the QR code** shown in your terminal


## Testing on Web Browser

**Method 1 (Recommended):**
1. In the terminal where Expo is running, press `w`
2. This will automatically open the web version in your browser

**Method 2 (Manual):**
1. Stop the current server (Ctrl+C)
2. Restart with: `npm run web`
3. The app will open automatically in your browser

**Note:** http://localhost:8081 shows the Expo manifest (JSON). You need to press `w` in the terminal or run `npm run web` to see the actual app.

## What You'll See

The app currently displays:
- ✅ A functional calendar interface
- ✅ Date selection capability
- ✅ Event display area (currently empty)
- ✅ "Add Event" button (UI only, functionality to be implemented)

## Development Commands

While the server is running, you can press:
- `w` - Open in web browser
- `a` - Open on Android device/emulator
- `i` - Open on iOS simulator (requires Xcode)
- `r` - Reload the app
- `m` - Toggle menu
- `j` - Open debugger

## Making Changes

1. Edit any file in the `src/` directory
2. Save the file
3. The app will automatically reload with your changes (Hot Reload)

## Next Development Steps

### 1. Connect to Foundry
- Create a `.env` file (copy from `.env.example`)
- Add your Foundry credentials
- Update `src/services/foundryClient.ts` with your Foundry object types

### 2. Implement Navigation
```bash
# The navigation packages are already installed
# You'll need to set up React Navigation in App.tsx
```

### 3. Add Event Management
- Create AddEventScreen.tsx
- Implement event creation form
- Connect to Foundry backend

### 4. Add Family Member Management
- Create FamilyMembersScreen.tsx
- Implement member list and management
- Connect to Foundry backend

## Troubleshooting

### Package Version Warning
You may see a warning about `react-native-screens` version. This is safe to ignore for now, or fix it with:
```bash
npm install react-native-screens@~4.16.0
```

### Can't Connect on Phone
- Make sure your phone and computer are on the same WiFi network
- Try tunnel mode: Stop the server (Ctrl+C) and run `npm start --tunnel`

### Metro Bundler Issues
If you encounter bundler issues:
```bash
# Stop the server (Ctrl+C)
# Clear cache and restart
npm start --clear
```

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the development server.

## Building for Production

When you're ready to build standalone apps:

### iOS
```bash
npx eas-cli build --platform ios
```

### Android
```bash
npx eas-cli build --platform android
```

### Web
```bash
npm run web
# Deploy the generated files to your hosting service
```

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Palantir Foundry OSDK](https://www.palantir.com/docs/foundry/ontology-sdk/)
- [React Native Calendars](https://github.com/wix/react-native-calendars)

## Need Help?

Check the main README.md for detailed documentation and troubleshooting tips.
