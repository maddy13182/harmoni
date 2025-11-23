#!/usr/bin/env node

/**
 * Increment Build Numbers Script
 * 
 * Increments iOS buildNumber and Android versionCode in app.json
 * Run before each build to ensure unique build numbers
 */

const fs = require('fs');
const path = require('path');

// Read app.json
const appPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));

// Get current build numbers
const currentIosBuild = parseInt(appJson.expo.ios.buildNumber || '1');
const currentAndroidBuild = parseInt(appJson.expo.android.versionCode || 1);

// Increment build numbers
const newIosBuild = currentIosBuild + 1;
const newAndroidBuild = currentAndroidBuild + 1;

// Update app.json
appJson.expo.ios.buildNumber = newIosBuild.toString();
appJson.expo.android.versionCode = newAndroidBuild;

// Write back to app.json
fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✅ Build numbers incremented!`);
console.log(`📱 iOS buildNumber: ${currentIosBuild} → ${newIosBuild}`);
console.log(`🤖 Android versionCode: ${currentAndroidBuild} → ${newAndroidBuild}`);
console.log(`\n📦 App version: ${appJson.expo.version}`);
console.log(`\n🚀 Ready to build with:`);
console.log(`   eas build --platform all --profile preview`);
