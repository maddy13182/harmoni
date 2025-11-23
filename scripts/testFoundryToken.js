/**
 * Script to test Foundry API token validity
 * Run with: node scripts/testFoundryToken.js
 */

require('dotenv').config();
const https = require('https');

const FOUNDRY_URL = process.env.EXPO_PUBLIC_FOUNDRY_API_URL || 'https://newageplatform.usw-16.palantirfoundry.com';
const FOUNDRY_TOKEN = process.env.EXPO_PUBLIC_FOUNDRY_TOKEN;

if (!FOUNDRY_TOKEN) {
  console.error('❌ ERROR: EXPO_PUBLIC_FOUNDRY_TOKEN not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing Foundry API Token...');
console.log('📍 API URL:', FOUNDRY_URL);
console.log('🔑 Token (first 20 chars):', FOUNDRY_TOKEN.substring(0, 20) + '...');
console.log('');

// Parse the URL
const url = new URL(FOUNDRY_URL);

// Make a simple API request to test the token
const options = {
  hostname: url.hostname,
  port: 443,
  path: '/api/v1/ontologies', // Simple endpoint to test authentication
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${FOUNDRY_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log('📡 Response Status:', res.statusCode);
  console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS: Token is valid!');
      console.log('📦 Response data:', data.substring(0, 200) + '...');
    } else if (res.statusCode === 401) {
      console.error('❌ AUTHENTICATION FAILED: Token is invalid or expired');
      console.error('💡 Please regenerate your token in Foundry and update .env file');
    } else if (res.statusCode === 403) {
      console.error('❌ FORBIDDEN: Token is valid but lacks necessary permissions');
      console.error('💡 Check token permissions in Foundry');
    } else {
      console.error('⚠️  Unexpected response code:', res.statusCode);
      console.error('📄 Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ CONNECTION ERROR:', error.message);
  console.error('💡 Possible causes:');
  console.error('   - Network connectivity issue');
  console.error('   - Incorrect API URL');
  console.error('   - Firewall blocking the connection');
  console.error('   - VPN or proxy issues');
});

req.setTimeout(10000, () => {
  console.error('❌ REQUEST TIMEOUT: Could not connect to Foundry API');
  console.error('💡 Check your network connection and API URL');
  req.destroy();
});

req.end();
