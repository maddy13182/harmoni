# Foundry SDK Integration Guide

This guide will help you integrate Palantir Foundry SDK with your Harmoni app after Google authentication is working.

## Prerequisites

✅ Google authentication working in Harmoni app
✅ Foundry token available
✅ Foundry OSDK package information

## Your Foundry Configuration

Based on your setup instructions:

```bash
Foundry URL: https://newageplatform.usw-16.palantirfoundry.com
Application: ri.third-party-applications.main.application.3ff69c1a-6909-40ed-91cb-bca22943a548
Ontology: ri.ontology.main.ontology.999b797d-0f22-4d1a-9127-a804ab27568a
Client ID: 9e0d5a99178a16cb02944b7d3910f13f
OSDK Package: @familycalnderapp/sdk
Registry URL: https://newageplatform.usw-16.palantirfoundry.com/artifacts/api/repositories/ri.artifacts.main.repository.06cc1cfc-5894-4b53-b01f-fb99f4dbc22e/contents/release/npm
```

## Step 1: Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# Foundry Configuration
EXPO_PUBLIC_FOUNDRY_URL=https://newageplatform.usw-16.palantirfoundry.com
EXPO_PUBLIC_FOUNDRY_ONTOLOGY=ri.ontology.main.ontology.999b797d-0f22-4d1a-9127-a804ab27568a
EXPO_PUBLIC_FOUNDRY_APPLICATION=ri.third-party-applications.main.application.3ff69c1a-6909-40ed-91cb-bca22943a548
EXPO_PUBLIC_FOUNDRY_CLIENT_ID=9e0d5a99178a16cb02944b7d3910f13f

# For development only - DO NOT commit this token
FOUNDRY_TOKEN=eyJwbG50ciI6IkRIcHp6YmZ5TmJpTnJlaDdOYUhoUVE9PSIsImFsZyI6IkVTMjU2In0...
```

**Important:** Add `.env` to your `.gitignore` file!

## Step 2: Configure NPM Registry for Foundry SDK

Create or update `.npmrc` file in your project root:

```
@familycalnderapp:registry=https://newageplatform.usw-16.palantirfoundry.com/artifacts/api/repositories/ri.artifacts.main.repository.06cc1cfc-5894-4b53-b01f-fb99f4dbc22e/contents/release/npm
//newageplatform.usw-16.palantirfoundry.com/artifacts/api/repositories/ri.artifacts.main.repository.06cc1cfc-5894-4b53-b01f-fb99f4dbc22e/contents/release/npm/:_authToken=${FOUNDRY_TOKEN}
```

## Step 3: Install Foundry SDK

```bash
export FOUNDRY_TOKEN=your_token_here
npm install @familycalnderapp/sdk@2.x
```

## Step 4: Update Foundry Client Service

Update `src/services/foundryClient.ts`:

```typescript
import { Client } from '@familycalnderapp/sdk';

// Foundry Configuration
const FOUNDRY_CONFIG = {
  url: process.env.EXPO_PUBLIC_FOUNDRY_URL || 'https://newageplatform.usw-16.palantirfoundry.com',
  ontology: process.env.EXPO_PUBLIC_FOUNDRY_ONTOLOGY || 'ri.ontology.main.ontology.999b797d-0f22-4d1a-9127-a804ab27568a',
  clientId: process.env.EXPO_PUBLIC_FOUNDRY_CLIENT_ID || '9e0d5a99178a16cb02944b7d3910f13f',
};

// Initialize Foundry client with user's auth token
export function createFoundryClient(authToken: string) {
  return new Client(FOUNDRY_CONFIG.url, FOUNDRY_CONFIG.ontology, {
    auth: {
      type: 'bearer',
      token: authToken,
    },
  });
}

