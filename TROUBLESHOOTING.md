# Troubleshooting Guide

## "Opening project" Stuck on Expo Go

If your iPhone shows "Opening project" and gets stuck, try these solutions:

### Solution 1: Use Tunnel Mode (Most Reliable)

1. **Stop the current server** (Ctrl+C in terminal)
2. **Start with tunnel mode:**
   ```bash
   npm start --tunnel
   ```
   Or with nvm:
   ```bash
   export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 22.18.0 && npm start --tunnel
   ```
3. **Wait for the new QR code** to appear (may take 30-60 seconds)
4. **Scan the new QR code** with your iPhone

Tunnel mode routes traffic through Expo's servers, bypassing local network issues.

### Solution 2: Check Network Connection

1. **Ensure both devices are on the same WiFi network**
   - Your Mac and iPhone must be on the same network
   - Corporate/school networks may block connections
   - Guest networks often don't allow device-to-device communication

2. **Try disabling VPN** if you have one running

3. **Check firewall settings** on your Mac:
   - System Settings → Network → Firewall
   - Temporarily disable or allow Node/Expo

### Solution 3: Use LAN Connection

1. Stop the server (Ctrl+C)
2. Start with LAN mode:
   ```bash
   npm start --lan
   ```
3. Scan the new QR code

### Solution 4: Clear Expo Cache

1. Stop the server (Ctrl+C)
2. Clear cache and restart:
   ```bash
   npm start --clear
   ```

### Solution 5: Restart Everything

1. **Close Expo Go app** completely on iPhone (swipe up and close)
2. **Stop the server** on Mac (Ctrl+C)
3. **Restart the server:**
   ```bash
   npm start
   ```
4. **Reopen Expo Go** and scan QR code

### Solution 6: Check Terminal for Errors

Look at your terminal where `npm start` is running. Common errors:

- **Port already in use**: Kill the process using port 8081
  ```bash
  lsof -ti:8081 | xargs kill -9
  ```
  Then restart: `npm start`

- **Metro bundler errors**: Clear cache
  ```bash
  npm start --clear
  ```

### Solution 7: Try Web First

If mobile is still stuck, test on web to verify the app works:

1. In the terminal, press `w`
2. Or run: `npm run web`
3. If web works, the issue is network-related

### Solution 8: Manual Connection

1. In Expo Go app, tap "Enter URL manually"
2. Enter the URL shown in your terminal (looks like: `exp://192.168.x.x:8081`)
3. Tap "Connect"

### Solution 9: Update Expo Go

1. Check App Store for Expo Go updates
2. Update to the latest version
3. Try scanning QR code again

### Solution 10: Check Mac's IP Address

1. Get your Mac's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Make sure it's a valid local IP (192.168.x.x or 10.x.x.x)
3. If you see multiple IPs, you may need to specify which one to use

## Still Having Issues?

### Quick Test Checklist:
- [ ] Both devices on same WiFi?
- [ ] VPN disabled?
- [ ] Firewall allowing connections?
- [ ] Expo Go app updated?
- [ ] Server running without errors?
- [ ] Tried tunnel mode?

### Best Practice for Development:

**Use Tunnel Mode by default** if you have network issues:
```bash
npm start --tunnel
```

It's slower to start but much more reliable for connections.

### Alternative: Test on Web

While troubleshooting mobile, you can develop using the web version:
```bash
npm run web
```

The app works identically on web, so you can continue development while fixing mobile connectivity.
