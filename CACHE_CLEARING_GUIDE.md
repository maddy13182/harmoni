# 🧹 Cache Clearing Guide for iOS Simulator

This guide helps ensure your iOS simulator uses the latest Foundry SDK version (v0.2.0) instead of cached packages.

## 🚨 When to Clear Cache

Clear cache when:
- ✅ You've updated the Foundry SDK version
- ✅ You see old SDK versions in logs
- ✅ Import errors for new Foundry actions/objects
- ✅ 404 errors for objects that should exist
- ✅ App behavior doesn't match code changes

## 📱 Step-by-Step Cache Clearing

### **Step 1: Stop All Running Processes**
```bash
# Stop the development server (Ctrl+C in terminal)
# Close iOS Simulator app
```

### **Step 2: Clear Metro Bundler Cache**
```bash
# Option A: Clear cache with Expo
npx expo start --clear

# Option B: Clear cache with React Native
npx react-native start --reset-cache

# Option C: Clear cache manually
rm -rf node_modules/.cache
rm -rf .expo
```

### **Step 3: Clear iOS Simulator Cache**
```bash
# Reset all iOS simulators to factory settings
xcrun simctl erase all

# Or reset specific simulator (safer)
xcrun simctl list devices
xcrun simctl erase "iPhone 15 Pro"  # Replace with your simulator name
```

### **Step 4: Clear Node Modules (If Needed)**
```bash
# Only if you're still having issues
rm -rf node_modules
rm package-lock.json
npm install
```

### **Step 5: Restart Development Server**
```bash
# Start fresh with cleared cache
npx expo start --clear

# Or for iOS specifically
npm run ios
```

## 🔍 Verify SDK Version

After clearing cache, check the logs for:

```
🔧 Foundry SDK Versions:
   @familycalnderapp/sdk: ^0.2.0
   @osdk/client: ^2.5.2
   @osdk/foundry: ^2.40.0
🌐 Foundry URL: https://newageplatform.usw-16.palantirfoundry.com
📋 Ontology RID: ri.ontology.main.ontology.999b797d-0f22-4d1a-9127-a804ab27568a
✅ Foundry client initialized successfully
```

## 🎯 Quick Commands Reference

```bash
# Full reset (nuclear option)
xcrun simctl erase all && rm -rf node_modules .expo && npm install && npx expo start --clear

# Gentle reset (recommended)
npx expo start --clear

# iOS Simulator only
xcrun simctl erase all

# Metro cache only
rm -rf node_modules/.cache && npx expo start --clear
```

## ⚠️ Troubleshooting

### **Still seeing old SDK version?**
1. Check `package.json` - ensure `@familycalnderapp/sdk: ^0.2.0`
2. Run `npm list @familycalnderapp/sdk` to verify installed version
3. Try the "nuclear option" command above

### **Import errors for createuser?**
1. Verify the `createuser` action exists in Foundry
2. Regenerate SDK in Foundry
3. Update SDK version in your project
4. Clear all caches

### **404 errors for User object?**
1. Verify the `User` object type exists in Foundry
2. Check the `googleUserId` property exists
3. Regenerate SDK in Foundry
4. Clear all caches

## 📊 Expected Log Flow

After clearing cache, you should see:
```
🔧 Foundry SDK Versions: (shows v0.2.0)
✅ Foundry client initialized successfully
Starting user verification/creation process for: Harshika Mahesh
Searching for user by googleUserId: 100921214119586976845
User search results: 0 users found (or 1 if exists)
Creating new user in Foundry: (if user doesn't exist)
User created successfully: (success message)
```

## 🎉 Success Indicators

✅ **SDK version shows ^0.2.0**  
✅ **No import errors for createuser**  
✅ **User lookup works (no 404 ObjectTypeNotFound)**  
✅ **User creation works (no 404 ActionTypeNotFound)**  
✅ **Auto-provisioning flow completes successfully**  

---

**💡 Pro Tip**: Always clear cache after updating Foundry SDK versions to avoid mysterious issues!
