// Palantir Foundry OSDK Client Configuration
import { Client, createClient } from "@osdk/client";
import { debugFoundrySDK } from "../../utils/foundryDebug";

// Foundry configuration from environment variables
export const FOUNDRY_CONFIG = {
  url: process.env.EXPO_PUBLIC_FOUNDRY_API_URL || 'https://newageplatform.usw-16.palantirfoundry.com',
  ontologyRid: process.env.EXPO_PUBLIC_FOUNDRY_ONTOLOGY_RID || 'ri.ontology.main.ontology.999b797d-0f22-4d1a-9127-a804ab27568a',
  token: process.env.EXPO_PUBLIC_FOUNDRY_TOKEN || '',
};

// Log SDK version information
try {
  // Try to get SDK version from package.json
  const packageJson = require('../../../package.json');
  const sdkVersion = packageJson.dependencies['@familycalnderapp/sdk'] || 'unknown';
  const osdkClientVersion = packageJson.dependencies['@osdk/client'] || 'unknown';
  const osdkFoundryVersion = packageJson.dependencies['@osdk/foundry'] || 'unknown';
  
  console.log('🔧 Foundry SDK Versions:');
  console.log(`   @familycalnderapp/sdk: ${sdkVersion}`);
  console.log(`   @osdk/client: ${osdkClientVersion}`);
  console.log(`   @osdk/foundry: ${osdkFoundryVersion}`);
  console.log(`🌐 Foundry URL: ${FOUNDRY_CONFIG.url}`);
  console.log(`📋 Ontology RID: ${FOUNDRY_CONFIG.ontologyRid}`);
} catch (error) {
  console.log('⚠️  Could not load SDK version info:', error instanceof Error ? error.message : String(error));
}

// Initialize the Foundry client with token authentication
// Using token directly as auth parameter
export const foundryClient: Client = createClient(
  FOUNDRY_CONFIG.url, 
  FOUNDRY_CONFIG.ontologyRid, 
  () => Promise.resolve(FOUNDRY_CONFIG.token)
);

console.log('✅ Foundry client initialized successfully');

// Debug SDK exports to see what's actually available
debugFoundrySDK();