// Example: Fetch calendar events from Foundry
export async function fetchCalendarEventsFromFoundry(authToken: string, startDate: Date, endDate: Date) {
  try {
    const client = createFoundryClient(authToken);
    
    // Replace with your actual Foundry object type
    // const events = await client.objects.CalendarEvent
    //   .where(event => event.startDate >= startDate && event.endDate <= endDate)
    //   .fetchPage();
    
    console.log('Fetching calendar events from Foundry...', { startDate, endDate });
    return [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

// Example: Create calendar event in Foundry
export async function createCalendarEventInFoundry(authToken: string, eventData: any) {
  try {
    const client = createFoundryClient(authToken);
    
    // Replace with your actual Foundry object type
    // const newEvent = await client.objects.CalendarEvent.create(eventData);
    
    console.log('Creating calendar event in Foundry...', eventData);
    return eventData;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}
```

## Step 5: Connect Google Auth with Foundry

The flow will be:
1. User signs in with Google
2. Get Google access token
3. Exchange Google token for Foundry token (or use Google token directly if Foundry supports it)
4. Use Foundry token to access Foundry APIs

### Option A: Use Google Token Directly (if Foundry supports it)

Update `src/services/authService.ts` to store both tokens:

```typescript
// After successful Google login
await storeAuthToken(googleAccessToken);
await storeUserInfo(userInfo);

// Use Google token with Foundry
const foundryClient = createFoundryClient(googleAccessToken);
```

### Option B: Exchange Google Token for Foundry Token

If Foundry requires its own token:

```typescript
export async function exchangeGoogleTokenForFoundry(googleToken: string): Promise<string> {
  try {
    const response = await fetch(`${FOUNDRY_URL}/api/auth/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${googleToken}`,
      },
      body: JSON.stringify({
        clientId: FOUNDRY_CLIENT_ID,
      }),
    });
    
    const data = await response.json();
    return data.foundryToken;
  } catch (error) {
    console.error('Error exchanging tokens:', error);
    throw error;
  }
}
```

## Step 6: Update Calendar Screen to Use Foundry Data

Update `src/screens/CalendarScreen.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { getAuthToken } from '../services/authService';
import { fetchCalendarEventsFromFoundry } from '../services/foundryClient';

export default function CalendarScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const authToken = await getAuthToken();
      if (authToken) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        const foundryEvents = await fetchCalendarEventsFromFoundry(
          authToken,
          startDate,
          endDate
        );
        
        setEvents(foundryEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
}
```

## Step 7: Define Foundry Object Types

Create `src/types/foundry.ts`:

```typescript
// Define your Foundry object types based on your ontology

export interface FoundryCalendarEvent {
  __primaryKey: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate: string;
  location?: string;
  attendees: string[];
  createdBy: string;
  category: string;
}

export interface FoundryFamilyMember {
  __primaryKey: string;
  name: string;
  email: string;
  role: 'parent' | 'child' | 'other';
  avatarUrl?: string;
}
```

## Step 8: Testing Foundry Integration

1. **Test authentication:**
   ```bash
   npm start
   ```

2. **Sign in with Google**

3. **Check console logs** for Foundry API calls

4. **Verify data** is being fetched from Foundry

## Authentication Flow Diagram

```
┌─────────────────┐
│  User Signs In  │
│  with Google    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get Google     │
│  Access Token   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Exchange for   │ (if needed)
│  Foundry Token  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Store Tokens   │
│  Securely       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Use Foundry    │
│  APIs with      │
│  Token          │
└─────────────────┘
```

## Security Considerations

### ✅ DO:
- Store tokens securely using expo-secure-store
- Use HTTPS for all API calls
- Implement token refresh logic
- Handle token expiration gracefully
- Validate all data from Foundry

### ❌ DON'T:
- Store tokens in AsyncStorage (use SecureStore)
- Log tokens in console (in production)
- Commit tokens to git
- Share tokens between users

## Troubleshooting

### Issue: Cannot install Foundry SDK

**Solution:** Verify your FOUNDRY_TOKEN is set and .npmrc is configured correctly.

```bash
echo $FOUNDRY_TOKEN  # Should show your token
cat .npmrc           # Should show registry config
```

### Issue: Authentication fails with Foundry

**Solution:** Check if Google token needs to be exchanged for Foundry token.

### Issue: CORS errors

**Solution:** You may need to use the CORS proxy option mentioned in Foundry docs:
```bash
--corsProxy true
```

## Next Steps After Integration

1. ✅ Test fetching events from Foundry
2. ✅ Test creating events in Foundry
3. ✅ Implement family member management
4. ✅ Add real-time sync
5. ✅ Implement offline support

## Resources

- [Foundry OSDK Documentation](https://www.palantir.com/docs/foundry/ontology-sdk/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [React Native Best Practices](https://reactnative.dev/docs/security)

## Summary

Once Google authentication is working:
1. Set up environment variables
2. Configure NPM registry
3. Install Foundry SDK
4. Update foundryClient.ts
5. Connect auth tokens
6. Test integration

The key is connecting your Google authentication token with Foundry's authentication system!
