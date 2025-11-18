# Family Calendar App

A cross-platform family calendar application built with React Native and Expo, integrated with Palantir Foundry for backend data management.

## Features

- 📅 Interactive calendar view
- 👨‍👩‍👧‍👦 Family member management
- 📱 Cross-platform support (iOS, Android, Web)
- 🔄 Real-time sync with Palantir Foundry
- 🎨 Clean, intuitive UI

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe development
- **Palantir Foundry OSDK** - Backend integration
- **React Native Calendars** - Calendar component
- **React Navigation** - Navigation (to be implemented)
- **date-fns** - Date manipulation utilities

## Prerequisites

- Node.js v18 or newer
- npm or yarn
- Expo Go app on your mobile device (for testing)
- Palantir Foundry account with OSDK access

## Installation

1. **Clone the repository** (if applicable)
   ```bash
   cd family_calanderapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Foundry connection**
   - Copy `.env.example` to `.env`
   - Fill in your Foundry instance details:
     ```
     EXPO_PUBLIC_FOUNDRY_URL=https://your-foundry-instance.palantirfoundry.com
     EXPO_PUBLIC_FOUNDRY_ONTOLOGY=your-ontology-rid
     EXPO_PUBLIC_FOUNDRY_TOKEN=your-api-token
     ```

## Running the App

### Start the development server
```bash
npm start
```

This will open the Expo DevTools in your browser.

### Test on iOS
```bash
npm run ios
```
Or scan the QR code with your iPhone camera (requires Expo Go app)

### Test on Android
```bash
npm run android
```
Or scan the QR code with the Expo Go app

### Test on Web
```bash
npm run web
```

## Project Structure

```
family_calanderapp/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   │   ├── CalendarScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── services/        # API and Foundry integration
│   │   └── foundryClient.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   └── utils/           # Utility functions
├── App.tsx              # Main app component
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Development Workflow

1. **Make changes** to your code
2. **Save the file** - Expo will automatically reload
3. **Test on device** using Expo Go
4. **Iterate** quickly with hot reload

## Foundry Integration

The app uses Palantir Foundry OSDK for backend operations. Key integration points:

- `src/services/foundryClient.ts` - Foundry client configuration
- Environment variables for secure credential management
- Type-safe API calls using TypeScript

### Implementing Foundry Queries

Update `src/services/foundryClient.ts` with your actual Foundry object types:

```typescript
// Example: Fetch calendar events
export async function fetchCalendarEvents(startDate: Date, endDate: Date) {
  const events = await foundryClient.objects.CalendarEvent
    .where(event => event.startDate >= startDate && event.endDate <= endDate)
    .fetchPage();
  return events;
}
```

## Next Steps

- [ ] Implement navigation between screens
- [ ] Add event creation/editing functionality
- [ ] Implement family member management
- [ ] Add authentication
- [ ] Connect to actual Foundry data sources
- [ ] Add push notifications
- [ ] Implement recurring events
- [ ] Add event reminders

## Testing

### iOS Testing
- **Free**: Use Expo Go app (no Apple Developer account needed)
- **Paid**: Build standalone app ($99/year Apple Developer Program)

### Android Testing
- **Free**: Use Expo Go app or build APK
- **Paid**: Publish to Google Play Store ($25 one-time fee)

### Web Testing
- **Free**: Test locally or deploy to Vercel/Netlify

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

### Web
```bash
npm run web
# Then deploy the web-build folder to your hosting service
```

## Troubleshooting

### Node.js not found
If you're using nvm, make sure to activate it:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.18.0
```

### Expo Go connection issues
- Ensure your phone and computer are on the same WiFi network
- Try using tunnel mode: `expo start --tunnel`

### Foundry connection errors
- Verify your `.env` file has correct credentials
- Check that your Foundry token has appropriate permissions
- Ensure your Foundry instance is accessible

## Contributing

1. Create a feature branch
2. Make your changes
3. Test on all platforms
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions, please contact [your contact info]
