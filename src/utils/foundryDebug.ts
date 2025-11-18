// Debug utility to check what's available in the Foundry SDK
import * as SDK from "@familycalnderapp/sdk";

/**
 * Log all available exports from the Foundry SDK
 */
export function debugFoundrySDK() {
  console.log('🔍 Debugging Foundry SDK exports:');
  
  try {
    const exports = Object.keys(SDK);
    console.log('📦 Available SDK exports:', exports);
    
    // Check for User-related exports
    const userExports = exports.filter(name => 
      name.toLowerCase().includes('user')
    );
    console.log('👤 User-related exports:', userExports);
    
    // Check for Action-related exports
    const actionExports = exports.filter(name => 
      name.toLowerCase().includes('create') || 
      name.toLowerCase().includes('action')
    );
    console.log('⚡ Action-related exports:', actionExports);
    
    // Try to access specific exports
    if (SDK.User) {
      console.log('✅ User object type found');
    } else {
      console.log('❌ User object type not found');
    }
    
    if (SDK.createuser) {
      console.log('✅ createuser action found');
    } else {
      console.log('❌ createuser action not found');
    }
    
    // Check for alternative names
    const possibleUserNames = ['User', 'user', 'Users', 'AppUser'];
    const possibleActionNames = ['createuser', 'CreateUser', 'createUser', 'CreateUserAction'];
    
    console.log('🔍 Checking possible User object names:');
    possibleUserNames.forEach(name => {
      if ((SDK as any)[name]) {
        console.log(`✅ Found: ${name}`);
      }
    });
    
    console.log('🔍 Checking possible CreateUser action names:');
    possibleActionNames.forEach(name => {
      if ((SDK as any)[name]) {
        console.log(`✅ Found: ${name}`);
      }
    });
    
  } catch (error) {
    console.error('Error debugging SDK:', error);
  }
}
