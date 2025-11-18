/**
 * Foundry Client - Backward Compatibility Wrapper
 * 
 * This file maintains backward compatibility with existing imports.
 * All functionality has been moved to modular services in ./foundry/
 * 
 * New code should import from './foundry' directly:
 * import { verifyOrCreateUser } from './services/foundry';
 * 
 * This wrapper will be maintained for backward compatibility.
 */

// Re-export everything from the modular foundry services
export * from './foundry';
