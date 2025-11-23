#!/usr/bin/env node

/**
 * Sync Version Script
 * 
 * Syncs the version from package.json to app.json
 * Run after npm version commands to keep versions in sync
 */

const fs = require('fs');
const path = require('path');

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageJson.version;

// Read app.json
const appPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));

// Update version in app.json
appJson.expo.version = version;

// Write back to app.json
fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✅ Synced version to ${version} in app.json`);
console.log(`📱 iOS buildNumber: ${appJson.expo.ios.buildNumber}`);
console.log(`🤖 Android versionCode: ${appJson.expo.android.versionCode}`);
console.log(`\n💡 Remember to increment build numbers before building!`);
console.log(`   Run: npm run build:increment`);
